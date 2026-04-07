# 🚀 部署到 Vercel - 超简单指南

## 📋 Vercel 优点

- ✅ 完全免费，无需信用卡
- ✅ 界面超级简单
- ✅ 自动 HTTPS
- ✅ 全球最快 CDN

---

## 🎯 部署步骤（10 分钟）

### 第一步：准备代码

我已经帮你创建好了 Vercel 配置文件，现在只需要：

1. **确保代码已上传到 GitHub**
   - 使用 GitHub Desktop 或网页上传
   - 仓库名：`game-query-system`

### 第二步：部署到 Vercel

1. 访问：https://vercel.com
2. 点击 **"Start"** 或 **"Sign Up"**
3. 选择 **"Continue with GitHub"**
4. 授权 Vercel 访问 GitHub

### 第三步：导入项目

1. 点击 **"Add New..."** → **"Project"**
2. 在 **"Import Git Repository"** 页面
3. 找到你的 `game-query-system` 仓库
4. 点击 **"Import"**

### 第四步：配置项目

**Framework Preset:** Other
**Build Command:** `npm install`
**Output Directory:** (留空)
**Install Command:** `npm install`

点击 **"Environment Variables"**，添加：

```
Key: NODE_ENV
Value: production
```

### 第五步：部署

点击 **"Deploy"**

等待 2-3 分钟，看到 **"Congratulations"** 表示成功！

### 第六步：获取地址

部署成功后，你会看到：

```
https://game-query-system-xxxx.vercel.app
```

**📝 复制这个地址！**

---

## 🎨 修改前端 API 地址

### 修改 public/index.html

1. 打开：`public/index.html`
2. 搜索：`const API_BASE`
3. 修改为：
   ```javascript
   const API_BASE = 'https://game-query-system-xxxx.vercel.app/api';
   ```
4. 保存

### 修改 public/admin.html

1. 打开：`public/admin.html`
2. 搜索：`const API_BASE`
3. 同样修改为你的 Vercel 地址
4. 保存

### 推送到 GitHub

```bash
cd f:\Project\Game
git add .
git commit -m "Update API for Vercel"
git push
```

Vercel 会自动重新部署！

---

## 🌐 部署前端（可选）

如果你还想部署前端到 Cloudflare Pages：

1. 访问：https://dash.cloudflare.com
2. Pages → 创建项目
3. 连接 GitHub 仓库
4. Build output directory: `public`
5. 部署

---

## ✅ 完成！

你的地址：
- 后端 API：`https://game-query-system-xxxx.vercel.app`
- 后台管理：`https://game-query-system-xxxx.vercel.app/admin.html`

---

## 💡 Vercel 注意事项

1. **自动休眠**
   - Vercel 免费版不会休眠
   - 比 Render 更友好

2. **数据库**
   - SQLite 在 Vercel 上是临时的
   - 每次部署会重置
   - 建议使用外部数据库（如 MongoDB Atlas 免费版）

3. **Serverless 限制**
   - 函数运行时间：10 秒
   - 对你的项目足够用

---

**开始部署吧！** 🚀
