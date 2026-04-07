# Railway 添加 Volume 完整指南 📦

## 你的当前状态
✅ 服务已经 Online！
📍 位置：Railway 项目页面

---

## 添加 Volume 的步骤（对照截图）

### 第 1 步：点击右上角的 "Add" 按钮

在你截图的右上角，有一个 **"+ Add"** 按钮（紫色或蓝色）

### 第 2 步：选择 Volume 类型

点击 "Add" 后，会看到一个列表，选择：
- **"Persistent Volume"** 或
- **"Volume"** 或
- **"Storage"**

### 第 3 步：配置 Volume

添加后需要配置：
- **Name**: `sqlite-data`（可选）
- **Mount Path**: `/app`（必填！）
- **Size**: 默认即可（1GB）

### 第 4 步：确认添加

点击 **"Add Volume"** 或 **"Create"**

---

## 如果 Add 按钮下拉菜单没有 Volume

### 方法 A：使用 Services 添加

1. 点击 "Add" 按钮
2. 选择 **"Service"**
3. 搜索 **"Volume"** 或 **"Persistent Volume"**
4. 添加并配置

### 方法 B：使用 CLI（最简单！）

```bash
# 安装 CLI
npm install -g @railway/cli

# 登录
railway login

# 选择你的项目
railway project

# 添加 Volume
railway volume add --mount /app
```

---

## 验证 Volume 是否添加成功

添加成功后，在项目页面应该看到：
1. 多了一个存储服务的卡片
2. 或者在 `monkey_game` 服务详情中看到 "Volumes" 标签

---

## 重要提示

⚠️ **如果不添加 Volume 会怎样？**
- 服务可以正常运行
- 但每次重新部署后，数据库会重置
- 数据会丢失！

✅ **添加 Volume 后：**
- 数据永久保存
- 重新部署不会丢失数据

---

## 现在就这样做

1. 点击右上角的 **"+ Add"** 按钮
2. 找 **"Persistent Volume"** 或 **"Volume"**
3. 配置 Mount Path 为 `/app`
4. 点击添加

**如果还是找不到，告诉我你看到什么选项！** 📸
