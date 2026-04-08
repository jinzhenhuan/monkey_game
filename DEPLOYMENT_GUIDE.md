# 🎯 部署实战指南 - 从零到上线

## 📋 准备工作（5 分钟）

### 1. 注册 GitHub 账号

1. 访问：https://github.com
2. 点击 "Sign up"
3. 填写邮箱、密码、用户名
4. 验证邮箱
5. ✅ 完成！

---

## 🚀 第一步：创建 GitHub 仓库（10 分钟）

### 在 GitHub 上创建仓库

1. 登录 GitHub
2. 点击右上角 **"+"** → **"New repository"**
3. 填写信息：
   ```
   Repository name: game-query-system
   Description: 大展宏图游戏查询系统
   Public: ✅ (公开仓库，免费)
   Initialize with README: ❌ (不要勾选)
   ```
4. 点击 **"Create repository"**

### 上传代码到 GitHub

#### 方法 A：使用 GitHub Desktop（推荐新手）

1. 下载 GitHub Desktop：https://desktop.github.com
2. 安装并登录
3. 点击 **"Add Local Repository"** → **"Choose..."**
4. 选择你的项目文件夹：`f:\Project\Game`
5. 点击 **"Create repository"**
6. 点击 **"Publish repository"**
7. 点击 **"Publish"**

#### 方法 B：使用 Git 命令行

```bash
# 在项目目录打开 PowerShell
cd f:\Project\Game

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/game-query-system.git

# 推送
git push -u origin main
```

如果提示分支不对，执行：
```bash
git branch -M main
git push -u origin main
```

---

## ☁️ 第二步：部署后端到 Render（15 分钟）

### 1. 注册 Render

1. 访问：https://render.com
2. 点击 **"Get Started for Free"**
3. 选择 **"Continue with GitHub"**（推荐）
4. 授权 Render 访问你的 GitHub

### 2. 创建 Web Service

1. 登录 Render Dashboard
2. 点击右上角 **"New +"**
3. 选择 **"Web Service"**
4. 在 **"Connect a repository"** 页面：
   - 找到你的 `game-query-system` 仓库
   - 点击 **"Connect"**

### 3. 配置服务

填写以下信息：

```
┌─────────────────────────────────────────┐
│ Name: game-query-system                 │
│ Region: Singapore (新加坡)              │
│ Branch: main                            │
│ Root Directory: (留空)                  │
│ Runtime: Node                           │
│ Build Command: npm install              │
│ Start Command: node server.js           │
│ Instance Type: Free                     │
└─────────────────────────────────────────┘
```

### 4. 高级设置（重要！）

展开 **"Advanced"**，添加环境变量：

```
Key: NODE_ENV
Value: production
```

### 5. 创建服务

1. 点击 **"Create Web Service"**
2. 等待部署（约 2-5 分钟）
3. 看到 **"Your service is live"** 表示成功！

### 6. 获取 API 地址

部署成功后，你会看到：
```
https://game-query-system-xxxxx.onrender.com
```

**📝 复制这个地址！后面要用！**

---

## 🎨 第三步：修改前端 API 地址（5 分钟）

### 修改 index.html

1. 打开文件：`f:\Project\Game\public\index.html`
2. 搜索：`const API_BASE`
3. 找到这一行（约第 600 行）：
   ```javascript
   const API_BASE = 'http://localhost:3000/api';
   ```
4. 修改为你的 Render 地址：
   ```javascript
   const API_BASE = 'https://game-query-system-xxxxx.onrender.com/api';
   ```
5. 保存文件

### 修改 admin.html

1. 打开文件：`f:\Project\Game\public\admin.html`
2. 搜索：`const API_BASE`
3. 同样修改为你的 Render 地址
4. 保存文件

### 推送到 GitHub

```bash
# 在 PowerShell 执行
cd f:\Project\Game
git add .
git commit -m "Update API base URL"
git push
```

---

## 🌐 第四步：部署前端到 Cloudflare Pages（10 分钟）

### 1. 注册 Cloudflare

1. 访问：https://dash.cloudflare.com
2. 点击 **"Sign up"**
3. 填写邮箱和密码
4. 验证邮箱
5. ✅ 完成！

### 2. 创建 Pages 项目

1. 登录 Cloudflare Dashboard
2. 点击左侧 **"Pages"**
3. 点击 **"Create a project"**
4. 选择 **"Connect to Git"**
5. 授权 Cloudflare 访问 GitHub
6. 选择你的 `game-query-system` 仓库

### 3. 构建设置

