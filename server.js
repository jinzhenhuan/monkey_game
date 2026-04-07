const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 根路径路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// admin.html 路由
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 初始化数据库
const db = new sqlite3.Database('./game_data.db', (err) => {
    if (err) {
        console.error('数据库连接失败:', err);
    } else {
        console.log('✅ 数据库连接成功');
        initDatabase();
    }
});

// 创建表结构
function initDatabase() {
    db.serialize(() => {
        // 物品表
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT,
            description TEXT,
            level_requirement INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 怪物表
        db.run(`CREATE TABLE IF NOT EXISTS monsters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            hp INTEGER DEFAULT 100,
            attack INTEGER DEFAULT 10,
            defense INTEGER DEFAULT 5,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 地图表
        db.run(`CREATE TABLE IF NOT EXISTS maps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            route_description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 物品出处表
        db.run(`CREATE TABLE IF NOT EXISTS item_sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER,
            monster_id INTEGER,
            map_id INTEGER,
            drop_rate TEXT,
            notes TEXT,
            FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
            FOREIGN KEY (monster_id) REFERENCES monsters(id) ON DELETE CASCADE,
            FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
        )`);

        // 怪物刷新表
        db.run(`CREATE TABLE IF NOT EXISTS monster_spawns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            monster_id INTEGER,
            map_id INTEGER,
            spawn_point TEXT,
            refresh_time INTEGER,
            notes TEXT,
            FOREIGN KEY (monster_id) REFERENCES monsters(id) ON DELETE CASCADE,
            FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
        )`);

        // NPC 表
        db.run(`CREATE TABLE IF NOT EXISTS npcs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            map_id INTEGER,
            position TEXT,
            function TEXT,
            dialogue TEXT,
            FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE SET NULL
        )`);

        console.log('✅ 数据库表初始化完成');
    });
}

// API 路由

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/items', (req, res) => {
    const { search, type } = req.query;
    let sql = 'SELECT * FROM items WHERE 1=1';
    const params = [];
    
    if (search) {
        sql += ' AND name LIKE ?';
        params.push(`%${search}%`);
    }
    if (type) {
        sql += ' AND type = ?';
        params.push(type);
    }
    
    sql += ' ORDER BY id DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows, count: rows.length });
    });
});

app.get('/api/items/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM items WHERE id = ?', [id], (err, item) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!item) return res.status(404).json({ error: '物品不存在' });
        
        const sourceSql = `
            SELECT s.*, m.name as monster_name, map.name as map_name
            FROM item_sources s
            LEFT JOIN monsters m ON s.monster_id = m.id
            LEFT JOIN maps map ON s.map_id = map.id
            WHERE s.item_id = ?
        `;
        
        db.all(sourceSql, [id], (err, sources) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...item, sources });
        });
    });
});

app.post('/api/items', (req, res) => {
    const { name, type, description, level_requirement } = req.body;
    
    if (!name) return res.status(400).json({ error: '物品名称必填' });
    
    const sql = `INSERT INTO items (name, type, description, level_requirement) 
                 VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [name, type, description, level_requirement || 0], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: '创建成功' });
    });
});

app.put('/api/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, type, description, level_requirement } = req.body;
    
    const sql = `UPDATE items SET name = ?, type = ?, description = ?, 
                 level_requirement = ? WHERE id = ?`;
    
    db.run(sql, [name, type, description, level_requirement, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changes: this.changes, message: '更新成功' });
    });
});

app.delete('/api/items/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM items WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changes: this.changes, message: '删除成功' });
    });
});

app.get('/api/monsters', (req, res) => {
    const { search } = req.query;
    let sql = 'SELECT * FROM monsters WHERE 1=1';
    const params = [];
    
    if (search) {
        sql += ' AND name LIKE ?';
        params.push(`%${search}%`);
    }
    sql += ' ORDER BY level ASC, id DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows, count: rows.length });
    });
});

app.get('/api/monsters/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM monsters WHERE id = ?', [id], (err, monster) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!monster) return res.status(404).json({ error: '怪物不存在' });
        
        const spawnSql = `
            SELECT s.*, map.name as map_name
            FROM monster_spawns s
            LEFT JOIN maps map ON s.map_id = map.id
            WHERE s.monster_id = ?
        `;
        
        db.all(spawnSql, [id], (err, spawns) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...monster, spawns });
        });
    });
});

app.post('/api/monsters', (req, res) => {
    const { name, level, hp, attack, defense, description } = req.body;
    
    if (!name) return res.status(400).json({ error: '怪物名称必填' });
    
    const sql = `INSERT INTO monsters (name, level, hp, attack, defense, description) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [name, level, hp, attack, defense, description], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: '创建成功' });
    });
});

app.put('/api/monsters/:id', (req, res) => {
    const { id } = req.params;
    const { name, level, hp, attack, defense, description } = req.body;
    
    const sql = `UPDATE monsters SET name = ?, level = ?, hp = ?, attack = ?, 
                 defense = ?, description = ? WHERE id = ?`;
    
    db.run(sql, [name, level, hp, attack, defense, description, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changes: this.changes, message: '更新成功' });
    });
});

app.delete('/api/monsters/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM monsters WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changes: this.changes, message: '删除成功' });
    });
});

