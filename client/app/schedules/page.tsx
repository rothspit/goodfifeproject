'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { scheduleApi } from '@/lib/api';
import { FiClock, FiCalendar } from 'react-icons/fi';

interface CastSchedule {
  id: number;
  cast_id: number;
  cast_name: string;
  cast_age: number;
  cast_image: string;
  start_time: string;
  end_time: string;
  date: string;
  schedule_date: string;
  cast_height?: number;
  cast_bust?: number;
  cast_waist?: number;
  cast_hip?: number;
}

export default function SchedulesPage() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [schedules, setSchedules] = useState<CastSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 今日から30日分の日付を生成
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    setWeekDates(dates);

    // 初期選択は今日
    const todayStr = formatDate(today);
    setSelectedDate(todayStr);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSchedules(selectedDate);
    }
  }, [selectedDate]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekdayLabel = (date: Date): string => {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return weekdays[date.getDay()];
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const fetchSchedules = async (date: string) => {
    setLoading(true);
    try {
      const response = await scheduleApi.getSchedules({ date });
      setSchedules(response.data.schedules || []);
    } catch (error) {
      console.error('スケジュール取得エラー:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Header />

      {/* スペーサー（ヘッダー分） */}
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-8">
        {/* ページタイトル */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
            <FiCalendar className="text-primary-600" />
            出勤スケジュール一覧
          </h1>
          <p className="text-gray-600 mt-2">
            キャストの出勤予定をご確認いただけます
          </p>
        </div>

        {/* カレンダー風日付選択 */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, index) => {
              const dateStr = formatDate(date);
              const isSelected = dateStr === selectedDate;
              const isTodayDate = isToday(date);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-3 rounded-lg transition-all text-center ${
                    isSelected
                      ? 'bg-primary-600 text-white shadow-lg scale-105'
                      : isTodayDate
                      ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-xs mb-1">
                    {date.getMonth() + 1}/{date.getDate()}
                  </div>
                  <div className="text-xs font-semibold">
                    ({getWeekdayLabel(date)})
                  </div>
                  {isTodayDate && !isSelected && (
                    <div className="text-[10px] mt-1 text-primary-600 font-bold">
                      今日
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 選択日表示 */}
        <div className="bg-gradient-to-r from-primary-500 to-pink-500 text-white rounded-lg p-4 mb-6 text-center">
          <h2 className="text-xl md:text-2xl font-bold">
            {selectedDate && new Date(selectedDate).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
            の出勤スケジュール
          </h2>
        </div>

        {/* キャスト一覧 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : schedules.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {schedules.map((schedule) => (
              <Link
                key={schedule.id}
                href={`/casts/${schedule.cast_id}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-200"
              >
                {/* キャスト画像 */}
                <div className="relative h-56 bg-gradient-to-br from-pink-100 to-purple-100">
                  <img
                    src={
                      schedule.cast_image ||
                      `https://via.placeholder.com/300x400/FFB6C1/000000?text=${encodeURIComponent(
                        schedule.cast_name
                      )}`
                    }
                    alt={schedule.cast_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/300x400/FFB6C1/000000?text=${encodeURIComponent(
                        schedule.cast_name
                      )}`;
                    }}
                  />
                  {/* 出勤時間バッジ */}
                  <div className="absolute top-3 left-3 bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg">
                    <FiClock size={16} />
                    <span>
                      {schedule.start_time?.slice(0, 5)} 〜 {schedule.end_time?.slice(0, 5)}
                    </span>
                  </div>
                </div>

                {/* キャスト情報 */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">
                    {schedule.cast_name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{schedule.cast_age}歳</p>
                    {schedule.cast_height && <p>身長: {schedule.cast_height}cm</p>}
                    {(schedule.cast_bust || schedule.cast_waist || schedule.cast_hip) && (
                      <p className="text-xs">
                        T{schedule.cast_bust || '---'} / W{schedule.cast_waist || '---'} / H
                        {schedule.cast_hip || '---'}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FiCalendar className="text-gray-300 text-6xl mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              この日の出勤予定はありません
            </p>
            <p className="text-gray-400 text-sm mt-2">
              他の日付をお選びください
            </p>
          </div>
        )}
      </div>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-bold mb-2">人妻の蜜</p>
          <p className="text-sm text-gray-400">〒273-0031 千葉県船橋市西船橋</p>
          <p className="text-sm text-gray-400 mt-4">© 2024 人妻の蜜. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
