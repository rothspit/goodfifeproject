'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { FiStar, FiTrendingUp, FiAward } from 'react-icons/fi';
import { customerApi } from '@/lib/api';

interface RankedCast {
  id: number;
  name: string;
  age: number;
  primary_image: string;
  avg_rating: number;
  review_count: number;
  reservation_count: number;
  height?: number;
  bust?: number;
  waist?: number;
  hip?: number;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankedCast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const response = await customerApi.getRanking({ limit: 20 });
      setRanking(response.data.ranking || []);
    } catch (error) {
      console.error('ランキング取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-pink-400 to-pink-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <FiAward size={24} />;
    return <FiTrendingUp size={20} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Header />
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <FiAward className="text-yellow-500" size={40} />
            評価ランキング
          </h1>
          <p className="text-gray-600">お客様の口コミ評価が高いキャストをご紹介</p>
        </div>

        {/* ランキング一覧 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-600 border-t-transparent"></div>
          </div>
        ) : ranking.length > 0 ? (
          <div className="space-y-4">
            {ranking.map((cast, index) => {
              const rank = index + 1;
              return (
                <Link
                  key={cast.id}
                  href={`/casts/${cast.id}`}
                  className="block bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                >
                  <div className="flex items-center p-4 md:p-6">
                    {/* ランク */}
                    <div className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${getRankColor(rank)} text-white flex items-center justify-center mr-4 shadow-lg`}>
                      {rank <= 3 ? (
                        <div className="text-center">
                          {getRankIcon(rank)}
                          <div className="text-xl md:text-2xl font-bold">{rank}</div>
                        </div>
                      ) : (
                        <div className="text-xl md:text-2xl font-bold">{rank}</div>
                      )}
                    </div>

                    {/* キャスト画像 */}
                    <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 mr-4">
                      <img
                        src={cast.primary_image || `https://via.placeholder.com/200x200/FFB6C1/000000?text=${encodeURIComponent(cast.name)}`}
                        alt={cast.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/200x200/FFB6C1/000000?text=${encodeURIComponent(cast.name)}`;
                        }}
                      />
                    </div>

                    {/* キャスト情報 */}
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">{cast.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{cast.age}歳 {cast.height && `/ ${cast.height}cm`}</p>
                      
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <FiStar className="fill-current" />
                          <span className="font-bold text-lg">{cast.avg_rating.toFixed(1)}</span>
                          <span className="text-gray-500 text-sm">({cast.review_count}件)</span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          予約: <span className="font-semibold">{cast.reservation_count}件</span>
                        </div>
                      </div>

                      {(cast.bust || cast.waist || cast.hip) && (
                        <p className="text-xs text-gray-500 mt-2">
                          T{cast.bust || '---'} / W{cast.waist || '---'} / H{cast.hip || '---'}
                        </p>
                      )}
                    </div>

                    {/* ランクバッジ（モバイル用） */}
                    {rank <= 3 && (
                      <div className="flex-shrink-0 ml-2">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center shadow-lg md:hidden`}>
                          {getRankIcon(rank)}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">現在ランキングデータがありません</p>
          </div>
        )}
      </div>

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
