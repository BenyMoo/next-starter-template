# Next.js Framework Starter

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/next-starter-template)

<!-- dash-content-start -->

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It's deployed on Cloudflare Workers as a [static website](https://developers.cloudflare.com/workers/static-assets/).

This template uses [OpenNext](https://opennext.js.org/) via the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare), which works by taking the Next.js build output and transforming it, so that it can run in Cloudflare Workers.

<!-- dash-content-end -->

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/next-starter-template
```

A live public deployment of this template is available at [https://next-starter-template.templates.workers.dev](https://next-starter-template.templates.workers.dev)

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

## Getting Started

First, run:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then run the development server (using the package manager of your choice):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Deploying To Production

| Command                           | Action                                       |
| :-------------------------------- | :------------------------------------------- |
| `npm run build`                   | Build your production site                   |
| `npm run preview`                 | Preview your build locally, before deploying |
| `npm run build && npm run deploy` | Deploy your production site to Cloudflare    |
| `npm wrangler tail`               | View real-time logs for all Workers          |

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
