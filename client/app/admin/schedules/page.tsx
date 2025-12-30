'use client';

import { useState, useEffect } from 'react';
import { scheduleApi, castApi } from '@/lib/api';

interface Cast {
  id: number;
  name: string;
}

interface Schedule {
  id: number;
  cast_id: number;
  cast_name: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: number;
  created_at: string;
}

export default function ScheduleManagementPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ castId: number; date: string } | null>(null);

  // フィルター - 週の開始日
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 0 : -dayOfWeek; // 日曜日を週の始まりに
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + diff);
    return startDate.toISOString().split('T')[0];
  });

  // 単一スケジュール登録用
  const [formData, setFormData] = useState({
    cast_id: '',
    date: '',
    start_time: '10:00',
    end_time: '18:00',
    is_available: true,
  });

  // 一括登録用
  const [bulkFormData, setBulkFormData] = useState({
    cast_ids: [] as string[],
    start_date: '',
    end_date: '',
    start_time: '10:00',
    end_time: '18:00',
    weekdays: [true, true, true, true, true, true, true],
  });

  useEffect(() => {
    fetchCasts();
  }, []);

  useEffect(() => {
    if (casts.length > 0) {
      fetchSchedules();
    }
  }, [weekStartDate, casts]);

  const fetchCasts = async () => {
    try {
      const response = await castApi.getCasts();
      setCasts(response.data.casts || []);
    } catch (error) {
      console.error('キャスト取得エラー:', error);
      alert('キャストの取得に失敗しました');
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const startDate = new Date(weekStartDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // 7日間

      const params = {
        start_date: weekStartDate,
        end_date: endDate.toISOString().split('T')[0],
      };

      const response = await scheduleApi.getAllSchedules(params);
      setSchedules(response.data.schedules || []);
    } catch (error) {
      console.error('スケジュール取得エラー:', error);
      alert('スケジュールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSchedule) {
        await scheduleApi.updateSchedule(editingSchedule.id, {
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          is_available: formData.is_available,
        });
        alert('スケジュールを更新しました');
      } else {
        await scheduleApi.createSchedule({
          cast_id: parseInt(formData.cast_id),
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          is_available: formData.is_available,
        });
        alert('スケジュールを登録しました');
      }

      setIsModalOpen(false);
      setEditingSchedule(null);
      setSelectedCell(null);
      resetForm();
      fetchSchedules();
    } catch (error: any) {
      console.error('スケジュール登録エラー:', error);
      alert(error.response?.data?.message || 'スケジュールの登録に失敗しました');
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bulkFormData.cast_ids.length === 0) {
      alert('キャストを選択してください');
      return;
    }

    try {
      const schedules: any[] = [];
      const startDate = new Date(bulkFormData.start_date);
      const endDate = new Date(bulkFormData.end_date);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (bulkFormData.weekdays[dayOfWeek]) {
          const dateStr = d.toISOString().split('T')[0];
          bulkFormData.cast_ids.forEach((cast_id) => {
            schedules.push({
              cast_id: parseInt(cast_id),
              date: dateStr,
              start_time: bulkFormData.start_time,
              end_time: bulkFormData.end_time,
              is_available: true,
            });
          });
        }
      }

      if (schedules.length === 0) {
        alert('登録するスケジュールがありません');
        return;
      }

      await scheduleApi.bulkCreateSchedules({ schedules });
      alert(`${schedules.length}件のスケジュールを登録しました`);
      setIsBulkModalOpen(false);
      resetBulkForm();
      fetchSchedules();
    } catch (error: any) {
      console.error('一括登録エラー:', error);
      alert(error.response?.data?.message || 'スケジュールの一括登録に失敗しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このスケジュールを削除してもよろしいですか？')) {
      return;
    }

    try {
      await scheduleApi.deleteSchedule(id);
      alert('スケジュールを削除しました');
      fetchSchedules();
    } catch (error) {
      console.error('スケジュール削除エラー:', error);
      alert('スケジュールの削除に失敗しました');
    }
  };

  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      cast_id: schedule.cast_id.toString(),
      date: schedule.date,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      is_available: schedule.is_available === 1,
    });
    setIsModalOpen(true);
  };

  const handleCellClick = (castId: number, date: string) => {
    const schedule = getScheduleForCastAndDate(castId, date);
    if (schedule) {
      openEditModal(schedule);
    } else {
      setSelectedCell({ castId, date });
      setFormData({
        cast_id: castId.toString(),
        date: date,
        start_time: '10:00',
        end_time: '18:00',
        is_available: true,
      });
      setEditingSchedule(null);
      setIsModalOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({
      cast_id: '',
      date: '',
      start_time: '10:00',
      end_time: '18:00',
      is_available: true,
    });
  };

  const resetBulkForm = () => {
    setBulkFormData({
      cast_ids: [],
      start_date: '',
      end_date: '',
      start_time: '10:00',
      end_time: '18:00',
      weekdays: [true, true, true, true, true, true, true],
    });
  };

  const toggleWeekday = (index: number) => {
    const newWeekdays = [...bulkFormData.weekdays];
    newWeekdays[index] = !newWeekdays[index];
    setBulkFormData({ ...bulkFormData, weekdays: newWeekdays });
  };

  const toggleCastSelection = (castId: string) => {
    const newCastIds = bulkFormData.cast_ids.includes(castId)
      ? bulkFormData.cast_ids.filter((id) => id !== castId)
      : [...bulkFormData.cast_ids, castId];
    setBulkFormData({ ...bulkFormData, cast_ids: newCastIds });
  };

  // 週の日付を生成
  const getWeekDates = () => {
    const dates = [];
    const startDate = new Date(weekStartDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // 週を移動
  const changeWeek = (delta: number) => {
    const currentDate = new Date(weekStartDate);
    currentDate.setDate(currentDate.getDate() + delta * 7);
    setWeekStartDate(currentDate.toISOString().split('T')[0]);
  };

  // 特定のキャストと日付のスケジュールを取得
  const getScheduleForCastAndDate = (castId: number, dateStr: string) => {
    return schedules.find((s) => s.cast_id === castId && s.date === dateStr);
  };

  const weekDates = getWeekDates();

  return (
    <div className="max-w-full mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">出勤スケジュール管理</h1>
        <button
          onClick={() => {
            resetBulkForm();
            setIsBulkModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          一括登録
        </button>
      </div>

      {/* 週選択 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center justify-between">
        <button
          onClick={() => changeWeek(-1)}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
        >
          ← 前の週
        </button>
        <div className="text-lg font-bold">
          {weekDates[0].toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} 〜{' '}
          {weekDates[6].toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
        </div>
        <button
          onClick={() => changeWeek(1)}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
        >
          次の週 →
        </button>
      </div>

      {/* スケジュールテーブル */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-pink-600 text-white">
                <th className="border border-gray-300 px-4 py-3 text-left sticky left-0 bg-pink-600 z-10">
                  キャスト名
                </th>
                {weekDates.map((date, index) => (
                  <th key={index} className="border border-gray-300 px-4 py-3 text-center min-w-[120px]">
                    <div className="text-sm">
                      {date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                    </div>
                    <div className="text-xs font-normal">
                      ({['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {casts.map((cast) => (
                <tr key={cast.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium sticky left-0 bg-white z-10">
                    <div className="text-blue-600 cursor-pointer hover:underline">
                      {cast.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">カンタン週間設定</div>
                  </td>
                  {weekDates.map((date, index) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const schedule = getScheduleForCastAndDate(cast.id, dateStr);
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <td
                        key={index}
                        className={`border border-gray-300 px-2 py-3 text-center cursor-pointer hover:bg-blue-50 ${
                          isPast ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => !isPast && handleCellClick(cast.id, dateStr)}
                      >
                        {schedule ? (
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-blue-600">出勤</div>
                            <div className="text-xs text-gray-700">
                              {schedule.start_time.substring(0, 5)}〜{schedule.end_time.substring(0, 5)}
                            </div>
                            {!schedule.is_available && (
                              <div className="text-xs text-red-600">休み</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">───</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 単一登録モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingSchedule ? 'スケジュール編集' : '新規スケジュール登録'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    キャスト<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.cast_id}
                    onChange={(e) => setFormData({ ...formData, cast_id: e.target.value })}
                    required
                    disabled={!!editingSchedule}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">選択してください</option>
                    {casts.map((cast) => (
                      <option key={cast.id} value={cast.id}>
                        {cast.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日付<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      開始時刻<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      終了時刻<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">出勤可能</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  {editingSchedule && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingSchedule.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      削除
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingSchedule(null);
                      setSelectedCell(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg"
                  >
                    {editingSchedule ? '更新' : '登録'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 一括登録モーダル */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">一括スケジュール登録</h2>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    キャスト選択<span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {casts.map((cast) => (
                      <label key={cast.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={bulkFormData.cast_ids.includes(cast.id.toString())}
                          onChange={() => toggleCastSelection(cast.id.toString())}
                          className="mr-2"
                        />
                        <span className="text-sm">{cast.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      開始日<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={bulkFormData.start_date}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, start_date: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      終了日<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={bulkFormData.end_date}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, end_date: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      開始時刻<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={bulkFormData.start_time}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, start_time: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      終了時刻<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={bulkFormData.end_time}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, end_time: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">曜日選択</label>
                  <div className="flex gap-2">
                    {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeekday(index)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                          bulkFormData.weekdays[index]
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    一括登録
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
