'use client';

import { useState, useEffect } from 'react';
import { X, Users, Globe, Monitor, Smartphone, Tablet, Calendar, Clock, MapPin, Eye } from 'lucide-react';

interface VisitorRecord {
  id: number;
  country: string;
  region: string;
  city: string;
  device_type: string;
  browser: string;
  os: string;
  visited_at: string;
}

interface VisitorDetails {
  total: number;
  today: number;
  recent: VisitorRecord[];
}

interface VisitorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VisitorDetailsModal({ isOpen, onClose }: VisitorDetailsModalProps) {
  const [details, setDetails] = useState<VisitorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchVisitorDetails();
    }
  }, [isOpen]);

  const fetchVisitorDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/visitors');
      const data = await response.json() as {
        success: boolean;
        data?: VisitorDetails;
        error?: string;
      };

      if (data.success) {
        setDetails(data.data || null);
      } else {
        setError(data.error || '获取详情失败');
      }
    } catch (error) {
      setError('网络错误');
      console.error('获取访问详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case '手机':
        return <Smartphone className="w-4 h-4" />;
      case '平板':
        return <Tablet className="w-4 h-4" />;
      case 'PC':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('zh-CN'),
      time: date.toLocaleTimeString('zh-CN')
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">访问详情</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3 text-white/60">加载中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchVisitorDetails}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                重试
              </button>
            </div>
          ) : details ? (
            <div className="space-y-6">
              {/* 统计概览 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{details.total}</div>
                  <div className="text-white/60 text-sm">总访问人数</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{details.today}</div>
                  <div className="text-white/60 text-sm">今日访问</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <Eye className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{details.recent.length}</div>
                  <div className="text-white/60 text-sm">最近记录</div>
                </div>
              </div>

              {/* 详细记录 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  最近访问记录
                </h3>
                <div className="space-y-3">
                  {details.recent.map((visitor) => {
                    const { date, time } = formatDateTime(visitor.visited_at);
                    return (
                      <div key={visitor.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-white/80">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium">
                                {[visitor.city, visitor.region, visitor.country].filter(Boolean).join(', ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                              {getDeviceIcon(visitor.device_type)}
                              <span className="text-sm">{visitor.device_type}</span>
                            </div>
                          </div>
                          <div className="text-white/60 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{date}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span>{visitor.browser}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Monitor className="w-3 h-3" />
                            <span>{visitor.os}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* 底部 */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <p className="text-white/60 text-sm text-center">
            为保护用户隐私，已隐藏IP地址、User-Agent等敏感信息
          </p>
        </div>
      </div>
    </div>
  );
}