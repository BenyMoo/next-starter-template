import { createConnection } from 'mysql2/promise';

// Cloudflare Worker 环境下的数据库连接配置
export interface CloudflareDBConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
}

// 获取环境变量
function getEnvVar(key: string): string {
  // 在 Cloudflare Worker 环境下，环境变量通过全局对象访问
  if (typeof (global as any)[key] !== 'undefined') {
    return (global as any)[key];
  }
  
  // 尝试从 process.env 获取（Node.js 环境）
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]!;
  }
  
  throw new Error(`环境变量 ${key} 未设置`);
}

// 创建数据库连接配置
export function getCloudflareDBConfig(): CloudflareDBConfig {
  return {
    host: getEnvVar('TIDB_HOST'),
    port: parseInt(getEnvVar('TIDB_PORT') || '4000'),
    user: getEnvVar('TIDB_USER'),
    password: getEnvVar('TIDB_PASSWORD'),
    database: getEnvVar('TIDB_DATABASE'),
    ssl: (getEnvVar('TIDB_ENABLE_SSL') || 'true') === 'true'
  };
}

// 创建数据库连接（适用于 Cloudflare Worker）
export async function getCloudflareConnection() {
  const config = getCloudflareDBConfig();
  
  try {
    const connection = await createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl ? {
        rejectUnauthorized: false // Cloudflare Worker 环境下需要设置为 false
      } : undefined,
      connectTimeout: 60000
    });
    
    console.log('✅ Successfully connected to TiDB database (Cloudflare Worker)');
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed in Cloudflare Worker:', error);
    throw new Error(`数据库连接失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// 测试数据库连接
export async function testCloudflareConnection() {
  let connection;
  try {
    connection = await getCloudflareConnection();
    const [rows] = await connection.execute('SELECT VERSION() as version');
    const version = (rows as any[])[0].version;
    console.log('🔌 Connected to TiDB cluster! (Cloudflare Worker Version:', version + ')');
    return { success: true, version };
  } catch (error) {
    console.error('Cloudflare Worker connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}