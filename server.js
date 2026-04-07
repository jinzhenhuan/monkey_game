const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getDB, closeDB } = require('./db');

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
connectDB()
    .then(() => console.log('🎉 服务已启动，SQLite 数据库连接成功'))
    .catch(err => {
        console.error('⚠️  数据库连接失败');
        console.error('错误:', err.message);
        process.exit(1);
    });

// API 路由

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/items', async (req, res) => {
    try {
        const db = getDB();
        const { search, type } = req.query;
        let query = 'SELECT * FROM items WHERE 1=1';
        const params = [];
        
        if (search) {
            query += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }
        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }
        query += ' ORDER BY id DESC';
        
        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ data: rows, count: rows.length });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/items/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        
        db.get('SELECT * FROM items WHERE id = ?', [id], (err, item) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!item) return res.status(404).json({ error: '物品不存在' });
            
            const sql = `
                SELECT 
                    s.id,
                    s.item_id,
                    s.monster_id,
                    s.map_id,
                    s.drop_rate,
                    s.notes,
                    m.name as monster_name,
                    mp.name as map_name
                FROM item_sources s
                LEFT JOIN monsters m ON s.monster_id = m.id
                LEFT JOIN maps mp ON s.map_id = mp.id
                WHERE s.item_id = ?
            `;
            
            db.all(sql, [id], (err, sources) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ...item, sources });
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/items', async (req, res) => {
    try {
        const db = getDB();
        const { name, type, description, level_requirement } = req.body;
        
        if (!name) return res.status(400).json({ error: '物品名称必填' });
        
        const sql = `INSERT INTO items (name, type, description, level_requirement) VALUES (?, ?, ?, ?)`;
        
        db.run(sql, [name, type || '', description || '', level_requirement || 0], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: '创建成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/items/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { name, type, description, level_requirement } = req.body;
        
        const sql = `UPDATE items SET name = ?, type = ?, description = ?, level_requirement = ? WHERE id = ?`;
        
        db.run(sql, [name, type, description, level_requirement, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ changes: this.changes, message: '更新成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/items/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        
        db.run('DELETE FROM items WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: '删除成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/monsters', async (req, res) => {
    try {
        const db = getDB();
        const { search } = req.query;
        let query = 'SELECT * FROM monsters WHERE 1=1';
        const params = [];
        
        if (search) {
            query += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }
        query += ' ORDER BY level ASC, id DESC';
        
        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ data: rows, count: rows.length });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/monsters/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        
        db.get('SELECT * FROM monsters WHERE id = ?', [id], (err, monster) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!monster) return res.status(404).json({ error: '怪物不存在' });
            
            const sql = `
                SELECT 
                    s.id,
                    s.monster_id,
                    s.map_id,
                    s.spawn_point,
                    s.refresh_time,
                    s.notes,
                    mp.name as map_name
                FROM monster_spawns s
                LEFT JOIN maps mp ON s.map_id = mp.id
                WHERE s.monster_id = ?
            `;
            
            db.all(sql, [id], (err, spawns) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ...monster, spawns });
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/monsters', async (req, res) => {
    try {
        const db = getDB();
        const { name, level, hp, attack, defense, description } = req.body;
        
        if (!name) return res.status(400).json({ error: '怪物名称必填' });
        
        const sql = `INSERT INTO monsters (name, level, hp, attack, defense, description) VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [name, level || 1, hp || 100, attack || 10, defense || 5, description || ''], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: '创建成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/monsters/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { name, level, hp, attack, defense, description } = req.body;
        
        const sql = `UPDATE monsters SET name = ?, level = ?, hp = ?, attack = ?, defense = ?, description = ? WHERE id = ?`;
        
        db.run(sql, [name, level, hp, attack, defense, description, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ changes: this.changes, message: '更新成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/monsters/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        
        db.run('DELETE FROM monsters WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: '删除成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/maps', async (req, res) => {
    try {
        const db = getDB();
        const { search } = req.query;
        let query = 'SELECT * FROM maps WHERE 1=1';
        const params = [];
        
        if (search) {
            query += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }
        query += ' ORDER BY id DESC';
        
        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ data: rows, count: rows.length });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/maps/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        
        db.get('SELECT * FROM maps WHERE id = ?', [id], (err, map) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!map) return res.status(404).json({ error: '地图不存在' });
            
            res.json(map);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/maps', async (req, res) => {
    try {
        const db = getDB();
        const { name, description, route_description } = req.body;
        
        if (!name) return res.status(400).json({ error: '地图名称必填' });
        
        const sql = `INSERT INTO maps (name, description, route_description) VALUES (?, ?, ?)`;
        
        db.run(sql, [name, description || '', route_description || ''], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: '创建成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/maps/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { name, description, route_description } = req.body;
        
        const sql = `UPDATE maps SET name = ?, description = ?, route_description = ? WHERE id = ?`;
        
        db.run(sql, [name, description, route_description, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ changes: this.changes, message: '更新成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/maps/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        
        db.run('DELETE FROM maps WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: '删除成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/item-sources', async (req, res) => {
    try {
        const db = getDB();
        
        const sql = `
            SELECT 
                s.id,
                s.item_id,
                s.monster_id,
                s.map_id,
                s.drop_rate,
                s.notes,
                i.name as item_name,
                m.name as monster_name,
                mp.name as map_name
            FROM item_sources s
            LEFT JOIN items i ON s.item_id = i.id
            LEFT JOIN monsters m ON s.monster_id = m.id
            LEFT JOIN maps mp ON s.map_id = mp.id
            ORDER BY s.id DESC
        `;
        
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ data: rows, count: rows.length });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/item-sources', async (req, res) => {
    try {
        const db = getDB();
        const { item_id, monster_id, map_id, drop_rate, notes } = req.body;
        
        if (!item_id || !monster_id) {
            return res.status(400).json({ error: '物品和怪物必填' });
        }
        
        const sql = `INSERT INTO item_sources (item_id, monster_id, map_id, drop_rate, notes) VALUES (?, ?, ?, ?, ?)`;
        
        db.run(sql, [item_id, monster_id, map_id || null, drop_rate || '', notes || ''], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: '添加出处成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/item-sources/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        
        db.run('DELETE FROM item_sources WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: '删除成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/monster-spawns', async (req, res) => {
    try {
        const db = getDB();
        
        const sql = `
            SELECT 
                s.id,
                s.monster_id,
                s.map_id,
                s.spawn_point,
                s.refresh_time,
                s.notes,
                m.name as monster_name,
                mp.name as map_name
            FROM monster_spawns s
            LEFT JOIN monsters m ON s.monster_id = m.id
            LEFT JOIN maps mp ON s.map_id = mp.id
            ORDER BY s.id DESC
        `;
        
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ data: rows, count: rows.length });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/monster-spawns', async (req, res) => {
    try {
        const db = getDB();
        const { monster_id, map_id, spawn_point, refresh_time, notes } = req.body;
        
        if (!monster_id || !map_id) {
            return res.status(400).json({ error: '怪物和地图必填' });
        }
        
        const sql = `INSERT INTO monster_spawns (monster_id, map_id, spawn_point, refresh_time, notes) VALUES (?, ?, ?, ?, ?)`;
        
        db.run(sql, [monster_id, map_id, spawn_point || '', refresh_time || null, notes || ''], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: '添加刷新点成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/monster-spawns/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        
        db.run('DELETE FROM monster_spawns WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: '删除成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/npcs', async (req, res) => {
    try {
        const db = getDB();
        
        const sql = `
            SELECT 
                n.id,
                n.name,
                n.map_id,
                n.position,
                n.function,
                n.dialogue,
                m.name as map_name
            FROM npcs n
            LEFT JOIN maps m ON n.map_id = m.id
            ORDER BY n.id DESC
        `;
        
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ data: rows, count: rows.length });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/npcs', async (req, res) => {
    try {
        const db = getDB();
        const { name, map_id, position, function: npcFunction, dialogue } = req.body;
        
        if (!name) return res.status(400).json({ error: 'NPC 名称必填' });
        
        const sql = `INSERT INTO npcs (name, map_id, position, function, dialogue) VALUES (?, ?, ?, ?, ?)`;
        
        db.run(sql, [name, map_id || null, position || '', npcFunction || '', dialogue || ''], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: '创建成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/npcs/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { name, map_id, position, function: npcFunction, dialogue } = req.body;
        
        const sql = `UPDATE npcs SET name = ?, map_id = ?, position = ?, function = ?, dialogue = ? WHERE id = ?`;
        
        db.run(sql, [name, map_id, position, npcFunction, dialogue, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ changes: this.changes, message: '更新成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/npcs/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        
        db.run('DELETE FROM npcs WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: '删除成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const db = getDB();
        
        const tables = ['items', 'monsters', 'maps', 'npcs', 'item_sources'];
        const stats = {};
        
        const countPromises = tables.map(table => {
            return new Promise((resolve) => {
                db.get(`SELECT COUNT(*) as count FROM ${table}`, [], (err, row) => {
                    resolve({ table, count: row ? row.count : 0 });
                });
            });
        });
        
        Promise.all(countPromises).then(results => {
            results.forEach(({ table, count }) => {
                stats[table] = count;
            });
            res.json(stats);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║     大展宏图 - 游戏数据管理系统          ║
    ════════════════════════════════════════╣
      🌐 前端查询：http://localhost:${PORT}    ║
    ║  ️ 后台管理：http://localhost:${PORT}/admin.html ║
    ║  💾 数据库：SQLite                       ║
    ╚════════════════════════════════════════╝
    `);
});

process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
});
