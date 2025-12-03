# Cloudflare Workers 数据库连接问题修复

## 问题描述

在 Cloudflare Workers 环境中访问 `/api/database` 端点时出现 500 错误：

```json
{
    "success": false,
    "error": "Failed to fetch data from database",
    "details": "The options.rejectUnauthorized option is not implemented"
}
```

## 根本原因

Cloudflare Workers 使用 V8 引擎而不是完整的 Node.js 运行时。因此，许多 Node.js 原生模块的选项不被支持，包括 TLS/SSL 配置中的 `rejectUnauthorized` 选项。

之前的代码：
```typescript
ssl: config.ssl ? {
  rejectUnauthorized: false  // ❌ 在 Cloudflare Workers 中不支持
} : undefined
```

## 解决方案

将 SSL 配置从对象形式改为简单的布尔值：

```typescript
ssl: config.ssl  // ✅ 只使用布尔值
```

## 修改的文件

1. **src/lib/database-cloudflare.ts**
   - 移除了 `ssl: { rejectUnauthorized: false }` 配置
   - 改为 `ssl: config.ssl`（布尔值）

2. **src/lib/database.ts**
   - 移除了 `ssl: { rejectUnauthorized: false }` 配置
   - 改为 `ssl: true` 或 `undefined`

## 部署步骤

1. 确保所有更改已保存
2. 重新构建并部署到 Cloudflare Workers：
   ```bash
   npm run deploy
   ```

3. 测试 API 端点：
   ```bash
   curl https://nextdemo.yuenet.top/api/database
   ```

## 注意事项

- 在 Cloudflare Workers 环境中，SSL 连接的证书验证由 Cloudflare 的运行时自动处理
- 不需要手动配置 `rejectUnauthorized` 选项
- 如果数据库需要 SSL，只需将环境变量 `TIDB_ENABLE_SSL` 设置为 `true`

## 环境变量检查

确保在 Cloudflare Workers 中配置了以下环境变量：
- `TIDB_HOST`
- `TIDB_PORT`
- `TIDB_USER`
- `TIDB_PASSWORD`
- `TIDB_DATABASE`
- `TIDB_ENABLE_SSL` (设置为 "true" 启用 SSL)
