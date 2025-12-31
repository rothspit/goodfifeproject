'use client';

import { useState, useEffect } from 'react';
import { announcementApi } from '@/lib/api';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

const ANNOUNCEMENT_TYPES = [
  { value: 'general', label: '一般' },
  { value: 'important', label: '重要' },
  { value: 'maintenance', label: 'メンテナンス' },
  { value: 'event', label: 'イベント' },
  { value: 'campaign', label: 'キャンペーン' },
];

export default function AnnouncementManagementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // フィルター
  const [filterType, setFilterType] = useState('');
  const [filterActive, setFilterActive] = useState('');

  // フォームデータ
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    is_active: true,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterType) params.type = filterType;
      if (filterActive) params.is_active = filterActive;

      const response = await announcementApi.getAllAnnouncements(params);
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('お知らせ取得エラー:', error);
      alert('お知らせの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAnnouncement) {
        await announcementApi.updateAnnouncement(editingAnnouncement.id, formData);
        alert('お知らせを更新しました');
      } else {
        await announcementApi.createAnnouncement(formData);
        alert('お知らせを作成しました');
      }

      setIsModalOpen(false);
      setEditingAnnouncement(null);
      resetForm();
      fetchAnnouncements();
    } catch (error: any) {
      console.error('お知らせ登録エラー:', error);
      alert(error.response?.data?.message || 'お知らせの登録に失敗しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このお知らせを削除してもよろしいですか？')) {
      return;
    }

    try {
      await announcementApi.deleteAnnouncement(id);
      alert('お知らせを削除しました');
      fetchAnnouncements();
    } catch (error) {
      console.error('お知らせ削除エラー:', error);
      alert('お知らせの削除に失敗しました');
    }
  };

  const toggleActive = async (announcement: Announcement) => {
    try {
      await announcementApi.updateAnnouncement(announcement.id, {
        is_active: !announcement.is_active,
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      is_active: announcement.is_active === 1,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      is_active: true,
    });
  };

  const getTypeLabel = (type: string) => {
    return ANNOUNCEMENT_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      general: 'bg-gray-100 text-gray-800',
      important: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      event: 'bg-blue-100 text-blue-800',
      campaign: 'bg-green-100 text-green-800',
    };
    return colors[type] || colors.general;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">お知らせ管理</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingAnnouncement(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FiPlus />
          新規お知らせ作成
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリー</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">全て</option>
              {ANNOUNCEMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">全て</option>
              <option value="true">公開中</option>
              <option value="false">非公開</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchAnnouncements}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              検索
            </button>
          </div>
        </div>
      </div>

      {/* お知らせ一覧 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">お知らせがありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-gray-800">{announcement.title}</h2>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadgeColor(announcement.type)}`}>
                      {getTypeLabel(announcement.type)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        announcement.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {announcement.is_active ? '公開中' : '非公開'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap line-clamp-3">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    作成日: {new Date(announcement.created_at).toLocaleString('ja-JP')}
                    {announcement.updated_at !== announcement.created_at && (
                      <span className="ml-4">
                        更新日: {new Date(announcement.updated_at).toLocaleString('ja-JP')}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => toggleActive(announcement)}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
                    announcement.is_active
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                  }`}
                >
                  {announcement.is_active ? <FiEyeOff /> : <FiEye />}
                  {announcement.is_active ? '非公開にする' : '公開する'}
                </button>
                <button
                  onClick={() => openEditModal(announcement)}
                  className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm"
                >
                  <FiEdit2 />
                  編集
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm"
                >
                  <FiTrash2 />
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 作成・編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingAnnouncement ? 'お知らせ編集' : '新規お知らせ作成'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイトル<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="お知らせのタイトルを入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カテゴリー<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {ANNOUNCEMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    内容<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={8}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="お知らせの内容を入力"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">公開する</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingAnnouncement(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {editingAnnouncement ? '更新' : '作成'}
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
