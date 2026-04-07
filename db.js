const { MongoClient } = require('mongodb');

let db = null;
let client = null;

async function connectDB() {
    if (db) return db;

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGODB_DB_NAME || 'game_query';

    try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db(dbName);
        
        console.log('✅ MongoDB 连接成功');
        
        // 初始化集合
        await initCollections();
        
        return db;
    } catch (err) {
        console.error('❌ MongoDB 连接失败:', err);
        throw err;
    }
}

async function initCollections() {
    const collections = ['items', 'monsters', 'maps', 'npcs', 'item_sources', 'monster_spawns'];
    
    for (const name of collections) {
        const exists = await db.listCollections({ name }).hasNext();
        if (!exists) {
            await db.createCollection(name);
            console.log(`✅ 创建集合：${name}`);
        }
    }
}

function getDB() {
    if (!db) {
        throw new Error('数据库未连接，请先调用 connectDB()');
    }
    return db;
}

async function closeDB() {
    if (client) {
        await client.close();
        console.log('👋 MongoDB 连接已关闭');
    }
}

module.exports = {
    connectDB,
    getDB,
    closeDB
};
