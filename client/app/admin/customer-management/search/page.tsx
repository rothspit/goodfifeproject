'use client';

import { useState } from 'react';
import { getCustomerByPhone, addCustomerNote } from '../api';
import { formatPhoneNumber, formatDate, formatPrice, getStatusLabel } from '../utils';

export default function CustomerSearchPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      setError('電話番号を入力してください');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await getCustomerByPhone(phoneNumber.replace(/\D/g, ''));
      if (result.success) {
        setCustomer(result.customer);
        setReservations(result.reservations || []);
        setNotes(result.notes || []);
      } else {
        setError(result.message || '顧客が見つかりません');
        setCustomer(null);
        setReservations([]);
        setNotes([]);
      }
    } catch (err: any) {
      setError(err.message || '検索エラーが発生しました');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !customer) return;

    setAddingNote(true);
    try {
      await addCustomerNote(customer.id, newNote);
      // メモリストを再取得
      const result = await getCustomerByPhone(phoneNumber.replace(/\D/g, ''));
      if (result.success) {
        setNotes(result.notes || []);
        setNewNote('');
      }
    } catch (err: any) {
      alert('メモの追加に失敗しました: ' + err.message);
    } finally {
      setAddingNote(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">顧客検索</h1>
          <p className="text-gray-600 mt-2">電話番号で顧客情報を検索します</p>
        </div>

        {/* 検索ボックス */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="電話番号を入力（例: 09012345678）"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-400 font-medium transition-colors"
            >
              {loading ? '検索中...' : '検索'}
            </button>
          </div>
          {error && (
            <p className="mt-4 text-red-600 bg-red-50 p-3 rounded">{error}</p>
          )}
        </div>

        {/* 顧客情報 */}
        {customer && (
          <div className="space-y-6">
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">顧客情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">お名前</label>
                  <p className="text-lg font-semibold">{customer.name || '未登録'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">電話番号</label>
                  <p className="text-lg font-semibold">{formatPhoneNumber(customer.phone_number)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">メールアドレス</label>
                  <p className="text-lg">{customer.email || '未登録'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">顧客タイプ</label>
                  <p className="text-lg">
                    {customer.customer_type === 'member' ? '会員' : customer.customer_type === 'visitor' ? 'ビジター' : '未設定'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">自宅住所</label>
                  <p className="text-lg">{customer.home_address || '未登録'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">会社名</label>
                  <p className="text-lg">{customer.company_name || '未登録'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">総利用回数</label>
                  <p className="text-lg font-semibold text-pink-600">{customer.total_orders || 0}回</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">総利用金額</label>
                  <p className="text-lg font-semibold text-pink-600">¥{formatPrice(customer.total_spent || 0)}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">最終利用日</label>
                  <p className="text-lg">{customer.last_visit_date ? formatDate(customer.last_visit_date) : '未利用'}</p>
                </div>
              </div>
            </div>

            {/* 予約履歴 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">予約履歴</h2>
              {reservations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">予約履歴がありません</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日時</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">店舗</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">キャスト</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">時間</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">場所</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">料金</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reservations.map((reservation) => (
                        <tr key={reservation.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {formatDate(reservation.order_datetime)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {reservation.store_name || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            {reservation.cast_name || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {reservation.duration}分
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {reservation.location_name || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-pink-600">
                            ¥{formatPrice(reservation.total_price)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                              reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getStatusLabel(reservation.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 顧客メモ */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">顧客メモ</h2>
              
              {/* メモ追加フォーム */}
              <div className="mb-6">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="新しいメモを入力..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows={3}
                />
                <button
                  onClick={handleAddNote}
                  disabled={addingNote || !newNote.trim()}
                  className="mt-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-400 font-medium transition-colors"
                >
                  {addingNote ? 'メモ追加中...' : 'メモを追加'}
                </button>
              </div>

              {/* メモ一覧 */}
              {notes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">メモがありません</p>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500">{formatDate(note.created_at)}</span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{note.content || note.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* アクションボタン */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.location.href = `/admin/customer-management/orders/new?customer_id=${customer.id}&phone=${customer.phone_number}`}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                新規受注を作成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
