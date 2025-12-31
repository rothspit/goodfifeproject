'use client';

import { useState, useEffect } from 'react';
import { twitterApi } from '@/lib/api';
import { FiTwitter, FiCheck, FiX, FiSend, FiSettings } from 'react-icons/fi';

export default function TwitterSettingsPage() {
  const [status, setStatus] = useState({
    configured: false,
    loading: true,
  });

  const [config, setConfig] = useState({
    apiKey: '',
    apiSecret: '',
    accessToken: '',
    accessSecret: '',
    autoPostNewCast: true,
  });

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    username?: string;
  } | null>(null);

  const [customTweet, setCustomTweet] = useState({
    message: '',
    hashtags: ['人妻の蜜西船橋店', 'デリヘル', '西船橋'],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // X連携の設定状況を取得
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await twitterApi.getStatus();
      setStatus({
        configured: response.data.configured,
        loading: false,
      });
    } catch (error) {
      console.error('設定状況の取得エラー:', error);
      setStatus({
        configured: false,
        loading: false,
      });
    }
  };

  // 設定を保存
  const handleSaveConfig = async () => {
    if (!config.apiKey || !config.apiSecret || !config.accessToken || !config.accessSecret) {
      setMessage({
        type: 'error',
        text: 'すべての認証情報を入力してください',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await twitterApi.saveConfig(config);
      setMessage({
        type: 'success',
        text: 'X連携の設定を保存しました',
      });
      fetchStatus();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || '設定の保存に失敗しました',
      });
    } finally {
      setLoading(false);
    }
  };

  // 接続テスト
  const handleTestConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await twitterApi.testConnection();
      setTestResult({
        success: true,
        message: '接続テスト成功',
        username: response.data.username,
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || '接続テストに失敗しました',
      });
    } finally {
      setLoading(false);
    }
  };

  // カスタムツイート投稿
  const handlePostCustomTweet = async () => {
    if (!customTweet.message.trim()) {
      setMessage({
        type: 'error',
        text: 'メッセージを入力してください',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await twitterApi.postCustom({
        message: customTweet.message,
        hashtags: customTweet.hashtags.filter(tag => tag.trim()),
      });
      setMessage({
        type: 'success',
        text: 'Xに投稿しました',
      });
      setCustomTweet({
        ...customTweet,
        message: '',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || '投稿に失敗しました',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiTwitter className="text-blue-500" />
          X（Twitter）連携設定
        </h1>
        <p className="text-gray-600 mt-2">
          新人キャスト入店時の自動投稿やカスタム投稿を設定できます
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 設定状況 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiSettings />
          連携状況
        </h2>
        {status.loading ? (
          <p className="text-gray-500">読み込み中...</p>
        ) : (
          <div className="flex items-center gap-2">
            {status.configured ? (
              <>
                <FiCheck className="text-green-500 text-xl" />
                <span className="text-green-700 font-medium">X連携が有効です</span>
              </>
            ) : (
              <>
                <FiX className="text-red-500 text-xl" />
                <span className="text-red-700 font-medium">X連携が設定されていません</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* API認証情報設定 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">API認証情報</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="API Key を入力"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Secret
            </label>
            <input
              type="password"
              value={config.apiSecret}
              onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="API Secret を入力"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Token
            </label>
            <input
              type="password"
              value={config.accessToken}
              onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Access Token を入力"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Token Secret
            </label>
            <input
              type="password"
              value={config.accessSecret}
              onChange={(e) => setConfig({ ...config, accessSecret: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Access Token Secret を入力"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoPost"
              checked={config.autoPostNewCast}
              onChange={(e) => setConfig({ ...config, autoPostNewCast: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoPost" className="text-sm text-gray-700">
              新人キャスト登録時に自動的にXに投稿する
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveConfig}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : '設定を保存'}
            </button>
            <button
              onClick={handleTestConnection}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'テスト中...' : '接続テスト'}
            </button>
          </div>

          {testResult && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              <p className="font-medium">{testResult.message}</p>
              {testResult.username && (
                <p className="text-sm mt-1">接続アカウント: @{testResult.username}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* カスタム投稿 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiSend />
          カスタム投稿
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              投稿内容
            </label>
            <textarea
              value={customTweet.message}
              onChange={(e) => setCustomTweet({ ...customTweet, message: e.target.value })}
              rows={4}
              maxLength={280}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="投稿したい内容を入力してください（最大280文字）"
            />
            <p className="text-sm text-gray-500 mt-1">
              {customTweet.message.length} / 280文字
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ハッシュタグ（カンマ区切り）
            </label>
            <input
              type="text"
              value={customTweet.hashtags.join(', ')}
              onChange={(e) =>
                setCustomTweet({
                  ...customTweet,
                  hashtags: e.target.value.split(',').map(tag => tag.trim()),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="人妻の蜜西船橋店, デリヘル, 西船橋"
            />
          </div>

          <button
            onClick={handlePostCustomTweet}
            disabled={loading || !status.configured}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiTwitter />
            {loading ? '投稿中...' : 'Xに投稿'}
          </button>

          {!status.configured && (
            <p className="text-sm text-red-600">
              ※ X連携の設定を保存してから投稿してください
            </p>
          )}
        </div>
      </div>

      {/* 使い方 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📘 使い方</h3>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>Twitter Developer Portalで API Key/Secret と Access Token/Secret を取得</li>
          <li>上記の「API認証情報」に各値を入力して保存</li>
          <li>「接続テスト」で正常に接続できるか確認</li>
          <li>「新人キャスト登録時に自動的にXに投稿する」をONにすると、CSVインポートや手動登録時に自動投稿されます</li>
          <li>「カスタム投稿」でお知らせやキャンペーンなどを手動投稿できます</li>
        </ol>
      </div>
    </div>
  );
}
