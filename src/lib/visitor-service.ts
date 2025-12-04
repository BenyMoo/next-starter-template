import { getTiDBConnection } from '@/lib/database-tidb-serverless';

// 简单的内存缓存实现
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly defaultTTL = 30000; // 30秒默认缓存

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// 全局缓存实例
const cache = new MemoryCache();

// 缓存键常量
const CACHE_KEYS = {
  VISITOR_STATS: 'visitor_stats',
  RECENT_VISITORS: 'recent_visitors',
  TOTAL_VISITORS: 'total_visitors',
  TODAY_VISITORS: 'today_visitors'
};

export interface VisitorStats {
  total: number;
  today: number;
  recent: Array<{
    id: number;
    country: string;
    region: string;
    city: string;
    device_type: string;
    browser: string;
    os: string;
    visited_at: string;
  }>;
}

/**
 * 获取访问统计（带缓存优化）
 */
export async function getVisitorStats(): Promise<VisitorStats> {
  const cacheKey = CACHE_KEYS.VISITOR_STATS;
  const cached = cache.get<VisitorStats>(cacheKey);
  
  if (cached) {
    console.log('📊 使用缓存的访问统计');
    return cached;
  }

  try {
    const conn = getTiDBConnection();

    // 优化的聚合查询 - 一次查询获取所有统计信息
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT session_id) as total_visitors,
        COUNT(DISTINCT CASE WHEN DATE(visited_at) = CURDATE() THEN session_id END) as today_visitors,
        COUNT(*) as total_records
      FROM visitors
    `;

    const recentQuery = `
      SELECT 
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
      LIMIT 10
    `;

    // 并行执行查询
    const [statsResult, recentResult] = await Promise.all([
      conn.execute(statsQuery),
      conn.execute(recentQuery)
    ]);

    const statsRows = 'rows' in statsResult ? statsResult.rows : statsResult;
    const recentRows = 'rows' in recentResult ? recentResult.rows : recentResult;

    const stats = {
      total: (statsRows as any[])[0]?.total_visitors || 0,
      today: (statsRows as any[])[0]?.today_visitors || 0,
      recent: (recentRows as any[]) || []
    };

    // 缓存结果（30秒TTL）
    cache.set(cacheKey, stats, 30000);
    
    console.log('✅ 数据库查询完成，统计已缓存');
    return stats;

  } catch (error) {
    console.error('❌ 获取访问统计失败:', error);
    throw new Error(`获取访问统计失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 获取总访问人数（带缓存）
 */
export async function getTotalVisitors(): Promise<number> {
  const cacheKey = CACHE_KEYS.TOTAL_VISITORS;
  const cached = cache.get<number>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const conn = getTiDBConnection();
    const result = await conn.execute('SELECT COUNT(DISTINCT session_id) as total FROM visitors');
    const rows = 'rows' in result ? result.rows : result;
    const total = (rows as any[])[0]?.total || 0;
    
    cache.set(cacheKey, total, 60000); // 1分钟缓存
    return total;
  } catch (error) {
    console.error('获取总访问人数失败:', error);
    throw error;
  }
}

/**
 * 获取今日访问人数（带缓存）
 */
export async function getTodayVisitors(): Promise<number> {
  const cacheKey = CACHE_KEYS.TODAY_VISITORS;
  const cached = cache.get<number>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const conn = getTiDBConnection();
    const result = await conn.execute(
      'SELECT COUNT(DISTINCT session_id) as today FROM visitors WHERE DATE(visited_at) = CURDATE()'
    );
    const rows = 'rows' in result ? result.rows : result;
    const today = (rows as any[])[0]?.today || 0;
    
    cache.set(cacheKey, today, 30000); // 30秒缓存
    return today;
  } catch (error) {
    console.error('获取今日访问人数失败:', error);
    throw error;
  }
}

/**
 * 获取最近访问记录（带缓存）
 */
export async function getRecentVisitors(limit: number = 10): Promise<any[]> {
  const cacheKey = `${CACHE_KEYS.RECENT_VISITORS}_${limit}`;
  const cached = cache.get<any[]>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  try {
    const conn = getTiDBConnection();
    const result = await conn.execute(
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
       LIMIT ?`,
      [limit]
    );
    
    const rows = 'rows' in result ? result.rows : result;
    const recent = (rows as any[]) || [];
    
    cache.set(cacheKey, recent, 15000); // 15秒缓存
    return recent;
  } catch (error) {
    console.error('获取最近访问记录失败:', error);
    throw error;
  }
}

/**
 * 获取分页访问记录（带缓存）
 */
export async function getPaginatedVisitors(
  page: number = 1, 
  pageSize: number = 20
): Promise<{ visitors: any[]; total: number; hasMore: boolean }> {
  const cacheKey = `visitors_page_${page}_${pageSize}`;
  const cached = cache.get<{ visitors: any[]; total: number; hasMore: boolean }>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const conn = getTiDBConnection();
    const offset = (page - 1) * pageSize;

    // 并行获取数据和总数
    const [visitorsResult, totalResult] = await Promise.all([
      conn.execute(
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
         LIMIT ? OFFSET ?`,
        [pageSize, offset]
      ),
      conn.execute('SELECT COUNT(*) as total FROM visitors')
    ]);

    const visitors = 'rows' in visitorsResult ? visitorsResult.rows : visitorsResult;
    const totalRows = 'rows' in totalResult ? totalResult.rows : totalResult;
    const total = (totalRows as any[])[0]?.total || 0;
    const visitorArray = (visitors as any[]) || [];
    const hasMore = offset + visitorArray.length < total;

    const result = {
      visitors: visitorArray,
      total,
      hasMore
    };

    // 缓存较短的时间（10秒）
    cache.set(cacheKey, result, 10000);
    return result;

  } catch (error) {
    console.error('获取分页访问记录失败:', error);
    throw error;
  }
}

/**
 * 记录新的访问（并清除相关缓存）
 */
export async function recordVisitor(
  ipAddress: string,
  userAgent: string | null,
  referer: string,
  sessionId: string
): Promise<void> {
  try {
    const conn = getTiDBConnection();

    // 解析用户代理信息
    const { device_type, browser, os } = parseUserAgent(userAgent);

    const query = `
      INSERT INTO visitors (ip_address, user_agent, referer, country, region, city, device_type, browser, os, session_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await conn.execute(query, [
      ipAddress,
      userAgent,
      referer,
      '中国', // 默认国家
      '未知省份',
      '未知城市',
      device_type,
      browser,
      os,
      sessionId
    ]);

    // 清除相关缓存
    cache.delete(CACHE_KEYS.VISITOR_STATS);
    cache.delete(CACHE_KEYS.TOTAL_VISITORS);
    cache.delete(CACHE_KEYS.TODAY_VISITORS);
    cache.delete(CACHE_KEYS.RECENT_VISITORS);
    
    console.log('✅ 访问记录已保存，相关缓存已清除');

  } catch (error) {
    console.error('❌ 记录访问失败:', error);
    throw error;
  }
}

/**
 * 清除所有缓存
 */
export function clearCache(): void {
  cache.clear();
  console.log('🗑️ 所有缓存已清除');
}

/**
 * 解析用户代理信息
 */
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