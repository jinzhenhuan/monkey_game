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
connectDB().catch(err => {
    console.error('数据库初始化失败:', err);
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
        let query = {};
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (type) {
            query.type = type;
        }
        
        const items = await db.collection('items').find(query).sort({ _id: -1 }).toArray();
        res.json({ data: items, count: items.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/items/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const { id } = req.params;
        
        const item = await db.collection('items').findOne({ _id: new ObjectId(id) });
        if (!item) return res.status(404).json({ error: '物品不存在' });
        
        const sources = await db.collection('item_sources')
            .aggregate([
                { $match: { item_id: id } },
                {
                    $lookup: {
                        from: 'monsters',
                        localField: 'monster_id',
                        foreignField: '_id',
                        as: 'monster'
                    }
                },
                {
                    $lookup: {
                        from: 'maps',
                        localField: 'map_id',
                        foreignField: '_id',
                        as: 'map'
                    }
                },
                { $unwind: { path: '$monster', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$map', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        item_id: 1,
                        monster_id: 1,
                        map_id: 1,
                        drop_rate: 1,
                        notes: 1,
                        monster_name: '$monster.name',
                        map_name: '$map.name'
                    }
                }
            ]).toArray();
        
        res.json({ ...item, sources });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/items', async (req, res) => {
    try {
        const db = getDB();
        const { name, type, description, level_requirement } = req.body;
        
        if (!name) return res.status(400).json({ error: '物品名称必填' });
        
        const result = await db.collection('items').insertOne({
            name,
            type: type || '',
            description: description || '',
            level_requirement: level_requirement || 0,
            created_at: new Date()
        });
        
        res.json({ id: result.insertedId, message: '创建成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/items/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const { id } = req.params;
        const { name, type, description, level_requirement } = req.body;
        
        const result = await db.collection('items').updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, type, description, level_requirement } }
        );
        
        res.json({ changes: result.modifiedCount, message: '更新成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/items/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const { id } = req.params;
        
        await db.collection('items').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: '删除成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/monsters', async (req, res) => {
    try {
        const db = getDB();
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        const monsters = await db.collection('monsters').find(query).sort({ level: 1, _id: -1 }).toArray();
        res.json({ data: monsters, count: monsters.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/monsters/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const { id } = req.params;
        
        const monster = await db.collection('monsters').findOne({ _id: new ObjectId(id) });
        if (!monster) return res.status(404).json({ error: '怪物不存在' });
        
        const spawns = await db.collection('monster_spawns')
            .aggregate([
                { $match: { monster_id: id } },
                {
                    $lookup: {
                        from: 'maps',
                        localField: 'map_id',
                        foreignField: '_id',
                        as: 'map'
                    }
                },
                { $unwind: { path: '$map', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        monster_id: 1,
                        map_id: 1,
                        spawn_point: 1,
                        refresh_time: 1,
                        notes: 1,
                        map_name: '$map.name'
                    }
                }
            ]).toArray();
        
        res.json({ ...monster, spawns });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/monsters', async (req, res) => {
    try {
        const db = getDB();
        const { name, level, hp, attack, defense, description } = req.body;
        
        if (!name) return res.status(400).json({ error: '怪物名称必填' });
        
        const result = await db.collection('monsters').insertOne({
            name,
            level: level || 1,
            hp: hp || 100,
            attack: attack || 10,
            defense: defense || 5,
            description: description || '',
            created_at: new Date()
        });
        
        res.json({ id: result.insertedId, message: '创建成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/monsters/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const { id } = req.params;
        const { name, level, hp, attack, defense, description } = req.body;
        
        const result = await db.collection('monsters').updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, level, hp, attack, defense, description } }
        );
        
        res.json({ changes: result.modifiedCount, message: '更新成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/monsters/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const { id } = req.params;
        
        await db.collection('monsters').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: '删除成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/maps', async (req, res) => {
    try {
        const db = getDB();
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        const maps = await db.collection('maps').find(query).sort({ _id: -1 }).toArray();
        res.json({ data: maps, count: maps.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/maps/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const { id } = req.params;
        
        const map = await db.collection('maps').findOne({ _id: new ObjectId(id) });
        if (!map) return res.status(404).json({ error: '地图不存在' });
        
        res.json(map);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/maps', async (req, res) => {
    try {
        const db = getDB();
        const { name, description, route_description } = req.body;
        
        if (!name) return res.status(400).json({ error: '地图名称必填' });
        
        const result = await db.collection('maps').insertOne({
            name,
            description: description || '',
            route_description: route_description || '',
            created_at: new Date()
        });
        
        res.json({ id: result.insertedId, message: '创建成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/maps/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const { id } = req.params;
        const { name, description, route_description } = req.body;
        
        const result = await db.collection('maps').updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, description, route_description } }
        );
        
        res.json({ changes: result.modifiedCount, message: '更新成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/maps/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const { id } = req.params;
        
        await db.collection('maps').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: '删除成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/item-sources', async (req, res) => {
    try {
        const db = getDB();
        
        const sources = await db.collection('item_sources')
            .aggregate([
                { $sort: { _id: -1 } },
                {
                    $lookup: {
                        from: 'items',
                        localField: 'item_id',
                        foreignField: '_id',
                        as: 'item'
                    }
                },
                {
                    $lookup: {
                        from: 'monsters',
                        localField: 'monster_id',
                        foreignField: '_id',
                        as: 'monster'
                    }
                },
                {
                    $lookup: {
                        from: 'maps',
                        localField: 'map_id',
                        foreignField: '_id',
                        as: 'map'
                    }
                },
                { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$monster', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$map', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        item_id: 1,
                        monster_id: 1,
                        map_id: 1,
                        drop_rate: 1,
                        notes: 1,
                        item_name: '$item.name',
                        monster_name: '$monster.name',
                        map_name: '$map.name'
                    }
                }
            ]).toArray();
        
        res.json({ data: sources, count: sources.length });
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
        
        const result = await db.collection('item_sources').insertOne({
            item_id,
            monster_id,
            map_id: map_id || null,
            drop_rate: drop_rate || '',
            notes: notes || ''
        });
        
        res.json({ id: result.insertedId, message: '添加出处成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/item-sources/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const { id } = req.params;
        
        await db.collection('item_sources').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: '删除成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/monster-spawns', async (req, res) => {
    try {
        const db = getDB();
        
        const spawns = await db.collection('monster_spawns')
            .aggregate([
                { $sort: { _id: -1 } },
                {
                    $lookup: {
                        from: 'monsters',
                        localField: 'monster_id',
                        foreignField: '_id',
                        as: 'monster'
                    }
                },
                {
                    $lookup: {
                        from: 'maps',
                        localField: 'map_id',
                        foreignField: '_id',
                        as: 'map'
                    }
                },
                { $unwind: { path: '$monster', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$map', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        monster_id: 1,
                        map_id: 1,
                        spawn_point: 1,
                        refresh_time: 1,
                        notes: 1,
                        monster_name: '$monster.name',
                        map_name: '$map.name'
                    }
                }
            ]).toArray();
        
        res.json({ data: spawns, count: spawns.length });
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
        
        const result = await db.collection('monster_spawns').insertOne({
            monster_id,
            map_id,
            spawn_point: spawn_point || '',
            refresh_time: refresh_time || null,
            notes: notes || ''
        });
        
        res.json({ id: result.insertedId, message: '添加刷新点成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/monster-spawns/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const { id } = req.params;
        
        await db.collection('monster_spawns').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: '删除成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/npcs', async (req, res) => {
    try {
        const db = getDB();
        
        const npcs = await db.collection('npcs')
            .aggregate([
                { $sort: { _id: -1 } },
                {
                    $lookup: {
                        from: 'maps',
                        localField: 'map_id',
                        foreignField: '_id',
                        as: 'map'
                    }
                },
                { $unwind: { path: '$map', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        map_id: 1,
                        position: 1,
                        function: 1,
                        dialogue: 1,
                        map_name: '$map.name'
                    }
                }
            ]).toArray();
        
        res.json({ data: npcs, count: npcs.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/npcs', async (req, res) => {
    try {
        const db = getDB();
        const { name, map_id, position, function: npcFunction, dialogue } = req.body;
        
        if (!name) return res.status(400).json({ error: 'NPC 名称必填' });
        
        const result = await db.collection('npcs').insertOne({
            name,
            map_id: map_id || null,
            position: position || '',
            function: npcFunction || '',
            dialogue: dialogue || '',
            created_at: new Date()
        });
        
        res.json({ id: result.insertedId, message: '创建成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/npcs/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const { id } = req.params;
        const { name, map_id, position, function: npcFunction, dialogue } = req.body;
        
        const result = await db.collection('npcs').updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, map_id, position, function: npcFunction, dialogue } }
        );
        
        res.json({ changes: result.modifiedCount, message: '更新成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/npcs/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const { id } = req.params;
        
        await db.collection('npcs').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: '删除成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const db = getDB();
        
        const items = await db.collection('items').countDocuments();
        const monsters = await db.collection('monsters').countDocuments();
        const maps = await db.collection('maps').countDocuments();
        const npcs = await db.collection('npcs').countDocuments();
        const item_sources = await db.collection('item_sources').countDocuments();
        
        res.json({
            items,
            monsters,
            maps,
            npcs,
            item_sources
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
    ║  ⚙️ 后台管理：http://localhost:${PORT}/admin.html ║
    ║  💾 数据库：MongoDB Atlas               ║
    ╚════════════════════════════════════════╝
    `);
});

process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
});
