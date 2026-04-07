const { MongoClient } = require('mongodb');

let db = null;
let client = null;

async function connectDB() {
    if (db) return db;

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'game_query';

    console.log('🔍 开始连接 MongoDB...');
    console.log('📝 环境变量 MONGODB_URI:', uri ? '已设置' : '未设置');
    console.log('📝 数据库名称:', dbName);

    if (!uri) {
        const errorMsg = '❌ 错误：MONGODB_URI 环境变量未设置！';
        console.error(errorMsg);
        console.error('请在 Vercel 中设置 MONGODB_URI 环境变量');
        throw new Error(errorMsg);
    }

    try {
        console.log('⏳ 正在连接 MongoDB Atlas...');
        client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        await client.connect();
        db = client.db(dbName);
        
        console.log('✅ MongoDB 连接成功！');
        console.log('📊 数据库:', db.databaseName);
        
        // 测试连接
        const admin = client.db().admin();
        const { version } = await admin.serverStatus();
        console.log('📦 MongoDB 版本:', version);
        
        // 初始化集合
        await initCollections();
        
        return db;
    } catch (err) {
        console.error('❌ MongoDB 连接失败！');
        console.error('错误类型:', err.name);
        console.error('错误信息:', err.message);
        console.error('完整错误:', JSON.stringify(err, null, 2));
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
