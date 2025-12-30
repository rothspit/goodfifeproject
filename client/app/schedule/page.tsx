'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { castApi } from '@/lib/api';
import type { Cast } from '@/types';
import { FiClock, FiCalendar, FiSearch } from 'react-icons/fi';

interface ScheduledCast extends Cast {
  schedule_start_time?: string;
  schedule_end_time?: string;
  schedule_status?: string;
}

export default function SchedulePage() {
  const [scheduledCasts, setScheduledCasts] = useState<ScheduledCast[]>([]);
  const [filteredCasts, setFilteredCasts] = useState<ScheduledCast[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [weekDates, setWeekDates] = useState<{date: string; dayOfWeek: string; dayLabel: string}[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    ageMin: '',
    ageMax: '',
    cupSize: '',
    timeSlot: '',
  });

  useEffect(() => {
    initializeDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchScheduledCasts();
    }
  }, [selectedDate]);

  const initializeDates = () => {
    const today = new Date();
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
      const dateStr = date.toISOString().split('T')[0];
      const [year, month, day] = dateStr.split('-');
      const dayLabel = i === 0 ? '本日' : `${parseInt(month)}/${parseInt(day)}`;
      
      dates.push({
        date: dateStr,
        dayOfWeek,
        dayLabel: i === 0 ? '本日\n(水)' : dayLabel,
      });
    }
    
    setWeekDates(dates);
    setSelectedDate(dates[0].date); // Select today by default
  };

  const fetchScheduledCasts = async () => {
    setLoading(true);
    try {
      const response = await castApi.getCasts({ date: selectedDate });
      const casts = response.data.casts || [];
      
      // Filter casts that have schedules for the selected date
      const castsWithSchedule = casts.filter((cast: ScheduledCast) => {
        if (cast.schedules && cast.schedules.length > 0) {
          return cast.schedules.some(schedule => schedule.date === selectedDate);
        }
        return false;
      });

      // Add schedule info to each cast
      const enrichedCasts = castsWithSchedule.map((cast: ScheduledCast) => {
        const todaySchedule = cast.schedules?.find(s => s.date === selectedDate);
        return {
          ...cast,
          schedule_start_time: todaySchedule?.start_time,
          schedule_end_time: todaySchedule?.end_time,
          schedule_status: todaySchedule?.is_available ? 'available' : 'waiting',
        };
      });

      // Sort by start time
      enrichedCasts.sort((a: ScheduledCast, b: ScheduledCast) => {
        const timeA = a.schedule_start_time || '99:99';
        const timeB = b.schedule_start_time || '99:99';
        return timeA.localeCompare(timeB);
      });

      setScheduledCasts(enrichedCasts);
      setFilteredCasts(enrichedCasts);
    } catch (error) {
      console.error('出勤予定取得エラー:', error);
      setScheduledCasts([]);
      setFilteredCasts([]);
    } finally {
      setLoading(false);
    }
  };

  // 絞り込み検索
  const handleFilterChange = (key: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    let filtered = [...scheduledCasts];

    // 名前検索
    if (searchFilters.name) {
      filtered = filtered.filter(cast => 
        cast.name.toLowerCase().includes(searchFilters.name.toLowerCase())
      );
    }

    // 年齢検索
    if (searchFilters.ageMin) {
      filtered = filtered.filter(cast => cast.age >= parseInt(searchFilters.ageMin));
    }
    if (searchFilters.ageMax) {
      filtered = filtered.filter(cast => cast.age <= parseInt(searchFilters.ageMax));
    }

    // カップサイズ検索
    if (searchFilters.cupSize) {
      filtered = filtered.filter(cast => cast.cup_size === searchFilters.cupSize);
    }

    // 時間帯検索
    if (searchFilters.timeSlot) {
      const [startHour] = searchFilters.timeSlot.split('-').map(Number);
      filtered = filtered.filter(cast => {
        if (!cast.schedule_start_time) return false;
        const [castHour] = cast.schedule_start_time.split(':').map(Number);
        return castHour >= startHour && castHour < startHour + 3;
      });
    }

    setFilteredCasts(filtered);
  };

  const resetFilters = () => {
    setSearchFilters({
      name: '',
      ageMin: '',
      ageMax: '',
      cupSize: '',
      timeSlot: '',
    });
    setFilteredCasts(scheduledCasts);
  };

  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5); // HH:MM format
  };

  const getStatusBadge = (cast: ScheduledCast) => {
    if (cast.schedule_status === 'waiting') {
      return <span className="text-xs text-orange-600 font-bold">待機中</span>;
    }
    
    const now = new Date();
    const [hours, minutes] = (cast.schedule_start_time || '').split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);
    
    const diffMs = startTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours <= 0) {
      return <span className="text-xs text-red-600 font-bold">出勤中</span>;
    } else if (diffHours <= 1) {
      return <span className="text-xs text-pink-600 font-bold">まもなく出勤</span>;
    }
    
    return <span className="text-xs text-green-600 font-bold">次回01:00〜</span>;
  };

  const getNextAvailableTime = (cast: ScheduledCast) => {
    const now = new Date();
    const [hours, minutes] = (cast.schedule_start_time || '').split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);
    
    if (startTime > now) {
      return `次回${formatTime(cast.schedule_start_time)}〜`;
    }
    return '出勤中';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-6 pb-32 md:pb-8">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">週間出勤予定</h1>
          <p className="text-yellow-100">今週の出勤スケジュール</p>
        </div>

        {/* 日付タブ */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-x-auto">
          <div className="flex">
            <button
              className="flex-1 min-w-[100px] py-4 px-2 text-center font-bold bg-yellow-500 text-white border-r border-yellow-600"
            >
              日付で見る
            </button>
            <button
              className="flex-1 min-w-[100px] py-4 px-2 text-center font-medium text-gray-600 hover:bg-gray-50 border-r border-gray-200"
            >
              月間で見る
            </button>
          </div>
        </div>

        {/* 週間カレンダー */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
            {weekDates.map((dateInfo, index) => {
              const isToday = index === 0;
              const isSelected = dateInfo.date === selectedDate;
              
              return (
                <button
                  key={dateInfo.date}
                  onClick={() => setSelectedDate(dateInfo.date)}
                  className={`flex-shrink-0 w-20 py-3 rounded-lg font-bold transition-all text-center ${
                    isSelected
                      ? isToday
                        ? 'bg-yellow-500 text-white shadow-lg'
                        : 'bg-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-sm whitespace-pre-line">{dateInfo.dayLabel}</div>
                  {index > 0 && <div className="text-xs mt-1">({dateInfo.dayOfWeek})</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 絞り込み検索 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FiSearch className="mr-2 text-pink-600" />
            絞り込み検索
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 名前検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
              <input
                type="text"
                value={searchFilters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="名前で検索"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* 年齢検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年齢</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={searchFilters.ageMin}
                  onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                  placeholder="下限"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <span className="text-gray-500">〜</span>
                <input
                  type="number"
                  value={searchFilters.ageMax}
                  onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                  placeholder="上限"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* カップサイズ検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">カップ</label>
              <select
                value={searchFilters.cupSize}
                onChange={(e) => handleFilterChange('cupSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">全て</option>
                <option value="A">Aカップ</option>
                <option value="B">Bカップ</option>
                <option value="C">Cカップ</option>
                <option value="D">Dカップ</option>
                <option value="E">Eカップ</option>
                <option value="F">Fカップ</option>
                <option value="G">Gカップ</option>
              </select>
            </div>

            {/* 時間帯検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">出勤時間</label>
              <select
                value={searchFilters.timeSlot}
                onChange={(e) => handleFilterChange('timeSlot', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">全ての時間</option>
                <option value="9-12">9:00〜12:00</option>
                <option value="12-15">12:00〜15:00</option>
                <option value="15-18">15:00〜18:00</option>
                <option value="18-21">18:00〜21:00</option>
                <option value="21-24">21:00〜24:00</option>
                <option value="0-3">0:00〜3:00</option>
              </select>
            </div>

            {/* 検索ボタン */}
            <div className="flex items-end gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:from-pink-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                検索
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                リセット
              </button>
            </div>
          </div>
        </div>

        {/* 出勤予定一覧ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            出勤予定一覧
          </h2>
          <div className="text-gray-600">
            全 <span className="text-pink-600 font-bold text-lg">{filteredCasts.length}</span> 名
            {filteredCasts.length !== scheduledCasts.length && (
              <span className="text-sm text-gray-500 ml-2">
                （{scheduledCasts.length}名中）
              </span>
            )}
          </div>
        </div>

        {/* 出勤予定一覧 */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : filteredCasts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCasts.map((cast) => (
              <Link
                key={cast.id}
                href={`/casts/${cast.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                {/* ステータスバッジ */}
                <div className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    {getStatusBadge(cast)}
                  </div>
                  <div className="absolute top-2 right-2 z-10 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                    {getNextAvailableTime(cast)}
                  </div>
                </div>

                {/* 画像 */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-pink-200 to-purple-200">
                  <img
                    src={cast.primary_image || `https://placehold.co/390x520/FFB6C1/000000?text=${encodeURIComponent(cast.name)}`}
                    alt={cast.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://placehold.co/390x520/FFB6C1/000000?text=${encodeURIComponent(cast.name)}`;
                    }}
                  />
                  {cast.is_new && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-md text-xs font-bold">
                      NEW
                    </div>
                  )}
                </div>

                {/* 情報 */}
                <div className="p-4">
                  {/* 出勤時間 */}
                  <div className="flex items-center gap-2 mb-2 text-pink-600">
                    <FiClock className="flex-shrink-0" />
                    <span className="font-bold text-sm">
                      {formatTime(cast.schedule_start_time)}〜{formatTime(cast.schedule_end_time)}
                    </span>
                  </div>

                  {/* 名前 */}
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{cast.name}</h3>
                  
                  {/* 基本情報 */}
                  <p className="text-sm text-gray-600 mb-2">
                    {cast.age}歳 / T{cast.height || '---'} / {cast.cup_size || '-'}カップ
                  </p>

                  {/* スリーサイズ */}
                  <p className="text-xs text-gray-500">
                    T{cast.height || '--'}(B{cast.bust || '--'}・W{cast.waist || '--'}・H{cast.hip || '--'})
                  </p>

                  {/* オプションアイコン */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {cast.threesome_ok && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">3P</span>
                    )}
                    {cast.home_visit_ok && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">自宅</span>
                    )}
                    {cast.overnight_ok && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">お泊</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">本日の出勤予定はありません</h3>
            <p className="text-gray-600 mb-6">別の日付をお選びください</p>
          </div>
        )}
      </div>
    </div>
  );
}
