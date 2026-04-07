const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

function connectDB() {
    return new Promise((resolve, reject) => {
        // 使用环境变量指定的路径，或者默认路径
        // Railway 的 Volume 会挂载到 /app，但我们需要保存到 Volume 内的子目录
        const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'game.db');
        console.log('📁 数据库路径:', dbPath);
        
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ 数据库连接失败:', err.message);
                reject(err);
                return;
            }
            console.log('✅ SQLite 数据库连接成功');
            
            // 初始化表
            initializeTables().then(() => {
                resolve(db);
            }).catch(reject);
        });
    });
}

async function initializeTables() {
    const createTables = `
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT,
            description TEXT,
            level_requirement INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS monsters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            hp INTEGER DEFAULT 100,
            attack INTEGER DEFAULT 10,
            defense INTEGER DEFAULT 5,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS maps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            route_description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS item_sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            monster_id INTEGER NOT NULL,
            map_id INTEGER,
            drop_rate TEXT,
            notes TEXT,
            FOREIGN KEY (item_id) REFERENCES items(id),
            FOREIGN KEY (monster_id) REFERENCES monsters(id),
            FOREIGN KEY (map_id) REFERENCES maps(id)
        );
        
        CREATE TABLE IF NOT EXISTS monster_spawns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            monster_id INTEGER NOT NULL,
            map_id INTEGER NOT NULL,
            spawn_point TEXT,
            refresh_time INTEGER,
            notes TEXT,
            FOREIGN KEY (monster_id) REFERENCES monsters(id),
            FOREIGN KEY (map_id) REFERENCES maps(id)
        );
        
        CREATE TABLE IF NOT EXISTS npcs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            map_id INTEGER,
            position TEXT,
            function TEXT,
            dialogue TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (map_id) REFERENCES maps(id)
        );
    `;

    return new Promise((resolve, reject) => {
        db.exec(createTables, (err) => {
            if (err) {
                console.error('❌ 表创建失败:', err.message);
                reject(err);
            } else {
                console.log('✅ 数据表初始化完成');
                resolve();
            }
        });
    });
}

function getDB() {
    if (!db) {
        throw new Error('数据库未连接，请先调用 connectDB()');
    }
    return db;
}

function closeDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('关闭数据库失败:', err.message);
                    reject(err);
                } else {
                    console.log('数据库已关闭');
                    db = null;
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}

module.exports = { connectDB, getDB, closeDB };
