'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiCalendar, FiClock, FiSave, FiX } from 'react-icons/fi';

interface ScheduleEntry {
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface DaySchedule {
  date: Date;
  dayOfWeek: string;
  isToday: boolean;
  schedules: ScheduleEntry[];
}

export default function CastSchedulePage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('18:00');
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  // 認証チェック
  useEffect(() => {
    const castToken = localStorage.getItem('cast_token');
    const castData = localStorage.getItem('cast');
    
    if (!castToken || !castData) {
      router.push('/cast/login');
    }
  }, [router]);

  // カレンダーの日付を生成
  const generateCalendar = (): DaySchedule[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: DaySchedule[] = [];
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

    for (let date = firstDay; date <= lastDay; date.setDate(date.getDate() + 1)) {
      const currentDateObj = new Date(date);
      const dateString = formatDate(currentDateObj);
      const daySchedules = schedules.filter(s => s.date === dateString);

      days.push({
        date: new Date(currentDateObj),
        dayOfWeek: dayOfWeek[currentDateObj.getDay()],
        isToday: currentDateObj.getTime() === today.getTime(),
        schedules: daySchedules,
      });
    }

    return days;
  };

  // 日付フォーマット (YYYY-MM-DD)
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 月の切り替え
  const changeMonth = (delta: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  // 日付選択
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowTimeModal(true);
  };

  // スケジュール追加
  const handleAddSchedule = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const dateString = formatDate(selectedDate);
      
      // ここで実際のAPIコールを行う
      // const response = await castApi.addSchedule({
      //   date: dateString,
      //   startTime,
      //   endTime,
      // });

      // 仮のデータ追加（実際はAPI応答を使用）
      const newSchedule: ScheduleEntry = {
        date: dateString,
        startTime,
        endTime,
        status: 'pending',
      };

      setSchedules(prev => [...prev, newSchedule]);
      setShowTimeModal(false);
      setSelectedDate(null);
      
      alert('出勤申請を送信しました');
    } catch (error) {
      console.error('スケジュール追加エラー:', error);
      alert('出勤申請に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // スケジュール削除
  const handleDeleteSchedule = (dateString: string, time: string) => {
    if (confirm('このスケジュールを削除しますか？')) {
      setSchedules(prev => 
        prev.filter(s => !(s.date === dateString && s.startTime === time))
      );
    }
  };

  // 時間選択のオプション生成
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const calendar = generateCalendar();
  const timeOptions = generateTimeOptions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/cast/mypage"
              className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <FiArrowLeft size={20} />
              <span className="font-medium">マイページへ戻る</span>
            </Link>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              出勤申請
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 月選択 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              前月
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              翌月
            </button>
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-2">
            {/* 曜日ヘッダー */}
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <div
                key={day}
                className={`text-center font-bold py-2 ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
                }`}
              >
                {day}
              </div>
            ))}

            {/* 前月の空白 */}
            {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24"></div>
            ))}

            {/* 日付セル */}
            {calendar.map((day) => {
              const hasSchedule = day.schedules.length > 0;
              const isPast = day.date < new Date(new Date().setHours(0, 0, 0, 0));
              
              return (
                <div
                  key={day.date.toISOString()}
                  onClick={() => !isPast && handleDateClick(day.date)}
                  className={`
                    border rounded-lg p-2 min-h-24 cursor-pointer transition-all
                    ${day.isToday ? 'border-pink-500 border-2 bg-pink-50' : 'border-gray-200'}
                    ${isPast ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-pink-300 hover:shadow-md'}
                    ${hasSchedule ? 'bg-purple-50' : 'bg-white'}
                  `}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    day.date.getDay() === 0 ? 'text-red-500' :
                    day.date.getDay() === 6 ? 'text-blue-500' :
                    'text-gray-700'
                  }`}>
                    {day.date.getDate()}
                  </div>
                  
                  {/* スケジュール表示 */}
                  <div className="space-y-1">
                    {day.schedules.map((schedule, index) => (
                      <div
                        key={index}
                        className={`text-xs px-2 py-1 rounded flex items-center justify-between group ${
                          schedule.status === 'approved' ? 'bg-green-100 text-green-700' :
                          schedule.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        <div className="flex items-center gap-1 flex-1">
                          <FiClock size={10} />
                          <span className="truncate">
                            {schedule.startTime}-{schedule.endTime}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSchedule(schedule.date, schedule.startTime);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX size={12} className="text-red-500 hover:text-red-700" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 凡例 */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">凡例</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-sm text-gray-600">申請中</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-sm text-gray-600">承認済み</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-sm text-gray-600">却下</span>
            </div>
          </div>
        </div>
      </div>

      {/* 時間入力モーダル */}
      {showTimeModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiCalendar className="text-pink-500" />
                {formatDate(selectedDate)}の時間設定
              </h3>
              <button
                onClick={() => setShowTimeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 開始時間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始時間
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* 終了時間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了時間
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* 追加ボタン */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTimeModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddSchedule}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiSave />
                  {loading ? '送信中...' : '申請する'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
