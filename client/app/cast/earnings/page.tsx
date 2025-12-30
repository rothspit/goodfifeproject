'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiUser,
} from 'react-icons/fi';
import { castMemberApi } from '@/lib/api';

interface EarningDetail {
  id: number;
  reservation_date: string;
  start_time: string;
  duration: number;
  course: string;
  total_price: number;
  cast_earning: number;
  back_rate: number;
  customer_name: string;
  status?: string;
}

interface DailySummary {
  total_revenue: number;
  total_earnings: number;
  reservation_count: number;
}

export default function CastEarningsPage() {
  const router = useRouter();
  const [cast, setCast] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [summary, setSummary] = useState<DailySummary>({
    total_revenue: 0,
    total_earnings: 0,
    reservation_count: 0,
  });
  const [details, setDetails] = useState<EarningDetail[]>([]);
  const [backRate, setBackRate] = useState<number>(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 認証チェック
    const castStr = localStorage.getItem('cast');
    const token = localStorage.getItem('cast_token');

    if (!castStr || !token) {
      router.push('/cast/login');
      return;
    }

    try {
      const castData = JSON.parse(castStr);
      setCast(castData);

      // 今日の日付を設定
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      fetchEarnings(today);
    } catch (error) {
      console.error('キャストデータ解析エラー:', error);
      router.push('/cast/login');
    }
  }, []);

  const fetchEarnings = async (date: string) => {
    setLoading(true);
    try {
      const response = await castMemberApi.getDailyEarnings(date);
      const data = response.data;

      setSummary(data.summary);
      setDetails(data.details);
      setBackRate(data.back_rate);
    } catch (error) {
      console.error('精算明細取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchEarnings(newDate);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM形式
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/cast/mypage"
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
            >
              <FiArrowLeft size={24} />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">精算明細</h1>
              <p className="text-green-100 text-sm">
                {cast?.name}さんの売上確認
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 日付選択 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <FiCalendar className="text-green-600" size={24} />
            <label className="font-bold text-gray-800">精算日</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <p className="text-sm text-gray-600 mt-3">
            ※ 営業日は朝8時〜翌朝8時までです。深夜0時〜8時の予約は前日扱いとなります。
          </p>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 総売上 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <FiDollarSign size={32} />
              <h3 className="text-lg font-bold">総売上</h3>
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(summary.total_revenue)}
            </p>
          </div>

          {/* あなたの取り分 */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <FiTrendingUp size={32} />
              <h3 className="text-lg font-bold">あなたの取り分</h3>
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(summary.total_earnings)}
            </p>
            <p className="text-sm text-green-100 mt-1">
              バック率: {backRate}%
            </p>
          </div>

          {/* 予約件数 */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <FiUser size={32} />
              <h3 className="text-lg font-bold">予約件数</h3>
            </div>
            <p className="text-3xl font-bold">{summary.reservation_count}件</p>
          </div>
        </div>

        {/* 明細一覧 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            予約明細
          </h2>

          {details.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                この日の予約はまだありません
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {details.map((detail) => (
                <div
                  key={detail.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:bg-green-50 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FiClock className="text-gray-500" />
                        <span className="font-bold text-gray-800">
                          {formatTime(detail.start_time)} ({detail.duration}分)
                        </span>
                      </div>
                      <p className="text-gray-600">{detail.course}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        お客様: {detail.customer_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">売上</p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(detail.total_price)}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        取り分: {formatCurrency(detail.cast_earning)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        バック率: {detail.back_rate}%
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          detail.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {detail.status === 'completed' ? '完了' : '確定済み'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 月間サマリーへのリンク */}
        <div className="mt-6 text-center">
          <Link
            href="/cast/earnings/monthly"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-bold"
          >
            <FiCalendar />
            月間売上を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
