'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { castApi } from '@/lib/api';
import type { Cast, SearchFilters } from '@/types';
import { FiSearch, FiStar, FiFilter, FiX, FiHeart, FiClock, FiMapPin } from 'react-icons/fi';

export default function CastsPage() {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // デフォルトをグリッド表示に
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    date: '',
    time: '',
    min_age: undefined,
    max_age: undefined,
    min_height: undefined,
    max_height: undefined,
    cup_size: '',
    blood_type: '',
    is_new: undefined,
    smoking_ok: undefined,
    tattoo: undefined,
    threesome_ok: undefined,
    hairless: undefined,
    home_visit_ok: undefined,
    clothing_request_ok: undefined,
    overnight_ok: undefined,
    sweet_sadist_ok: undefined,
  });

  useEffect(() => {
    fetchCasts();
  }, []);

  const fetchCasts = async (searchFilters?: SearchFilters) => {
    setLoading(true);
    try {
      const params: any = {};
      const currentFilters = searchFilters || filters;

      // フィルターをパラメータに変換
      if (currentFilters.name) params.name = currentFilters.name;
      if (currentFilters.date) params.date = currentFilters.date;
      if (currentFilters.time) params.time = currentFilters.time;
      if (currentFilters.min_age) params.min_age = currentFilters.min_age;
      if (currentFilters.max_age) params.max_age = currentFilters.max_age;
      if (currentFilters.min_height) params.min_height = currentFilters.min_height;
      if (currentFilters.max_height) params.max_height = currentFilters.max_height;
      if (currentFilters.cup_size) params.cup_size = currentFilters.cup_size;
      if (currentFilters.blood_type) params.blood_type = currentFilters.blood_type;
      if (currentFilters.is_new !== undefined) params.is_new = currentFilters.is_new;
      if (currentFilters.smoking_ok !== undefined) params.smoking_ok = currentFilters.smoking_ok;
      if (currentFilters.tattoo !== undefined) params.tattoo = currentFilters.tattoo;
      if (currentFilters.threesome_ok !== undefined) params.threesome_ok = currentFilters.threesome_ok;
      if (currentFilters.hairless !== undefined) params.hairless = currentFilters.hairless;
      if (currentFilters.home_visit_ok !== undefined) params.home_visit_ok = currentFilters.home_visit_ok;
      if (currentFilters.clothing_request_ok !== undefined) params.clothing_request_ok = currentFilters.clothing_request_ok;
      if (currentFilters.overnight_ok !== undefined) params.overnight_ok = currentFilters.overnight_ok;
      if (currentFilters.sweet_sadist_ok !== undefined) params.sweet_sadist_ok = currentFilters.sweet_sadist_ok;

      const response = await castApi.getCasts(params);
      setCasts(response.data.casts || []);
    } catch (error) {
      console.error('キャスト取得エラー:', error);
      setCasts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCasts(filters);
    setShowFilters(false);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      name: '',
      date: '',
      time: '',
      min_age: undefined,
      max_age: undefined,
      min_height: undefined,
      max_height: undefined,
      cup_size: '',
      blood_type: '',
    };
    setFilters(resetFilters);
    fetchCasts(resetFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-6 pb-32 md:pb-8">
        {/* ページヘッダー - シティヘブン風 */}
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">在籍女の子一覧</h1>
          <p className="text-pink-100">人妻の蜜 西船橋店のキャスト情報</p>
        </div>

        {/* 検索バー - シンプル版 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="🔍 女の子の名前で検索"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              onClick={handleSearch}
              className="bg-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-pink-700 transition-colors"
            >
              検索
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <FiFilter />
              詳細検索
            </button>
          </div>

          {/* 詳細検索フィルター */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* 年齢 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年齢</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="20"
                      value={filters.min_age || ''}
                      onChange={(e) => setFilters({ ...filters, min_age: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <span>〜</span>
                    <input
                      type="number"
                      placeholder="35"
                      value={filters.max_age || ''}
                      onChange={(e) => setFilters({ ...filters, max_age: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* カップ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">カップ</label>
                  <select
                    value={filters.cup_size}
                    onChange={(e) => setFilters({ ...filters, cup_size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">すべて</option>
                    <option value="A">Aカップ</option>
                    <option value="B">Bカップ</option>
                    <option value="C">Cカップ</option>
                    <option value="D">Dカップ</option>
                    <option value="E">Eカップ</option>
                    <option value="F">Fカップ</option>
                    <option value="G">Gカップ以上</option>
                  </select>
                </div>

                {/* 身長 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">身長 (cm)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="150"
                      value={filters.min_height || ''}
                      onChange={(e) => setFilters({ ...filters, min_height: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <span>〜</span>
                    <input
                      type="number"
                      placeholder="170"
                      value={filters.max_height || ''}
                      onChange={(e) => setFilters({ ...filters, max_height: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* こだわり検索 */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">こだわり条件</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.is_new === true}
                      onChange={(e) => setFilters({ ...filters, is_new: e.target.checked ? true : undefined })}
                      className="rounded border-gray-300 text-pink-600"
                    />
                    <span className="text-sm">新人</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.threesome_ok === true}
                      onChange={(e) => setFilters({ ...filters, threesome_ok: e.target.checked ? true : undefined })}
                      className="rounded border-gray-300 text-pink-600"
                    />
                    <span className="text-sm">3P可能</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.home_visit_ok === true}
                      onChange={(e) => setFilters({ ...filters, home_visit_ok: e.target.checked ? true : undefined })}
                      className="rounded border-gray-300 text-pink-600"
                    />
                    <span className="text-sm">自宅訪問OK</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.overnight_ok === true}
                      onChange={(e) => setFilters({ ...filters, overnight_ok: e.target.checked ? true : undefined })}
                      className="rounded border-gray-300 text-pink-600"
                    />
                    <span className="text-sm">お泊まりOK</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={handleReset}
                  className="text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
                >
                  <FiX />
                  リセット
                </button>
                <button
                  onClick={handleSearch}
                  className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
                >
                  この条件で検索
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 検索結果ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-700 font-medium">
            全 <span className="text-pink-600 font-bold text-lg">{casts.length}</span> 名
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-pink-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              リスト表示
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-pink-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              グリッド表示
            </button>
          </div>
        </div>

        {/* キャスト一覧 */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : casts.length > 0 ? (
          <>
            {/* リスト表示 - シティヘブン風 */}
            {viewMode === 'list' ? (
              <div className="space-y-4">
                {casts.map((cast) => (
                  <Link
                    key={cast.id}
                    href={`/casts/${cast.id}`}
                    className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* 画像エリア */}
                      <div className="relative w-full md:w-[195px] h-[260px] bg-gradient-to-br from-pink-200 to-purple-200 flex-shrink-0">
                        <img
                          src={cast.primary_image || `https://placehold.co/390x520/FFB6C1/000000?text=${encodeURIComponent(cast.name)}`}
                          alt={cast.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://placehold.co/390x520/FFB6C1/000000?text=${encodeURIComponent(cast.name)}`;
                          }}
                        />
                        {cast.is_new && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-md text-xs font-bold shadow-lg">
                            NEW
                          </div>
                        )}
                      </div>

                      {/* 情報エリア */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">{cast.name}</h3>
                            <div className="flex items-center gap-4 text-gray-600 text-sm">
                              <span className="font-medium">{cast.age}歳</span>
                              <span>T{cast.height || '---'}</span>
                              <span>B{cast.bust || '--'} (カップ)</span>
                              <span>W{cast.waist || '--'}</span>
                              <span>H{cast.hip || '--'}</span>
                            </div>
                          </div>
                          {cast.avg_rating && cast.avg_rating > 0 && (
                            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                              <FiStar className="text-yellow-500 fill-current" />
                              <span className="font-bold text-yellow-700">{cast.avg_rating.toFixed(1)}</span>
                              <span className="text-xs text-gray-500">({cast.review_count}件)</span>
                            </div>
                          )}
                        </div>

                        {/* プロフィール */}
                        {cast.profile && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {cast.profile}
                          </p>
                        )}

                        {/* タグ・特徴 */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {cast.blood_type && (
                            <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs font-medium">
                              {cast.blood_type}型
                            </span>
                          )}
                          {cast.threesome_ok && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                              3P可
                            </span>
                          )}
                          {cast.home_visit_ok && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                              自宅訪問OK
                            </span>
                          )}
                          {cast.overnight_ok && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                              お泊まりOK
                            </span>
                          )}
                        </div>

                        {/* ボタンエリア */}
                        <div className="flex gap-3 mt-4">
                          <button className="flex-1 bg-pink-600 text-white py-2 rounded-lg font-bold hover:bg-pink-700 transition-colors">
                            詳細を見る
                          </button>
                          <button className="px-4 py-2 border-2 border-pink-600 text-pink-600 rounded-lg font-bold hover:bg-pink-50 transition-colors">
                            <FiHeart />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* グリッド表示 */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {casts.map((cast) => (
                  <Link
                    key={cast.id}
                    href={`/casts/${cast.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-pink-200 to-purple-200">
                      <img
                        src={cast.primary_image || `https://placehold.co/390x520/FFB6C1/000000?text=${encodeURIComponent(cast.name)}`}
                        alt={cast.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://placehold.co/390x520/FFB6C1/000000?text=${encodeURIComponent(cast.name)}`;
                        }}
                      />
                      {cast.is_new && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-md text-xs font-bold">
                          NEW
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{cast.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {cast.age}歳 / T{cast.height || '---'} / {cast.cup_size || '-'}カップ
                      </p>
                      {cast.avg_rating && cast.avg_rating > 0 ? (
                        <div className="flex items-center gap-1 text-sm">
                          <FiStar className="text-yellow-500 fill-current" />
                          <span className="font-bold">{cast.avg_rating.toFixed(1)}</span>
                          <span className="text-gray-500">({cast.review_count})</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">レビューなし</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">該当する女の子が見つかりませんでした</h3>
            <p className="text-gray-600 mb-6">検索条件を変更してお試しください</p>
            <button
              onClick={handleReset}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 transition-colors"
            >
              条件をリセット
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
