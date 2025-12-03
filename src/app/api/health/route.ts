import { NextRequest, NextResponse } from 'next/server';
import { getHyperdriveConnection } from '@/lib/database-hyperdrive';

export async function GET(request: NextRequest) {
  let connection;
  const isCloudflareWorker = typeof globalThis !== 'undefined' && 'HYPERDRIVE' in globalThis;

  try {
    // 测试数据库连接
    try {
      // 使用 Hyperdrive 连接（自动适配环境）
      connection = await getHyperdriveConnection();

      // 执行简单查询测试
      const [rows] = await connection.execute('SELECT 1 as test');
      const testResult = (rows as any[])[0].test;

      return NextResponse.json({
        success: true,
        message: '数据库连接正常',
        environment: isCloudflareWorker ? 'cloudflare-worker' : 'node-js',
        testResult,
        timestamp: new Date().toISOString()
      });

    } catch (dbError) {
      console.error('数据库连接失败:', dbError);
      return NextResponse.json({
        success: false,
        message: '数据库连接失败',
        environment: isCloudflareWorker ? 'cloudflare-worker' : 'node-js',
        error: dbError instanceof Error ? dbError.message : String(dbError),
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error) {
    console.error('健康检查失败:', error);
    return NextResponse.json({
      success: false,
      message: '健康检查失败',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}