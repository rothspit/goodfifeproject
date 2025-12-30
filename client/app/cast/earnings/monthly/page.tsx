'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiDollarSign,
  FiCalendar,
  FiTrendingUp,
  FiBarChart2,
} from 'react-icons/fi';
import { castMemberApi } from '@/lib/api';

interface DailyEarning {
  date: string;
  reservation_count: number;
  total_revenue: number;
  earnings: number;
}

interface MonthlySummary {
  total_revenue: number;
  total_earnings: number;
  total_reservations: number;
  working_days: number;
}

export default function MonthlyEarningsPage() {
  const router = useRouter();
  const [cast, setCast] = useState<any>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [summary, setSummary] = useState<MonthlySummary>({
    total_revenue: 0,
    total_earnings: 0,
    total_reservations: 0,
    working_days: 0,
  });
  const [dailyEarnings, setDailyEarnings] = useState<DailyEarning[]>([]);
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
      fetchMonthlyEarnings(year, month);
    } catch (error) {
      console.error('キャストデータ解析エラー:', error);
      router.push('/cast/login');
    }
  }, []);

  const fetchMonthlyEarnings = async (y: number, m: number) => {
    setLoading(true);
    try {
      const response = await castMemberApi.getMonthlyEarnings(y, m);
      const data = response.data;

      setSummary(data.summary);
      setDailyEarnings(data.daily_earnings);
      setBackRate(data.back_rate);
    } catch (error) {
      console.error('月間精算取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    let newYear = year;
    let newMonth = month;

    if (direction === 'prev') {
      newMonth -= 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
    } else {
      newMonth += 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
    }

    setYear(newYear);
    setMonth(newMonth);
    fetchMonthlyEarnings(newYear, newMonth);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getWeekday = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return weekdays[date.getDay()];
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
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/cast/earnings"
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
            >
              <FiArrowLeft size={24} />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">月間売上</h1>
              <p className="text-emerald-100 text-sm">
                {cast?.name}さんの月間集計
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 月選択 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleMonthChange('prev')}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-bold transition-all"
            >
              ← 前月
            </button>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">
                {year}年{month}月
              </p>
            </div>
            <button
              onClick={() => handleMonthChange('next')}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-bold transition-all"
            >
              翌月 →
            </button>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 月間総売上 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <FiDollarSign size={24} />
              <h3 className="text-sm font-bold">月間総売上</h3>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.total_revenue)}
            </p>
          </div>

          {/* 月間取り分 */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <FiTrendingUp size={24} />
              <h3 className="text-sm font-bold">月間取り分</h3>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.total_earnings)}
            </p>
            <p className="text-xs text-emerald-100 mt-1">
              バック率: {backRate}%
            </p>
          </div>

          {/* 総予約件数 */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <FiBarChart2 size={24} />
              <h3 className="text-sm font-bold">総予約件数</h3>
            </div>
            <p className="text-2xl font-bold">
              {summary.total_reservations}件
            </p>
          </div>

          {/* 出勤日数 */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <FiCalendar size={24} />
              <h3 className="text-sm font-bold">出勤日数</h3>
            </div>
            <p className="text-2xl font-bold">{summary.working_days}日</p>
          </div>
        </div>

        {/* 日別売上一覧 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiBarChart2 />
            日別売上
          </h2>

          {dailyEarnings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                この月の売上データはまだありません
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">
                      日付
                    </th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700">
                      曜日
                    </th>
                    <th className="text-right py-3 px-4 font-bold text-gray-700">
                      予約数
                    </th>
                    <th className="text-right py-3 px-4 font-bold text-gray-700">
                      売上
                    </th>
                    <th className="text-right py-3 px-4 font-bold text-gray-700">
                      取り分
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyEarnings.map((day) => (
                    <tr
                      key={day.date}
                      className="border-b border-gray-100 hover:bg-emerald-50 transition-all"
                    >
                      <td className="py-4 px-4 font-bold text-gray-800">
                        {formatDate(day.date)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                            getWeekday(day.date) === '土'
                              ? 'bg-blue-100 text-blue-800'
                              : getWeekday(day.date) === '日'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {getWeekday(day.date)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-700">
                        {day.reservation_count}件
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-gray-800">
                        {formatCurrency(day.total_revenue)}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-green-600">
                        {formatCurrency(day.earnings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 日別明細へのリンク */}
        <div className="mt-6 text-center">
          <Link
            href="/cast/earnings"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold"
          >
            <FiCalendar />
            日別明細を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
