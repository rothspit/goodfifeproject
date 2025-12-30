'use client';

import { useState, useEffect } from 'react';
import { getTodayOrders, getStores } from '../api';
import { formatTime, formatPrice, getStatusLabel, getStatusColor, getTodayDate } from '../utils';
import Link from 'next/link';

export default function TodayOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    fetchStores();
    fetchOrders();
    setTodayDate(getTodayDate());
  }, []);

  const fetchStores = async () => {
    try {
      const result = await getStores();
      if (result.success) {
        setStores(result.stores || []);
      }
    } catch (err: any) {
      console.error('店舗リスト取得エラー:', err);
    }
  };

  const fetchOrders = async (storeId?: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await getTodayOrders(storeId);
      if (result.success) {
        setOrders(result.orders || []);
      }
    } catch (err: any) {
      setError(err.message || '受注リストの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId);
    fetchOrders(storeId || undefined);
  };

  const handleRefresh = () => {
    fetchOrders(selectedStore || undefined);
  };

  // タイムテーブル表示用にグループ化
  const groupOrdersByHour = () => {
    const grouped: { [hour: string]: any[] } = {};
    orders.forEach(order => {
      const hour = order.start_time.substring(0, 2);
      if (!grouped[hour]) grouped[hour] = [];
      grouped[hour].push(order);
    });
    return grouped;
  };

  const groupedOrders = groupOrdersByHour();
  const hours = Object.keys(groupedOrders).sort();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">本日の受注一覧</h1>
            <p className="text-gray-600 mt-2">
              {todayDate} の受注 - <span className="font-semibold text-pink-600">{orders.length}件</span>
            </p>
          </div>
          <Link
            href="/admin/customer-management/orders/new"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
          >
            + 新規受注
          </Link>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">店舗で絞り込み:</label>
            <select
              value={selectedStore}
              onChange={(e) => handleStoreChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">すべての店舗</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
            <button
              onClick={handleRefresh}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              🔄 更新
            </button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* ローディング */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">本日の受注はまだありません</p>
            <Link
              href="/admin/customer-management/orders/new"
              className="mt-6 inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              新規受注を作成
            </Link>
          </div>
        ) : (
          <>
            {/* リスト表示 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">受注リスト</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">時刻</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">店舗</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">顧客名</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">電話番号</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">キャスト</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">時間</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">料金</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {formatTime(order.start_time)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {order.store_name || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {order.customer_name || '未登録'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {order.phone_number || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-pink-600">
                          {order.cast_name || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {order.duration}分
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold">
                          ¥{formatPrice(order.total_price)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/admin/customer-management/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            詳細/編集
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* タイムテーブル表示 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">タイムテーブル</h2>
              <div className="space-y-4">
                {hours.map(hour => (
                  <div key={hour} className="border-l-4 border-pink-500 pl-4">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">{hour}:00〜{hour}:59</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedOrders[hour].map(order => (
                        <div
                          key={order.id}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-lg font-bold text-pink-600">
                              {formatTime(order.start_time)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">顧客:</span> {order.customer_name || '未登録'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">キャスト:</span> {order.cast_name || '-'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">時間:</span> {order.duration}分
                            </p>
                            <p className="text-sm font-semibold text-pink-600">
                              ¥{formatPrice(order.total_price)}
                            </p>
                          </div>
                          <Link
                            href={`/admin/customer-management/orders/${order.id}`}
                            className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            詳細を見る →
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
