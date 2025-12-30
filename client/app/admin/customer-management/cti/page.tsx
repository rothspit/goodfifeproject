'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCustomerByPhone, getStores } from '../api';
import { formatPhoneNumber, formatDate, formatPrice, formatDateTime } from '../utils';

// 店舗の電話番号マッピング
const STORE_PHONE_MAPPING: { [key: string]: string } = {
  '0501748': 'nishifuna',  // 050-1748-xxxx → 西船橋
  '0501749': 'kinshicho',  // 050-1749-xxxx → 錦糸町
  '0501750': 'kasai',      // 050-1750-xxxx → 葛西
  '0501751': 'matsudo',    // 050-1751-xxxx → 松戸
};

// 着信電話番号から店舗を自動判定
const detectStoreFromIncomingNumber = (incomingNumber: string): string | null => {
  const normalized = incomingNumber.replace(/\D/g, '');
  
  // 最初の7桁で判定
  const prefix = normalized.substring(0, 7);
  return STORE_PHONE_MAPPING[prefix] || null;
};

export default function CTIPopupPage() {
  const searchParams = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [incomingNumber, setIncomingNumber] = useState(''); // 着信した電話番号
  const [detectedStore, setDetectedStore] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('');
  const [customer, setCustomer] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    // URLパラメータから電話番号と着信番号を取得
    const phone = searchParams.get('phone');
    const incoming = searchParams.get('incoming');
    
    if (phone) {
      setPhoneNumber(phone);
      searchCustomer(phone);
    }
    
    if (incoming) {
      setIncomingNumber(incoming);
      const store = detectStoreFromIncomingNumber(incoming);
      setDetectedStore(store);
      
      // 店舗名を取得
      loadStores(store);
    }
  }, [searchParams]);

  const loadStores = async (storeId: string | null) => {
    try {
      const result = await getStores();
      setStores(result.stores || []);
      
      if (storeId && result.stores) {
        const store = result.stores.find((s: any) => s.id === storeId);
        if (store) {
          setStoreName(store.display_name || store.name);
        }
      }
    } catch (err) {
      console.error('店舗情報取得エラー:', err);
    }
  };

  const searchCustomer = async (phone: string) => {
    setLoading(true);
    try {
      const result = await getCustomerByPhone(phone.replace(/\D/g, ''));
      if (result.success && result.customer) {
        setCustomer(result.customer);
        setReservations(result.reservations || []);
        setNotes(result.notes || []);
      } else {
        setCustomer(null);
        setReservations([]);
        setNotes([]);
      }
    } catch (err) {
      console.error('顧客検索エラー:', err);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const openHistoryWindow = () => {
    if (customer) {
      const url = `/admin/customer-management/history?customer_id=${customer.id}&phone=${phoneNumber}`;
      window.open(url, 'customer-history', 'width=900,height=700,resizable=yes,scrollbars=yes');
    }
  };

  const openDetailWindow = () => {
    const url = `/admin/customer-management/search?phone=${phoneNumber}`;
    window.open(url, 'customer-detail', 'width=1200,height=800,resizable=yes,scrollbars=yes');
  };

  const openOrderWindow = () => {
    let url = `/admin/customer-management/orders/new?phone=${phoneNumber}`;
    if (customer) {
      url += `&customer_id=${customer.id}`;
    }
    if (detectedStore) {
      url += `&store_id=${detectedStore}`;
    }
    window.open(url, 'new-order', 'width=1400,height=900,resizable=yes,scrollbars=yes');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 text-white p-4 rounded-t-lg shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-1">📞 着信</h2>
              <p className="text-2xl font-semibold">{formatPhoneNumber(phoneNumber)}</p>
              {storeName && (
                <div className="mt-2 inline-block bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium">🏢 {storeName}</span>
                </div>
              )}
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

        {/* コンテンツ */}
        <div className="bg-white rounded-b-lg shadow-lg p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
              <p className="mt-3 text-gray-600">顧客情報を検索中...</p>
            </div>
          ) : customer ? (
            <div className="space-y-4">
              {/* 顧客情報 */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border-2 border-pink-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">👤</span>
                  顧客情報
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">お名前</label>
                    <p className="text-xl font-bold text-pink-600">{customer.name || '未登録'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">顧客タイプ</label>
                    <p className="text-base font-semibold">
                      {customer.customer_type === 'member' ? '🌟 会員' : 'ビジター'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">総利用回数</label>
                    <p className="text-lg font-bold text-green-600">{customer.total_orders || 0}回</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">総利用金額</label>
                    <p className="text-lg font-bold text-green-600">¥{formatPrice(customer.total_spent || 0)}</p>
                  </div>
                </div>
              </div>

              {/* 顧客メモ（重要な情報）*/}
              {notes.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300">
                  <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">⚠️</span>
                    重要なメモ
                  </h3>
                  <div className="space-y-2">
                    {notes.slice(0, 3).map((note) => (
                      <div key={note.id} className="bg-white p-2 rounded border border-yellow-200">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content || note.note}</p>
                        <span className="text-xs text-gray-500 mt-1 block">{formatDate(note.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 最近の利用履歴（直近5件） */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-gray-900 flex items-center">
                    <span className="mr-2">📋</span>
                    最近の利用履歴
                    <span className="ml-2 text-sm text-gray-500">(直近5件)</span>
                  </h3>
                  {reservations.length > 5 && (
                    <button
                      onClick={openHistoryWindow}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      全履歴を見る →
                    </button>
                  )}
                </div>
                {reservations.length === 0 ? (
                  <p className="text-gray-500 text-center py-3 text-sm">利用履歴がありません</p>
                ) : (
                  <div className="space-y-2">
                    {reservations.slice(0, 5).map((reservation) => (
                      <div key={reservation.id} className="bg-white p-3 rounded border border-gray-200">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs text-gray-600">{formatDateTime(reservation.order_datetime)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            reservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            reservation.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reservation.status === 'completed' ? '完了' :
                             reservation.status === 'confirmed' ? '確定' :
                             reservation.status === 'in_progress' ? '進行中' :
                             reservation.status === 'cancelled' ? 'キャンセル' : '下書き'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-xs text-gray-500">キャスト</span>
                            <p className="font-medium text-pink-600">{reservation.cast_name || '未定'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">料金</span>
                            <p className="font-semibold">¥{formatPrice(reservation.total_price)}</p>
                          </div>
                        </div>
                        {reservation.notes && (
                          <div className="mt-1 pt-1 border-t border-gray-100">
                            <p className="text-xs text-gray-600 line-clamp-1">{reservation.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* アクションボタン */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={openDetailWindow}
                  className="py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm transition-colors"
                >
                  詳細を見る
                </button>
                <button
                  onClick={openHistoryWindow}
                  className="py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-sm transition-colors"
                >
                  全履歴
                </button>
                <button
                  onClick={openOrderWindow}
                  className="py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm transition-colors"
                >
                  🆕 新規受注
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">❓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">新規顧客</h3>
              <p className="text-gray-600 mb-4 text-sm">この電話番号は登録されていません</p>
              <button
                onClick={openOrderWindow}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition-colors"
              >
                新規顧客として受注を作成
              </button>
            </div>
          )}
        </div>

        {/* 実装メモ */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
          <p className="font-semibold mb-1">📝 CTI連携の使い方</p>
          <p>CTIシステムから以下のようにURLを開いてください：</p>
          <code className="block mt-1 bg-white p-2 rounded text-xs">
            {`/admin/customer-management/cti?phone=090XXXX&incoming=0501748XXXX`}
          </code>
          <p className="mt-1 text-xs">
            • <strong>phone</strong>: 顧客の電話番号<br/>
            • <strong>incoming</strong>: 着信した電話番号（店舗判定用）
          </p>
        </div>
      </div>
    </div>
  );
}
