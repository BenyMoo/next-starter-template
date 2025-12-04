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
          // Get table structure first
          console.log(`Getting structure for table: ${tableName}`);
          let structureResult;
          try {
            // Try different approaches to get table structure
            const approaches = [
              `DESCRIBE ${tableName}`,
              `SHOW COLUMNS FROM ${tableName}`,
              `SHOW CREATE TABLE ${tableName}`,
              `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`
            ];
            
            for (const sql of approaches) {
              try {
                console.log(`Trying: ${sql}`);
                structureResult = await conn.execute(sql);
                console.log(`Success with ${sql}:`, JSON.stringify(structureResult, null, 2));
                break;
              } catch (approachError) {
                console.error(`Failed with ${sql}:`, approachError instanceof Error ? approachError.message : String(approachError));
                continue;
              }
            }
            
            if (!structureResult) {
              console.error(`All table structure queries failed for ${tableName}`);
            }
          } catch (describeError) {
            console.error(`Table structure query failed for ${tableName}:`, describeError);
            structureResult = null;
          }
          
          let formattedColumns: any[] = [];
          if (structureResult) {
            // Use actual table structure from query
            const rows = 'rows' in structureResult ? structureResult.rows : structureResult;
            if (rows && Array.isArray(rows) && rows.length > 0) {
              console.log(`Processing ${rows.length} structure rows for ${tableName}`);
              formattedColumns = rows.map((row: any) => {
                console.log(`Structure row:`, JSON.stringify(row, null, 2));
                return {
                  field: row.Field || row.field || row.COLUMN_NAME || row.column_name,
                  type: row.Type || row.type || row.DATA_TYPE || row.data_type || 'UNKNOWN',
                  null: row.Null || row.null || row.IS_NULLABLE || row.is_nullable || 'YES',
                  key: row.Key || row.key || row.COLUMN_KEY || row.column_key || '',
                  default: row.Default !== undefined ? row.Default : (row.default !== undefined ? row.default : (row.COLUMN_DEFAULT || row.column_default || null)),
                  extra: row.Extra || row.extra || row.EXTRA || row.extra || ''
                };
              });
              console.log(`Processed ${formattedColumns.length} columns for ${tableName}`);
            } else {
              console.log(`No rows in structure result for ${tableName}, using fallback`);
            }
          } else {
            console.log(`No structure result for ${tableName}, using fallback`);
            // Fallback: Get sample data and infer structure
            const dataResult = await conn.execute(`SELECT * FROM ${tableName} LIMIT 1`);
            const rows = 'rows' in dataResult ? dataResult.rows : dataResult;
            
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
          }

          // Get sample data (limit to 10 rows)  
          console.log(`Getting data for table: ${tableName}`);
          const dataResult = await conn.execute(`SELECT * FROM ${tableName} LIMIT 10`);
          console.log(`Full SELECT result for ${tableName}:`, JSON.stringify(dataResult, null, 2));
          console.log(`SELECT result type for ${tableName}:`, typeof dataResult);
          console.log(`SELECT result has rows property:`, 'rows' in dataResult);
          const rows = 'rows' in dataResult ? dataResult.rows : dataResult;

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