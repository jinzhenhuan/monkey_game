const sqlite3 = require('sqlite3').verbose();

// 连接数据库
const db = new sqlite3.Database('./data/game.db', (err) => {
    if (err) {
        console.error('连接数据库失败:', err.message);
        return;
    }
    console.log('成功连接到数据库');
});

// 清理 item_sources 表中 map_id 不存在于 maps 表中的记录
console.log('清理 item_sources 表中 map_id 不存在于 maps 表中的记录:');
db.run(`
    DELETE FROM item_sources
    WHERE map_id NOT IN (SELECT id FROM maps)
`, function(err) {
    if (err) {
        console.error('清理 item_sources 失败:', err.message);
        return;
    }
    console.log(`成功删除了 ${this.changes} 条无效记录`);
    
    // 清理 monster_spawns 表中 map_id 不存在于 maps 表中的记录
    console.log('\n清理 monster_spawns 表中 map_id 不存在于 maps 表中的记录:');
    db.run(`
        DELETE FROM monster_spawns
        WHERE map_id NOT IN (SELECT id FROM maps)
    `, function(err) {
        if (err) {
            console.error('清理 monster_spawns 失败:', err.message);
            return;
        }
        console.log(`成功删除了 ${this.changes} 条无效记录`);
        
        // 清理 monster_spawns 表中 monster_id 不存在于 monsters 表中的记录
        console.log('\n清理 monster_spawns 表中 monster_id 不存在于 monsters 表中的记录:');
        db.run(`
            DELETE FROM monster_spawns
            WHERE monster_id NOT IN (SELECT id FROM monsters)
        `, function(err) {
            if (err) {
                console.error('清理 monster_spawns 失败:', err.message);
                return;
            }
            console.log(`成功删除了 ${this.changes} 条无效记录`);
            
            // 关闭数据库连接
            db.close((err) => {
                if (err) {
                    console.error('关闭数据库失败:', err.message);
                    return;
                }
                console.log('\n成功关闭数据库连接');
                console.log('数据库清理完成！');
            });
        });
    });
});