import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';

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

function parseUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return {
      device_type: 'unknown',
      browser: 'unknown',
      os: 'unknown'
    };
  }

  // 简化的设备类型检测
  const device_type = /mobile|android|iphone|ipad/i.test(userAgent) ? '手机' : 
                     /tablet|ipad/i.test(userAgent) ? '平板' : 'PC';

  // 简化的浏览器检测
  let browser = '未知浏览器';
  if (/chrome/i.test(userAgent)) browser = 'Chrome';
  else if (/firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/safari/i.test(userAgent)) browser = 'Safari';
  else if (/edge/i.test(userAgent)) browser = 'Edge';

  // 简化的操作系统检测
  let os = '未知系统';
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/macintosh|mac os/i.test(userAgent)) os = 'macOS';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad/i.test(userAgent)) os = 'iOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';

  return { device_type, browser, os };
}

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const userAgent = request.headers.get('user-agent');
    const referer = request.headers.get('referer') || searchParams.get('ref') || '直接访问';
    const ipAddress = getClientIP(request);
    const sessionId = generateSessionId();
    
    // 解析用户代理信息
    const { device_type, browser, os } = parseUserAgent(userAgent);
    
    connection = await getConnection();
    
    // 插入访问记录
    const query = `
      INSERT INTO visitors (ip_address, user_agent, referer, country, region, city, device_type, browser, os, session_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(query, [
      ipAddress,
      userAgent,
      referer,
      '中国', // 默认国家，实际应用中可集成IP地理位置服务
      '未知省份',
      '未知城市',
      device_type,
      browser,
      os,
      sessionId
    ]);
    
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
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    connection = await getConnection();
    
    // 获取总访问人数（基于session_id去重）
    const [totalResult] = await connection.execute(
      'SELECT COUNT(DISTINCT session_id) as total FROM visitors'
    );
    
    // 获取今日访问人数
    const [todayResult] = await connection.execute(
      'SELECT COUNT(DISTINCT session_id) as today FROM visitors WHERE DATE(visited_at) = CURDATE()'
    );
    
    // 获取最近访问记录（限制10条，隐藏敏感信息）
    const [recentResult] = await connection.execute(
      `SELECT 
        id,
        country,
        region,
        city,
        device_type,
        browser,
        os,
        visited_at
       FROM visitors 
       ORDER BY visited_at DESC 
       LIMIT 10`
    );
    
    const total = (totalResult as any[])[0]?.total || 0;
    const today = (todayResult as any[])[0]?.today || 0;
    const recent = recentResult as any[];
    
    return NextResponse.json({
      success: true,
      data: {
        total,
        today,
        recent
      }
    });
    
  } catch (error) {
    console.error('获取访问统计失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取统计失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}