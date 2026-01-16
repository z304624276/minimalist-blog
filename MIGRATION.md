# Cookiesen Blog - 数据结构与迁移指南

## 数据结构概览

本站使用 **PocketBase** 作为后端服务，数据存储在以下集合（Collections）中。

### 1. articles（文章表）

存储博客文章的所有信息。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | text | 自动 | 自动生成，唯一标识符 |
| title | text | 是 | 文章标题 |
| summary | text | 否 | 文章摘要/简介 |
| content | text | 是 | 文章内容（Markdown 格式） |
| category | text | 否 | 文章分类，默认 'General' |
| views | number | 否 | 阅读量，默认 0 |
| createtime | text | 是 | 创建时间（自动生成） |
| updated | text | 否 | 更新时间（自动生成） |

**示例数据**：
```json
{
  "id": "abc123xyz",
  "title": "Vue 3 组合式 API 入门指南",
  "summary": "详细介绍 Vue 3 Composition API 的使用方法",
  "content": "# Vue 3 组合式 API\n\n## 简介\n...",
  "category": "Vue",
  "views": 128,
  "createtime": "2024-01-15 10:30:00.123Z",
  "updated": "2024-01-15 10:30:00.123Z"
}
```

### 2. moments（朋友圈动态表）

存储朋友圈的动态内容。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | text | 自动 | 自动生成，唯一标识符 |
| content | text | 是 | 动态内容文本 |
| images | text | 否 | 图片文件（通过 PocketBase Storage 上传） |
| likes | number | 否 | 点赞数，默认 0 |
| createtime | text | 是 | 创建时间（自动生成） |
| updated | text | 否 | 更新时间（自动生成） |

**示例数据**：
```json
{
  "id": "def456uvw",
  "content": "今天天气真好，出去散步了",
  "images": "photo_20240115.jpg",
  "likes": 5,
  "createtime": "2024-01-15 14:20:00.456Z",
  "updated": "2024-01-15 14:20:00.456Z"
}
```

### 3. site_settings（站点设置表）

存储站点的基本配置信息，这是一个单例集合，只有一条记录。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | text | 自动 | 固定值：`z0lbzjrwqp9og9k` |
| nickname | text | 否 | 站点昵称 |
| avatar | text | 否 | 头像图片 URL |
| bio | text | 否 | 个人简介 |
| github | text | 否 | GitHub 链接 |
| updated | text | 否 | 更新时间（自动生成） |

**示例数据**：
```json
{
  "id": "z0lbzjrwqp9og9k",
  "nickname": "啊超",
  "avatar": "https://example.com/avatar.png",
  "bio": "全栈开发者 / PHP & Vue &新技术爱好者 / 记录生活",
  "github": "https://github.com/z304624276",
  "updated": "2024-01-15 10:00:00.789Z"
}
```

### 4. blog_images（图片存储桶）

存储文章和朋友圈中使用的图片文件。

- **类型**: File Upload Bucket
- **权限**: 公开读取（Public）
- **支持的格式**: jpg, png, gif, webp 等常见图片格式
- **文件命名**: 自动生成唯一文件名

## 迁移指南

### 方案一：PocketBase 到 PocketBase 迁移

适用于更换服务器或重新部署 PocketBase 实例。

#### 步骤 1: 备份现有数据

```bash
# 停止 PocketBase 服务
./pocketbase serve stop

# 备份数据目录（包含所有数据）
cp -r pb_data pb_data_backup
cp -r pb_migrations pb_migrations_backup
```

#### 步骤 2: 导出数据（可选）

如果需要手动导出数据，可以使用 PocketBase Admin API：

```bash
# 导出所有集合数据
curl -X GET "http://your-pb-url/api/collections/articles/records" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -o articles_backup.json

curl -X GET "http://your-pb-url/api/collections/moments/records" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -o moments_backup.json

curl -X GET "http://your-pb-url/api/collections/site_settings/records" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -o site_settings_backup.json
```

#### 步骤 3: 在新服务器上部署 PocketBase

```bash
# 下载 PocketBase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
unzip pocketbase_0.22.0_linux_amd64.zip

# 上传备份数据
# 将 pb_data 和 pb_migrations 目录上传到新服务器
```

#### 步骤 4: 启动新服务

```bash
# 启动 PocketBase
./pocketbase serve
```

#### 步骤 5: 更新前端配置

修改 `.env` 文件：

```env
VITE_POCKETBASE_URL=http://your-new-pb-url:8090
VITE_POCKETBASE_EMAIL=your-email@example.com
VITE_POCKETBASE_PASSWORD=your-password
```

### 方案二：从其他平台迁移到 PocketBase

适用于从 WordPress、Hugo、Hexo 等其他博客平台迁移。

#### 步骤 1: 导出原始数据

从原平台导出文章数据，通常为 JSON、XML 或 Markdown 格式。

#### 步骤 2: 数据转换

创建转换脚本，将原始数据转换为 PocketBase 格式：

