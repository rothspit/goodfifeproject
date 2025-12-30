'use client';

import React, { useState, useEffect } from 'react';
import {
  FiFileText,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiImage,
  FiCalendar,
  FiUser,
  FiRefreshCw,
  FiEye,
} from 'react-icons/fi';
import { blogApi, castApi } from '@/lib/api';
import Image from 'next/image';

interface Blog {
  id: number;
  cast_id: number;
  cast_name: string;
  title: string;
  content: string;
  image_url: string | null;
  cast_image: string | null;
  created_at: string;
  updated_at: string;
}

interface Cast {
  id: number;
  name: string;
  age: number;
}

const BlogManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [casts, setCasts] = useState<Cast[]>([]);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCastId, setFilterCastId] = useState<number | null>(null);
  
  // フォーム状態
  const [formData, setFormData] = useState({
    cast_id: 0,
    title: '',
    content: '',
    image_url: '',
  });

  useEffect(() => {
    fetchData();
    fetchCasts();
  }, [filterCastId, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filterCastId) params.cast_id = filterCastId;
      if (searchTerm) params.search = searchTerm;

      const response = await blogApi.getAllBlogs(params);
      setBlogs(response.data.blogs);
      setTotal(response.data.total);
    } catch (error) {
      console.error('ブログ取得エラー:', error);
      alert('ブログの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchCasts = async () => {
    try {
      const response = await castApi.getCasts();
      setCasts(response.data.casts);
    } catch (error) {
      console.error('キャスト取得エラー:', error);
    }
  };

  const openCreateModal = () => {
    setEditingBlog(null);
    setFormData({
      cast_id: 0,
      title: '',
      content: '',
      image_url: '',
    });
    setShowModal(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      cast_id: blog.cast_id,
      title: blog.title,
      content: blog.content,
      image_url: blog.image_url || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.cast_id || !formData.title || !formData.content) {
      alert('キャスト、タイトル、内容は必須です');
      return;
    }

    try {
      if (editingBlog) {
        await blogApi.updateBlog(editingBlog.id, formData);
        alert('ブログを更新しました');
      } else {
        await blogApi.createBlog(formData);
        alert('ブログを作成しました');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;

    try {
      await blogApi.deleteBlog(id);
      alert('削除しました');
      fetchData();
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
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
              <FiFileText className="text-pink-600" />
              ブログ管理（写メ日記）
            </h1>
            <p className="text-gray-600 mt-2">全{total}件のブログ</p>
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
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg shadow-md transition"
            >
              <FiPlus />
              新規ブログ作成
            </button>
          </div>
        </div>

        {/* フィルター */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="タイトルや内容で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterCastId || ''}
            onChange={(e) => setFilterCastId(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">すべてのキャスト</option>
            {casts.map((cast) => (
              <option key={cast.id} value={cast.id}>
                {cast.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ブログ一覧 */}
      {blogs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FiFileText className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">ブログがありません</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
          >
            最初のブログを作成
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {/* 画像 */}
              {blog.image_url ? (
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={blog.image_url}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <FiImage className="text-6xl text-gray-400" />
                </div>
              )}

              {/* コンテンツ */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden">
                    {blog.cast_image ? (
                      <Image
                        src={blog.cast_image}
                        alt={blog.cast_name}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <FiUser className="text-pink-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{blog.cast_name}</span>
                </div>

                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{blog.content}</p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <FiCalendar />
                  <span>{formatDate(blog.created_at)}</span>
                </div>

                {/* アクション */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(blog)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                  >
                    <FiEdit2 />
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id, blog.title)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                  >
                    <FiTrash2 />
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 作成・編集モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-pink-600 text-white px-6 py-4 rounded-t-lg sticky top-0">
              <h3 className="text-xl font-bold">
                {editingBlog ? 'ブログを編集' : '新規ブログ作成'}
              </h3>
            </div>
            <div className="p-6">
              {/* キャスト選択 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  キャスト <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.cast_id}
                  onChange={(e) => setFormData({ ...formData, cast_id: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value={0}>選択してください</option>
                  {casts.map((cast) => (
                    <option key={cast.id} value={cast.id}>
                      {cast.name}（{cast.age}歳）
                    </option>
                  ))}
                </select>
              </div>

              {/* タイトル */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例：今日のお礼♡"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* 内容 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  placeholder="今日も楽しい時間をありがとうございました♡&#10;またお会いできるのを楽しみにしています(^^)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">{formData.content.length}文字</p>
              </div>

              {/* 画像URL */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  画像URL
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                {formData.image_url && (
                  <div className="mt-2 relative h-40 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={formData.image_url}
                      alt="プレビュー"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {/* ボタン */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
                >
                  {editingBlog ? '更新' : '作成'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagementPage;
