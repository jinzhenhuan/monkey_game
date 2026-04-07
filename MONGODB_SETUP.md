# 🗄️ 迁移到 MongoDB Atlas - 永久保存数据

## 📋 为什么需要 MongoDB？

Vercel 的 SQLite 是临时文件系统，每次部署会重置，所以数据会丢失。

使用 MongoDB Atlas 云数据库：
- ✅ 数据永久保存
- ✅ 完全免费（512MB）
- ✅ 无需信用卡
- ✅ 全球访问

---

## 🎯 部署步骤（15 分钟）

### 第一步：注册 MongoDB Atlas

1. 访问：https://www.mongodb.com/cloud/atlas/register
2. 点击 **"Start for Free"**
3. 使用 Google 或 GitHub 账号登录
4. 填写基本信息
5. ✅ 注册完成！

---

### 第二步：创建免费集群

1. 登录后，点击 **"Build a Database"**
2. 选择 **"M0 FREE"** 套餐
3. 选择云提供商和区域：
   - **Provider:** AWS
   - **Region:** Singapore（新加坡，离中国近）
4. 集群名称：`game-query`
5. 点击 **"Create Cluster"**

等待 3-5 分钟集群创建完成。

---

### 第三步：配置访问权限

#### 1. 添加数据库用户

1. 点击左侧 **"Database Access"**
2. 点击 **"+ ADD NEW DATABASE USER"**
3. 选择 **"Password"** 认证
4. 填写：
   ```
   Username: gameadmin
   Password: (生成一个强密码，复制保存！)
   ```
5. 权限选择：**"Read and write to any database"**
6. 点击 **"Add User"**

#### 2. 添加网络访问

1. 点击左侧 **"Network Access"**
2. 点击 **"+ ADD IP ADDRESS"**
3. 点击 **"ALLOW ACCESS FROM ANYWHERE"**
4. 点击 **"Confirm"**

⚠️ **警告：** 这允许任何知道密码的人访问数据库。生产环境应该限制 IP。

---

### 第四步：获取连接字符串

1. 返回 **"Database"** 页面
2. 点击集群的 **"Connect"** 按钮
3. 选择 **"Connect your application"**
4. 选择 **Driver: Node.js**
5. 复制连接字符串，类似：
   ```
   mongodb+srv://gameadmin:<password>@game-query.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **替换 `<password>` 为你刚才设置的密码**

---

### 第五步：安装 MongoDB 依赖

在本地项目目录执行：

```bash
cd f:\Project\Game
npm install mongodb
```

---

### 第六步：修改代码

#### 1. 修改 server.js

将 SQLite 改为 MongoDB。

#### 2. 创建新文件 `db.js`

我会帮你创建 MongoDB 版本的代码。

---

### 第七步：配置环境变量

在 Vercel 项目设置中添加环境变量：

1. 进入 Vercel Dashboard
2. 选择你的项目 `monkey-game`
3. 点击 **"Settings"** → **"Environment Variables"**
4. 添加：
   ```
   Key: MONGODB_URI
   Value: mongodb+srv://gameadmin:你的密码@game-query.xxxxx.mongodb.net/game_query?retryWrites=true&w=majority
   ```
5. 点击 **"Save"**

---

### 第八步：重新部署

```bash
cd f:\Project\Game
git add .
git commit -m "Migrate to MongoDB Atlas"
git push
```

Vercel 会自动重新部署。

---

## ✅ 完成！

现在你的数据会永久保存在 MongoDB Atlas 云中！

访问后台添加数据，刷新页面数据不会丢失！

---

## 📊 查看数据库

随时可以访问 MongoDB Atlas Dashboard 查看你的数据：
- 点击 **"Browse Collections"**
- 可以看到所有集合（items, monsters, maps 等）
- 可以直接编辑、删除数据

---

## 🎯 需要我帮你改造代码吗？

告诉我：
- A. 需要，帮我改造成 MongoDB
- B. 太复杂了，我用本地开发吧
- C. 有其他问题

我会继续帮助你！💪
