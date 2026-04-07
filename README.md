# 大展宏图 - 游戏数据管理系统

一个完整的游戏数据查询和管理系统，支持物品、怪物、地图、NPC 等数据的管理和查询。

## 🌟 功能特性

### 前台查询系统
- 📦 物品查询 - 查看物品属性、掉落来源
- 👹 怪物查询 - 查看怪物属性、刷新地点
- 🗺️ 地图查询 - 查看地图详情、走法说明
- 🧙 NPC 查询 - 查看 NPC 位置、功能
- 📚 游戏攻略 - 新手指南

### 后台管理系统
- 📊 数据概览 - 实时统计
- 📦 物品管理 - CRUD 操作
- 👹 怪物管理 - 属性配置
- 🗺️ 地图管理 - 走法说明
- 🔗 物品出处 - 关联管理
- 📍 怪物刷新 - 刷新点设置
- 🧙 NPC 管理 - NPC 配置

## 🚀 部署方案

### 🥇 推荐方案：部署到 Zeabur（无需信用卡！）

**Zeabur 优点：**
- ✅ 完全免费（$5/月额度）
- ✅ 无需信用卡
- ✅ 中文界面
- ✅ 新加坡节点，速度快

**详细步骤：** 查看 [`ZEABUR_DEPLOY.md`](ZEABUR_DEPLOY.md)

### 备选方案：部署到 Render

⚠️ **注意：** Render 需要信用卡验证

### 第一步：准备 GitHub 仓库

1. 注册 GitHub 账号：https://github.com

2. 创建新仓库
   ```bash
   # 在本地项目目录执行
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```

### 第二步：部署到 Render

1. 注册 Render：https://render.com

2. 创建 Web Service
   - 登录 Render Dashboard
   - 点击 "New +" → "Web Service"
   - 连接 GitHub 账号
   - 选择你的仓库

3. 配置服务
   ```
   Name: game-query-system
   Region: Singapore (新加坡，离中国近)
   Branch: main
   Root Directory: (留空)
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   ```

4. 选择免费套餐
   - Instance Type: **Free**
   - 点击 "Create Web Service"

5. 等待部署完成（约 2-5 分钟）

6. 获取访问地址
   - 部署成功后，你会看到类似：`https://game-query-system-abc123.onrender.com`
   - 这就是你的 API 地址！

### 第三步：配置前端 API 地址

1. 打开 `public/index.html`

2. 找到这行（约第 600 行）：
   ```javascript
   const API_BASE = 'http://localhost:3000/api';
   ```

3. 修改为你的 Render 地址：
   ```javascript
   const API_BASE = 'https://game-query-system-abc123.onrender.com/api';
   ```

4. 同样修改 `public/admin.html` 中的 API 地址

### 第四步：部署前端到 Cloudflare Pages

1. 登录 Cloudflare：https://dash.cloudflare.com

2. 创建 Pages 项目
   - 进入 Pages → "Create a project"
   - 选择 "Connect to Git"
   - 选择你的仓库

3. 构建设置
   ```
   Project name: game-query-frontend
   Production branch: main
   Build command: (留空，因为是纯静态)
   Build output directory: public
   ```

4. 环境变量（重要！）
   - 在 "Environment variables" 中添加：
   ```
   Variable name: API_BASE
   Value: https://你的-render-地址.onrender.com/api
   ```

5. 点击 "Save and Deploy"

6. 配置自定义域名（可选）
   - 进入项目设置 → "Custom domains"
   - 添加你的域名

## 💻 本地开发

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 访问
# 前台：http://localhost:3000
# 后台：http://localhost:3000/admin.html
```

## 📊 数据库说明

- 使用 SQLite 数据库
- 数据库文件：`game_data.db`
- 云平台会自动创建数据库
- 备份时下载数据库文件即可

## 🔧 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务端口 | 3000 |

## 📝 使用流程

### 后台添加数据步骤：

1. 访问后台管理：`/admin.html`
2. **先添加地图**（如：祖玛寺庙）
3. **再添加怪物**（如：祖玛教主）
4. **然后添加物品**（如：裁决之杖）
5. **在"物品出处"建立关联**：裁决之杖 ← 祖玛教主 ← 祖玛寺庙
6. **设置怪物刷新点**：祖玛教主 @ 祖玛寺庙五层 (125,80)

### 前台查询：

访问网站首页，选择物品即可看到掉落来源和走法！

## ⚠️ 注意事项

1. **Render 免费套餐限制**
   - 每月 750 小时运行时间
   - 15 分钟无访问自动休眠
   - 下次访问需 30 秒唤醒
   - 解决方案：使用 UptimeRobot 免费监控保持活跃

2. **数据库备份**
   - 定期从 Render 下载 `game_data.db` 文件
   - 或使用 Render 的数据库备份功能

3. **API 地址**
   - 确保前端文件的 API_BASE 正确
   - 本地开发用 localhost
   - 生产环境用 Render 地址

## 🎯 快速开始

1. Fork 或克隆此仓库
2. 按照上述步骤部署到 Render
3. 部署前端到 Cloudflare Pages
4. 访问后台添加数据
5. 分享给朋友使用！

## 📞 技术支持

如有问题，请提交 Issue 或联系开发者。

## 📄 License

MIT License
