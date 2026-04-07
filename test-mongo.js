const { MongoClient } = require('mongodb');

async function testConnection() {
    // 从环境变量获取连接字符串，如果没有则使用你手动输入的
    const uri = process.env.MONGODB_URI || '你的连接字符串';
    
    console.log('正在连接 MongoDB...');
    console.log('连接字符串:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'));
    
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ MongoDB 连接成功！');
        
        const db = client.db();
        const collections = await db.listCollections().toArray();
        console.log('数据库中的集合:', collections.map(c => c.name).join(', '));
        
        await client.close();
        console.log('👋 连接已关闭');
    } catch (err) {
        console.error('❌ MongoDB 连接失败:', err.message);
        console.error('完整错误:', err);
    }
}

testConnection();
