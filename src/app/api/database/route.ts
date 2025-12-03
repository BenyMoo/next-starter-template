import { NextRequest, NextResponse } from 'next/server';
import { getTiDBConnection } from '@/lib/database-tidb-serverless';

export async function GET(request: NextRequest) {
  try {
    // 使用 TiDB Serverless Driver（官方推荐方式）
    const conn = getTiDBConnection();

    // First, let's see what tables exist
    const tablesResult = await conn.execute('SHOW TABLES');
    console.log('Full tablesResult:', JSON.stringify(tablesResult, null, 2));
    
    // TiDB Serverless Driver 可能返回不同的格式
    const tables = 'rows' in tablesResult ? tablesResult.rows : tablesResult;

    console.log('Raw tables result:', tables);
    console.log('Tables result type:', typeof tables);
    console.log('Tables result isArray:', Array.isArray(tables));
    console.log('tablesResult.rows:', 'rows' in tablesResult ? tablesResult.rows : 'No rows property');
    console.log('tablesResult type:', typeof tablesResult);

    if (Array.isArray(tables) && tables.length > 0) {
      // 获取所有表的数据
      const allTablesData = [];
      
      for (const tableRow of tables) {
        // 获取表名（处理不同的列名格式）
        const tableName = Object.values(tableRow)[0] as string;
        console.log(`Processing table: ${tableName}`);

        try {
          // Get sample data (limit to 10 rows)  
          console.log(`Getting data for table: ${tableName}`);
          const dataResult = await conn.execute(`SELECT * FROM ${tableName} LIMIT 10`);
          console.log(`Full SELECT result for ${tableName}:`, JSON.stringify(dataResult, null, 2));
          console.log(`SELECT result type for ${tableName}:`, typeof dataResult);
          console.log(`SELECT result has rows property:`, 'rows' in dataResult);
          const rows = 'rows' in dataResult ? dataResult.rows : dataResult;

          // 如果没有列信息，就从数据的第一行推断列名
          let formattedColumns: any[] = [];
          if (rows && rows.length > 0) {
            const firstRow = rows[0];
            formattedColumns = Object.keys(firstRow).map(key => ({
              field: key,
              type: 'UNKNOWN',
              null: 'YES',
              key: '',
              default: null,
              extra: ''
            }));
          }

          // Create table data structure that matches frontend expectation
          const tableData = {
            name: tableName,
            columns: formattedColumns,
            data: rows
          };

          allTablesData.push(tableData);
          console.log(`Successfully processed table ${tableName} with ${formattedColumns.length} columns and ${rows ? rows.length : 0} rows`);
        } catch (tableError) {
          console.error(`Error processing table ${tableName}:`, tableError);
          // 如果某个表处理失败，继续处理其他表
          continue;
        }
      }

      return NextResponse.json({
        success: true,
        tables: allTablesData,
        message: `Found ${tables.length} tables in database`,
        debug: {
          rawTables: tables,
          processedTables: allTablesData.length,
          connectionMethod: 'TiDB Serverless Driver'
        }
      });
    } else {
      // 尝试获取数据库信息
      let dbInfo: any = {
        database: 'ue_site', // 从配置中已知
        connectionMethod: 'TiDB Serverless Driver'
      };
      try {
        const versionResult = await conn.execute('SELECT VERSION() as version');
        const versionRows = 'rows' in versionResult ? versionResult.rows : versionResult;
        if (versionRows && versionRows.length > 0) {
          const firstRow = versionRows[0] as any;
          dbInfo.version = firstRow.version || 'unknown';
        }
      } catch (infoError) {
        console.error('Failed to get database version:', infoError);
      }

      return NextResponse.json({
        success: true,
        tables: [],
        message: 'No tables found in database',
        debug: {
          rawTablesResult: tablesResult,
          dbInfo,
          connectionMethod: 'TiDB Serverless Driver'
        }
      });
    }

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data from database',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}