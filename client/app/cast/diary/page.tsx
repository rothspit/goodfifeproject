'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiEdit, FiImage, FiSave, FiTrash2 } from 'react-icons/fi';

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

export default function CastDiaryPage() {
  const router = useRouter();
  const [cast, setCast] = useState<any>(null);
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const castStr = localStorage.getItem('cast');
    if (!castStr) {
      router.push('/cast/login');
      return;
    }

    const castData = JSON.parse(castStr);
    setCast(castData);
    fetchDiaries();
  }, []);

  const fetchDiaries = async () => {
    try {
      const { castMemberApi } = await import('@/lib/api');
      const response = await castMemberApi.getMyBlogs();
      setDiaries(response.data.blogs);
    } catch (error) {
      console.error('日記取得エラー:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      
      // 画像プレビュー生成
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('タイトルと本文を入力してください');
      return;
    }

    try {
      const { castMemberApi } = await import('@/lib/api');
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await castMemberApi.createBlog(formDataToSend);
      alert('日記を投稿しました！');
      setShowEditor(false);
      setFormData({ title: '', content: '', image: null });
      setImagePreview(null);
      fetchDiaries(); // 日記一覧を再取得
    } catch (error) {
      console.error('投稿エラー:', error);
      alert('投稿に失敗しました');
    }
  };

  const handleDeleteDiary = async (id: number) => {
    if (!confirm('この日記を削除しますか？')) {
      return;
    }

    try {
      const { castMemberApi } = await import('@/lib/api');
      await castMemberApi.deleteBlog(id);
      alert('日記を削除しました');
      fetchDiaries(); // 日記一覧を再取得
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return null;
    // 絶対URLの場合はそのまま返す
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // 相対パスの場合はサーバーのベースURLを追加
    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    return `${serverUrl}${imageUrl}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/cast/mypage" className="hover:bg-white/20 p-2 rounded-lg transition-all">
                <FiArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">写メ日記</h1>
                <p className="text-pink-100 text-sm">日記を書いてお客様にアピール</p>
              </div>
            </div>
            <button
              onClick={() => setShowEditor(!showEditor)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              <FiEdit />
              <span className="hidden md:inline">新規投稿</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 編集フォーム */}
        {showEditor && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">日記を書く</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="タイトルを入力..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  本文
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="本文を入力..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  rows={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  写真
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="プレビュー"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg"
                      type="button"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-all cursor-pointer">
                    <FiImage className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-sm text-gray-600 mb-1">クリックして写真を選択</p>
                    <p className="text-xs text-gray-500">JPG, PNG形式（最大10MB）</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditor(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-bold hover:from-pink-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                >
                  <FiSave />
                  投稿する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 日記一覧 */}
        {diaries.length === 0 ? (
          <div className="text-center py-12">
            <FiImage className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 text-lg">まだ日記を投稿していません</p>
            <p className="text-gray-500 text-sm mt-2">「新規投稿」ボタンから日記を書いてみましょう</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diaries.map((diary) => (
              <div key={diary.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                <div className="h-48 bg-gray-200 relative">
                  {diary.image_url ? (
                    <img
                      src={getImageUrl(diary.image_url) || ''}
                      alt={diary.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiImage className="text-gray-400" size={64} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2">{diary.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{diary.content}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {new Date(diary.created_at).toLocaleDateString('ja-JP')}
                    </p>
                    <button
                      onClick={() => handleDeleteDiary(diary.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
