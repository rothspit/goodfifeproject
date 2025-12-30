'use client';

import { useParams } from 'next/navigation';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { FiCalendar, FiUser, FiHeart, FiMessageSquare } from 'react-icons/fi';
import { blogApi } from '@/lib/api';

interface Blog {
  id: number;
  cast_id: number;
  cast_name: string;
  cast_image: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

export default function DiaryPage() {
  const params = useParams();
  const storeId = params.store_id as string;
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (storeId) params.store_id = storeId;
      
      const response = await blogApi.getBlogs(params);
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error('日記取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Header storeId={storeId} />
      
      {/* スペーサー */}
      <div className="h-20"></div>

      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            写メ日記
          </h1>
          <p className="text-center text-pink-100 text-lg">
            キャストの日常や想いをお届けします
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-xl mb-4">まだ日記が投稿されていません</p>
            <p className="text-gray-500">キャストからの投稿をお楽しみに！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                {/* 画像 */}
                <div className="relative h-64 bg-gradient-to-br from-pink-100 to-purple-100">
                  {blog.image_url ? (
                    <img
                      src={getImageUrl(blog.image_url) || ''}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiHeart className="text-pink-300" size={80} />
                    </div>
                  )}
                  
                  {/* キャスト情報オーバーレイ */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <Link
                      href={`/casts/${blog.cast_id}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                        {blog.cast_image ? (
                          <img
                            src={blog.cast_image}
                            alt={blog.cast_name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-pink-300 flex items-center justify-center">
                            <FiUser className="text-white" size={24} />
                          </div>
                        )}
                      </div>
                      <div className="text-white">
                        <p className="font-bold text-sm">{blog.cast_name}</p>
                        <p className="text-xs opacity-90">キャスト</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* コンテンツ */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {blog.title}
                  </h2>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-4">
                    {blog.content}
                  </p>

                  {/* フッター */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <FiCalendar size={16} />
                      <time>{formatDate(blog.created_at)}</time>
                    </div>
                    
                    <Link
                      href={`/casts/${blog.cast_id}`}
                      className="text-pink-600 hover:text-pink-700 font-medium text-sm flex items-center gap-1 transition-colors"
                    >
                      <span>プロフィール</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ページネーション（後で実装） */}
        {blogs.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              {blogs.length}件の日記を表示中
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
