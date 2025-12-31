'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTodayOrders, createOrUpdateOrder } from '../../api';
import { formatPrice, formatDate, formatTime, getStatusLabel, getStatusColor } from '../../utils';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  // 編集用の状態
  const [status, setStatus] = useState('');
  const [memo, setMemo] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      // 本日の受注から該当のIDを検索
      const result = await getTodayOrders();
      if (result.success) {
        const foundOrder = result.orders.find((o: any) => o.id.toString() === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
          setStatus(foundOrder.status);
          setMemo(foundOrder.memo || '');
          setDiscount(foundOrder.discount || 0);
        } else {
          setError('受注が見つかりませんでした');
        }
      }
    } catch (err: any) {
      setError(err.message || '受注の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!order) return;

    setSaving(true);
    setError('');

    try {
      const updateData = {
        id: order.id,
        order_date: order.order_date,
        order_datetime: order.order_datetime,
        store_id: order.store_id,
        customer_id: order.customer_id,
        cast_id: order.cast_id,
        start_time: order.start_time,
        duration: order.duration,
        location_type: order.location_type,
        location_name: order.location_name,
        address: order.address,
        base_price: order.base_price,
        nomination_fee: order.nomination_fee,
        transportation_fee: order.transportation_fee,
        option_fee: order.option_fee,
        discount,
        total_price: order.base_price + order.nomination_fee + order.transportation_fee + order.option_fee - discount,
        options: order.options,
        memo,
        status,
        is_nomination: order.is_nomination,
      };

      const result = await createOrUpdateOrder(updateData);
      if (result.success) {
        alert('受注を更新しました！');
        setEditMode(false);
        fetchOrder();
      }
    } catch (err: any) {
      setError(err.message || '受注の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    if (!confirm('本当にこの受注を削除しますか？')) return;

    setSaving(true);
    setError('');

    try {
      // ステータスをキャンセルに変更
      const updateData = {
        ...order,
        id: order.id,
        status: 'cancelled',
      };

      const result = await createOrUpdateOrder(updateData);
      if (result.success) {
        alert('受注を削除（キャンセル）しました');
        router.push('/admin/customer-management/orders');
      }
    } catch (err: any) {
      setError(err.message || '受注の削除に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
            <p className="font-bold mb-2">エラー</p>
            <p>{error}</p>
            <button
              onClick={() => router.push('/admin/customer-management/orders')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              受注一覧に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const totalPrice = order.base_price + order.nomination_fee + order.transportation_fee + order.option_fee - discount;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">受注詳細 #{order.id}</h1>
            <p className="text-gray-600 mt-2">{formatDate(order.order_date)}</p>
          </div>
          <div className="flex gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  編集
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium transition-colors"
                >
                  削除
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setStatus(order.status);
                    setMemo(order.memo || '');
                    setDiscount(order.discount || 0);
                  }}
                  disabled={saving}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 font-medium transition-colors"
                >
                  キャンセル
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* ステータス */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">ステータス</h2>
            {editMode ? (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="pending">未確定</option>
                <option value="confirmed">確定</option>
                <option value="completed">完了</option>
                <option value="cancelled">キャンセル</option>
              </select>
            ) : (
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            )}
          </div>

          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">日時</label>
                <p className="text-lg font-semibold">
                  {formatDate(order.order_datetime)} {formatTime(order.start_time)}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">店舗</label>
                <p className="text-lg font-semibold">{order.store_name || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">時間</label>
                <p className="text-lg font-semibold">{order.duration}分</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">指名</label>
                <p className="text-lg font-semibold">
                  {order.is_nomination ? 'あり' : 'なし'}
                </p>
              </div>
            </div>
          </div>

          {/* 顧客情報 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">顧客情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">お名前</label>
                <p className="text-lg font-semibold">{order.customer_name || '未登録'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">電話番号</label>
                <p className="text-lg font-semibold">{order.phone_number || '-'}</p>
              </div>
            </div>
          </div>

          {/* キャスト情報 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">キャスト情報</h2>
            <div>
              <label className="text-sm text-gray-600">キャスト名</label>
              <p className="text-lg font-semibold text-pink-600">{order.cast_name || '-'}</p>
            </div>
          </div>

          {/* 場所情報 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">場所情報</h2>
            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-600">場所タイプ</label>
                <p className="text-lg font-semibold">
                  {order.location_type === 'hotel' ? 'ホテル' :
                   order.location_type === 'home' ? '自宅' : 'その他'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">場所名</label>
                <p className="text-lg">{order.location_name || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">住所</label>
                <p className="text-lg">{order.address || '-'}</p>
              </div>
            </div>
          </div>

          {/* 料金情報 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">料金情報</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>基本料金</span>
                <span className="font-semibold">¥{formatPrice(order.base_price)}</span>
              </div>
              {order.nomination_fee > 0 && (
                <div className="flex justify-between text-pink-600">
                  <span>指名料</span>
                  <span className="font-semibold">¥{formatPrice(order.nomination_fee)}</span>
                </div>
              )}
              {order.transportation_fee > 0 && (
                <div className="flex justify-between">
                  <span>交通費</span>
                  <span className="font-semibold">¥{formatPrice(order.transportation_fee)}</span>
                </div>
              )}
              {order.option_fee > 0 && (
                <div className="flex justify-between">
                  <span>オプション料金</span>
                  <span className="font-semibold">¥{formatPrice(order.option_fee)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>割引</span>
                {editMode ? (
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
                  />
                ) : (
                  <span className="font-semibold text-red-600">-¥{formatPrice(order.discount || 0)}</span>
                )}
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold text-pink-600">
                  <span>合計</span>
                  <span>¥{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* メモ */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">メモ</h2>
            {editMode ? (
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                rows={4}
                placeholder="メモを入力..."
              />
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap">{order.memo || 'メモなし'}</p>
            )}
          </div>

          {/* 戻るボタン */}
          <div className="text-center">
            <button
              onClick={() => router.push('/admin/customer-management/orders')}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              受注一覧に戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