```javascript
// convert-to-pocketbase.js
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

// 登录管理员账号
await pb.admins.authWithPassword('your-email', 'your-password')

// 示例：从 WordPress 迁移
const wpPosts = require('./wordpress-export.json')

for (const post of wpPosts) {
  try {
    await pb.collection('articles').create({
      title: post.title,
      summary: post.excerpt,
      content: post.content,
      category: post.category || 'General',
      views: 0
    })
    console.log(`✅ 导入文章: ${post.title}`)
  } catch (error) {
    console.error(`❌ 导入失败: ${post.title}`, error)
  }
}
```

#### 步骤 3: 创建必需的集合

在 PocketBase Admin 后台创建以下集合：

1. **articles**
   - 字段：title (text), summary (text), content (text), category (text), views (number)

2. **moments**
   - 字段：content (text), images (file), likes (number)

3. **site_settings**
   - 字段：nickname (text), avatar (text), bio (text), github (text)

4. **blog_images**
   - 类型：File Upload Bucket
   - 设置为 Public

#### 步骤 4: 配置权限

在 PocketBase Admin 后台配置 API Rules：

**articles**:
```json
{
  "read": true,
  "create": false,
  "update": false,
  "delete": false
}
```

**moments**:
```json
{
  "read": true,
  "create": false,
  "update": false,
  "delete": false
}
```

**site_settings**:
```json
{
  "read": "id = 'z0lbzjrwqp9og9k'",
  "create": false,
  "update": false,
  "delete": false
}
```

**blog_images**:
```json
{
  "read": true,
  "create": false,
  "update": false,
  "delete": false
}
```

### 方案三：从 Supabase 迁移到 PocketBase

如果你的项目之前使用 Supabase，可以使用以下迁移脚本：

```javascript
// migrate-from-supabase.js
import PocketBase from 'pocketbase'
import { createClient } from '@supabase/supabase-js'

const pb = new PocketBase('http://127.0.0.1:8090')
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY')

// 登录 PocketBase
await pb.admins.authWithPassword('your-email', 'your-password')

// 迁移文章
const { data: articles } = await supabase.from('articles').select('*')
for (const article of articles) {
  await pb.collection('articles').create({
    title: article.title,
    summary: article.summary,
    content: article.content,
    category: article.category,
    views: article.views
  })
}

// 迁移朋友圈
const { data: moments } = await supabase.from('moments').select('*')
for (const moment of moments) {
  await pb.collection('moments').create({
    content: moment.content,
    likes: moment.likes
  })
}

// 迁移站点设置
const { data: settings } = await supabase.from('site_settings').select('*').single()
await pb.collection('site_settings').create({
  id: 'z0lbzjrwqp9og9k',
  nickname: settings.nickname,
  avatar: settings.avatar,
  bio: settings.bio,
  github: settings.github
})
```

## 环境配置

### 必需的环境变量

在项目根目录创建 `.env` 文件：

```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_POCKETBASE_EMAIL=your-email@example.com
VITE_POCKETBASE_PASSWORD=your-password
```

### Vercel 部署配置

在 Vercel 项目设置中添加环境变量：

| Key | Value |
|-----|-------|
| VITE_POCKETBASE_URL | https://your-pocketbase-url.com |
| VITE_POCKETBASE_EMAIL | your-email@example.com |
| VITE_POCKETBASE_PASSWORD | your-password |

## 注意事项

1. **记录 ID 固定**: `site_settings` 集合的记录 ID 必须是 `z0lbzjrwqp9og9k`，这是代码中硬编码的值。

2. **权限配置**: 确保所有集合都配置了正确的读取权限，否则前端无法获取数据。

3. **图片存储**: `blog_images` 存储桶必须设置为 Public，否则图片无法在前端显示。

4. **数据备份**: 迁移前务必备份原有数据，避免数据丢失。

5. **管理员账号**: 确保 PocketBase 管理员账号已创建，且邮箱和密码与 `.env` 文件中的配置一致。

6. **API 版本**: PocketBase SDK 版本需要与项目依赖一致（当前版本：0.26.5）。

## 故障排查

### 问题 1: 无法获取站点设置

**错误信息**: `getSiteSettings error: ClientResponseError 404`

**解决方案**:
- 检查 `site_settings` 集合是否存在
- 确认记录 ID 为 `z0lbzjrwqp9og9k`
- 检查 API Rules 中的读取权限

### 问题 2: 图片无法显示

**错误信息**: 图片显示 404

**解决方案**:
- 确保 `blog_images` 存储桶已创建
- 检查存储桶是否设置为 Public
- 确认图片文件已成功上传

### 问题 3: 无法发布文章

**错误信息**: `401 Unauthorized`

**解决方案**:
- 检查管理员账号是否正确
- 确认 `.env` 文件中的邮箱和密码配置正确
- 检查 PocketBase 服务是否正常运行

## 技术支持

如有问题，请参考：
- PocketBase 官方文档: https://pocketbase.io/docs/
- Vue 3 文档: https://vuejs.org/
- Element Plus 文档: https://element-plus.org/

---

**最后更新**: 2025-01-16