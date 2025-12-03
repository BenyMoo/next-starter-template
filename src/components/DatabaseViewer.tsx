'use client';

import { useState, useEffect } from 'react';
import { Database, Table, AlertCircle, RefreshCw } from 'lucide-react';

interface DatabaseData {
  success: boolean;
  tables?: any[];
  selectedTable?: string;
  columns?: any[];
  data?: any[];
  message?: string;
  error?: string;
  details?: string;
}

export default function DatabaseViewer() {
  const [dbData, setDbData] = useState<DatabaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/database');
      const data = await response.json() as DatabaseData;
      
      if (data.success) {
        setDbData(data);
      } else {
        setError(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Failed to connect to database');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">正在连接数据库...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-8">
        <div className="flex items-center mb-2">
          <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
          <h3 className="text-red-400 font-semibold">数据库连接错误</h3>
        </div>
        <p className="text-gray-300 mb-4">{error}</p>
        <button 
          onClick={fetchData}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          重试连接
        </button>
      </div>
    );
  }

  if (!dbData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-400">没有数据可显示</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Database Info */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center mb-4">
          <Database className="w-6 h-6 text-green-400 mr-3" />
          <h3 className="text-xl font-semibold text-white">数据库信息</h3>
        </div>
        <p className="text-gray-300 mb-2">{dbData.message}</p>
        {dbData.tables && (
          <p className="text-gray-400 text-sm">表数量: {dbData.tables.length}</p>
        )}
      </div>

      {/* Tables List */}
      {dbData.tables && dbData.tables.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center mb-4">
            <Table className="w-6 h-6 text-blue-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">数据表</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dbData.tables.map((table, index) => {
              const tableName = Object.values(table)[0] as string;
              return (
                <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white font-medium">{tableName}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Table Data */}
      {dbData.selectedTable && dbData.data && dbData.data.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            表数据: <span className="text-blue-400">{dbData.selectedTable}</span>
          </h3>
          
          {/* Table Columns */}
          {dbData.columns && (
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gray-300 mb-2">字段结构:</h4>
              <div className="flex flex-wrap gap-2">
                {dbData.columns.map((column: any, index) => (
                  <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">
                    {column.Field} ({column.Type})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Data Table */}
          {dbData.data && dbData.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    {Object.keys(dbData.data[0]).map((key) => (
                      <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {dbData.data.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-800 transition-colors">
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {value === null ? 'NULL' : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-gray-400 text-sm mt-4">
            显示 {dbData.data.length} 条记录
          </p>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button 
          onClick={fetchData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center mx-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新数据
        </button>
      </div>
    </div>
  );
}