# Next.js 框架入门模板

[![部署到 Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/next-starter-template)

<!-- dash-content-start -->

这是一个使用 [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) 创建的 [Next.js](https://nextjs.org/) 项目。它作为[静态网站](https://developers.cloudflare.com/workers/static-assets/)部署在 Cloudflare Workers 上。

此模板使用 [OpenNext](https://opennext.js.org/) 通过 [OpenNext Cloudflare 适配器](https://opennext.js.org/cloudflare)，它接收 Next.js 构建输出并进行转换，使其能够在 Cloudflare Workers 中运行。

<!-- dash-content-end -->

在此仓库之外，您可以使用 [C3](https://developers.cloudflare.com/pages/get-started/c3/)（`create-cloudflare` CLI）基于此模板创建新项目：

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/next-starter-template
```

此模板的实时公开部署可在 [https://next-starter-template.templates.workers.dev](https://next-starter-template.templates.workers.dev) 查看

## 数据库连接方案

本项目支持多种数据库连接方式，主要使用 **TiDB Cloud Serverless** 作为数据库，并提供多种连接方案以适应不同的部署环境：

### 🗄️ 数据库配置

项目使用 **TiDB Cloud Serverless** 数据库，支持以下环境变量配置：

```env
TIDB_HOST=your-tidb-host.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your-username
TIDB_PASSWORD=your-password
TIDB_DATABASE=your-database
TIDB_ENABLE_SSL=true
```

### 🔌 连接方式

#### 1. TiDB Cloud Serverless Driver（推荐）
- **文件**：`src/lib/database-tidb-serverless.ts`
- **依赖**：`@tidbcloud/serverless`
- **适用场景**：Cloudflare Workers 和本地开发
- **特点**：
  - 通过 HTTP 连接，完美适配 Cloudflare Workers 的 V8 引擎
  - 无需 TCP 支持
  - 自动处理连接池和 SSL
  - 支持本地开发和生产环境

**使用示例**：
```typescript
import { getTiDBConnection } from '@/lib/database-tidb-serverless';

const conn = getTiDBConnection();
const result = await conn.execute('SELECT * FROM visitors');
```

#### 2. MySQL2 直连（传统方式）
- **文件**：`src/lib/database.ts`
- **依赖**：`mysql2`
- **适用场景**：传统 Node.js 环境
- **特点**：
  - 使用 TCP 连接
  - 支持完整的 MySQL 功能
  - 需要 Node.js 环境

#### 3. Cloudflare Hyperdrive（高级方案）
- **文件**：`src/lib/database-hyperdrive.ts`
- **适用场景**：Cloudflare Workers 生产环境
- **特点**：
  - 专为 Cloudflare Workers 优化
  - 自动处理连接池和 SSL
  - 提供连接字符串方式

#### 4. Cloudflare Worker 专用连接
- **文件**：`src/lib/database-cloudflare.ts`
- **适用场景**：纯 Cloudflare Worker 环境
- **特点**：
  - 针对 Worker 环境特殊优化
  - 环境变量通过全局对象访问

### 🚀 数据库连接流程

1. **环境检测**：自动检测运行环境（Cloudflare Workers vs Node.js）
2. **配置加载**：根据环境加载对应的数据库配置
3. **连接创建**：使用适合当前环境的连接方式
4. **查询执行**：通过统一的接口执行 SQL 查询
5. **连接管理**：自动处理连接生命周期

### 📊 数据库功能

项目包含完整的访问统计功能：

- **访问记录**：记录访客 IP、设备信息、浏览器等
- **统计分析**：总访问人数、今日访问、最近记录
- **数据展示**：前端组件展示访问统计数据

**API 端点**：
- `POST /api/visitors` - 记录新的访问
- `GET /api/visitors` - 获取访问统计数据

### 🛠️ 开发建议

1. **本地开发**：推荐使用 TiDB Cloud Serverless Driver
2. **生产部署**：Cloudflare Workers 上使用 TiDB Cloud Serverless Driver
3. **数据库迁移**：支持多种连接方式，便于迁移和测试
4. **性能优化**：使用连接池和适当的索引优化查询性能

## 入门指南

首先，运行：

```bash
npm install
# 或者
yarn install
# 或者
pnpm install
# 或者
bun install
```

然后运行开发服务器（使用您选择的包管理器）：

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

您可以通过修改 `app/page.tsx` 开始编辑页面。当您编辑文件时，页面会自动更新。

此项目使用 [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) 自动优化和加载 Inter，这是一种自定义 Google 字体。

## 部署到生产环境

| 命令 | 操作 |
| :-------------------------------- | :------------------------------------------- |
| `npm run build` | 构建您的生产站点 |
| `npm run preview` | 在部署前本地预览您的构建 |
| `npm run build && npm run deploy` | 将您的生产站点部署到 Cloudflare |
| `npm wrangler tail` | 查看所有 Workers 的实时日志 |

## 了解更多

要了解更多关于 Next.js 的信息，请查看以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 功能和 API。
- [学习 Next.js](https://nextjs.org/learn) - 一个交互式 Next.js 教程。

您可以查看 [Next.js GitHub 仓库](https://github.com/vercel/next.js/) - 欢迎您的反馈和贡献！