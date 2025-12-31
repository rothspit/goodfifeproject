'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiEye } from 'react-icons/fi';
import { castApi } from '@/lib/api';

interface Cast {
  id: number;
  name: string;
  age: number;
  height: number;
  cup_size: string;
  primary_image?: string;
  is_new: boolean;
  is_available: boolean;
  avg_rating?: number;
  review_count: number;
}

export default function CastManagementPage() {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCasts();
  }, []);

  const fetchCasts = async () => {
    try {
      const response = await castApi.getCasts();
      console.log('キャスト一覧レスポンス:', response.data);
      if (response.data.casts) {
        setCasts(response.data.casts);
      }
    } catch (error) {
      console.error('キャスト取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`${name}さんを削除してもよろしいですか？`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/casts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert('削除しました');
        fetchCasts();
      } else {
        throw new Error(data.message || '削除に失敗しました');
      }
    } catch (error: any) {
      console.error('削除エラー:', error);
      alert(error.message || '削除に失敗しました');
    }
  };

  const filteredCasts = casts.filter(cast =>
    cast.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">キャスト管理</h1>
          <p className="text-gray-600">キャストの登録・編集・削除</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/casts/order"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-shadow"
          >
            🔢 並び順設定
          </Link>
          <Link
            href="/admin/casts/import"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-shadow"
          >
            📥 CSVインポート
          </Link>
          <Link
            href="/admin/casts/new"
            className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-shadow"
          >
            <FiPlus />
            新規キャスト登録
          </Link>
        </div>
      </div>

      {/* 検索バー */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="キャスト名で検索..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* キャスト一覧 */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">写真</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">名前</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">年齢</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">スペック</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">評価</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ステータス</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCasts.map((cast) => (
                <tr key={cast.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{cast.id}</td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg overflow-hidden">
                      {cast.primary_image ? (
                        <img
                          src={cast.primary_image}
                          alt={cast.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{cast.name}</div>
                    {cast.is_new && (
                      <span className="inline-block mt-1 bg-gold-500 text-white text-xs px-2 py-1 rounded-full">
                        NEW
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{cast.age}歳</td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    T{cast.height}cm / {cast.cup_size}cup
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {cast.avg_rating ? (
                      <div>
                        <span className="text-gold-600 font-bold">⭐ {cast.avg_rating.toFixed(1)}</span>
                        <span className="text-gray-500 ml-1">({cast.review_count}件)</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">未評価</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {cast.is_available ? (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                        稼働中
                      </span>
                    ) : (
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                        非稼働
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/casts/${cast.id}`}
                        target="_blank"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="詳細を見る"
                      >
                        <FiEye size={18} />
                      </Link>
                      <Link
                        href={`/admin/casts/${cast.id}/edit`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="編集"
                      >
                        <FiEdit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(cast.id, cast.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="削除"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCasts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            キャストが見つかりませんでした
          </div>
        )}
      </div>

      {/* 統計 */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600">{casts.length}</div>
            <div className="text-sm text-gray-600 mt-1">総キャスト数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {casts.filter(c => c.is_available).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">稼働中</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gold-600">
              {casts.filter(c => c.is_new).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">新人</div>
          </div>
        </div>
      </div>
    </div>
  );
}
