'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { FiHeart, FiStar, FiTrash2 } from 'react-icons/fi';
import { customerApi } from '@/lib/api';

interface Favorite {
  id: number;
  cast_id: number;
  cast_name: string;
  cast_age: number;
  cast_image: string;
  height?: number;
  bust?: number;
  waist?: number;
  hip?: number;
  avg_rating: number;
  review_count: number;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await customerApi.getFavorites();
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('お気に入り取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (castId: number) => {
    if (!confirm('お気に入りから削除しますか？')) return;

    try {
      await customerApi.removeFavorite(castId);
      setFavorites(favorites.filter(f => f.cast_id !== castId));
    } catch (error) {
      console.error('お気に入り削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Header />
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/mypage" className="text-pink-600 hover:text-pink-700">
            ← マイページに戻る
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FiHeart className="text-pink-600" />
          お気に入りキャスト
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-600 border-t-transparent"></div>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Link href={`/casts/${favorite.cast_id}`}>
                  <div className="relative h-64 bg-gradient-to-br from-pink-100 to-purple-100">
                    <img
                      src={favorite.cast_image || '/placeholder-cast.png'}
                      alt={favorite.cast_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link href={`/casts/${favorite.cast_id}`}>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-pink-600">
                      {favorite.cast_name}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {favorite.cast_age}歳 {favorite.height && `/ ${favorite.height}cm`}
                  </p>

                  {favorite.avg_rating > 0 && (
                    <div className="flex items-center gap-1 text-yellow-500 mb-3">
                      <FiStar className="fill-current" size={16} />
                      <span className="font-bold">{favorite.avg_rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({favorite.review_count})</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleRemoveFavorite(favorite.cast_id)}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-all"
                  >
                    <FiTrash2 />
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg">
            <FiHeart className="text-gray-300 mx-auto mb-4" size={64} />
            <p className="text-gray-500 text-lg mb-4">まだお気に入りがありません</p>
            <Link href="/casts" className="inline-block bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700 transition-all">
              キャストを探す
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
