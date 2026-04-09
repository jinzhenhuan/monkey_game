const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getDB, closeDB } = require('./db');
const XLSX = require('xlsx');
const fs = require('fs');
const os = require('os');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 配置multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, os.tmpdir());
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

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
                    s.map_id,
                    s.drop_rate,
                    s.notes,
                    mp.name as map_name
                FROM item_sources s
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
        const { name, type, category, quality, description, level_requirement } = req.body;
        
        if (!name) return res.status(400).json({ error: '物品名称必填' });
        
        const sql = `INSERT INTO items (name, type, category, quality, description, level_requirement) VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [name, type || '', category || '', quality || '', description || '', level_requirement || 0], function(err) {
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
        const { name, type, category, quality, description, level_requirement } = req.body;
        
        const sql = `UPDATE items SET name = ?, type = ?, category = ?, quality = ?, description = ?, level_requirement = ? WHERE id = ?`;
        
        db.run(sql, [name, type, category, quality, description, level_requirement, id], function(err) {
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
        query += ' ORDER BY id DESC';
        
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
            if (!monster) return res.status(404).json({ error: '武将不存在' });
            
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
        const { name, general_trait, force, attack, intelligence, speed, description } = req.body;
        
        if (!name) return res.status(400).json({ error: '武将名称必填' });
        
        const sql = `INSERT INTO monsters (name, general_trait, force, attack, intelligence, speed, description) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [name, general_trait || '', force || 100, attack || 10, intelligence || 5, speed || 5, description || ''], function(err) {
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
        const { name, general_trait, force, attack, intelligence, speed, description } = req.body;
        
        const sql = `UPDATE monsters SET name = ?, general_trait = ?, force = ?, attack = ?, intelligence = ?, speed = ?, description = ? WHERE id = ?`;
        
        db.run(sql, [name, general_trait, force, attack, intelligence, speed, description, id], function(err) {
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
        const { name, description, route_description, dropped_items } = req.body;
        
        if (!name) return res.status(400).json({ error: '地图名称必填' });
        
        db.run('BEGIN TRANSACTION');
        
        const sql = `INSERT INTO maps (name, description, route_description) VALUES (?, ?, ?)`;
        
        db.run(sql, [name, description || '', route_description || ''], function(err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
            }
            
            const mapId = this.lastID;
            
            // 处理物品掉落
            if (dropped_items && dropped_items.length > 0) {
                const insertSourceSql = `INSERT INTO item_sources (item_id, map_id) VALUES (?, ?)`;
                
                let completed = 0;
                let hasError = false;
                
                dropped_items.forEach(itemId => {
                    db.run(insertSourceSql, [itemId, mapId], function(err) {
                        if (err) {
                            hasError = true;
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: err.message });
                        }
                        
                        completed++;
                        if (completed === dropped_items.length) {
                            db.run('COMMIT');
                            res.json({ id: mapId, message: '创建成功' });
                        }
                    });
                });
            } else {
                db.run('COMMIT');
                res.json({ id: mapId, message: '创建成功' });
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/maps/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { name, description, route_description, dropped_items } = req.body;
        
        db.run('BEGIN TRANSACTION');
        
        const sql = `UPDATE maps SET name = ?, description = ?, route_description = ? WHERE id = ?`;
        
        db.run(sql, [name, description, route_description, id], function(err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
            }
            
            // 删除旧的物品掉落关联
            db.run('DELETE FROM item_sources WHERE map_id = ?', [id], function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }
                
                // 处理新的物品掉落
                if (dropped_items && dropped_items.length > 0) {
                    const insertSourceSql = `INSERT INTO item_sources (item_id, map_id) VALUES (?, ?)`;
                    
                    let completed = 0;
                    let hasError = false;
                    
                    dropped_items.forEach(itemId => {
                        db.run(insertSourceSql, [itemId, id], function(err) {
                            if (err) {
                                hasError = true;
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: err.message });
                            }
                            
                            completed++;
                            if (completed === dropped_items.length) {
                                db.run('COMMIT');
                                res.json({ changes: 1, message: '更新成功' });
                            }
                        });
                    });
                } else {
                    db.run('COMMIT');
                    res.json({ changes: 1, message: '更新成功' });
                }
            });
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
                s.map_id,
                s.drop_rate,
                s.notes,
                i.name as item_name,
                mp.name as map_name
            FROM item_sources s
            LEFT JOIN items i ON s.item_id = i.id
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
        const { item_id, map_ids, notes } = req.body;
        
        if (!item_id) return res.status(400).json({ error: '物品不能为空' });
        
        // 先删除该物品的所有旧出处记录
        db.run('BEGIN TRANSACTION');
        
        db.run('DELETE FROM item_sources WHERE item_id = ?', [item_id], function(err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
            }
            
            if (!map_ids || map_ids.length === 0) {
                // 如果没有选择地图，创建一个没有地图的记录
                const sql = `INSERT INTO item_sources (item_id, map_id, notes) VALUES (?, ?, ?)`;
                db.run(sql, [item_id, null, notes || ''], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: err.message });
                    }
                    db.run('COMMIT');
                    res.json({ id: this.lastID, message: '创建成功' });
                });
            } else {
                // 为每个选中的地图创建一个记录
                let completed = 0;
                let hasError = false;
                
                map_ids.forEach(map_id => {
                    const sql = `INSERT INTO item_sources (item_id, map_id, notes) VALUES (?, ?, ?)`;
                    db.run(sql, [item_id, map_id, notes || ''], function(err) {
                        if (err) {
                            hasError = true;
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: err.message });
                        }
                        
                        completed++;
                        if (completed === map_ids.length) {
                            db.run('COMMIT');
                            res.json({ message: '创建成功' });
                        }
                    });
                });
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/item-sources/:item_id', async (req, res) => {
    try {
        const db = getDB();
        const { item_id } = req.params;
        
        db.run('DELETE FROM item_sources WHERE item_id = ?', [item_id], function(err) {
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
            return res.status(400).json({ error: '武将和地图必填' });
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

app.put('/api/monster-spawns/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { monster_id, map_id, spawn_point, refresh_time, notes } = req.body;
        
        if (!monster_id || !map_id) {
            return res.status(400).json({ error: '武将和地图必填' });
        }
        
        const sql = `UPDATE monster_spawns SET monster_id = ?, map_id = ?, spawn_point = ?, refresh_time = ?, notes = ? WHERE id = ?`;
        
        db.run(sql, [monster_id, map_id, spawn_point || '', refresh_time || null, notes || '', id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ changes: this.changes, message: '更新成功' });
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



app.get('/api/stats', async (req, res) => {
    try {
        const db = getDB();
        
        const tables = ['items', 'monsters', 'maps', 'item_sources'];
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

// 攻略相关API
app.get('/api/guides', async (req, res) => {
    try {
        const db = getDB();
        const { search } = req.query;
        let query = 'SELECT * FROM guides WHERE 1=1';
        const params = [];
        
        if (search) {
            query += ' AND title LIKE ?';
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

app.post('/api/guides', async (req, res) => {
    try {
        const db = getDB();
        const { title, content } = req.body;
        
        if (!title || !content) return res.status(400).json({ error: '标题和内容必填' });
        
        const sql = `INSERT INTO guides (title, content) VALUES (?, ?)`;
        
        db.run(sql, [title, content], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: '创建成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/guides/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { title, content } = req.body;
        
        if (!title || !content) return res.status(400).json({ error: '标题和内容必填' });
        
        const sql = `UPDATE guides SET title = ?, content = ? WHERE id = ?`;
        
        db.run(sql, [title, content, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ changes: this.changes, message: '更新成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/guides/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        
        db.run('DELETE FROM guides WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: '删除成功' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Excel 导入导出 API

// 导出物品为 Excel
app.get('/api/export/items', async (req, res) => {
    try {
        const db = getDB();
        
        const sql = `SELECT name, type, category, quality, level_requirement, description FROM items ORDER BY id`;
        
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // 转换数据为中文表头格式
            const chineseRows = rows.map(row => ({
                '物品名称': row.name,
                '类型': row.type,
                '分类': row.category,
                '品级': row.quality,
                '等级': row.level_requirement,
                '描述': row.description
            }));
            
            // 创建工作表，使用中文表头
            const ws = XLSX.utils.json_to_sheet(chineseRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, '物品');
            
            // 生成Excel文件
            const fileName = `物品_${Date.now()}.xlsx`;
            const filePath = path.join(os.tmpdir(), fileName);
            XLSX.writeFile(wb, filePath);
            
            // 发送文件
            res.download(filePath, fileName, (err) => {
                if (err) return res.status(500).json({ error: err.message });
                // 删除临时文件
                fs.unlinkSync(filePath);
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 导出地图为 Excel
app.get('/api/export/maps', async (req, res) => {
    try {
        const db = getDB();
        
        const sql = `SELECT name, description, route_description FROM maps ORDER BY id`;
        
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // 转换数据为中文表头格式
            const chineseRows = rows.map(row => ({
                '地图名称': row.name,
                '描述': row.description,
                '走法说明': row.route_description
            }));
            
            // 创建工作表，使用中文表头
            const ws = XLSX.utils.json_to_sheet(chineseRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, '地图');
            
            // 生成Excel文件
            const fileName = `地图_${Date.now()}.xlsx`;
            const filePath = path.join(os.tmpdir(), fileName);
            XLSX.writeFile(wb, filePath);
            
            // 发送文件
            res.download(filePath, fileName, (err) => {
                if (err) return res.status(500).json({ error: err.message });
                // 删除临时文件
                fs.unlinkSync(filePath);
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 导出武将为 Excel
app.get('/api/export/monsters', async (req, res) => {
    try {
        const db = getDB();
        
        const sql = `SELECT name, general_trait, force, attack, intelligence, speed, description FROM monsters ORDER BY id`;
        
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // 转换数据为中文表头格式
            const chineseRows = rows.map(row => ({
                '武将名称': row.name,
                '大将特性': row.general_trait,
                '兵力': row.force,
                '武力': row.attack,
                '智力': row.intelligence,
                '速度': row.speed,
                '描述': row.description
            }));
            
            // 创建工作表，使用中文表头
            const ws = XLSX.utils.json_to_sheet(chineseRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, '武将');
            
            // 生成Excel文件
            const fileName = `武将_${Date.now()}.xlsx`;
            const filePath = path.join(os.tmpdir(), fileName);
            XLSX.writeFile(wb, filePath);
            
            // 发送文件
            res.download(filePath, fileName, (err) => {
                if (err) return res.status(500).json({ error: err.message });
                // 删除临时文件
                fs.unlinkSync(filePath);
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 导入Excel文件
app.post('/api/import', async (req, res) => {
    try {
        // 这里需要处理文件上传，暂时返回提示
        res.json({ message: '导入功能开发中' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 全站数据备份和恢复

// 备份数据
app.get('/api/backup', async (req, res) => {
    try {
        const db = getDB();
        const tables = ['items', 'monsters', 'maps', 'item_sources', 'monster_spawns', 'guides'];
        const backupData = {};
        
        let completed = 0;
        
        tables.forEach(table => {
            db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                
                backupData[table] = rows;
                completed++;
                
                if (completed === tables.length) {
                    // 生成备份文件
                    const fileName = `backup_${Date.now()}.json`;
                    const filePath = path.join(os.tmpdir(), fileName);
                    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
                    
                    // 发送文件
                    res.download(filePath, fileName, (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        // 删除临时文件
                        fs.unlinkSync(filePath);
                    });
                }
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 导入Excel文件
app.post('/api/import/items', upload.single('file'), async (req, res) => {
    try {
        const db = getDB();
        
        if (!req.file) return res.status(400).json({ error: '请选择文件' });
        
        // 读取Excel文件
        const workbook = XLSX.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // 解析数据
        const rows = XLSX.utils.sheet_to_json(worksheet);
        
        if (rows.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: '文件中没有数据' });
        }
        
        // 清空旧数据
        db.run('DELETE FROM items', (err) => {
            if (err) {
                fs.unlinkSync(req.file.path);
                return res.status(500).json({ error: err.message });
            }
            
            // 批量插入新数据
            let completed = 0;
            
            db.run('BEGIN TRANSACTION');
            
            rows.forEach(row => {
                const sql = `INSERT INTO items (name, type, category, quality, level_requirement, description) VALUES (?, ?, ?, ?, ?, ?)`;
                db.run(sql, [row['物品名称'], row['类型'], row['分类'], row['品级'], row['等级'], row['描述']], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        fs.unlinkSync(req.file.path);
                        return res.status(500).json({ error: err.message });
                    }
                    
                    completed++;
                    if (completed === rows.length) {
                        db.run('COMMIT');
                        fs.unlinkSync(req.file.path);
                        res.json({ message: '导入成功', count: rows.length });
                    }
                });
            });
        });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/import/maps', upload.single('file'), async (req, res) => {
    try {
        const db = getDB();
        
        if (!req.file) return res.status(400).json({ error: '请选择文件' });
        
        // 读取Excel文件
        const workbook = XLSX.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // 解析数据
        const rows = XLSX.utils.sheet_to_json(worksheet);
        
        if (rows.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: '文件中没有数据' });
        }
        
        // 清空旧数据
        db.run('DELETE FROM maps', (err) => {
            if (err) {
                fs.unlinkSync(req.file.path);
                return res.status(500).json({ error: err.message });
            }
            
            // 批量插入新数据
            let completed = 0;
            
            db.run('BEGIN TRANSACTION');
            
            rows.forEach(row => {
                const sql = `INSERT INTO maps (name, description, route_description) VALUES (?, ?, ?)`;
                db.run(sql, [row['地图名称'], row['描述'], row['走法说明']], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        fs.unlinkSync(req.file.path);
                        return res.status(500).json({ error: err.message });
                    }
                    
                    completed++;
                    if (completed === rows.length) {
                        db.run('COMMIT');
                        fs.unlinkSync(req.file.path);
                        res.json({ message: '导入成功', count: rows.length });
                    }
                });
            });
        });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/import/monsters', upload.single('file'), async (req, res) => {
    try {
        const db = getDB();
        
        if (!req.file) return res.status(400).json({ error: '请选择文件' });
        
        // 读取Excel文件
        const workbook = XLSX.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // 解析数据
        const rows = XLSX.utils.sheet_to_json(worksheet);
        
        if (rows.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: '文件中没有数据' });
        }
        
        // 清空旧数据
        db.run('DELETE FROM monsters', (err) => {
            if (err) {
                fs.unlinkSync(req.file.path);
                return res.status(500).json({ error: err.message });
            }
            
            // 批量插入新数据
            let completed = 0;
            
            db.run('BEGIN TRANSACTION');
            
            rows.forEach(row => {
                const sql = `INSERT INTO monsters (name, general_trait, force, attack, intelligence, speed, description) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                db.run(sql, [row['武将名称'], row['大将特性'], row['兵力'], row['武力'], row['智力'], row['速度'], row['描述']], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        fs.unlinkSync(req.file.path);
                        return res.status(500).json({ error: err.message });
                    }
                    
                    completed++;
                    if (completed === rows.length) {
                        db.run('COMMIT');
                        fs.unlinkSync(req.file.path);
                        res.json({ message: '导入成功', count: rows.length });
                    }
                });
            });
        });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    }
});

// 恢复数据
app.post('/api/restore', upload.single('file'), async (req, res) => {
    try {
        const db = getDB();
        
        if (!req.file) return res.status(400).json({ error: '请选择文件' });
        
        // 读取备份文件
        const backupData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
        
        // 定义需要恢复的表
        const tables = ['items', 'monsters', 'maps', 'item_sources', 'monster_spawns', 'guides'];
        
        // 开始事务
        db.run('BEGIN TRANSACTION');
        
        let completed = 0;
        
        // 恢复每个表的数据
        tables.forEach(table => {
            if (backupData[table]) {
                // 清空表
                db.run(`DELETE FROM ${table}`, (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        fs.unlinkSync(req.file.path);
                        return res.status(500).json({ error: err.message });
                    }
                    
                    // 插入数据
                    if (backupData[table].length > 0) {
                        const firstRow = backupData[table][0];
                        const columns = Object.keys(firstRow).join(', ');
                        const placeholders = Object.keys(firstRow).map(() => '?').join(', ');
                        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
                        
                        let rowCompleted = 0;
                        
                        backupData[table].forEach(row => {
                            const values = Object.values(row);
                            db.run(sql, values, function(err) {
                                if (err) {
                                    db.run('ROLLBACK');
                                    fs.unlinkSync(req.file.path);
                                    return res.status(500).json({ error: err.message });
                                }
                                
                                rowCompleted++;
                                if (rowCompleted === backupData[table].length) {
                                    completed++;
                                    if (completed === tables.length) {
                                        db.run('COMMIT');
                                        fs.unlinkSync(req.file.path);
                                        res.json({ message: '恢复成功' });
                                    }
                                }
                            });
                        });
                    } else {
                        completed++;
                        if (completed === tables.length) {
                            db.run('COMMIT');
                            fs.unlinkSync(req.file.path);
                            res.json({ message: '恢复成功' });
                        }
                    }
                });
            } else {
                completed++;
                if (completed === tables.length) {
                    db.run('COMMIT');
                    fs.unlinkSync(req.file.path);
                    res.json({ message: '恢复成功' });
                }
            }
        });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    }
});

// 清空所有数据
app.delete('/api/clear-all', async (req, res) => {
    try {
        const db = getDB();
        
        // 定义需要清空的表
        const tables = ['items', 'monsters', 'maps', 'item_sources', 'monster_spawns', 'guides'];
        
        // 开始事务
        db.run('BEGIN TRANSACTION');
        
        let completed = 0;
        
        // 清空每个表
        tables.forEach(table => {
            db.run(`DELETE FROM ${table}`, (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }
                
                completed++;
                if (completed === tables.length) {
                    db.run('COMMIT');
                    res.json({ message: '清空成功' });
                }
            });
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
