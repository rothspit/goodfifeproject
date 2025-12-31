'use client';

import { useState, useEffect } from 'react';
import { adPlatformAPI } from '../lib/api';
import type { DistributionLog } from '../types';

export default function LogViewer() {
  const [logs, setLogs] = useState<DistributionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '成功' | '失敗'>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await adPlatformAPI.getLogs({ limit: 100 });
      setLogs(data);
    } catch (error) {
      console.error('ログ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '成功': return 'bg-green-100 text-green-800';
      case '失敗': return 'bg-red-100 text-red-800';
      case '処理中': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">配信ログ</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('成功')}
            className={`px-3 py-1 rounded text-sm ${
              filter === '成功' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            成功
          </button>
          <button
            onClick={() => setFilter('失敗')}
            className={`px-3 py-1 rounded text-sm ${
              filter === '失敗' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            失敗
          </button>
          <button
            onClick={loadLogs}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
          >
            🔄 更新
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          読み込み中...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          ログがありません
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  日時
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  広告媒体
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  配信タイプ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ステータス
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  実行時間
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  エラー
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {log.platform_name || `ID: ${log.platform_id}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.distribution_type}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.execution_time ? `${log.execution_time}ms` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600 max-w-xs truncate">
                    {log.error_message || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
