import { NextRequest, NextResponse } from 'next/server';
import { getVisitorStats, recordVisitor } from '@/lib/visitor-service';

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAgent = request.headers.get('user-agent');
    const referer = request.headers.get('referer') || searchParams.get('ref') || '直接访问';
    const ipAddress = getClientIP(request);
    const sessionId = generateSessionId();

    // 使用优化的服务记录访问
    await recordVisitor(ipAddress, userAgent, referer, sessionId);

    return NextResponse.json({
      success: true,
      message: '访问记录已保存',
      sessionId
    });

  } catch (error) {
    console.error('记录访问者数据失败:', error);
    return NextResponse.json({
      success: false,
      error: '记录访问失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // 使用优化的服务获取统计信息
    const stats = await getVisitorStats();

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取访问统计失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取统计失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}