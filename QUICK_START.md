# 🚀 快速部署检查清单

## ✅ 已完成的工作

- [x] 修改 `server.js` 支持环境变量端口
- [x] 创建 `.gitignore` 文件
- [x] 创建 `README.md` 文档
- [x] 创建 `DEPLOYMENT_GUIDE.md` 详细指南
- [x] 创建此检查清单

## 📋 你需要做的步骤

### 步骤 1: 创建 GitHub 仓库 [ ]
- [ ] 注册 GitHub: https://github.com
- [ ] 创建新仓库: `game-query-system`
- [ ] 上传代码（使用 GitHub Desktop 或 Git 命令）

### 步骤 2: 部署到 Render [ ]
- [ ] 注册 Render: https://render.com
- [ ] 创建 Web Service
- [ ] 连接 GitHub 仓库
- [ ] 配置：
  - Region: Singapore
  - Build Command: `npm install`
  - Start Command: `node server.js`
  - Instance Type: Free
- [ ] 等待部署完成
- [ ] **复制你的 Render 地址**：`https://game-query-system-xxxxx.onrender.com`

### 步骤 3: 修改前端 API 地址 [ ]
- [ ] 打开 `public/index.html`
- [ ] 搜索 `const API_BASE`
- [ ] 修改为：`const API_BASE = 'https://你的-render-地址.onrender.com/api';`
- [ ] 打开 `public/admin.html`
- [ ] 同样修改 API 地址
- [ ] 保存并推送到 GitHub

### 步骤 4: 部署到 Cloudflare Pages [ ]
- [ ] 注册 Cloudflare: https://dash.cloudflare.com
- [ ] 创建 Pages 项目
- [ ] 连接 GitHub 仓库
- [ ] 配置：
  - Build output directory: `public`
  - Build command: (留空)
- [ ] 部署
- [ ] **复制你的 Pages 地址**：`https://game-query-frontend.pages.dev`

### 步骤 5: 测试验证 [ ]
- [ ] 访问后台：`https://game-query-frontend.pages.dev/admin.html`
- [ ] 添加测试数据（地图、怪物、物品）
- [ ] 访问前台：`https://game-query-frontend.pages.dev`
- [ ] 查询物品，验证数据正确显示

### 步骤 6: 保持服务活跃（可选但推荐）[ ]
- [ ] 注册 UptimeRobot: https://uptimerobot.com
- [ ] 添加监控：
  - URL: `https://你的-render-地址.onrender.com/api/health`
  - Interval: 5 minutes

## 🎯 快速参考

### 你的地址记录

```
Render API 地址：https://______________________.onrender.com
Cloudflare Pages: https://____________________.pages.dev
```

### 常用命令

```powershell
# 推送到 GitHub
cd f:\Project\Game
git add .
git commit -m "更新说明"
git push

# 查看 Git 状态
git status

# 查看提交历史
git log --oneline
```

## ⚠️ 重要提醒

1. **Render 免费版限制**
   - 15 分钟无访问会休眠
   - 下次访问需 30 秒唤醒
   - 使用 UptimeRobot 避免休眠

2. **数据库**
   - SQLite 在 Render 上是临时的
   - 服务重启数据会保留（除非删除服务）
   - 重要数据建议定期备份

3. **API 地址**
   - 必须使用 `https://`
   - 确保两个 HTML 文件都修改了
   - 修改后要推送到 GitHub 才会更新

## 📞 需要帮助？

如果遇到问题：

1. 查看 `DEPLOYMENT_GUIDE.md` 详细指南
2. 查看 Render 日志：服务页面 → "Logs"
3. 查看 Cloudflare 部署日志：Pages → "Deployments"
4. 浏览器按 F12 查看控制台错误

---

**准备好了吗？让我们开始部署吧！** 🚀

按照 `DEPLOYMENT_GUIDE.md` 的详细步骤一步步来，你一定能成功！
