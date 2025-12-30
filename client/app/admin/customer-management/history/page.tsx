'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCustomerByPhone } from '../api';
import { formatPhoneNumber, formatDate, formatDateTime, formatPrice } from '../utils';

export default function CustomerHistoryPage() {
  const searchParams = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [allReservations, setAllReservations] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone) {
      setPhoneNumber(phone);
      loadCustomerHistory(phone);
    }
  }, [searchParams]);

  const loadCustomerHistory = async (phone: string) => {
    setLoading(true);
    try {
      const result = await getCustomerByPhone(phone.replace(/\D/g, ''));
      if (result.success && result.customer) {
        setCustomer(result.customer);
        setAllReservations(result.reservations || []);
        setNotes(result.notes || []);
      }
    } catch (err) {
      console.error('顧客履歴取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // フィルタリングされた予約
  const filteredReservations = allReservations.filter((res) => {
    // ステータスフィルター
    if (filterStatus !== 'all' && res.status !== filterStatus) {
      return false;
    }
    
    // 年フィルター
    if (filterYear !== 'all') {
      const resYear = new Date(res.order_datetime).getFullYear().toString();
      if (resYear !== filterYear) {
        return false;
      }
    }
    
    return true;
  });

  // 利用可能な年のリスト
  const availableYears = Array.from(
    new Set(allReservations.map((res) => new Date(res.order_datetime).getFullYear()))
  ).sort((a, b) => b - a);

  // ステータスごとの集計
  const statusCounts = {
    all: allReservations.length,
    completed: allReservations.filter(r => r.status === 'completed').length,
    confirmed: allReservations.filter(r => r.status === 'confirmed').length,
    in_progress: allReservations.filter(r => r.status === 'in_progress').length,
    cancelled: allReservations.filter(r => r.status === 'cancelled').length,
    draft: allReservations.filter(r => r.status === 'draft').length,
  };

  // 合計金額計算
  const totalAmount = filteredReservations
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + (r.total_price || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">顧客が見つかりません</h2>
          <button
            onClick={() => window.close()}
            className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">📚 全利用履歴</h1>
            <p className="text-xl font-semibold mb-1">{customer.name || '未登録'}</p>
            <p className="text-lg opacity-90">{formatPhoneNumber(phoneNumber)}</p>
            <div className="flex gap-4 mt-3">
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="text-sm">総利用: <strong>{customer.total_orders || 0}回</strong></span>
              </div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="text-sm">総額: <strong>¥{formatPrice(customer.total_spent || 0)}</strong></span>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.close()}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            title="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto p-6">
        {/* フィルターエリア */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">ステータス</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">全て ({statusCounts.all})</option>
                <option value="completed">完了 ({statusCounts.completed})</option>
                <option value="confirmed">確定 ({statusCounts.confirmed})</option>
                <option value="in_progress">進行中 ({statusCounts.in_progress})</option>
                <option value="cancelled">キャンセル ({statusCounts.cancelled})</option>
                <option value="draft">下書き ({statusCounts.draft})</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">年度</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">全期間</option>
                {availableYears.map((year) => (
                  <option key={year} value={year.toString()}>{year}年</option>
                ))}
              </select>
            </div>

            <div className="ml-auto">
              <div className="text-right">
                <p className="text-sm text-gray-600">表示中</p>
                <p className="text-2xl font-bold text-pink-600">{filteredReservations.length}件</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">合計金額（完了分）</p>
              <p className="text-2xl font-bold text-green-600">¥{formatPrice(totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* 履歴リスト */}
        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-xl text-gray-600">該当する履歴がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation, index) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-sm text-gray-500">#{allReservations.length - index}</span>
                    <h3 className="text-lg font-bold text-gray-900">{formatDateTime(reservation.order_datetime)}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {reservation.store_name || '店舗未設定'} 
                      {reservation.start_time && ` • ${new Date(reservation.start_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`}
                      {reservation.duration && ` • ${reservation.duration}分`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    reservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    reservation.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reservation.status === 'completed' ? '✓ 完了' :
                     reservation.status === 'confirmed' ? '確定' :
                     reservation.status === 'in_progress' ? '進行中' :
                     reservation.status === 'cancelled' ? 'キャンセル' : '下書き'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="text-xs text-gray-600">キャスト</label>
                    <p className="font-semibold text-pink-600">{reservation.cast_name || '未定'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">場所</label>
                    <p className="font-medium text-gray-800">
                      {reservation.location_type === 'hotel' ? '🏨 ホテル' :
                       reservation.location_type === 'home' ? '🏠 自宅' : '🏢 その他'}
                      {reservation.location_name && `: ${reservation.location_name}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">料金</label>
                    <p className="text-xl font-bold text-gray-900">¥{formatPrice(reservation.total_price)}</p>
                  </div>
                </div>

                {reservation.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <label className="text-xs text-gray-600 mb-1 block">特記事項</label>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{reservation.notes}</p>
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      const url = `/admin/customer-management/orders/${reservation.id}`;
                      window.open(url, '_blank');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    詳細を見る →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 顧客メモ（オプション） */}
        {notes.length > 0 && (
          <div className="mt-6 bg-yellow-50 rounded-lg shadow-md p-5 border-2 border-yellow-300">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">⚠️</span>
              顧客メモ
            </h2>
            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="bg-white p-3 rounded border border-yellow-200">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content || note.note}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{formatDateTime(note.created_at)}</span>
                    <span>作成者: {note.created_by_name || 'システム'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
