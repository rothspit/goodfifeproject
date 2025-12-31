'use client';

import React, { useState, useEffect } from 'react';
import {
  FiClock,
  FiCheck,
  FiX,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiUser,
  FiCalendar,
  FiAlertCircle,
} from 'react-icons/fi';
import { instantPrincessApi } from '@/lib/api';

interface Cast {
  id: number;
  name: string;
  age: number;
  status: string;
  start_time?: string;
  end_time?: string;
}

interface InstantPrincess {
  id: number;
  cast_id: number;
  cast_name: string;
  cast_age: number;
  is_active: boolean;
  note: string;
  created_at: string;
  updated_at: string;
}

const ImmediatePrincessManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instantPrincesses, setInstantPrincesses] = useState<InstantPrincess[]>([]);
  const [workingCasts, setWorkingCasts] = useState<Cast[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCastId, setSelectedCastId] = useState<number | null>(null);
  const [selectedPrincess, setSelectedPrincess] = useState<InstantPrincess | null>(null);
  const [note, setNote] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // 現在時刻を1分ごとに更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [princessesRes, workingRes] = await Promise.all([
        instantPrincessApi.getAll(),
        instantPrincessApi.getWorkingCasts(),
      ]);
      setInstantPrincesses(princessesRes.data || []);
      setWorkingCasts(workingRes.data || []);
    } catch (error: any) {
      console.error('データ取得エラー:', error);
      const errorMsg = error.response?.data?.message || error.message || 'データの取得に失敗しました';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedCastId) {
      alert('キャストを選択してください');
      return;
    }

    try {
      await instantPrincessApi.create({ cast_id: selectedCastId, note });
      alert('即姫を追加しました');
      setShowAddModal(false);
      setSelectedCastId(null);
      setNote('');
      fetchData();
    } catch (error: any) {
      console.error('追加エラー:', error);
      alert(error.response?.data?.error || '追加に失敗しました');
    }
  };

  const handleUpdate = async () => {
    if (!selectedPrincess) return;

    try {
      await instantPrincessApi.update(selectedPrincess.id, {
        is_active: selectedPrincess.is_active,
        note,
      });
      alert('即姫を更新しました');
      setShowEditModal(false);
      setSelectedPrincess(null);
      setNote('');
      fetchData();
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を即姫から削除しますか？`)) return;

    try {
      await instantPrincessApi.delete(id);
      alert('削除しました');
      fetchData();
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  const handleToggleActive = async (princess: InstantPrincess) => {
    try {
      await instantPrincessApi.update(princess.id, {
        is_active: !princess.is_active,
        note: princess.note,
      });
      fetchData();
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const openEditModal = (princess: InstantPrincess) => {
    setSelectedPrincess(princess);
    setNote(princess.note || '');
    setShowEditModal(true);
  };

  const formatTime = (timeStr: string) => {
    return timeStr ? timeStr.slice(0, 5) : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-red-600 text-2xl flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-red-800 mb-2">エラーが発生しました</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                再読み込み
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FiClock className="text-pink-600" />
              即姫管理（出勤連動）
            </h1>
            <p className="text-gray-600 mt-2">出勤中のキャストのみ即姫として表示されます</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              更新
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg shadow-md transition"
            >
              <FiPlus />
              即姫を追加
            </button>
          </div>
        </div>

        {/* 現在時刻 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <FiCalendar className="text-blue-600 text-xl" />
          <div>
            <p className="text-sm text-blue-600 font-medium">現在時刻</p>
            <p className="text-lg font-bold text-blue-800">
              {currentTime.toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                weekday: 'short',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* 本日の出勤中キャスト */}
      <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
          <FiUser className="text-green-600" />
          本日の出勤中キャスト（{workingCasts.length}名）
        </h2>
        {workingCasts.length === 0 ? (
          <p className="text-gray-500">現在出勤中のキャストはいません</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workingCasts.map((cast) => (
              <div
                key={cast.id}
                className="bg-white border border-green-300 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{cast.name}</h3>
                    <p className="text-sm text-gray-600">{cast.age}歳</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    出勤中
                  </span>
                </div>
                {cast.start_time && cast.end_time && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <FiClock className="text-green-600" />
                    <span>
                      {formatTime(cast.start_time)} 〜 {formatTime(cast.end_time)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 即姫一覧 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-4">
          <h2 className="text-xl font-bold">即姫一覧（{instantPrincesses.length}名）</h2>
          <p className="text-sm text-pink-100 mt-1">出勤スケジュールと自動連動しています</p>
        </div>

        {instantPrincesses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FiUser className="mx-auto text-4xl mb-4 text-gray-300" />
            <p>登録されている即姫はありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {instantPrincesses.map((princess) => (
              <div
                key={princess.id}
                className={`p-6 hover:bg-gray-50 transition ${
                  !princess.is_active ? 'bg-gray-50 opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{princess.cast_name}</h3>
                      <span className="text-sm text-gray-600">（{princess.cast_age}歳）</span>
                      <button
                        onClick={() => handleToggleActive(princess)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          princess.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {princess.is_active ? (
                          <>
                            <FiCheck className="inline mr-1" />
                            有効
                          </>
                        ) : (
                          <>
                            <FiX className="inline mr-1" />
                            無効
                          </>
                        )}
                      </button>
                    </div>
                    {princess.note && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">備考:</span> {princess.note}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      登録日時: {new Date(princess.created_at).toLocaleString('ja-JP')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(princess)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="編集"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(princess.id, princess.cast_name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="削除"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="bg-pink-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-bold">即姫を追加</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  出勤中のキャストを選択 <span className="text-red-500">*</span>
                </label>
                {workingCasts.length === 0 ? (
                  <p className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-3">
                    ⚠️ 現在出勤中のキャストがいません。先にスケジュールを登録してください。
                  </p>
                ) : (
                  <select
                    value={selectedCastId || ''}
                    onChange={(e) => setSelectedCastId(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {workingCasts.map((cast) => (
                      <option key={cast.id} value={cast.id}>
                        {cast.name}（{cast.age}歳）- {formatTime(cast.start_time!)} 〜{' '}
                        {formatTime(cast.end_time!)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="特記事項があれば入力してください"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCastId(null);
                    setNote('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAdd}
                  disabled={workingCasts.length === 0}
                  className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {showEditModal && selectedPrincess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-bold">即姫を編集</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">キャスト</label>
                <p className="text-lg font-bold text-gray-800">
                  {selectedPrincess.cast_name}（{selectedPrincess.cast_age}歳）
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={selectedPrincess.is_active}
                      onChange={() =>
                        setSelectedPrincess({ ...selectedPrincess, is_active: true })
                      }
                      className="text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">有効</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!selectedPrincess.is_active}
                      onChange={() =>
                        setSelectedPrincess({ ...selectedPrincess, is_active: false })
                      }
                      className="text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">無効</span>
                  </label>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="特記事項があれば入力してください"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPrincess(null);
                    setNote('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImmediatePrincessManagementPage;
