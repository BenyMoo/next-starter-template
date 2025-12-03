'use client';

import { useState, useEffect } from 'react';
import { Users, Eye, Calendar } from 'lucide-react';

interface VisitorStats {
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

interface VisitorStatsProps {
  onViewDetails?: () => void;
}

export default function VisitorStats({ onViewDetails }: VisitorStatsProps) {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 记录当前访问
    const recordVisit = async () => {
      try {
        await fetch('/api/visitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('记录访问失败:', error);
      }
    };

    // 获取统计数据
    const fetchStats = async () => {
    try {
      const response = await fetch('/api/visitors');
      const data = await response.json() as {
        success: boolean;
        data?: VisitorStats;
        error?: string;
      };
      
      if (data.success) {
        setStats(data.data || null);
      } else {
        setError(data.error || '获取统计失败');
      }
    } catch (error) {
      setError('网络错误');
      console.error('获取访问统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

    recordVisit();
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-4"></div>
          <div className="h-8 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 backdrop-blur-sm rounded-lg p-6 border border-red-500/20">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">访问统计</h3>
        </div>
        <button
          onClick={onViewDetails}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          查看详情
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-white/60 text-xs">总访问人数</p>
        </div>
        
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.today}</span>
          </div>
          <p className="text-white/60 text-xs">今日访问</p>
        </div>
      </div>
      
      {stats.recent && stats.recent.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <p className="text-white/60 text-sm mb-2">最近访问</p>
          <div className="space-y-2">
            {stats.recent.slice(0, 3).map((visitor) => (
              <div key={visitor.id} className="flex items-center justify-between text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3" />
                  <span>{visitor.city || visitor.region || visitor.country}</span>
                </div>
                <span>{new Date(visitor.visited_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}