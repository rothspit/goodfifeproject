'use client';

import { useState, useEffect } from 'react';
import { adPlatformAPI } from './lib/api';
import type { AdPlatform, DistributionStats } from './types';
import PlatformList from './components/PlatformList';
import DistributionPanel from './components/DistributionPanel';
import LogViewer from './components/LogViewer';
import Dashboard from './components/Dashboard';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'platforms' | 'distribution' | 'logs'>('dashboard');
  const [platforms, setPlatforms] = useState<AdPlatform[]>([]);
  const [stats, setStats] = useState<DistributionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [platformsData, statsData] = await Promise.all([
        adPlatformAPI.getAll(),
        adPlatformAPI.getStatistics(),
      ]);
      setPlatforms(platformsData);
      setStats(statsData);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">広告媒体一括更新システム</h1>
              <p className="text-sm text-gray-600 mt-1">Mr.Venrey型 配信管理システム</p>
            </div>
            {stats && (
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                  <div className="text-xs text-gray-600">成功</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.failure}</div>
                  <div className="text-xs text-gray-600">失敗</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-gray-600">合計</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`${
                activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              📈 ダッシュボード
            </button>
            <button
              onClick={() => setActiveTab('platforms')}
              className={`${
                activeTab === 'platforms'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              📡 広告媒体管理
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={`${
                activeTab === 'distribution'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              🚀 一括配信
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`${
                activeTab === 'logs'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              📊 配信ログ
            </button>
          </nav>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard platforms={platforms} stats={stats} />}
            {activeTab === 'platforms' && <PlatformList platforms={platforms} onRefresh={loadData} />}
            {activeTab === 'distribution' && <DistributionPanel platforms={platforms} />}
            {activeTab === 'logs' && <LogViewer />}
          </>
        )}
      </div>
    </div>
  );
}
