'use client';

import { useState } from 'react';
import type { AdPlatform } from '../types';
import { adPlatformAPI } from '../lib/api';

interface Props {
  platforms: AdPlatform[];
  onRefresh: () => void;
}

export default function PlatformList({ platforms, onRefresh }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPlatforms = platforms.filter(p => {
    // カテゴリフィルター
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }
    
    // ステータスフィルター
    if (selectedStatus === 'active' && !p.is_active) {
      return false;
    }
    if (selectedStatus === 'inactive' && p.is_active) {
      return false;
    }
    
    // 検索フィルター
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const toggleActive = async (platform: AdPlatform) => {
    try {
      await adPlatformAPI.update(platform.id, {
        is_active: !platform.is_active,
      });
      onRefresh();
    } catch (error) {
      alert('更新に失敗しました');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">登録広告媒体</h2>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm"
          >
            🔄 更新
          </button>
        </div>
        
        {/* フィルターエリア */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="🔍 サイト名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm flex-1 min-w-[200px]"
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">📂 すべてのカテゴリ</option>
            <option value="お客向け">👥 お客向け</option>
            <option value="女子求人">👩 女子求人</option>
            <option value="男子求人">👨 男子求人</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">📊 すべての状態</option>
            <option value="active">✅ 有効のみ</option>
            <option value="inactive">⏸️ 無効のみ</option>
          </select>
        </div>
        
        {/* 結果カウント */}
        <div className="mt-3 text-sm text-gray-600">
          {filteredPlatforms.length} / {platforms.length} 件表示中
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlatforms.map((platform) => (
          <div
            key={platform.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-900">{platform.name}</h3>
                <span className="inline-block px-2 py-1 mt-1 text-xs rounded-full bg-purple-100 text-purple-800">
                  {platform.category}
                </span>
              </div>
              <button
                onClick={() => toggleActive(platform)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  platform.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {platform.is_active ? '✅ 有効' : '⏸️ 無効'}
              </button>
            </div>

            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">接続:</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                  {platform.connection_type}
                </span>
              </div>
              
              {platform.login_id && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">ID:</span>
                  <span className="truncate">{platform.login_id}</span>
                </div>
              )}

              {platform.last_sync_at && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">最終同期:</span>
                  <span className="text-xs">
                    {new Date(platform.last_sync_at).toLocaleString('ja-JP')}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <button
                className="flex-1 px-3 py-1.5 bg-primary text-white rounded hover:bg-primary/90 text-sm"
                onClick={() => alert('編集機能は近日実装予定')}
              >
                ✏️ 編集
              </button>
              <button
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                onClick={() => window.open(platform.url, '_blank')}
              >
                🔗
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPlatforms.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          該当する広告媒体がありません
        </div>
      )}
    </div>
  );
}
