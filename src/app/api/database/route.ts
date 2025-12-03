import { NextRequest, NextResponse } from 'next/server';
import { getTiDBConnection } from '@/lib/database-tidb-serverless';

export async function GET(request: NextRequest) {
  try {
    // 使用 TiDB Serverless Driver（官方推荐方式）
    const conn = getTiDBConnection();

    // First, let's see what tables exist
    const tablesResult = await conn.execute('SHOW TABLES');
    const tables = tablesResult.rows;

    if (Array.isArray(tables) && tables.length > 0) {
      // Get the first table name
      const tableName = Object.values(tables[0])[0] as string;

      // Get table structure
      const columnsResult = await conn.execute(`DESCRIBE ${tableName}`);
      const columns = columnsResult.rows;

      // Get sample data (limit to 10 rows)  
      const dataResult = await conn.execute(`SELECT * FROM ${tableName} LIMIT 10`);
      const rows = dataResult.rows;

      // Format columns to match frontend expectation
      const formattedColumns = (columns as any[]).map(col => ({
        field: col.Field,
        type: col.Type,
        null: col.Null,
        key: col.Key,
        default: col.Default,
        extra: col.Extra
      }));

      // Create table data structure that matches frontend expectation
      const tableData = {
        name: tableName,
        columns: formattedColumns,
        data: rows
      };

      return NextResponse.json({
        success: true,
        tables: [tableData], // Wrap in array to match frontend expectation
        message: `Found ${tables.length} tables in database`
      });
    } else {
      return NextResponse.json({
        success: true,
        tables: [],
        message: 'No tables found in database'
      });
    }

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data from database',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}