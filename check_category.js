const sqlite3 = require('sqlite3').verbose();

// 打开数据库连接
const db = new sqlite3.Database('data/game.db');

// 查询装备分类
db.all('SELECT DISTINCT category FROM items WHERE type = ?', ['装备'], (err, rows) => {
    if (err) {
        console.error('查询出错:', err);
    } else {
        console.log('数据库中的装备分类:');
        rows.forEach(row => {
            console.log(`- ${row.category}`);
        });
        
        // 检查是否包含"坐骑/鞋靴"
        const hasMount = rows.some(row => row.category === '坐骑/鞋靴');
        console.log(`\n是否包含"坐骑/鞋靴": ${hasMount ? '是' : '否'}`);
    }
    
    // 关闭数据库连接
    db.close();
});