'use client';

import { useState, useEffect } from 'react';
import { reservationAPI } from '../lib/api';
import type { Reservation } from '../types';

export default function ReservationManagement() {
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateReservations, setDateReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTodayReservations();
  }, []);

  const loadTodayReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationAPI.getToday();
      setTodayReservations(data);
    } catch (err: any) {
      setError('予約データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadDateReservations = async (date: string) => {
    if (!date) return;
    setLoading(true);
    try {
      const data = await reservationAPI.getByDate(date);
      setDateReservations(data);
    } catch (err: any) {
      setError('予約データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    loadDateReservations(date);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:mm format
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '保留';
      case 'confirmed': return '確定';
      case 'completed': return '完了';
      case 'cancelled': return 'キャンセル';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalSales = (reservations: Reservation[]) => {
    return reservations
      .filter(r => r.order_status !== 'cancelled')
      .reduce((sum, r) => sum + r.total_price, 0);
  };

  const ReservationTable = ({ reservations, title }: { reservations: Reservation[], title: string }) => (
    <div className="dashboard-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="text-right">
          <p className="text-sm text-gray-500">予約件数</p>
          <p className="text-2xl font-bold">{reservations.length}件</p>
          <p className="text-sm text-gray-500 mt-1">売上合計</p>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(calculateTotalSales(reservations))}
          </p>
        </div>
      </div>

      {reservations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  時間
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  店舗
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  顧客
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  キャスト
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  場所
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  コース
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  金額
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  状態
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {formatTime(reservation.start_time)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {reservation.store?.name || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div>
                      <p className="font-medium">{reservation.customer?.name || '-'}</p>
                      <p className="text-gray-500 text-xs">
                        {reservation.customer?.phone_number || '-'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {reservation.cast?.display_name || '指名なし'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {reservation.location}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {reservation.duration}分
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {formatCurrency(reservation.total_price)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className={`badge ${getStatusColor(reservation.order_status)}`}>
                      {getStatusLabel(reservation.order_status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          予約がありません
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Today's Reservations */}
      <ReservationTable 
        reservations={todayReservations} 
        title={`本日の予約 (${new Date().toLocaleDateString('ja-JP')})`}
      />

      {/* Date Selector for Other Dates */}
      <div className="dashboard-card">
        <h2 className="text-xl font-bold mb-4">別の日の予約を確認</h2>
        <div className="flex gap-4 items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="input-field"
          />
          {selectedDate && (
            <button
              onClick={() => {
                setSelectedDate('');
                setDateReservations([]);
              }}
              className="btn-secondary"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* Selected Date Reservations */}
      {selectedDate && (
        <ReservationTable 
          reservations={dateReservations} 
          title={`${new Date(selectedDate).toLocaleDateString('ja-JP')}の予約`}
        />
      )}

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      )}
    </div>
  );
}
