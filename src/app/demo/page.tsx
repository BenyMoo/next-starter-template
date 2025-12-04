'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, ArrowLeft, Table, Code, Zap } from 'lucide-react';

interface DatabaseData {
  success: boolean;
  tables: Array<{
    name: string;
    columns: Array<{
      field: string;
      type: string;
      null: string;
      key: string;
      default: string | null;
      extra: string;
    }>;
    data: any[];
  }>;
  message?: string;
  error?: string;
}

export default function DemoPage() {
  const router = useRouter();
  const [dbData, setDbData] = useState<DatabaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  const fetchDatabaseData = async () => {
    try {
      const response = await fetch('/api/database');
      const data = await response.json() as DatabaseData;

      if (data.success) {
        setDbData(data);
      } else {
        setError(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-x-hidden">
      {/* Header */}
      <div className="relative overflow-hidden w-full max-w-[100vw]">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse"></div>
        <div className="relative z-10 px-4 sm:px-6 py-8 w-full max-w-[100vw]">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              返回首页
            </button>
            
            <div className="text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <div className="relative">
                  <Database className="w-16 h-16 text-purple-400" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                    数据库浏览器
                  </h1>
                  <p className="text-lg sm:text-xl text-purple-200">
                    Database Demo
                  </p>
                </div>
              </div>
              
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto px-2">
                探索数据库结构，查看表信息和样本数据
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 pb-12 w-full max-w-[100vw]">
        <div className="max-w-6xl mx-auto">
          {loading && (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="text-center px-4">
                <div className="relative inline-block">
                  <Database className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 animate-bounce" />
                </div>
                <p className="text-white/80 mt-3 sm:mt-4 text-base sm:text-lg">正在连接数据库...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 sm:p-6 text-center mx-4">
              <div className="text-red-400 text-base sm:text-lg mb-2">连接失败</div>
              <div className="text-white/80 text-sm sm:text-base px-2">{error}</div>
              <button
                onClick={fetchDatabaseData}
                className="mt-4 px-4 sm:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                重试连接
              </button>
            </div>
          )}

          {dbData && !loading && (
            <div className="space-y-8">
              {dbData.tables.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10">
                    <Table className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">暂无数据表</h3>
                    <p className="text-white/60 mb-6">数据库中尚未创建任何表格</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-white/50">
                      <Code className="w-4 h-4" />
                      <span>CREATE TABLE your_table (...)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 sm:gap-8">
                  {dbData.tables.map((table, index) => (
                    <div key={table.name} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 w-full max-w-[100vw]">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Table className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl sm:text-2xl font-bold text-white break-words">{table.name}</h3>
                          <p className="text-white/60 text-sm sm:text-base">{table.columns.length} 列 · {table.data.length} 行数据</p>
                        </div>
                      </div>

                      {/* Table Structure */}
                      <div className="mb-6 w-full max-w-[100vw]">
                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Code className="w-5 h-5" />
                          表结构
                        </h4>
                        <div className="overflow-x-auto w-full max-w-[100vw]">
                          <table className="w-full text-sm min-w-[600px]">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-2 sm:px-4 text-purple-300 min-w-[100px]">字段名</th>
                                <th className="text-left py-3 px-2 sm:px-4 text-purple-300 min-w-[120px]">数据类型</th>
                                <th className="text-left py-3 px-2 sm:px-4 text-purple-300 min-w-[80px]">可空</th>
                                <th className="text-left py-3 px-2 sm:px-4 text-purple-300 min-w-[60px]">键</th>
                                <th className="text-left py-3 px-2 sm:px-4 text-purple-300 min-w-[100px]">默认值</th>
                              </tr>
                            </thead>
                            <tbody>
                              {table.columns.map((column, colIndex) => (
                                <tr key={colIndex} className="border-b border-white/5 hover:bg-white/5">
                                  <td className="py-3 px-2 sm:px-4 text-white font-mono text-xs break-all">{column.field}</td>
                                  <td className="py-3 px-2 sm:px-4 text-white/80 text-xs sm:text-sm">{column.type}</td>
                                  <td className="py-3 px-2 sm:px-4">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      column.null === 'YES' 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : 'bg-red-500/20 text-red-400'
                                    }`}>
                                      {column.null}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 sm:px-4 text-white/80 text-xs sm:text-sm">{column.key || '-'}</td>
                                  <td className="py-3 px-2 sm:px-4 text-white/80 text-xs sm:text-sm break-all">{column.default || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Sample Data */}
                      {table.data.length > 0 && (
                        <div className="w-full max-w-[100vw]">
                          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            样本数据 (前10行)
                          </h4>
                          <div className="overflow-x-auto w-full max-w-[100vw]">
                            <table className="w-full text-sm min-w-[800px]">
                              <thead>
                                <tr className="border-b border-white/10">
                                  {table.columns.map((column, colIndex) => (
                                    <th key={colIndex} className="text-left py-3 px-2 sm:px-4 text-purple-300 min-w-[80px]">
                                      {column.field}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.data.slice(0, 5).map((row, rowIndex) => (
                                  <tr key={rowIndex} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    {table.columns.map((column, colIndex) => (
                                      <td key={colIndex} className={`py-3 px-2 sm:px-4 text-white/90 break-all text-sm sm:text-base ${colIndex >= 4 ? 'hidden sm:table-cell' : ''}`}>
                                        {row[column.field] !== null && row[column.field] !== undefined
                                          ? String(row[column.field])
                                          : <span className="text-white/40">NULL</span>
                                        }
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}