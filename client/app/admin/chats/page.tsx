'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiMessageCircle, FiClock, FiUser } from 'react-icons/fi';
import { chatApi } from '@/lib/api';

interface ChatRoom {
  id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  user_email: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdminChatsPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await chatApi.getRooms();
      setRooms(response.data.rooms || []);
    } catch (error) {
      console.error('チャットルーム一覧取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return '昨日';
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString('ja-JP');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiMessageCircle className="text-blue-600" />
          お客様チャット管理
        </h1>
        <p className="text-gray-600 mt-2">お客様とのチャット一覧</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FiMessageCircle className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">チャットはまだありません</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/admin/chats/${room.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="p-4 flex items-start gap-4">
                  {/* アバター */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                      {room.user_name?.charAt(0) || 'U'}
                    </div>
                  </div>

                  {/* メインコンテンツ */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        {room.user_name || 'お客様'}
                        {room.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {room.unread_count}
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(room.last_message_at || room.updated_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <FiUser className="text-gray-400 text-sm" />
                      <span className="text-sm text-gray-600">
                        {room.user_phone || room.user_email}
                      </span>
                    </div>

                    {room.last_message && (
                      <p className="text-sm text-gray-600 truncate">
                        {room.last_message}
                      </p>
                    )}
                  </div>

                  {/* ステータス */}
                  <div className="flex-shrink-0">
                    {room.status === 'active' ? (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        対応中
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                        完了
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 統計情報 */}
      {rooms.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総チャット数</p>
                <p className="text-2xl font-bold text-gray-800">{rooms.length}</p>
              </div>
              <FiMessageCircle className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">未読メッセージ</p>
                <p className="text-2xl font-bold text-red-600">
                  {rooms.reduce((sum, room) => sum + room.unread_count, 0)}
                </p>
              </div>
              <FiMessageCircle className="text-4xl text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">対応中</p>
                <p className="text-2xl font-bold text-green-600">
                  {rooms.filter((room) => room.status === 'active').length}
                </p>
              </div>
              <FiClock className="text-4xl text-green-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
