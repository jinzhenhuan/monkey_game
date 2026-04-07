# Railway 快速部署指南 🚀

## 部署失败？这样解决！

看到你的部署失败了，按照以下步骤修复：

---

## 方案 1：使用 Railway CLI（推荐，最简单）

### 第 1 步：安装 Railway CLI

```bash
npm install -g @railway/cli
```

### 第 2 步：登录 Railway

```bash
railway login
```

会打开浏览器让你登录 GitHub 账号。

### 第 3 步：初始化项目

```bash
railway init
```

- 选择 "Create new project"
- 输入项目名称：`monkey-game`
- 选择你的 GitHub 仓库（如果有）

### 第 4 步：添加 SQLite 持久化存储

```bash
railway volume add --mount /app
```

### 第 5 步：部署

```bash
railway up
```

这会自动上传代码并部署。

### 第 6 步：查看部署状态

```bash
railway status
```

### 第 7 步：获取访问地址

```bash
railway domain
```

这会生成一个公网访问地址。

---

## 方案 2：手动在 Railway 网站部署

### 第 1 步：推送到 GitHub

确保你的代码已经推送到 GitHub：

```bash
git add .
git commit -m "修复部署配置"
git push
```

### 第 2 步：在 Railway 创建项目

1. 访问 https://railway.app
2. 用 GitHub 账号登录
3. 点击 **"New Project"**
4. 选择 **"Deploy from GitHub repo"**
5. 找到你的仓库并连接

### 第 3 步：配置服务

1. 点击你的服务
2. 点击 **"Settings"** 标签
3. 找到 **"Start Command"**
4. 确保设置为：`node server.js`

### 第 4 步：添加持久化存储（重要！）

1. 点击 **"Volumes"** 标签
2. 点击 **"Add Volume"**
3. **Mount Path** 填写：`/app`
4. 点击 **"Add"**

### 第 5 步：重新部署

1. 点击 **"Deployments"** 标签
2. 点击 **"Redeploy"** 按钮
3. 等待 2-3 分钟

---

## 方案 3：使用 Docker（最稳定）

如果以上方法都不行，使用 Docker 部署：

### 创建 Dockerfile

在项目根目录创建 `Dockerfile`（无扩展名）：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### 然后部署

1. 提交 Dockerfile 到 GitHub
2. Railway 会自动识别并使用 Docker 部署
3. 记得添加 Volume：`/app`

---

## 检查部署是否成功

### 查看日志

在 Railway 项目页面：
1. 点击你的服务
2. 点击 **"Deployments"**
3. 查看实时日志

应该看到类似内容：
```
> game-query-system@1.0.0 start
> node server.js

📁 数据库路径：/app/game.db
✅ SQLite 数据库连接成功
✅ 数据表初始化完成

╔════════════════════════════════════════╗
║     大展宏图 - 游戏数据管理系统          ║
═══════════════════════════════════════╣
  🌐 前端查询：http://0.0.0.0:3000    ║
║  ⚙️ 后台管理：http://0.0.0.0:3000/admin.html ║
║  💾 数据库：SQLite                       ║
╚════════════════════════════════════════╝
```

### 测试 API

部署成功后，访问：
- `https://你的项目名.up.railway.app/api/health`

应该返回：
```json
{"status":"ok","timestamp":"..."}
```

---

## 常见错误及解决方案

### 错误 1：Build failed

**原因**：Railway 无法识别 Node.js 项目

**解决方案**：
- 确保有 `package.json` 文件
- 确保 `package.json` 中有 `"start": "node server.js"`
- 或者使用 Railway CLI：`railway up`

### 错误 2：服务启动后立即停止

**原因**：没有添加持久化存储

**解决方案**：
- 添加 Volume，Mount Path 设置为 `/app`

### 错误 3：502 Bad Gateway

**原因**：服务没有正确启动

**解决方案**：
- 查看日志，检查错误信息
- 确保 `server.js` 没有语法错误
- 本地测试：`npm start`

### 错误 4：数据库未连接

**原因**：SQLite 文件路径问题

**解决方案**：
- 确保添加了 Volume
- 数据库文件会自动创建在 `/app/game.db`

---

## 完成后的效果

部署成功后：

- **前台查询**：`https://monkey-game.up.railway.app`
- **后台管理**：`https://monkey-game.up.railway.app/admin.html`
- **API 测试**：`https://monkey-game.up.railway.app/api/health`

✅ 数据永久保存（有 Volume）
✅ 国内可访问
✅ 完全免费
✅ 自动 HTTPS

---

## 需要帮助？

如果还是不行，提供以下信息：
1. Railway 日志中的错误信息
2. 截图部署失败的页面
3. 检查 GitHub 仓库是否有所有文件

🚀 祝你部署成功！
