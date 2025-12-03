import { NextRequest, NextResponse } from 'next/server';
import { getHyperdriveConnection } from '@/lib/database-hyperdrive';

export async function GET(request: NextRequest) {
  let connection;

  try {
    // 使用 Hyperdrive 连接（在 Cloudflare Workers 中）或直接连接（在本地）
    connection = await getHyperdriveConnection();

    // First, let's see what tables exist
    const [tables] = await connection.execute('SHOW TABLES');

    if (Array.isArray(tables) && tables.length > 0) {
      // Get the first table name
      const tableName = Object.values(tables[0])[0];

      // Get table structure
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);

      // Get sample data (limit to 10 rows)
      const [rows] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 10`);

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
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}