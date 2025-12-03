import { createConnection, ConnectionOptions } from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig: ConnectionOptions = {
  host: process.env.TIDB_HOST || 'localhost',
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER || 'root',
  password: process.env.TIDB_PASSWORD || '',
  database: process.env.TIDB_DATABASE || 'ue_site',
  ssl: process.env.TIDB_ENABLE_SSL === 'true' ? {
    rejectUnauthorized: true
  } : undefined,
  connectTimeout: 30000
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