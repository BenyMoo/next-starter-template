import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedVisitors } from '@/lib/visitor-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取分页参数
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    // 参数验证
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json({
        success: false,
        error: '无效的分页参数'
      }, { status: 400 });
    }

    // 获取分页数据
    const result = await getPaginatedVisitors(page, pageSize);

    return NextResponse.json({
      success: true,
      data: {
        visitors: result.visitors,
        pagination: {
          currentPage: page,
          pageSize,
          total: result.total,
          hasMore: result.hasMore,
          totalPages: Math.ceil(result.total / pageSize)
        }
      }
    });

  } catch (error) {
    console.error('获取分页访问记录失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取访问记录失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}