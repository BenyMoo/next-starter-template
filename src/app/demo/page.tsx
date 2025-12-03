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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse"></div>
        <div className="relative z-10 px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              返回首页
            </button>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="relative">
                  <Database className="w-16 h-16 text-purple-400" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    数据库演示
                  </h1>
                  <p className="text-xl text-purple-200">
                    Database Demo
                  </p>
                </div>
              </div>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                实时展示TiDB数据库中的表格结构和数据内容
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative inline-block">
                  <Database className="w-16 h-16 text-purple-400 animate-bounce" />
                </div>
                <p className="text-white/80 mt-4 text-lg">正在连接数据库...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
              <div className="text-red-400 text-lg mb-2">连接失败</div>
              <div className="text-white/80">{error}</div>
              <button
                onClick={fetchDatabaseData}
                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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
                <div className="grid gap-8">
                  {dbData.tables.map((table, index) => (
                    <div key={table.name} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                          <Table className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{table.name}</h3>
                          <p className="text-white/60">{table.columns.length} 列 · {table.data.length} 行数据</p>
                        </div>
                      </div>

                      {/* Table Structure */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Code className="w-5 h-5" />
                          表结构
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-purple-300">字段名</th>
                                <th className="text-left py-3 px-4 text-purple-300">数据类型</th>
                                <th className="text-left py-3 px-4 text-purple-300">可空</th>
                                <th className="text-left py-3 px-4 text-purple-300">键</th>
                                <th className="text-left py-3 px-4 text-purple-300">默认值</th>
                              </tr>
                            </thead>
                            <tbody>
                              {table.columns.map((column, colIndex) => (
                                <tr key={colIndex} className="border-b border-white/5 hover:bg-white/5">
                                  <td className="py-3 px-4 text-white font-mono text-xs">{column.field}</td>
                                  <td className="py-3 px-4 text-white/80">{column.type}</td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      column.null === 'YES' 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : 'bg-red-500/20 text-red-400'
                                    }`}>
                                      {column.null}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-white/80">{column.key || '-'}</td>
                                  <td className="py-3 px-4 text-white/80">{column.default || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Sample Data */}
                      {table.data.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            样本数据 (前10行)
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-white/10">
                                  {table.columns.map((column, colIndex) => (
                                    <th key={colIndex} className="text-left py-3 px-4 text-purple-300">
                                      {column.field}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.data.map((row, rowIndex) => (
                                  <tr key={rowIndex} className="border-b border-white/5 hover:bg-white/5">
                                    {table.columns.map((column, colIndex) => (
                                      <td key={colIndex} className="py-3 px-4 text-white/80 font-mono text-xs">
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