import { createConnection, ConnectionOptions } from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Cloudflare Worker 环境下需要特殊处理
const isCloudflareWorker = typeof process === 'undefined' || !process.env;

// Database configuration
const dbConfig: ConnectionOptions = {
  host: isCloudflareWorker ? (global as any).TIDB_HOST || process?.env?.TIDB_HOST : process.env.TIDB_HOST || 'localhost',
  port: parseInt((isCloudflareWorker ? (global as any).TIDB_PORT || process?.env?.TIDB_PORT : process.env.TIDB_PORT) || '4000'),
  user: isCloudflareWorker ? (global as any).TIDB_USER || process?.env?.TIDB_USER : process.env.TIDB_USER || 'root',
  password: isCloudflareWorker ? (global as any).TIDB_PASSWORD || process?.env?.TIDB_PASSWORD : process.env.TIDB_PASSWORD || '',
  database: isCloudflareWorker ? (global as any).TIDB_DATABASE || process?.env?.TIDB_DATABASE : process.env.TIDB_DATABASE || 'ue_site',
  ssl: (isCloudflareWorker ? (global as any).TIDB_ENABLE_SSL || process?.env?.TIDB_ENABLE_SSL : process.env.TIDB_ENABLE_SSL) === 'true' ? {
    rejectUnauthorized: false // Cloudflare Worker 环境下需要设置为 false
  } : undefined,
  connectTimeout: 60000 // 增加超时时间
};

// Create connection function
export async function getConnection() {
  try {
    const connection = await createConnection(dbConfig);
    console.log('✅ Successfully connected to TiDB database');
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Test connection function
export async function testConnection() {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute('SELECT VERSION() as version');
    const version = (rows as any[])[0].version;
    console.log('🔌 Connected to TiDB cluster! (Version:', version + ')');
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export default dbConfig;