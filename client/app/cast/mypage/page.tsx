'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiUser,
  FiHeart,
  FiEdit,
  FiCalendar,
  FiTrendingUp,
  FiStar,
  FiMessageSquare,
  FiShield,
  FiLogOut,
  FiMail,
  FiAward,
} from 'react-icons/fi';

export default function CastMyPage() {
  const router = useRouter();
  const [cast, setCast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    favorites: 0,
    ranking: 0,
    reviews: 0,
    averageRating: 0,
  });

  useEffect(() => {
    // 認証チェック
    const castStr = localStorage.getItem('cast');
    const token = localStorage.getItem('cast_token');

    if (!castStr || !token) {
      router.push('/cast/login');
      return;
    }

    try {
      const castData = JSON.parse(castStr);
      setCast(castData);
      // TODO: 統計データを取得
      setStats({
        favorites: 24,
        ranking: 3,
        reviews: 42,
        averageRating: 4.8,
      });
    } catch (error) {
      console.error('キャストデータ解析エラー:', error);
      router.push('/cast/login');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cast_token');
    localStorage.removeItem('cast');
    router.push('/cast/login');
  };

  if (loading || !cast) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-3">
                <FiUser className="text-pink-600" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{cast.name}さん</h1>
                <p className="text-pink-100 text-sm">キャストマイページ</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
            >
              <FiLogOut />
              <span className="hidden md:inline">ログアウト</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FiHeart className="text-pink-600 mx-auto mb-2" size={32} />
            <p className="text-3xl font-bold text-gray-800">{stats.favorites}</p>
            <p className="text-sm text-gray-600 mt-1">お気に入り登録数</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FiAward className="text-yellow-500 mx-auto mb-2" size={32} />
            <p className="text-3xl font-bold text-gray-800">{stats.ranking}位</p>
            <p className="text-sm text-gray-600 mt-1">総合ランキング</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FiStar className="text-purple-600 mx-auto mb-2" size={32} />
            <p className="text-3xl font-bold text-gray-800">{stats.averageRating}</p>
            <p className="text-sm text-gray-600 mt-1">平均評価</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FiMessageSquare className="text-blue-600 mx-auto mb-2" size={32} />
            <p className="text-3xl font-bold text-gray-800">{stats.reviews}</p>
            <p className="text-sm text-gray-600 mt-1">口コミ数</p>
          </div>
        </div>

        {/* メインメニュー */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* お客様へのアプローチ */}
          <Link
            href="/cast/appeal"
            className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <FiMail size={40} className="mb-4" />
            <h3 className="text-xl font-bold mb-2">お客様へアプローチ</h3>
            <p className="text-pink-100 text-sm">お客様にアピールメッセージを送信</p>
          </Link>

          {/* 写メ日記 */}
          <Link
            href="/cast/diary"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <FiEdit size={40} className="mb-4" />
            <h3 className="text-xl font-bold mb-2">写メ日記</h3>
            <p className="text-purple-100 text-sm">日記を書いてお客様にアピール</p>
          </Link>

          {/* 出勤申請 */}
          <Link
            href="/cast/schedule"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <FiCalendar size={40} className="mb-4" />
            <h3 className="text-xl font-bold mb-2">出勤申請</h3>
            <p className="text-blue-100 text-sm">出勤予定を登録・管理</p>
          </Link>

          {/* ランキング */}
          <Link
            href="/cast/ranking"
            className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <FiTrendingUp size={40} className="mb-4" />
            <h3 className="text-xl font-bold mb-2">ランキング</h3>
            <p className="text-yellow-100 text-sm">現在のランキングを確認</p>
          </Link>

          {/* お気に入り登録数 */}
          <Link
            href="/cast/favorites"
            className="bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <FiHeart size={40} className="mb-4" />
            <h3 className="text-xl font-bold mb-2">お気に入り登録数</h3>
            <p className="text-pink-100 text-sm">登録してくれたお客様一覧</p>
          </Link>

          {/* プロフィール編集 */}
          <Link
            href="/cast/profile"
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <FiUser size={40} className="mb-4" />
            <h3 className="text-xl font-bold mb-2">プロフィール編集</h3>
            <p className="text-indigo-100 text-sm">自己紹介やプロフィールを更新</p>
          </Link>

          {/* 精算明細 */}
          <Link
            href="/cast/earnings"
            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <FiTrendingUp size={40} className="mb-4" />
            <h3 className="text-xl font-bold mb-2">精算明細</h3>
            <p className="text-green-100 text-sm">今日の売上・取り分を確認</p>
          </Link>
        </div>

        {/* 秘密厳守の連絡先 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <FiShield className="text-gray-700" size={24} />
            <h2 className="text-xl font-bold text-gray-800">秘密厳守の連絡先</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 店長へ連絡 */}
            <Link
              href="/cast/contact/manager"
              className="border-2 border-pink-200 rounded-xl p-6 hover:border-pink-400 hover:bg-pink-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="bg-pink-100 rounded-full p-3">
                  <FiMessageSquare className="text-pink-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">店長に直接連絡</h3>
                  <p className="text-sm text-gray-600">秘密厳守でお話しできます</p>
                </div>
              </div>
            </Link>

            {/* 責任者へ連絡 */}
            <Link
              href="/cast/contact/director"
              className="border-2 border-purple-200 rounded-xl p-6 hover:border-purple-400 hover:bg-purple-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 rounded-full p-3">
                  <FiShield className="text-purple-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">責任者に連絡</h3>
                  <p className="text-sm text-gray-600">秘密厳守でご相談できます</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              <FiShield className="inline mr-1" />
              すべてのやり取りは完全に秘密厳守されます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
