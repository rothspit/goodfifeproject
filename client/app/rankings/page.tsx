'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { rankingApi } from '@/lib/api';
import { FiStar, FiAward, FiThumbsUp } from 'react-icons/fi';
import { GiLaurelCrown, GiTrophy } from 'react-icons/gi';

interface RankingCast {
  id: number;
  cast_id: number;
  cast_name: string;
  cast_age: number;
  cast_image: string;
  category: string;
  rank_position: number;
  points: number;
  cast_height?: number;
  cast_bust?: number;
  cast_waist?: number;
  cast_hip?: number;
}

interface Rankings {
  overall: RankingCast[];
  newcomer: RankingCast[];
  popularity: RankingCast[];
  review: RankingCast[];
}

export default function RankingsPage() {
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [rankings, setRankings] = useState<Rankings>({
    overall: [],
    newcomer: [],
    popularity: [],
    review: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const response = await rankingApi.getAllRankings();
      setRankings(response.data.rankings || {
        overall: [],
        newcomer: [],
        popularity: [],
        review: [],
      });
    } catch (error) {
      console.error('ランキング取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: 'overall', name: '総合ランキング', icon: GiTrophy, color: 'from-yellow-400 to-orange-500' },
    { key: 'newcomer', name: '新人ランキング', icon: FiStar, color: 'from-green-400 to-teal-500' },
    { key: 'popularity', name: '人気投票', icon: FiThumbsUp, color: 'from-pink-400 to-rose-500' },
    { key: 'review', name: 'レビューランキング', icon: FiAward, color: 'from-purple-400 to-indigo-500' },
  ];

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-300 text-gray-800';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <GiLaurelCrown className="inline mr-1" />;
    return null;
  };

  const currentCategory = categories.find(c => c.key === selectedCategory);
  const currentRankings = rankings[selectedCategory as keyof Rankings] || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Header />

      {/* スペーサー（ヘッダー分） */}
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-8">
        {/* ページタイトル */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <GiTrophy className="text-gold-500 text-5xl" />
            キャストランキング
          </h1>
          <p className="text-gray-600 text-lg">
            人気キャストをチェック！
          </p>
        </div>

        {/* カテゴリタブ */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.key;

              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`p-4 rounded-lg transition-all font-bold ${
                    isSelected
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-2xl mx-auto mb-2" />
                  <div className="text-sm md:text-base">{category.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ランキング表示 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : currentRankings.length > 0 ? (
          <div className="space-y-6">
            {/* カテゴリヘッダー */}
            {currentCategory && (
              <div className={`bg-gradient-to-r ${currentCategory.color} text-white rounded-lg p-6 text-center shadow-xl`}>
                <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-3">
                  <currentCategory.icon className="text-3xl" />
                  {currentCategory.name}
                </h2>
              </div>
            )}

            {/* TOP3を大きく表示 */}
            {currentRankings.filter(c => c.rank_position <= 3).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {currentRankings
                  .filter(c => c.rank_position <= 3)
                  .map((cast) => (
                    <Link
                      key={cast.id}
                      href={`/casts/${cast.cast_id}`}
                      className="relative bg-white rounded-xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all transform hover:-translate-y-2 border-4 border-gold-400"
                    >
                      {/* ランクバッジ */}
                      <div className={`absolute top-4 left-4 z-10 px-4 py-2 rounded-full ${getRankBadgeColor(cast.rank_position)} shadow-lg font-bold text-2xl`}>
                        {getRankIcon(cast.rank_position)}
                        {cast.rank_position}位
                      </div>

                      {/* キャスト画像 */}
                      <div className="relative h-80 bg-gradient-to-br from-pink-100 to-purple-100">
                        <img
                          src={
                            cast.cast_image ||
                            `https://via.placeholder.com/400x600/FFB6C1/000000?text=${encodeURIComponent(
                              cast.cast_name
                            )}`
                          }
                          alt={cast.cast_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/400x600/FFB6C1/000000?text=${encodeURIComponent(
                              cast.cast_name
                            )}`;
                          }}
                        />
                      </div>

                      {/* キャスト情報 */}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{cast.cast_name}</h3>
                        <p className="text-gray-600 mb-3">
                          {cast.cast_age}歳
                          {cast.cast_height && ` / ${cast.cast_height}cm`}
                        </p>
                        {cast.points > 0 && (
                          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-3">
                            <p className="text-sm text-gray-600">ポイント</p>
                            <p className="text-2xl font-bold text-orange-600">{cast.points.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
              </div>
            )}

            {/* 4位以降を表示 */}
            {currentRankings.filter(c => c.rank_position > 3).length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">4位以降</h3>
                <div className="space-y-3">
                  {currentRankings
                    .filter(c => c.rank_position > 3)
                    .map((cast) => (
                      <Link
                        key={cast.id}
                        href={`/casts/${cast.cast_id}`}
                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-all border border-gray-200 hover:border-primary-300"
                      >
                        {/* ランク */}
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700 text-lg">
                          {cast.rank_position}
                        </div>

                        {/* キャスト画像 */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                          <img
                            src={
                              cast.cast_image ||
                              `https://via.placeholder.com/100x100/FFB6C1/000000?text=${encodeURIComponent(
                                cast.cast_name
                              )}`
                            }
                            alt={cast.cast_name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://via.placeholder.com/100x100/FFB6C1/000000?text=${encodeURIComponent(
                                cast.cast_name
                              )}`;
                            }}
                          />
                        </div>

                        {/* キャスト情報 */}
                        <div className="flex-grow">
                          <h4 className="font-bold text-gray-800 text-lg">{cast.cast_name}</h4>
                          <p className="text-sm text-gray-600">
                            {cast.cast_age}歳
                            {cast.cast_height && ` / ${cast.cast_height}cm`}
                          </p>
                        </div>

                        {/* ポイント */}
                        {cast.points > 0 && (
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs text-gray-500">ポイント</p>
                            <p className="text-lg font-bold text-orange-600">
                              {cast.points.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <GiTrophy className="text-gray-300 text-6xl mx-auto mb-4" />
            <p className="text-gray-500 text-lg">このカテゴリのランキングデータがありません</p>
          </div>
        )}
      </div>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-bold mb-2">人妻の蜜</p>
          <p className="text-sm text-gray-400">〒273-0031 千葉県船橋市西船橋</p>
          <p className="text-sm text-gray-400 mt-4">© 2024 人妻の蜜. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
