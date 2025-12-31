'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FiUsers, 
  FiBell, 
  FiFileText, 
  FiMessageSquare, 
  FiThumbsUp,
  FiTrendingUp,
  FiClock,
  FiPhone,
  FiPlusCircle
} from 'react-icons/fi';
import OrderModal from '@/components/OrderModal';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCasts: 0,
    totalUsers: 0,
    totalReservations: 0,
    pendingReviews: 0,
    unreadMessages: 0,
    activeAnnouncements: 0,
    recentBlogs: 0,
  });
  
  // 受注モーダル
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  useEffect(() => {
    // TODO: APIから統計データを取得
    // 仮データ
    setStats({
      totalCasts: 25,
      totalUsers: 342,
      totalReservations: 156,
      pendingReviews: 8,
      unreadMessages: 15,
      activeAnnouncements: 5,
      recentBlogs: 12,
    });
  }, []);

  const statCards = [
    {
      title: 'キャスト数',
      value: stats.totalCasts,
      icon: FiUsers,
      color: 'bg-pink-500',
      link: '/admin/casts',
    },
    {
      title: '会員数',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'bg-purple-500',
      link: '/admin/users',
    },
    {
      title: '予約数（今月）',
      value: stats.totalReservations,
      icon: FiClock,
      color: 'bg-blue-500',
      link: '/admin/reservations',
    },
    {
      title: '承認待ち口コミ',
      value: stats.pendingReviews,
      icon: FiThumbsUp,
      color: 'bg-yellow-500',
      link: '/admin/reviews',
    },
    {
      title: '未読チャット',
      value: stats.unreadMessages,
      icon: FiMessageSquare,
      color: 'bg-green-500',
      link: '/admin/chats',
    },
    {
      title: 'お知らせ',
      value: stats.activeAnnouncements,
      icon: FiBell,
      color: 'bg-red-500',
      link: '/admin/announcements',
    },
  ];

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ダッシュボード</h1>
          <p className="text-gray-600">人妻の蜜 管理画面へようこそ</p>
        </div>
        
        {/* 受注ボタン */}
        <button
          onClick={() => setOrderModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-bold"
        >
          <FiPhone size={20} />
          受注登録
        </button>
      </div>
      
      {/* 受注モーダル */}
      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        storeId="nishifuna"
      />

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.link}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} text-white p-3 rounded-lg`}>
                  <Icon size={24} />
                </div>
                <FiTrendingUp className="text-green-500" size={20} />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </Link>
          );
        })}
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/customer-management/orders/new"
            className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-lg text-center font-bold hover:shadow-lg transition-shadow"
          >
            📝 新規受注
          </Link>
          <Link
            href="/admin/customer-management/search"
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-lg text-center font-bold hover:shadow-lg transition-shadow"
          >
            🔍 顧客検索
          </Link>
          <Link
            href="/admin/casts/new"
            className="bg-gradient-to-r from-pink-600 to-pink-500 text-white p-4 rounded-lg text-center font-bold hover:shadow-lg transition-shadow"
          >
            ➕ キャスト登録
          </Link>
          <Link
            href="/admin/announcements/new"
            className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 rounded-lg text-center font-bold hover:shadow-lg transition-shadow"
          >
            📢 お知らせ投稿
          </Link>
          <Link
            href="/admin/immediate/new"
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-lg text-center font-bold hover:shadow-lg transition-shadow"
          >
            ⚡ 即姫登録
          </Link>
          <Link
            href="/admin/reviews"
            className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white p-4 rounded-lg text-center font-bold hover:shadow-lg transition-shadow"
          >
            ✅ 口コミ承認
          </Link>
        </div>
      </div>

      {/* 最近のアクティビティ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最新の予約 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">最新の予約</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">テストユーザー{i}</p>
                  <p className="text-sm text-gray-500">キャスト名 - 60分コース</p>
                </div>
                <span className="text-xs text-gray-400">{i}時間前</span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/reservations"
            className="block text-center mt-4 text-pink-600 hover:text-pink-700 font-medium"
          >
            すべて見る →
          </Link>
        </div>

        {/* 承認待ち口コミ */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">承認待ち口コミ</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-gray-800">キャスト名{i}への口コミ</p>
                  <p className="text-sm text-gray-500">⭐ 5.0 - 素晴らしい接客でした...</p>
                </div>
                <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">待機中</span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/reviews"
            className="block text-center mt-4 text-pink-600 hover:text-pink-700 font-medium"
          >
            すべて見る →
          </Link>
        </div>
      </div>
    </div>
  );
}