app.get('/api/maps', (req, res) => {
    const { search } = req.query;
    let sql = 'SELECT * FROM maps WHERE 1=1';
    const params = [];
    
    if (search) {
        sql += ' AND name LIKE ?';
        params.push(`%${search}%`);
    }
    sql += ' ORDER BY id DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows, count: rows.length });
    });
});

app.get('/api/maps/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM maps WHERE id = ?', [id], (err, map) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!map) return res.status(404).json({ error: '地图不存在' });
        res.json(map);
    });
});

app.post('/api/maps', (req, res) => {
    const { name, description, route_description } = req.body;
    if (!name) return res.status(400).json({ error: '地图名称必填' });
    
    const sql = `INSERT INTO maps (name, description, route_description) VALUES (?, ?, ?)`;
    db.run(sql, [name, description, route_description], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: '创建成功' });
    });
});

app.put('/api/maps/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, route_description } = req.body;
    
    const sql = `UPDATE maps SET name = ?, description = ?, route_description = ? WHERE id = ?`;
    db.run(sql, [name, description, route_description, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changes: this.changes, message: '更新成功' });
    });
});

app.delete('/api/maps/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM maps WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changes: this.changes, message: '删除成功' });
    });
});

app.get('/api/item-sources', (req, res) => {
    const sql = `
        SELECT s.*, i.name as item_name, m.name as monster_name, map.name as map_name
        FROM item_sources s
        LEFT JOIN items i ON s.item_id = i.id
        LEFT JOIN monsters m ON s.monster_id = m.id
        LEFT JOIN maps map ON s.map_id = map.id
        ORDER BY s.id DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows, count: rows.length });
    });
});

app.post('/api/item-sources', (req, res) => {
    const { item_id, monster_id, map_id, drop_rate, notes } = req.body;
    
    if (!item_id || !monster_id) {
        return res.status(400).json({ error: '物品和怪物必填' });
    }
    
    const sql = `INSERT INTO item_sources (item_id, monster_id, map_id, drop_rate, notes) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [item_id, monster_id, map_id, drop_rate, notes], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: '添加出处成功' });
    });
});

app.delete('/api/item-sources/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM item_sources WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changes: this.changes, message: '删除成功' });
    });
});

app.get('/api/monster-spawns', (req, res) => {
    const sql = `
        SELECT s.*, m.name as monster_name, map.name as map_name
        FROM monster_spawns s
        LEFT JOIN monsters m ON s.monster_id = m.id
        LEFT JOIN maps map ON s.map_id = map.id
        ORDER BY s.id DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows, count: rows.length });
    });
});

app.post('/api/monster-spawns', (req, res) => {
    const { monster_id, map_id, spawn_point, refresh_time, notes } = req.body;
    
    if (!monster_id || !map_id) {
        return res.status(400).json({ error: '怪物和地图必填' });
    }
    
    const sql = `INSERT INTO monster_spawns (monster_id, map_id, spawn_point, refresh_time, notes) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [monster_id, map_id, spawn_point, refresh_time, notes], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: '添加刷新点成功' });
    });
});

app.delete('/api/monster-spawns/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM monster_spawns WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changes: this.changes, message: '删除成功' });
    });
});

app.get('/api/npcs', (req, res) => {
    const sql = `
        SELECT n.*, m.name as map_name
        FROM npcs n
        LEFT JOIN maps m ON n.map_id = m.id
        ORDER BY n.id DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows, count: rows.length });
    });
});

app.post('/api/npcs', (req, res) => {
    const { name, map_id, position, function: npcFunction, dialogue } = req.body;
    if (!name) return res.status(400).json({ error: 'NPC 名称必填' });
    
    const sql = `INSERT INTO npcs (name, map_id, position, function, dialogue) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [name, map_id, position, npcFunction, dialogue], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: '创建成功' });
    });
});

app.put('/api/npcs/:id', (req, res) => {
    const { id } = req.params;
    const { name, map_id, position, function: npcFunction, dialogue } = req.body;
    
    const sql = `UPDATE npcs SET name = ?, map_id = ?, position = ?, function = ?, dialogue = ? WHERE id = ?`;
    db.run(sql, [name, map_id, position, npcFunction, dialogue, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changes: this.changes, message: '更新成功' });
    });
});

app.delete('/api/npcs/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM npcs WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ changes: this.changes, message: '删除成功' });
    });
});

app.get('/api/stats', (req, res) => {
    db.get('SELECT COUNT(*) as count FROM items', [], (err, items) => {
        db.get('SELECT COUNT(*) as count FROM monsters', [], (err, monsters) => {
            db.get('SELECT COUNT(*) as count FROM maps', [], (err, maps) => {
                db.get('SELECT COUNT(*) as count FROM npcs', [], (err, npcs) => {
                    db.get('SELECT COUNT(*) as count FROM item_sources', [], (err, sources) => {
                        res.json({
                            items: items.count,
                            monsters: monsters.count,
                            maps: maps.count,
                            npcs: npcs.count,
                            item_sources: sources.count
                        });
                    });
                });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║     大展宏图 - 游戏数据管理系统          ║
    ╠════════════════════════════════════════╣
    ║  🌐 前端查询：http://localhost:${PORT}    ║
    ║  ⚙️ 后台管理：http://localhost:${PORT}/admin.html ║
    ╚════════════════════════════════════════╝
    `);
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error(err.message);
        console.log('👋 数据库连接已关闭');
        process.exit(0);
    });
});
