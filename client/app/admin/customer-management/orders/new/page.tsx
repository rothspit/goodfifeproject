'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getTodayWorkingCasts,
  getPricePlans,
  getHotels,
  getStores,
  getCustomerByPhone,
  createOrUpdateOrder,
} from '../../api';
import {
  formatPrice,
  calculateTotalPrice,
  formatDuration,
  getAvailableTimeSlots,
  formatDate,
  formatDateTime,
  getTodayDate,
  formatTime,
} from '../../utils';

function OrderFormContent() {
  const searchParams = useSearchParams();
  const customerIdParam = searchParams?.get('customer_id');
  const phoneParam = searchParams?.get('phone');

  // 基本情報
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  
  // 顧客情報
  const [phoneNumber, setPhoneNumber] = useState(phoneParam || '');
  const [customer, setCustomer] = useState<any>(null);
  const [searchingCustomer, setSearchingCustomer] = useState(false);

  // 日時
  const [orderDate, setOrderDate] = useState(getTodayDate());
  const [startTime, setStartTime] = useState('');

  // キャスト選択
  const [casts, setCasts] = useState<any[]>([]);
  const [selectedCast, setSelectedCast] = useState<any>(null);
  const [loadingCasts, setLoadingCasts] = useState(false);

  // 時間・料金
  const [duration, setDuration] = useState(60);
  const [pricePlans, setPricePlans] = useState<any[]>([]);
  const [basePrice, setBasePrice] = useState(0);
  const [nominationFee, setNominationFee] = useState(0);
  const [isNomination, setIsNomination] = useState(false);

  // 場所
  const [locationType, setLocationType] = useState<'hotel' | 'home' | 'other'>('hotel');
  const [hotels, setHotels] = useState<any[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [transportationFee, setTransportationFee] = useState(0);

  // オプション・割引
  const [optionFee, setOptionFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [memo, setMemo] = useState('');

  // UI状態
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (phoneParam && customerIdParam) {
      searchCustomer(phoneParam);
    }
  }, [phoneParam, customerIdParam]);

  useEffect(() => {
    if (selectedStore) {
      fetchCasts();
      fetchHotels();
    }
  }, [selectedStore, orderDate]);

  useEffect(() => {
    if (selectedStore && selectedCast) {
      fetchPricePlans();
    }
  }, [selectedStore, selectedCast, duration]);

  const fetchStores = async () => {
    try {
      const result = await getStores();
      if (result.success) {
        setStores(result.stores || []);
        if (result.stores.length > 0) {
          setSelectedStore(result.stores[0].id);
        }
      }
    } catch (err) {
      console.error('店舗リスト取得エラー:', err);
    }
  };

  const searchCustomer = async (phone: string) => {
    if (!phone.trim()) return;
    setSearchingCustomer(true);
    try {
      const result = await getCustomerByPhone(phone.replace(/\D/g, ''));
      if (result.success && result.customer) {
        setCustomer(result.customer);
        if (result.customer.home_address) {
          setAddress(result.customer.home_address);
        }
      }
    } catch (err) {
      console.error('顧客検索エラー:', err);
    } finally {
      setSearchingCustomer(false);
    }
  };

  const fetchCasts = async () => {
    setLoadingCasts(true);
    try {
      const result = await getTodayWorkingCasts(selectedStore);
      if (result.success) {
        setCasts(result.casts || []);
      }
    } catch (err) {
      console.error('キャスト取得エラー:', err);
    } finally {
      setLoadingCasts(false);
    }
  };

  const fetchPricePlans = async () => {
    try {
      const result = await getPricePlans(selectedStore, selectedCast?.id);
      if (result.success) {
        setPricePlans(result.plans || []);
        // 現在の時間に合う料金を自動設定
        const plan = result.plans.find((p: any) => p.duration === duration);
        if (plan) {
          setBasePrice(plan.price);
        }
      }
    } catch (err) {
      console.error('料金プラン取得エラー:', err);
    }
  };

  const fetchHotels = async () => {
    try {
      const result = await getHotels(selectedStore);
      if (result.success) {
        setHotels(result.hotels || []);
      }
    } catch (err) {
      console.error('ホテルリスト取得エラー:', err);
    }
  };

  const handleCastSelect = (cast: any) => {
    setSelectedCast(cast);
    setNominationFee(cast.nomination_fee || 0);
  };

  const handleHotelSelect = (hotelId: string) => {
    const hotel = hotels.find(h => h.id.toString() === hotelId);
    if (hotel) {
      setSelectedHotel(hotel);
      setLocationName(hotel.name);
      setAddress(hotel.address || '');
      setTransportationFee(hotel.transportation_fee || 0);
    }
  };

  const handleLocationTypeChange = (type: 'hotel' | 'home' | 'other') => {
    setLocationType(type);
    if (type === 'home' && customer?.home_address) {
      setAddress(customer.home_address);
      setLocationName('自宅');
      // 自宅の場合は自動登録された交通費を使用（ここでは0円としておく）
      setTransportationFee(0);
    } else if (type === 'hotel') {
      setLocationName('');
      setAddress('');
      setTransportationFee(0);
    } else {
      setLocationName('');
      setAddress('');
      setTransportationFee(0);
    }
  };

  const totalPrice = calculateTotalPrice(
    basePrice,
    isNomination ? nominationFee : 0,
    transportationFee,
    optionFee,
    discount
  );

  const handleSave = async (status: 'pending' | 'confirmed' = 'pending') => {
    // バリデーション
    if (!customer) {
      setError('顧客を選択してください');
      return;
    }
    if (!selectedCast) {
      setError('キャストを選択してください');
      return;
    }
    if (!startTime) {
      setError('開始時刻を入力してください');
      return;
    }
    if (!locationName) {
      setError('場所を入力してください');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const orderData = {
        order_date: orderDate,
        order_datetime: `${orderDate} ${startTime}:00`,
        store_id: selectedStore,
        customer_id: customer.id,
        cast_id: selectedCast.id,
        start_time: `${orderDate} ${startTime}:00`,
        duration,
        location_type: locationType,
        location_name: locationName,
        address,
        base_price: basePrice,
        nomination_fee: isNomination ? nominationFee : 0,
        transportation_fee: transportationFee,
        option_fee: optionFee,
        discount,
        total_price: totalPrice,
        options: [],
        memo,
        status,
        is_nomination: isNomination,
      };

      const result = await createOrUpdateOrder(orderData);
      if (result.success) {
        alert('受注を登録しました！');
        window.location.href = '/admin/customer-management/orders';
      }
    } catch (err: any) {
      setError(err.message || '受注の登録に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">新規受注作成</h1>
          <p className="text-gray-600 mt-2">受注情報を入力してください</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* 店舗選択 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">店舗選択</h2>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">店舗を選択</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>

          {/* 顧客検索 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">顧客情報</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="電話番号を入力"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  onClick={() => searchCustomer(phoneNumber)}
                  disabled={searchingCustomer}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
                >
                  {searchingCustomer ? '検索中...' : '検索'}
                </button>
              </div>
              {customer && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-semibold text-lg">{customer.name || '未登録'}</p>
                  <p className="text-sm text-gray-600">{customer.phone_number}</p>
                  <p className="text-sm text-gray-600">利用回数: {customer.total_orders || 0}回</p>
                </div>
              )}
            </div>
          </div>

          {/* 日時選択 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">日時</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">開始時刻</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* キャスト選択 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">キャスト選択</h2>
            {loadingCasts ? (
              <p className="text-gray-500">読み込み中...</p>
            ) : casts.length === 0 ? (
              <p className="text-gray-500">本日出勤のキャストがいません</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {casts.map(cast => {
                  const availableSlots = getAvailableTimeSlots(
                    cast.start_time,
                    cast.end_time,
                    cast.bookings || []
                  );
                  const isSelected = selectedCast?.id === cast.id;
                  
                  return (
                    <div
                      key={cast.id}
                      onClick={() => handleCastSelect(cast)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300 hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-bold text-lg mb-2">{cast.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">年齢: {cast.age}歳</p>
                      <p className="text-sm text-gray-600 mb-1">指名料: ¥{formatPrice(cast.nomination_fee || 0)}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        出勤: {formatTime(cast.start_time)} 〜 {formatTime(cast.end_time)}
                      </p>
                      <div className="text-xs text-gray-500">
                        {availableSlots.length > 0 ? (
                          <p className="text-green-600 font-medium">空き時間あり</p>
                        ) : (
                          <p className="text-red-600 font-medium">予約いっぱい</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {selectedCast && (
              <div className="mt-4 p-4 bg-pink-50 rounded-lg">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isNomination}
                    onChange={(e) => setIsNomination(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="font-medium">本指名 (+¥{formatPrice(nominationFee)})</span>
                </label>
              </div>
            )}
          </div>

          {/* 時間・料金 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">時間・料金</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">コース時間</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value={60}>60分</option>
                  <option value={90}>90分</option>
                  <option value={120}>120分</option>
                  <option value={150}>150分</option>
                  <option value={180}>180分</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">基本料金</label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* 場所選択 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">場所</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={() => handleLocationTypeChange('hotel')}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    locationType === 'hotel'
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ホテル
                </button>
                <button
                  onClick={() => handleLocationTypeChange('home')}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    locationType === 'home'
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  自宅
                </button>
                <button
                  onClick={() => handleLocationTypeChange('other')}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    locationType === 'other'
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  その他
                </button>
              </div>

              {locationType === 'hotel' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ホテル選択</label>
                  <select
                    value={selectedHotel?.id || ''}
                    onChange={(e) => handleHotelSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">ホテルを選択</option>
                    {hotels.map(hotel => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name} (交通費: ¥{formatPrice(hotel.transportation_fee || 0)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">場所名</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="場所名を入力"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">住所</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="住所を入力"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">交通費</label>
                <input
                  type="number"
                  value={transportationFee}
                  onChange={(e) => setTransportationFee(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* オプション・割引 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">オプション・割引</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">オプション料金</label>
                <input
                  type="number"
                  value={optionFee}
                  onChange={(e) => setOptionFee(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">割引</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* メモ */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">メモ</h2>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモを入力..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows={4}
            />
          </div>

          {/* 料金明細 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">料金明細</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>基本料金 ({formatDuration(duration)})</span>
                <span>¥{formatPrice(basePrice)}</span>
              </div>
              {isNomination && (
                <div className="flex justify-between text-pink-600">
                  <span>指名料</span>
                  <span>¥{formatPrice(nominationFee)}</span>
                </div>
              )}
              {transportationFee > 0 && (
                <div className="flex justify-between">
                  <span>交通費</span>
                  <span>¥{formatPrice(transportationFee)}</span>
                </div>
              )}
              {optionFee > 0 && (
                <div className="flex justify-between">
                  <span>オプション料金</span>
                  <span>¥{formatPrice(optionFee)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>割引</span>
                  <span>-¥{formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold text-pink-600">
                  <span>合計</span>
                  <span>¥{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex gap-4">
            <button
              onClick={() => handleSave('pending')}
              disabled={saving}
              className="flex-1 py-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 font-bold text-lg transition-colors"
            >
              {saving ? '保存中...' : '下書き保存'}
            </button>
            <button
              onClick={() => handleSave('confirmed')}
              disabled={saving}
              className="flex-1 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-bold text-lg transition-colors"
            >
              {saving ? '保存中...' : '確定して保存'}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/admin/customer-management/orders"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              キャンセルして戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderNewPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">読み込み中...</div>}>
      <OrderFormContent />
    </Suspense>
  );
}
