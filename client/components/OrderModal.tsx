'use client';

import { useState, useEffect } from 'react';
import { FiX, FiPhone, FiSearch, FiUser, FiClock, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

interface Customer {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  recentOrders?: any[];
  notes?: any[];
}

interface Cast {
  id: number;
  name: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  initialPhoneNumber?: string;
  callId?: string;
}

export default function OrderModal({ isOpen, onClose, storeId, initialPhoneNumber, callId }: OrderModalProps) {
  const [step, setStep] = useState(1); // 1: 顧客検索, 2: 受注入力
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');
  const [searchLoading, setSearchLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // フォーム入力
  const [selectedCast, setSelectedCast] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [courseName, setCourseName] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [customerRequest, setCustomerRequest] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // キャスト一覧
  const [casts, setCasts] = useState<Cast[]>([]);
  const [castHistory, setCastHistory] = useState<any>(null);

  // 送信中フラグ
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCasts();
      if (initialPhoneNumber) {
        searchCustomer(initialPhoneNumber);
      }
    }
  }, [isOpen, initialPhoneNumber]);

  const loadCasts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/casts?store_id=${storeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCasts(response.data.casts || []);
    } catch (error) {
      console.error('キャスト取得エラー:', error);
    }
  };

  const searchCustomer = async (phone: string) => {
    if (!phone || phone.length < 10) {
      alert('正しい電話番号を入力してください');
      return;
    }

    setSearchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/orders/customers/search?phone_number=${phone}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.found) {
        setCustomer(response.data.customer);
        setIsNewCustomer(false);
        setStep(2);
      } else {
        // 新規顧客
        setIsNewCustomer(true);
        const customerName = prompt('新規顧客です。お名前を入力してください:');
        if (customerName) {
          setCustomer({
            id: 0,
            name: customerName,
            phone_number: phone,
            email: '',
            total_orders: 0,
            total_spent: 0,
            last_order_date: ''
          });
          setStep(2);
        }
      }
    } catch (error) {
      console.error('顧客検索エラー:', error);
      alert('顧客検索に失敗しました');
    } finally {
      setSearchLoading(false);
    }
  };

  const checkCastHistory = async (castId: string) => {
    if (!customer?.id || !castId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/orders/customers/cast-history?customer_id=${customer.id}&cast_id=${castId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCastHistory(response.data);
    } catch (error) {
      console.error('利用履歴取得エラー:', error);
    }
  };

  const handleCastChange = (castId: string) => {
    setSelectedCast(castId);
    checkCastHistory(castId);
  };

  const handleSubmit = async () => {
    if (!customer || !selectedCast || !reservationDate || !reservationTime || !duration) {
      alert('必須項目を入力してください');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // 新規顧客の場合は先に作成
      let customerId = customer.id;
      if (isNewCustomer) {
        const createCustomerResponse = await axios.post(
          '/api/auth/register',
          {
            phone_number: customer.phone_number,
            name: customer.name,
            password: 'temp' + Math.random().toString(36).slice(2, 10),
            role: 'user'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        customerId = createCustomerResponse.data.userId;
      }

      // 受注作成
      const orderData = {
        store_id: storeId,
        customer_id: customerId,
        cast_id: parseInt(selectedCast),
        reservation_date: reservationDate,
        reservation_time: reservationTime,
        duration: parseInt(duration),
        course_name: courseName,
        course_price: coursePrice ? parseFloat(coursePrice) : 0,
        options: {},
        subtotal: coursePrice ? parseFloat(coursePrice) : 0,
        discount: 0,
        total_amount: coursePrice ? parseFloat(coursePrice) : 0,
        order_source: callId ? 'phone' : 'manual',
        customer_request: customerRequest,
        admin_notes: adminNotes,
        call_id: callId
      };

      await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('受注が作成されました！');
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('受注作成エラー:', error);
      alert(error.response?.data?.message || '受注作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPhoneNumber('');
    setCustomer(null);
    setIsNewCustomer(false);
    setSelectedCast('');
    setReservationDate('');
    setReservationTime('');
    setDuration('60');
    setCourseName('');
    setCoursePrice('');
    setCustomerRequest('');
    setAdminNotes('');
    setCastHistory(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-600 to-purple-600 text-white p-6 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">受注登録</h2>
            <p className="text-pink-100 text-sm mt-1">
              {step === 1 ? '顧客検索' : `ステップ 2: 予約情報入力 ${callId ? '(電話受注)' : ''}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* ステップ1: 顧客検索 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPhone className="inline mr-2" />
                  電話番号
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="090-1234-5678"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && searchCustomer(phoneNumber)}
                  />
                  <button
                    onClick={() => searchCustomer(phoneNumber)}
                    disabled={searchLoading}
                    className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                  >
                    <FiSearch />
                    {searchLoading ? '検索中...' : '検索'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ステップ2: 受注入力 */}
          {step === 2 && customer && (
            <div className="space-y-6">
              {/* 顧客情報表示 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <FiUser />
                  顧客情報
                  {isNewCustomer && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">新規</span>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">お名前:</span>
                    <span className="ml-2 font-medium">{customer.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">電話番号:</span>
                    <span className="ml-2 font-medium">{customer.phone_number}</span>
                  </div>
                  {!isNewCustomer && (
                    <>
                      <div>
                        <span className="text-gray-600">利用回数:</span>
                        <span className="ml-2 font-medium">{customer.total_orders}回</span>
                      </div>
                      <div>
                        <span className="text-gray-600">累計利用額:</span>
                        <span className="ml-2 font-medium">¥{customer.total_spent?.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* キャスト選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  キャスト *
                </label>
                <select
                  value={selectedCast}
                  onChange={(e) => handleCastChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  required
                >
                  <option value="">キャストを選択</option>
                  {casts.map((cast) => (
                    <option key={cast.id} value={cast.id}>
                      {cast.name}
                    </option>
                  ))}
                </select>

                {/* キャスト利用履歴表示 */}
                {castHistory && selectedCast && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                    {castHistory.isFirstTime ? (
                      <p className="text-blue-700 flex items-center gap-2">
                        <FiAlertCircle />
                        このキャストは初めてのご利用です
                      </p>
                    ) : (
                      <p className="text-blue-700">
                        このキャストの利用は{castHistory.visitCount}回目です
                        （前回: {new Date(castHistory.lastVisit).toLocaleDateString()}）
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 予約日時 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    予約日 *
                  </label>
                  <input
                    type="date"
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    予約時刻 *
                  </label>
                  <input
                    type="time"
                    value={reservationTime}
                    onChange={(e) => setReservationTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
              </div>

              {/* コース・時間 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiClock className="inline mr-1" />
                    時間 (分) *
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    required
                  >
                    <option value="60">60分</option>
                    <option value="90">90分</option>
                    <option value="120">120分</option>
                    <option value="150">150分</option>
                    <option value="180">180分</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiDollarSign className="inline mr-1" />
                    料金 (円)
                  </label>
                  <input
                    type="number"
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(e.target.value)}
                    placeholder="15000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* お客様要望 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  お客様要望
                </label>
                <textarea
                  value={customerRequest}
                  onChange={(e) => setCustomerRequest(e.target.value)}
                  rows={3}
                  placeholder="お客様からの要望・リクエスト"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* 管理者メモ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  管理者メモ
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="内部用のメモ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* ボタン */}
              <div className="flex gap-4 justify-end pt-4 border-t">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 transition-all font-bold"
                >
                  {submitting ? '登録中...' : '受注登録'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
