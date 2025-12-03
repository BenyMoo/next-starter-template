import { createConnection } from 'mysql2/promise';

/**
 * 使用 Cloudflare Hyperdrive 连接数据库
 * Hyperdrive 专为 Cloudflare Workers 优化，自动处理连接池和 SSL
 */

// 检查是否在 Cloudflare Workers 环境中
function isCloudflareWorker(): boolean {
    return typeof globalThis !== 'undefined' && 'HYPERDRIVE' in globalThis;
}

// 从环境获取变量
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

/**
 * 创建数据库连接
 * 在 Cloudflare Workers 中使用 Hyperdrive，在本地使用直接连接
 */
export async function getHyperdriveConnection() {
    try {
        // 检查是否有 Hyperdrive 绑定
        if (isCloudflareWorker() && (globalThis as any).HYPERDRIVE) {
            console.log('🚀 Using Cloudflare Hyperdrive connection');

            // 使用 Hyperdrive 连接字符串
            const hyperdrive = (globalThis as any).HYPERDRIVE;
            const connection = await createConnection(hyperdrive.connectionString);

            console.log('✅ Successfully connected via Hyperdrive');
            return connection;
        } else {
            console.log('🔧 Using direct MySQL connection (local development)');

            // 本地开发环境：使用直接连接
            const connection = await createConnection({
                host: getEnvVar('TIDB_HOST', 'localhost'),
                port: parseInt(getEnvVar('TIDB_PORT', '4000')),
                user: getEnvVar('TIDB_USER', 'root'),
                password: getEnvVar('TIDB_PASSWORD', ''),
                database: getEnvVar('TIDB_DATABASE', 'ue_site'),
                // 本地环境可以使用完整的 SSL 配置
                ssl: getEnvVar('TIDB_ENABLE_SSL', 'true') === 'true' ? {
                    rejectUnauthorized: false
                } : undefined,
                connectTimeout: 60000
            });

            console.log('✅ Successfully connected to database');
            return connection;
        }
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw new Error(`数据库连接失败: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * 测试数据库连接
 */
export async function testHyperdriveConnection() {
    let connection;
    try {
        connection = await getHyperdriveConnection();
        const [rows] = await connection.execute('SELECT VERSION() as version');
        const version = (rows as any[])[0].version;

        const method = isCloudflareWorker() ? 'Hyperdrive' : 'Direct';
        console.log(`🔌 Connected to database! (Method: ${method}, Version: ${version})`);

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
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
