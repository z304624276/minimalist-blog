# minimalist Blog

一个基于 **Vue 3 + pocketbase** 的现代化个人博客系统，支持文章发布、朋友圈动态、后台管理等功能。



---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Vite |
| UI 组件库 | Element Plus |
| 路由 | Vue Router 4 |
| 样式 | SCSS |
| 后端服务 | pocketbase |
| 部署平台 | Vercel clawcloud|

---

## 从零开始搭建教程

### 第一步：环境准备

#### 1.1 安装 Node.js
```bash
# 访问 https://nodejs.org 下载安装 LTS 版本
# 验证安装
node -v  # 推荐 v18+
npm -v
```

#### 1.2 创建 Vue 项目
```bash
# 使用 Vite 创建项目
npm create vite@latest my-blog -- --template vue

# 进入项目目录
cd my-blog

# 安装依赖
npm install
```

#### 1.3 安装必要依赖
```bash
# UI 组件库
npm install element-plus @element-plus/icons-vue

# 路由
npm install vue-router@4

# Supabase 客户端
npm install @supabase/supabase-js

# Markdown 渲染
npm install markdown-it

# SCSS 支持
npm install -D sass
```

---

### 第二步：pocketbase 后端配置

移步MIGRATION.md
---

### 第三步：项目结构

```
my-blog/
├── public/
│   └── avatar.png          # 默认头像
├── src/
│   ├── api/
│   │   ├── pocketbase.js     # pocketbase API 封装
│   │   └── mock.js         # 模拟数据（开发用）
│   ├── router/
│   │   └── index.js        # 路由配置
│   ├── styles/
│   │   └── global.scss     # 全局样式
│   ├── views/
│   │   ├── Home.vue        # 首页
│   │   ├── Articles.vue    # 文章列表
│   │   ├── ArticleDetail.vue # 文章详情
│   │   ├── Moments.vue     # 朋友圈
│   │   └── admin/
│   │       ├── Login.vue   # 后台登录
│   │       └── Dashboard.vue # 后台管理
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── .env                    # 环境变量（不要提交！）
├── .gitignore
├── package.json
├── vite.config.js
└── vercel.json             # Vercel 部署配置
```

---

### 第四步：配置环境变量

修改 `.env` 文件：

```env
VITE_POCKETBASE_URL=http://your-new-pb-url:8090
VITE_POCKETBASE_EMAIL=your-email@example.com
VITE_POCKETBASE_PASSWORD=your-password

```

#### 4.2 确保 .gitignore 包含敏感文件
```gitignore
node_modules
dist
.env
.env.local
.env.production
.vercel
.DS_Store
*.log
```

---


### 第五步：本地开发

```bash
# 启动开发服务器
npm run dev

# 浏览器访问
http://localhost:5173

```

