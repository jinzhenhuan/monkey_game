# 🚀 部署到 Zeabur - 完全免费，无需信用卡

## 📋 为什么选择 Zeabur？

- ✅ **无需信用卡** - GitHub 账号即可注册
- ✅ **完全免费** - $5/月免费额度（Node.js 项目绰绰有余）
- ✅ **中文界面** - 台湾团队开发
- ✅ **代码零修改** - 直接部署现有项目
- ✅ **新加坡节点** - 中国大陆访问速度快
- ✅ **自动部署** - 连接 GitHub 后自动更新

---

## 📝 准备工作

1. **GitHub 账号**（必须有）
2. **本项目代码已上传到 GitHub**

---

## 🎯 部署步骤（15 分钟完成）

### 第一步：注册 Zeabur

1. 访问：https://zeabur.com
2. 点击 **"Start Now"**
3. 选择 **"Continue with GitHub"**
4. 授权 Zeabur 访问你的 GitHub
5. ✅ 注册完成！

---

### 第二步：创建新项目

1. 登录 Zeabur Dashboard
2. 点击 **"Create Project"**
3. 填写项目名称：
   ```
   Project Name: game-query
   Description: 游戏查询系统后端
   ```
4. 点击 **"Create"**

---

### 第三步：部署服务

1. 进入刚创建的项目
2. 点击 **"Create Service"**
3. 选择 **"Deploy from GitHub"**
4. 选择你的仓库：`game-query-system`
5. 点击 **"Continue"**

---

### 第四步：配置服务

#### 基本信息

```
Service Name: backend
Region: Singapore (新加坡) ⭐ 重要！
```

#### 环境变量

点击 **"Environment Variables"**，添加：

```
NODE_ENV = production
```

#### 构建设置

保持默认即可：

```
Build Command: (自动识别 npm install)
Start Command: (自动识别 node server.js)
```

---

### 第五步：部署

1. 点击 **"Deploy"**
2. 等待部署完成（约 2-3 分钟）
3. 看到 **"Service is running"** 表示成功！

---

### 第六步：获取访问地址

部署成功后，你会看到：

```
https://game-query-backend-xxxxx.zeabur.app
```

**📝 复制这个地址！这是你的 API 地址！**

---

## 🎨 配置前端

### 修改 API 地址

#### 1. 修改 public/index.html

1. 打开文件：`public/index.html`
2. 搜索：`const API_BASE`
3. 修改为：
   ```javascript
   const API_BASE = 'https://game-query-backend-xxxxx.zeabur.app/api';
   ```
4. 保存文件

#### 2. 修改 public/admin.html

1. 打开文件：`public/admin.html`
2. 搜索：`const API_BASE`
3. 同样修改为你的 Zeabur 地址
4. 保存文件

#### 3. 推送到 GitHub

```bash
cd f:\Project\Game
git add .
git commit -m "Update API base URL for Zeabur"
git push
```

---

## 🌐 部署前端到 Cloudflare Pages

### 步骤：

1. 访问：https://dash.cloudflare.com
2. 登录 Cloudflare
3. 进入 **"Pages"**
4. 点击 **"Create a project"**
5. 选择 **"Connect to Git"**
6. 选择你的仓库：`game-query-system`

### 配置：

```
Project name: game-query-frontend
Production branch: main
Build command: (留空)
Build output directory: public
```

### 环境变量（可选）：

如果你希望前端也能自动获取 API 地址，可以添加环境变量：

```
Variable name: API_BASE
Value: https://你的-zeabur 地址.zeabur.app/api
```

### 部署：

1. 点击 **"Save and Deploy"**
2. 等待 1-2 分钟
3. 看到 **"Your site is deployed"** 表示成功！

---

## ✅ 验证部署

### 测试步骤：

1. **访问后台**
   ```
   https://game-query-frontend.pages.dev/admin.html
   ```

2. **添加测试数据**
   - 点击"地图管理" → 添加地图
   - 点击"怪物管理" → 添加怪物
   - 点击"物品管理" → 添加物品

3. **访问前台**
   ```
   https://game-query-frontend.pages.dev
   ```

4. **查询数据**
   - 点击"物品查询"
   - 选择物品
   - 应该能看到掉落来源

---

## 💰 费用说明

### Zeabur 免费额度：

- **每月 $5 USD** 免费额度
- **你的项目消耗：** 约 $1-2/月（Node.js 轻量应用）
- **剩余额度：** 可以部署 2-3 个小项目

### 不会超支的方法：

1. Zeabur 有用量监控
2. 接近限额时会邮件通知
3. 免费额度完全够用

---

## 🔧 常见问题

### Q1: 部署失败怎么办？

**解决：**
1. 查看 Zeabur 部署日志
2. 确保 `package.json` 配置正确
3. 确保 `server.js` 监听 `process.env.PORT`

### Q2: 数据库会丢失吗？

**不会！**
- Zeabur 使用持久化存储
- 服务重启数据不会丢失
- 除非你手动删除服务

### Q3: 访问速度慢？

**解决：**
1. 确保选择 **Singapore** 节点
2. 使用 Cloudflare CDN 加速前端
3. 检查本地网络

### Q4: 额度用完了怎么办？

**方案：**
1. 升级到付费（$5/月）
2. 或者换其他免费平台（见下文）

---

## 🎯 完整部署流程图

```
┌─────────────────┐
│  1. 注册 Zeabur  │
│  (GitHub 登录)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. 创建项目    │
│  (game-query)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. 部署服务    │
│  (连接 GitHub)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. 获取地址    │
│  (xxxx.zeabur. │
│   app)          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  5. 修改前端    │
│  (API_BASE)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  6. 部署前端到  │
│  Cloudflare     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ✅ 完成！      │
│  随时随地访问   │
└─────────────────┘
```

---

## 📊 你的服务地址记录

```
┌────────────────────────────────────────────────┐
│  后端 API:                                      │
│  https://________________.zeabur.app           │
│                                                │
│  前端网站：                                     │
│  https://________________.pages.dev            │
│                                                │
│  后台管理：                                     │
│  https://________________.pages.dev/admin.html │
└────────────────────────────────────────────────┘
```

---

## 🎉 完成！

现在你拥有了：

✅ **完全免费**的后端服务（无需信用卡）
✅ **完全免费**的前端托管
✅ **随时随地**访问和管理数据
✅ **中文界面**，操作简单

开始部署吧！🚀

---

## 📞 其他免费平台备选

如果 Zeabur 不能满足需求，还可以考虑：

### 1. **Fly.io**
- 免费额度：3 个共享 CPU 虚拟机
- 需要：信用卡验证（但可以不花钱）

### 2. **Hugging Face Spaces**
- 完全免费
- 需要改造为 Docker 部署

### 3. **Glitch**
- 完全免费
- 适合小型项目
- 代码公开

### 4. **Replit**
- 免费额度有限
- 适合开发和测试

---

**祝你部署成功！** 🎊
