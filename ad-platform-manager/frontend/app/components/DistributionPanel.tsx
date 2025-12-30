'use client';

import { useState } from 'react';
import type { AdPlatform } from '../types';
import { distributionAPI } from '../lib/api';

interface Props {
  platforms: AdPlatform[];
}

export default function DistributionPanel({ platforms }: Props) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [distributionType, setDistributionType] = useState<'cast' | 'schedule' | 'diary' | 'bulk'>('cast');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const activePlatforms = platforms.filter(p => p.is_active);

  const togglePlatform = (platformId: number) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const selectAll = () => {
    setSelectedPlatforms(activePlatforms.map(p => p.id));
  };

  const deselectAll = () => {
    setSelectedPlatforms([]);
  };

  const handleDistribute = async () => {
    if (selectedPlatforms.length === 0) {
      alert('配信先の広告媒体を選択してください');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      let response;
      
      // デモデータで配信
      if (distributionType === 'cast') {
        response = await distributionAPI.distributeCast(1, selectedPlatforms, {
          name: 'さくら',
          age: 25,
          height: 160,
          bust: 88,
          waist: 58,
          hip: 86,
        });
      } else if (distributionType === 'bulk') {
        response = await distributionAPI.distributeBulk(selectedPlatforms, {
          includeSchedules: true,
          includeDiaries: false,
        });
      }

      setResult(response);
    } catch (error: any) {
      alert(`配信エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">一括配信</h2>

      {/* 配信タイプ選択 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">配信タイプ</label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setDistributionType('cast')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              distributionType === 'cast'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👩 キャスト情報
          </button>
          <button
            onClick={() => setDistributionType('schedule')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              distributionType === 'schedule'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📅 スケジュール
          </button>
          <button
            onClick={() => setDistributionType('diary')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              distributionType === 'diary'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📝 写メ日記
          </button>
          <button
            onClick={() => setDistributionType('bulk')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              distributionType === 'bulk'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🚀 一括配信
          </button>
        </div>
      </div>

      {/* 媒体選択 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">配信先の広告媒体</label>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-xs text-primary hover:underline">
              すべて選択
            </button>
            <button onClick={deselectAll} className="text-xs text-gray-600 hover:underline">
              選択解除
            </button>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {activePlatforms.map((platform) => (
            <label
              key={platform.id}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(platform.id)}
                onChange={() => togglePlatform(platform.id)}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm font-medium text-gray-900">{platform.name}</span>
              <span className="ml-auto text-xs text-gray-500">{platform.category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 配信ボタン */}
      <div className="mb-6">
        <button
          onClick={handleDistribute}
          disabled={loading || selectedPlatforms.length === 0}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
        >
          {loading ? '配信中...' : `🚀 ${selectedPlatforms.length}媒体に配信`}
        </button>
      </div>

      {/* 配信結果 */}
      {result && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-3">配信結果</h3>
          <div className="space-y-2">
            {result.results?.map((r: any, i: number) => (
              <div
                key={i}
                className={`p-3 rounded ${
                  r.success ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {r.success ? '✅' : '❌'} {r.platformName}
                  </span>
                  <span className="text-xs text-gray-600">{r.executionTime}ms</span>
                </div>
                {r.errorMessage && (
                  <p className="text-sm text-red-600 mt-1">{r.errorMessage}</p>
                )}
              </div>
            ))}
          </div>
          {result.summary && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-sm">
              <div>
                <span className="text-gray-600">合計:</span> <strong>{result.summary.total}</strong>
              </div>
              <div>
                <span className="text-green-600">成功:</span> <strong>{result.summary.success}</strong>
              </div>
              <div>
                <span className="text-red-600">失敗:</span> <strong>{result.summary.failure}</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
