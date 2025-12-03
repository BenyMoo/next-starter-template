# Cloudflare Hyperdrive 配置指南

## 什么是 Hyperdrive？

Hyperdrive 是 Cloudflare 提供的数据库加速服务，专门为 Workers 优化数据库连接。它可以：
- 自动处理连接池
- 减少延迟
- 解决 SSL/TLS 配置问题
- 支持 MySQL、PostgreSQL 等数据库

## 配置步骤

### 1. 登录 Cloudflare

首先需要登录到 Cloudflare 账户：

```bash
npx wrangler login
```

这会在浏览器中打开登录页面，完成认证后返回终端。

### 2. 创建 Hyperdrive 配置

使用以下命令创建 Hyperdrive 配置：

```bash
npx wrangler hyperdrive create tidb-hyperdrive --connection-string="mysql://N1f1rb6b8t6x2Mq.root:GM4VT5DkEl42VQBf@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/ue_site"
```

**注意**：这个命令会返回一个 Hyperdrive ID，类似于：
```
✅ Created new Hyperdrive config
 {
  "id": "a76a99bc342644f898d8df7b43104cfe",
  "name": "tidb-hyperdrive",
  ...
 }
```

**请保存这个 ID！** 我们下一步需要用到它。

### 3. 更新 wrangler.jsonc

在 `wrangler.jsonc` 文件中添加 Hyperdrive 绑定。**用你实际得到的 ID 替换下面的 `YOUR_HYPERDRIVE_ID`**：

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "next-starter-template",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-10-08",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": {
    "binding": "ASSETS",
    "directory": ".open-next/assets"
  },
  "observability": {
    "enabled": true
  },
  "upload_source_maps": true,
  
  // 添加 Hyperdrive 绑定
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "YOUR_HYPERDRIVE_ID"  // 替换为实际的 ID
    }
  ]
}
```

### 4. 更新代码使用 Hyperdrive

已经为你准备好了使用 Hyperdrive 的代码，位于：
- `src/lib/database-hyperdrive.ts` - Hyperdrive 连接实现
- `src/app/api/database/route.ts` - 已更新为使用 Hyperdrive

### 5. 测试本地开发

在本地开发时，Hyperdrive 会被模拟，所以代码会自动回退到直接连接：

```bash
npm run dev
```

### 6. 部署到 Cloudflare Workers

完成以上配置后，部署到 Cloudflare：

```bash
npm run deploy
```

### 7. 测试生产环境

部署完成后测试 API：

```bash
curl https://nextdemo.yuenet.top/api/database
```

## 常见问题

### Q: 如果忘记了 Hyperdrive ID 怎么办？

运行以下命令查看所有 Hyperdrive 配置：

```bash
npx wrangler hyperdrive list
```

### Q: 如何更新 Hyperdrive 配置？

```bash
npx wrangler hyperdrive update tidb-hyperdrive --connection-string="新的连接字符串"
```

### Q: 如何删除 Hyperdrive 配置？

```bash
npx wrangler hyperdrive delete tidb-hyperdrive
```

## 重要提示

1. **环境隔离**：Hyperdrive 在 Cloudflare Workers 环境才生效，本地开发会自动回退到直接连接
2. **连接池**：Hyperdrive 自动管理连接池，不需要手动配置
3. **SSL 处理**：Hyperdrive 会自动处理 SSL 连接，不需要配置 `rejectUnauthorized`
4. **性能优化**：Hyperdrive 会缓存数据库连接，显著提升性能
