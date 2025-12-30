'use client';

import { useState } from 'react';
import { customerAPI } from '../lib/api';
import type { Customer, Reservation } from '../types';

export default function CustomerSearch() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCustomer(null);
    setOrders([]);
    setLoading(true);

    try {
      const result = await customerAPI.search(phoneNumber);
      if (result) {
        setCustomer(result);
        // Get customer orders
        const customerOrders = await customerAPI.getOrders(result.id);
        setOrders(customerOrders);
      } else {
        setError('該当する顧客が見つかりませんでした');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '検索中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const getCustomerTypeLabel = (type: string) => {
    switch (type) {
      case 'new': return '新規';
      case 'regular': return '常連';
      case 'vip': return 'VIP';
      default: return type;
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '保留';
      case 'confirmed': return '確定';
      case 'completed': return '完了';
      case 'cancelled': return 'キャンセル';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="dashboard-card">
        <h2 className="text-xl font-bold mb-4">顧客検索（電話番号）</h2>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="電話番号を入力（ハイフンなし）"
            className="input-field flex-1"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? '検索中...' : '検索'}
          </button>
        </form>
        {error && (
          <p className="mt-4 text-red-600">{error}</p>
        )}
      </div>

      {customer && (
        <>
          {/* Customer Information */}
          <div className="dashboard-card">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">顧客情報</h2>
              <span className={`badge ${
                customer.customer_type === 'vip' ? 'badge-danger' :
                customer.customer_type === 'regular' ? 'badge-warning' :
                'badge-success'
              }`}>
                {getCustomerTypeLabel(customer.customer_type)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">顧客ID</p>
                <p className="font-medium">{customer.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">お名前</p>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">電話番号</p>
                <p className="font-medium">{customer.phone_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">メールアドレス</p>
                <p className="font-medium">{customer.email || '未登録'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">自宅住所</p>
                <p className="font-medium">{customer.home_address || '未登録'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">自宅交通費</p>
                <p className="font-medium">
                  {customer.home_transportation_fee ? formatCurrency(customer.home_transportation_fee) : '未設定'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">総注文数</p>
                <p className="font-medium">{customer.total_orders}回</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">最終来店日</p>
                <p className="font-medium">
                  {customer.last_visit_date ? formatDate(customer.last_visit_date) : '未来店'}
                </p>
              </div>
              {customer.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">備考</p>
                  <p className="font-medium">{customer.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order History */}
          <div className="dashboard-card">
            <h2 className="text-xl font-bold mb-4">
              利用履歴 ({orders.length}件)
            </h2>
            
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        予約日時
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        店舗
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        キャスト
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        コース
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        合計金額
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="table-cell">
                          {formatDate(order.order_datetime)}
                        </td>
                        <td className="table-cell">
                          {order.store?.name || '-'}
                        </td>
                        <td className="table-cell">
                          {order.cast?.display_name || '指名なし'}
                        </td>
                        <td className="table-cell">
                          {order.duration}分
                        </td>
                        <td className="table-cell font-medium">
                          {formatCurrency(order.total_price)}
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${
                            order.order_status === 'completed' ? 'badge-success' :
                            order.order_status === 'confirmed' ? 'badge-warning' :
                            order.order_status === 'cancelled' ? 'badge-danger' :
                            ''
                          }`}>
                            {getOrderStatusLabel(order.order_status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                利用履歴がありません
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
