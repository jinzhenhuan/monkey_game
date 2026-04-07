# Railway 部署指南 - 最简单方案 🚀

## 为什么选择 Railway？

- ✅ **完全免费** - 每月$5 免费额度，个人项目足够使用
- ✅ **不需要信用卡** - GitHub 账号登录即可
- ✅ **支持 SQLite** - 数据持久化存储
- ✅ **自动部署** - 连接 GitHub 后自动部署
- ✅ **国内可访问** - 访问速度不错
- ✅ **图形化界面** - 操作简单直观

---

## 部署步骤

### 第 1 步：准备代码

代码已经修改完成，使用 SQLite 数据库，无需额外配置。

### 第 2 步：推送到 GitHub

```bash
# 如果还没有 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "使用 SQLite，准备 Railway 部署"

# 推送到 GitHub（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

### 第 3 步：在 Railway 部署

1. **访问 Railway**
   - 打开 https://railway.app
   - 点击 "Login" → 选择 "Login with GitHub"

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 找到你的游戏查询系统仓库，点击连接

3. **配置服务**
   - Railway 会自动识别 Node.js 项目
   - 无需额外配置，默认设置即可

4. **添加持久化存储（重要！）**
   - 在 Railway 项目页面，点击你的服务
   - 点击 "Volumes" 标签
   - 点击 "Add Volume"
   - 设置 Mount Path: `/app`
   - 点击 "Add"

   这样 SQLite 数据库文件就会被持久化保存！

5. **等待部署**
   - Railway 会自动构建和部署
   - 大约需要 2-3 分钟
   - 部署成功后会生成一个公网 URL

### 第 4 步：访问网站

部署成功后，你会看到一个类似这样的 URL：
```
https://你的项目名.up.railway.app
```

- **前台查询**：`https://你的项目名.up.railway.app`
- **后台管理**：`https://你的项目名.up.railway.app/admin.html`

### 第 5 步：更新前端 API 地址

如果部署后 API 无法访问，需要更新前端文件中的 API 地址：

1. 打开 `public/index.html`
2. 找到 `const API_BASE = '...'`
3. 修改为你的 Railway 地址
4. 同样更新 `public/admin.html`

或者，使用相对路径（推荐）：

```javascript
const API_BASE = '/api';
```

---

## 环境变量（可选）

如果需要配置端口或其他环境变量：

1. 在 Railway 项目页面，点击 "Variables"
2. 添加环境变量：
   - `PORT`: `3000`（Railway 会自动设置，无需手动添加）
   - `NODE_ENV`: `production`

---

## 数据持久化

Railway 的 Volume 功能确保 SQLite 数据库文件被持久化：

- 数据库文件路径：`/app/game.db`
- 即使重新部署，数据也会保留
- 删除服务时数据才会丢失

---

## 免费额度说明

Railway 免费计划：
- 每月 $5 免费额度
- 足够小型项目使用
- 如果超出额度，服务会暂停（不会扣费）
- 下个月自动重置

---

## 常见问题

### Q: 数据会丢失吗？
A: 只要添加了 Volume，数据就会持久化保存，不会丢失。

### Q: 需要绑定信用卡吗？
A: 不需要！GitHub 账号登录即可使用免费额度。

### Q: 国内访问速度快吗？
A: Railway 使用全球 CDN，国内访问速度不错。

### Q: 如何自定义域名？
A: Railway 付费计划支持自定义域名，但免费版可以使用 railway.app 子域名。

### Q: 如何查看日志？
A: 在 Railway 项目页面点击 "Deployments" → 查看实时日志。

### Q: 如何重新部署？
A: 
- 自动：推送代码到 GitHub 后自动重新部署
- 手动：在 Railway 页面点击 "Deployments" → "Redeploy"

---

## 完成！

现在你可以：
- ✅ 随时随地访问前台查询数据
- ✅ 随时随地访问后台添加数据
- ✅ 数据永久保存在云数据库
- ✅ 无需 VPN，国内直接访问

**前台网址**：`https://你的项目名.up.railway.app`
**后台网址**：`https://你的项目名.up.railway.app/admin.html`

🎉 部署完成！
