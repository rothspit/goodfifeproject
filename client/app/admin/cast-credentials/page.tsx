'use client';

import { useState, useEffect } from 'react';
import {
  FiKey,
  FiRefreshCw,
  FiCopy,
  FiTrash2,
  FiCheck,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiDownload,
} from 'react-icons/fi';
import { castCredentialsApi } from '@/lib/api';

interface CastCredential {
  id: number;
  name: string;
  age: number;
  has_password: boolean;
  password: string | null;
  is_public: boolean;
}

export default function CastCredentialsPage() {
  const [credentials, setCredentials] = useState<CastCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedCasts, setSelectedCasts] = useState<Set<number>>(new Set());
  const [generating, setGenerating] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const response = await castCredentialsApi.getAll();
      setCredentials(response.data.credentials);
    } catch (error) {
      console.error('認証情報取得エラー:', error);
      alert('認証情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = async (castId: number) => {
    if (!confirm('パスワードを生成しますか？既存のパスワードは上書きされます。')) {
      return;
    }

    setGenerating(prev => new Set(prev).add(castId));
    try {
      const response = await castCredentialsApi.generatePassword(castId);
      alert(`パスワードを生成しました: ${response.data.credential.password}`);
      await fetchCredentials();
    } catch (error) {
      console.error('パスワード生成エラー:', error);
      alert('パスワードの生成に失敗しました');
    } finally {
      setGenerating(prev => {
        const newSet = new Set(prev);
        newSet.delete(castId);
        return newSet;
      });
    }
  };

  const handleDeletePassword = async (castId: number) => {
    if (!confirm('パスワードを削除しますか？このキャストはログインできなくなります。')) {
      return;
    }

    try {
      await castCredentialsApi.deletePassword(castId);
      alert('パスワードを削除しました');
      await fetchCredentials();
    } catch (error) {
      console.error('パスワード削除エラー:', error);
      alert('パスワードの削除に失敗しました');
    }
  };

  const handleBulkGenerate = async () => {
    if (selectedCasts.size === 0) {
      alert('キャストを選択してください');
      return;
    }

    if (!confirm(`選択した${selectedCasts.size}件のキャストのパスワードを生成しますか？`)) {
      return;
    }

    try {
      const response = await castCredentialsApi.bulkGenerate(Array.from(selectedCasts));
      alert(`${response.data.credentials.length}件のパスワードを生成しました`);
      setSelectedCasts(new Set());
      await fetchCredentials();
    } catch (error) {
      console.error('一括パスワード生成エラー:', error);
      alert('一括パスワード生成に失敗しました');
    }
  };

  const togglePasswordVisibility = (castId: number) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(castId)) {
        newSet.delete(castId);
      } else {
        newSet.add(castId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, castId: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(castId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleSelectCast = (castId: number) => {
    setSelectedCasts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(castId)) {
        newSet.delete(castId);
      } else {
        newSet.add(castId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedCasts.size === credentials.length) {
      setSelectedCasts(new Set());
    } else {
      setSelectedCasts(new Set(credentials.map(c => c.id)));
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['キャストID', 'キャスト名', '年齢', 'パスワード', 'ログインURL'].join(','),
      ...credentials
        .filter(c => c.has_password)
        .map(c => [
          c.id,
          c.name,
          c.age,
          c.password || '',
          `${window.location.origin}/cast/login`,
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cast_credentials_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <FiKey className="text-pink-600" />
          キャスト認証情報管理
        </h1>
        <p className="text-gray-600">キャストさんのログインID・パスワードを管理します</p>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">総キャスト数</p>
          <p className="text-3xl font-bold text-gray-800">{credentials.length}名</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">パスワード発行済み</p>
          <p className="text-3xl font-bold text-green-600">
            {credentials.filter(c => c.has_password).length}名
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">未発行</p>
          <p className="text-3xl font-bold text-orange-600">
            {credentials.filter(c => !c.has_password).length}名
          </p>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleBulkGenerate}
            disabled={selectedCasts.size === 0}
            className="flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw />
            選択した{selectedCasts.size > 0 && `${selectedCasts.size}件の`}キャストのパスワードを生成
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-all"
          >
            <FiDownload />
            CSV出力
          </button>

          <button
            onClick={fetchCredentials}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-all"
          >
            <FiRefreshCw />
            更新
          </button>
        </div>
      </div>

      {/* キャスト一覧 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedCasts.size === credentials.length && credentials.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                キャスト名
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                年齢
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                ログインID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                パスワード
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {credentials.map((cast) => (
              <tr key={cast.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedCasts.has(cast.id)}
                    onChange={() => toggleSelectCast(cast.id)}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  {cast.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {cast.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {cast.age}歳
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                      {cast.id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(cast.id.toString(), cast.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="コピー"
                    >
                      {copiedId === cast.id ? <FiCheck className="text-green-600" /> : <FiCopy />}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {cast.has_password && cast.password ? (
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                        {visiblePasswords.has(cast.id) ? cast.password : '••••••••••'}
                      </code>
                      <button
                        onClick={() => togglePasswordVisibility(cast.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {visiblePasswords.has(cast.id) ? <FiEyeOff /> : <FiEye />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(cast.password!, cast.id * 1000)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="コピー"
                      >
                        {copiedId === cast.id * 1000 ? <FiCheck className="text-green-600" /> : <FiCopy />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">未設定</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {cast.has_password ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      <FiCheck size={12} />
                      発行済み
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                      <FiAlertCircle size={12} />
                      未発行
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleGeneratePassword(cast.id)}
                      disabled={generating.has(cast.id)}
                      className="inline-flex items-center gap-1 bg-pink-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-pink-700 transition-all disabled:opacity-50"
                      title={cast.has_password ? '再発行' : '発行'}
                    >
                      <FiRefreshCw size={14} />
                      {cast.has_password ? '再発行' : '発行'}
                    </button>
                    {cast.has_password && (
                      <button
                        onClick={() => handleDeletePassword(cast.id)}
                        className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-200 transition-all"
                        title="削除"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 注意事項 */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
          <FiAlertCircle />
          注意事項
        </h3>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>ログインIDはキャストIDと同じです</li>
          <li>パスワードは自動生成されます（10桁の英数字）</li>
          <li>再発行すると以前のパスワードは使えなくなります</li>
          <li>CSV出力で一括管理できます</li>
        </ul>
      </div>
    </div>
  );
}
