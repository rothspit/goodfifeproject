'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { scheduleApi, castApi } from '@/lib/api';
import { FiClock } from 'react-icons/fi';

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

interface WeeklyScheduleProps {
  className?: string;
}

export default function WeeklySchedule({ className = '' }: WeeklyScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [schedules, setSchedules] = useState<CastSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 今日から7日分の日付を生成
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
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
      const response = await castApi.getCasts({ date });
      const casts = response.data.casts || [];
      
      // キャストのスケジュール情報を抽出
      const schedulesData: CastSchedule[] = [];
      casts.forEach((cast: any) => {
        if (cast.schedules && cast.schedules.length > 0) {
          cast.schedules.forEach((schedule: any) => {
            if (schedule.date === date) {
              schedulesData.push({
                id: schedule.id || cast.id,
                cast_id: cast.id,
                cast_name: cast.name,
                cast_age: cast.age,
                cast_image: cast.primary_image || '',
                start_time: schedule.start_time,
                end_time: schedule.end_time,
                date: schedule.date,
                schedule_date: schedule.date,
                cast_height: cast.height,
                cast_bust: cast.bust,
                cast_waist: cast.waist,
                cast_hip: cast.hip,
              });
            }
          });
        }
      });
      
      setSchedules(schedulesData);
    } catch (error) {
      console.error('スケジュール取得エラー:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`${className}`}>
      <div className="container mx-auto px-4">
        {/* タイトル */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 py-3 px-6 rounded-t-xl">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center">
            週間出勤予定
          </h2>
        </div>

        {/* 日付タブ - リキッドデザイン */}
        <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
          <div className="flex justify-center gap-2 overflow-x-auto scrollbar-hide">
            {weekDates.map((date, index) => {
              const dateStr = formatDate(date);
              const isSelected = dateStr === selectedDate;
              const isTodayDate = isToday(date);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex-shrink-0 px-5 py-4 min-w-[90px] rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    isSelected
                      ? 'bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 text-white font-bold shadow-xl scale-105'
                      : isTodayDate
                      ? 'bg-gradient-to-br from-amber-300 via-yellow-300 to-orange-300 text-gray-800 font-semibold shadow-lg'
                      : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white shadow-md hover:shadow-lg'
                  }`}
                  style={{
                    boxShadow: isSelected 
                      ? '0 10px 40px -10px rgba(236, 72, 153, 0.5)' 
                      : isTodayDate
                      ? '0 8px 30px -8px rgba(251, 191, 36, 0.5)'
                      : undefined
                  }}
                >
                  <div className="text-center mx-auto">
                    {isTodayDate && !isSelected && (
                      <div className="text-xs mb-1 font-bold animate-pulse">本日</div>
                    )}
                    {isSelected && (
                      <div className="text-xs mb-1 font-bold">✓ 選択中</div>
                    )}
                    <div className="text-base font-bold">
                      {date.getMonth() + 1}/{date.getDate()}
                    </div>
                    <div className="text-xs mt-1 opacity-90">
                      ({getWeekdayLabel(date)})
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* キャスト一覧 */}
        <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl p-4 md:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
            </div>
          ) : schedules.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {schedules.map((schedule) => (
                <Link
                  key={schedule.id}
                  href={`/casts/${schedule.cast_id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-200"
                >
                  {/* キャスト画像 */}
                  <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
                    <img
                      src={
                        schedule.cast_image ||
                        `https://placehold.co/390x520/FFB6C1/FFFFFF?text=${encodeURIComponent(
                          schedule.cast_name
                        )}`
                      }
                      alt={schedule.cast_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/390x520/FFB6C1/FFFFFF?text=${encodeURIComponent(
                          schedule.cast_name
                        )}`;
                      }}
                    />
                    {/* 出勤時間オーバーレイ */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                      <FiClock size={12} />
                      <span>
                        {schedule.start_time?.slice(0, 5)} 〜 {schedule.end_time?.slice(0, 5)}
                      </span>
                    </div>
                  </div>

                  {/* キャスト情報 */}
                  <div className="p-3">
                    <h3 className="text-base font-bold text-gray-800 mb-1 truncate">
                      {schedule.cast_name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {schedule.cast_age}歳
                      {schedule.cast_height && ` / ${schedule.cast_height}cm`}
                    </p>
                    {(schedule.cast_bust || schedule.cast_waist || schedule.cast_hip) && (
                      <p className="text-xs text-gray-500">
                        T{schedule.cast_bust || '---'} / W{schedule.cast_waist || '---'} / H
                        {schedule.cast_hip || '---'}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">この日の出勤予定はありません</p>
            </div>
          )}
        </div>

        {/* 一覧表示リンク */}
        <div className="text-center mt-6">
          <Link
            href="/schedules"
            className="inline-block bg-amber-500 text-white px-8 py-3 rounded-full font-bold hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl"
          >
            一覧表示する
          </Link>
        </div>
      </div>
    </section>
  );
}
