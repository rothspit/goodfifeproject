'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { getAuth, clearAuth, getStorageStatus } from '@/lib/authStorage';
import {
  FiUser,
  FiStar,
  FiHeart,
  FiMessageSquare,
  FiMail,
  FiGift,
  FiClock,
  FiDollarSign,
  FiLogOut,
} from 'react-icons/fi';
import { customerApi } from '@/lib/api';

interface UserPoints {
  points: number;
  total_earned: number;
  total_used: number;
}

interface Reservation {
  id: number;
  cast_name: string;
  cast_image: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_amount?: number;
  points_earned?: number;
}

interface Appeal {
  id: number;
  cast_name: string;
  cast_image: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') {
      console.log('サーバーサイドレンダリング中、認証チェックスキップ');
      return;
    }

    console.log('🔍 マイページ: useEffect実行開始');
    console.log('現在のURL:', window.location.href);
    console.log('URLパラメータ:', window.location.search);

    // ログイン直後の場合は少し待機
    const isFromLogin = window.location.search.includes('logged_in=true');
    const delay = isFromLogin ? 200 : 0;
    
    console.log(`⏱️ 認証チェック開始まで${delay}ms待機（ログイン直後: ${isFromLogin}）`);

    setTimeout(() => {
      // すべてのストレージ状態を確認
      const storageStatus = getStorageStatus();
      console.log('📦 全ストレージ確認:', storageStatus);

      // 統合ストレージから認証情報を取得（cookie → sessionStorage → localStorage の優先順）
      const { token, user, source } = getAuth();
      
      console.log('認証情報取得結果:', { 
        hasToken: !!token, 
        hasUser: !!user,
        source: source,
        userInfo: user ? `${user.phone_number} (ID: ${user.id})` : 'なし'
      });

      if (!token || !user) {
        console.log('❌ 認証情報なし、ログインページへリダイレクト');
        console.log('ストレージ詳細:', {
          localStorage: storageStatus.localStorage,
          sessionStorage: storageStatus.sessionStorage,
          cookie: storageStatus.cookie
        });
        clearAuth();
        router.push('/login');
        return;
      }

      console.log('✅ 認証成功 - ユーザーデータ設定');
      console.log('取得元:', source);
      console.log('ユーザー:', user);
      
      setUser(user);
      
      // データ取得も少し遅らせる（APIリクエストの準備時間を確保）
      setTimeout(() => {
        console.log('📊 データ取得開始...');
        fetchData();
      }, 100);
    }, delay);
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('📊 データ取得開始...');
      
      // 各APIを個別に呼び出してエラーを特定しやすくする
      let pointsData: any = null;
      let reservationsData: any[] = [];
      let appealsData: any[] = [];
      let favoritesData: any[] = [];

      try {
        console.log('🔄 ポイント取得中...');
        const pointsRes = await customerApi.getPoints();
        pointsData = pointsRes.data.points;
        console.log('✅ ポイント取得成功:', pointsData);
      } catch (error: any) {
        console.error('❌ ポイント取得エラー:', error.response?.status, error.message);
      }

      try {
        console.log('🔄 利用履歴取得中...');
        const reservationsRes = await customerApi.getReservationHistory({ limit: 5 });
        reservationsData = reservationsRes.data.reservations || [];
        console.log('✅ 利用履歴取得成功:', reservationsData.length, '件');
      } catch (error: any) {
        console.error('❌ 利用履歴取得エラー:', error.response?.status, error.message);
      }

      try {
        console.log('🔄 アピール取得中...');
        const appealsRes = await customerApi.getAppeals();
        appealsData = appealsRes.data.appeals || [];
        console.log('✅ アピール取得成功:', appealsData.length, '件');
      } catch (error: any) {
        console.error('❌ アピール取得エラー:', error.response?.status, error.message);
      }

      try {
        console.log('🔄 お気に入り取得中...');
        const favoritesRes = await customerApi.getFavorites();
        favoritesData = favoritesRes.data.favorites || [];
        console.log('✅ お気に入り取得成功:', favoritesData.length, '件');
      } catch (error: any) {
        console.error('❌ お気に入り取得エラー:', error.response?.status, error.message);
      }

      // 取得したデータを設定
      if (pointsData) {
        setPoints(pointsData);
      } else {
        // デフォルト値を設定
        setPoints({ points: 0, total_earned: 0, total_used: 0 });
      }
      
      setReservations(reservationsData);
      setAppeals(appealsData);
      setFavoritesCount(favoritesData.length);
      
      console.log('✅ 全データ取得完了');
    } catch (error: any) {
      console.error('📛 予期しないエラー:', error);
      // フォールバックとしてデフォルト値を設定
      setPoints({ points: 0, total_earned: 0, total_used: 0 });
      setReservations([]);
      setAppeals([]);
      setFavoritesCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Header />

      {/* スペーサー */}
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl shadow-xl p-6 md:p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-4">
                <FiUser className="text-pink-600" size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{user.name}さん</h1>
                <p className="text-pink-100 mt-1">マイページ</p>
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

        {/* ポイント情報 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiGift className="text-pink-600" />
            保有ポイント
          </h2>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-4">
                {points?.points || 0} <span className="text-xl text-gray-600">ポイント</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="mb-1">累計獲得ポイント</p>
                  <p className="text-lg font-semibold text-gray-800">{points?.total_earned || 0}pt</p>
                </div>
                <div>
                  <p className="mb-1">累計使用ポイント</p>
                  <p className="text-lg font-semibold text-gray-800">{points?.total_used || 0}pt</p>
                </div>
              </div>
              <Link
                href="/mypage/points"
                className="inline-block mt-4 text-pink-600 hover:text-pink-700 font-medium"
              >
                ポイント履歴を見る →
              </Link>
            </div>
          )}
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/mypage/reservations"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-center"
          >
            <FiClock className="text-pink-600 mx-auto mb-2" size={32} />
            <p className="text-sm font-semibold text-gray-800">利用履歴</p>
            <p className="text-xs text-gray-500 mt-1">{reservations.length}件</p>
          </Link>

          <Link
            href="/mypage/favorites"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-center"
          >
            <FiHeart className="text-pink-600 mx-auto mb-2" size={32} />
            <p className="text-sm font-semibold text-gray-800">お気に入り</p>
            <p className="text-xs text-gray-500 mt-1">{favoritesCount}人</p>
          </Link>

          <Link
            href="/mypage/chats"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-center"
          >
            <FiMessageSquare className="text-pink-600 mx-auto mb-2" size={32} />
            <p className="text-sm font-semibold text-gray-800">チャット</p>
            <p className="text-xs text-gray-500 mt-1">キャストと会話</p>
          </Link>

          <Link
            href="/mypage/appeals"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-center relative"
          >
            <FiStar className="text-pink-600 mx-auto mb-2" size={32} />
            <p className="text-sm font-semibold text-gray-800">アピール</p>
            <p className="text-xs text-gray-500 mt-1">{appeals.filter(a => !a.is_read).length}件未読</p>
            {appeals.filter(a => !a.is_read).length > 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {appeals.filter(a => !a.is_read).length}
              </div>
            )}
          </Link>
        </div>

        {/* 2段目のアクション */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/mypage/receipts"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-center"
          >
            <FiDollarSign className="text-pink-600 mx-auto mb-2" size={32} />
            <p className="text-sm font-semibold text-gray-800">電子領収書</p>
            <p className="text-xs text-gray-500 mt-1">申請・確認</p>
          </Link>

          <Link
            href="/mypage/settings"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-center"
          >
            <FiMail className="text-pink-600 mx-auto mb-2" size={32} />
            <p className="text-sm font-semibold text-gray-800">設定</p>
            <p className="text-xs text-gray-500 mt-1">メルマガ等</p>
          </Link>
        </div>

        {/* 最近の利用履歴 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiClock className="text-pink-600" />
              最近の利用履歴
            </h2>
            <Link href="/mypage/reservations" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
              すべて見る →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-all">
                  <img
                    src={reservation.cast_image || '/placeholder-cast.png'}
                    alt={reservation.cast_name}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-cast.png';
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{reservation.cast_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(reservation.date).toLocaleDateString('ja-JP')} {reservation.start_time} - {reservation.end_time}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ステータス: <span className="font-semibold">{reservation.status}</span>
                      {reservation.points_earned && (
                        <span className="ml-2 text-pink-600">+{reservation.points_earned}pt獲得</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">まだ利用履歴がありません</p>
          )}
        </div>

        {/* キャストからのアピール */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiMessageSquare className="text-pink-600" />
              キャストからのアピール
            </h2>
            <Link href="/mypage/appeals" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
              すべて見る →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : appeals.length > 0 ? (
            <div className="space-y-4">
              {appeals.slice(0, 3).map((appeal) => (
                <div
                  key={appeal.id}
                  className={`p-4 border rounded-lg ${!appeal.is_read ? 'bg-pink-50 border-pink-200' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={appeal.cast_image || '/placeholder-cast.png'}
                      alt={appeal.cast_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">{appeal.cast_name}</p>
                        {!appeal.is_read && (
                          <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">NEW</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{appeal.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(appeal.created_at).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">まだアピールがありません</p>
          )}
        </div>
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
