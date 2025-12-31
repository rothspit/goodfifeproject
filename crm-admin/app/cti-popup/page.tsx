'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { customerAPI } from '../lib/api';
import type { Customer, Reservation } from '../types';

function CTIPopupContent() {
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const callId = searchParams.get('callId') || '';
  const incomingNumber = searchParams.get('incoming') || '';
  const store = searchParams.get('store') || '';

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (phone) {
      loadCustomerData();
    }
  }, [phone]);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const customerData = await customerAPI.search(phone);
      if (customerData) {
        setCustomer(customerData);
        const customerOrders = await customerAPI.getOrders(customerData.id);
        setOrders(customerOrders);
      } else {
        setError('顧客情報が見つかりません（新規顧客の可能性があります）');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getStoreLabel = (storeCode: string) => {
    const stores: { [key: string]: string } = {
      'nishifuna': '西船橋店',
      'kinshicho': '錦糸町店',
      'kasai': '葛西店',
      'matsudo': '松戸店',
    };
    return stores[storeCode] || storeCode;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">顧客情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">着信通知</h1>
            <p className="text-sm opacity-90">{phone}</p>
          </div>
          {store && (
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {getStoreLabel(store)}
            </div>
          )}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="bg-white rounded-b-lg shadow-lg overflow-hidden">
        {error && !customer ? (
          <div className="p-6 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">{error}</p>
            </div>
            <div className="text-gray-600">
              <p className="font-medium mb-2">新規顧客登録が必要な可能性があります</p>
              <p className="text-sm">電話番号: {phone}</p>
            </div>
          </div>
        ) : customer ? (
          <>
            {/* 顧客情報 */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                  <p className="text-gray-500 mt-1">{customer.phone_number}</p>
                </div>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-semibold
                  ${customer.customer_type === 'vip' ? 'bg-red-100 text-red-800' :
                    customer.customer_type === 'regular' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'}
                `}>
                  {getCustomerTypeLabel(customer.customer_type)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">メール</p>
                  <p className="font-medium">{customer.email || '未登録'}</p>
                </div>
                <div>
                  <p className="text-gray-500">総注文数</p>
                  <p className="font-medium text-blue-600">{customer.total_orders}回</p>
                </div>
                <div>
                  <p className="text-gray-500">最終来店日</p>
                  <p className="font-medium">
                    {customer.last_visit_date ? formatDate(customer.last_visit_date) : '未来店'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">自宅交通費</p>
                  <p className="font-medium">
                    {customer.home_transportation_fee ? formatCurrency(customer.home_transportation_fee) : '未設定'}
                  </p>
                </div>
              </div>

              {customer.notes && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-medium text-yellow-800">備考</p>
                  <p className="text-sm text-yellow-700 mt-1">{customer.notes}</p>
                </div>
              )}

              {customer.home_address && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">自宅住所</p>
                  <p className="text-sm">{customer.home_address}</p>
                </div>
              )}
            </div>

            {/* 利用履歴 */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                直近の利用履歴 ({orders.length}件)
              </h3>
              
              {orders.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDate(order.order_datetime)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.store?.name} / {order.duration}分コース
                          </p>
                        </div>
                        <p className="font-bold text-blue-600">
                          {formatCurrency(order.total_price)}
                        </p>
                      </div>
                      {order.cast?.display_name && (
                        <p className="text-sm text-gray-600">
                          キャスト: {order.cast.display_name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">利用履歴がありません</p>
              )}
            </div>
          </>
        ) : null}

        {/* Call ID（デバッグ用） */}
        <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-500">
          <p>Call ID: {callId}</p>
          {incomingNumber && <p>着信番号: {incomingNumber}</p>}
        </div>
      </div>
    </div>
  );
}

export default function CTIPopupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <CTIPopupContent />
    </Suspense>
  );
}