填写以下信息：

```
┌─────────────────────────────────────────┐
│ Project name: game-query-frontend       │
│ Production branch: main                 │
│ Build command: (留空)                   │
│ Build output directory: public          │
└─────────────────────────────────────────┘
```

### 4. 环境变量（重要！）

1. 点击 **"Environment variables (advanced)"**
2. 点击 **"Add variable"**
3. 添加：
   ```
   Variable name: API_BASE
   Value: https://你的-render-地址.onrender.com/api
   ```

### 5. 部署

1. 点击 **"Save and Deploy"**
2. 等待部署完成（约 1-2 分钟）
3. 看到 **"Congratulations"** 表示成功！

### 6. 获取访问地址

部署成功后，你会看到：
```
https://game-query-frontend.pages.dev
```

**🎉 这就是你的网站地址！**

访问：
- 前台：`https://game-query-frontend.pages.dev`
- 后台：`https://game-query-frontend.pages.dev/admin.html`

---

## 🔗 第五步：绑定自定义域名（可选）

### 在 Cloudflare 添加域名

1. 进入 Pages 项目
2. 点击 **"Custom domains"**
3. 点击 **"Set up a custom domain"**
4. 输入你的域名：`www.你的域名.com`
5. 点击 **"Continue"**
6. Cloudflare 会自动配置 DNS

### 在 Render 添加自定义域名

1. 进入 Render 服务页面
2. 点击 **"Settings"**
3. 滚动到 **"Custom Domains"**
4. 点击 **"Add Custom Domain"**
5. 输入：`api.你的域名.com`
6. 按照提示配置 DNS

---

## ✅ 验证部署

### 测试步骤：

1. **访问后台**
   ```
   https://game-query-frontend.pages.dev/admin.html
   ```

2. **添加测试数据**
   - 点击"地图管理" → 添加地图
   - 点击"武将管理" → 添加武将
   - 点击"物品管理" → 添加物品

3. **访问前台**
   ```
   https://game-query-frontend.pages.dev
   ```

4. **查询数据**
   - 点击"物品查询"
   - 选择你添加的物品
   - 应该能看到掉落来源

---

## 🔧 常见问题解决

### Q1: Render 服务显示 "Crashed"

**原因：** 启动失败

**解决：**
1. 检查 `server.js` 中的 `PORT` 配置
2. 查看 Render 日志：点击服务 → "Logs"
3. 确保 `package.json` 中有正确的 `start` 脚本

### Q2: 前端无法连接 API

**原因：** API 地址错误

**解决：**
1. 检查 `index.html` 和 `admin.html` 中的 `API_BASE`
2. 确保使用 `https://` 而不是 `http://`
3. 在浏览器按 F12 查看控制台错误

### Q3: Cloudflare Pages 构建失败

**原因：** 配置错误

**解决：**
1. 确保 "Build output directory" 设置为 `public`
2. 确保没有设置 Build command（纯静态不需要）
3. 查看部署日志找错误

### Q4: 数据库为空

**原因：** Render 每次重启会重置文件系统

**解决：** 
- Render 免费版确实会重置，但 SQLite 在内存中运行
- 数据在会话期间是持久的
- 如需永久保存，考虑升级到付费版或使用外部数据库

---

## 📊 保持 Render 服务活跃（重要！）

Render 免费版 15 分钟无访问会休眠，使用 UptimeRobot 保持活跃：

### 设置 UptimeRobot

1. 访问：https://uptimerobot.com
2. 注册账号
3. 点击 **"Add New Monitor"**
4. 填写：
   ```
   Monitor Type: HTTP(s)
   Friendly Name: game-query
   URL: https://你的-render-地址.onrender.com/api/health
   Monitoring Interval: 5 minutes
   ```
5. 点击 **"Create Monitor"**

这样每 5 分钟访问一次，服务不会休眠！

---

## 🎉 完成！

现在你有了：

✅ 后端 API：`https://game-query-system-xxxxx.onrender.com`
✅ 前端网站：`https://game-query-frontend.pages.dev`
✅ 后台管理：`https://game-query-frontend.pages.dev/admin.html`

随时随地访问和管理数据！🚀

---

## 📞 下一步建议

1. **备份数据库**
   - 定期从 Render 下载 `game_data.db`

2. **监控服务**
   - 使用 UptimeRobot 监控

3. **自定义域名**
   - 绑定自己的域名更专业

4. **数据迁移**
   - 如果用户多了，考虑升级到付费数据库

祝你部署成功！🎊
