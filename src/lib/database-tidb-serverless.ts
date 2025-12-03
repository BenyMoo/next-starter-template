import { connect } from '@tidbcloud/serverless';

/**
 * 使用 TiDB Cloud Serverless Driver 连接数据库
 * 这是 Cloudflare Workers 连接 TiDB 的官方推荐方式
 * 
 * 优势：
 * - 通过 HTTP 连接，完美适配 Cloudflare Workers 的 V8 引擎
 * - 无需 TCP 支持
 * - 自动处理连接池和 SSL
 * - 支持本地开发和生产环境
 */

// 检查是否在 Cloudflare Workers 环境中
function isCloudflareWorker(): boolean {
    return typeof globalThis !== 'undefined' &&
        typeof (globalThis as any).Response !== 'undefined' &&
        typeof process === 'undefined';
}

// 从环境获取变量（兼容 Cloudflare Workers 和 Node.js）
function getEnvVar(key: string, defaultValue: string = ''): string {
    // Cloudflare Workers 环境
    if (typeof globalThis !== 'undefined' && (globalThis as any)[key]) {
        return (globalThis as any)[key];
    }

    // Node.js 环境
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }

    return defaultValue;
}

// 构建 TiDB 连接 URL
function getDatabaseUrl(): string {
    const host = getEnvVar('TIDB_HOST');
    const port = getEnvVar('TIDB_PORT', '4000');
    const user = getEnvVar('TIDB_USER');
    const password = getEnvVar('TIDB_PASSWORD');
    const database = getEnvVar('TIDB_DATABASE');

    // 构建 MySQL 连接字符串
    // 格式：mysql://username:password@host:port/database
    return `mysql://${user}:${password}@${host}:${port}/${database}?ssl={"rejectUnauthorized":true}`;
}

/**
 * 创建数据库连接
 * 使用 TiDB Cloud Serverless Driver
 */
export function getTiDBConnection() {
    const databaseUrl = getDatabaseUrl();

    // TiDB Serverless Driver 的 connect 函数返回一个连接对象
    // 这个对象可以直接执行 SQL 查询
    const conn = connect({
        url: databaseUrl,
        // 在 Cloudflare Workers 中，fetch API 会自动注入
        // 在本地环境，使用 node-fetch 或全局 fetch
    });

    console.log(isCloudflareWorker()
        ? '🚀 Using TiDB Serverless Driver (Cloudflare Workers)'
        : '🔧 Using TiDB Serverless Driver (Local)');

    return conn;
}

/**
 * 执行查询的辅助函数
 * @param sql SQL 查询语句
 * @param params 参数（可选）
 */
export async function executeQuery(sql: string, params?: any[]) {
    const conn = getTiDBConnection();

    try {
        const result = await conn.execute(sql, params);
        return result;
    } catch (error) {
        console.error('❌ Query execution failed:', error);
        throw new Error(`查询执行失败: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * 测试数据库连接
 */
export async function testTiDBConnection() {
    try {
        const conn = getTiDBConnection();
        const result = await conn.execute('SELECT VERSION() as version');

        const version = result.rows[0]?.version || 'unknown';
        const method = isCloudflareWorker() ? 'TiDB Serverless (Cloudflare Workers)' : 'TiDB Serverless (Local)';

        console.log(`🔌 Connected to TiDB! (Method: ${method}, Version: ${version})`);

        return {
            success: true,
            version,
            method
        };
    } catch (error) {
        console.error('Connection test failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * TiDB Serverless Driver Connection 类型
 * 提供类型提示
 */
export type TiDBConnection = ReturnType<typeof connect>;
