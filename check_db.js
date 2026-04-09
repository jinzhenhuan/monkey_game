const sqlite3 = require('sqlite3').verbose();

// 连接数据库
const db = new sqlite3.Database('./data/game.db', (err) => {
    if (err) {
        console.error('连接数据库失败:', err.message);
        return;
    }
    console.log('成功连接到数据库');
});

// 查询 item_sources 表中的数据
console.log('查询 item_sources 表中的数据:');
db.all('SELECT id, item_id, map_id FROM item_sources', [], (err, rows) => {
    if (err) {
        console.error('查询 item_sources 失败:', err.message);
        return;
    }
    console.log('item_sources 表中的数据:');
    rows.forEach(row => {
        console.log(`id: ${row.id}, item_id: ${row.item_id}, map_id: ${row.map_id}`);
    });
    
    // 查询 maps 表中的数据
    console.log('\n查询 maps 表中的数据:');
    db.all('SELECT id, name FROM maps', [], (err, mapRows) => {
        if (err) {
            console.error('查询 maps 失败:', err.message);
            return;
        }
        console.log('maps 表中的数据:');
        mapRows.forEach(row => {
            console.log(`id: ${row.id}, name: ${row.name}`);
        });
        
        // 检查是否有 map_id 不存在于 maps 表中的记录
        console.log('\n检查是否有 map_id 不存在于 maps 表中的记录:');
        db.all(`
            SELECT s.id, s.item_id, s.map_id, mp.name as map_name
            FROM item_sources s
            LEFT JOIN maps mp ON s.map_id = mp.id
            WHERE mp.name IS NULL
        `, [], (err, nullRows) => {
            if (err) {
                console.error('检查 map_id 失败:', err.message);
                return;
            }
            console.log('map_id 不存在于 maps 表中的记录:');
            if (nullRows.length === 0) {
                console.log('没有发现 map_id 不存在于 maps 表中的记录');
            } else {
                nullRows.forEach(row => {
                    console.log(`id: ${row.id}, item_id: ${row.item_id}, map_id: ${row.map_id}, map_name: ${row.map_name}`);
                });
            }
            
            // 关闭数据库连接
            db.close((err) => {
                if (err) {
                    console.error('关闭数据库失败:', err.message);
                    return;
                }
                console.log('成功关闭数据库连接');
            });
        });
    });
});