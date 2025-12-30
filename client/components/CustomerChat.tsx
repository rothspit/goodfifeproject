'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX, FiSend, FiMessageCircle } from 'react-icons/fi';
import { chatApi } from '@/lib/api';
import { getUser } from '@/lib/authStorage';

interface Message {
  id: number;
  room_id: number;
  sender_type: 'user' | 'admin';
  sender_id: number;
  sender_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ChatRoom {
  id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  status: string;
}

export default function CustomerChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // ログインユーザー情報を取得
    const userData = getUser();
    setUser(userData);
    
    // 未読数を取得
    if (userData) {
      fetchUnreadCount();
      // 定期的に未読数を更新（30秒ごと）
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      fetchRoomAndMessages();
    }
  }, [isOpen, user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await chatApi.getUnreadCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('未読数取得エラー:', error);
    }
  };

  const fetchRoomAndMessages = async () => {
    setIsLoading(true);
    try {
      // ルームを取得または作成
      const roomResponse = await chatApi.getMyRoom();
      const roomData = roomResponse.data.room;
      setRoom(roomData);

      // メッセージを取得
      if (roomData) {
        const messagesResponse = await chatApi.getRoomMessages(roomData.id);
        setMessages(messagesResponse.data.messages || []);
        
        // 未読数をリセット
        setUnreadCount(0);
      }
    } catch (error: any) {
      console.error('チャット取得エラー:', error);
      if (error.response?.status === 401) {
        // 未ログインの場合
        console.log('ログインが必要です');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !room || isSending) return;

    const messageText = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    try {
      const response = await chatApi.sendMessage(room.id, messageText);
      
      // 新しいメッセージを追加
      setMessages((prev) => [...prev, response.data.message]);
      
      // 入力欄をクリア
      setInputValue('');
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      alert('メッセージの送信に失敗しました');
      // 入力を復元
      setInputValue(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 未ログインの場合は表示しない
  if (!user) {
    return null;
  }

  return (
    <>
      {/* 浮遊ボタン */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300"
        >
          <FiMessageCircle className="text-3xl" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* チャットウィンドウ */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiMessageCircle className="text-2xl" />
              <div>
                <h3 className="font-bold text-lg">お問い合わせ</h3>
                <p className="text-xs opacity-90">スタッフがご対応します</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* ユーザー情報表示 */}
          {user && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{user.name || 'お客様'}</p>
                  <p className="text-xs text-gray-600">{user.phone_number || user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* メッセージエリア */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FiMessageCircle className="text-6xl mb-4 opacity-30" />
                <p className="text-center">
                  お気軽にお問い合わせください。
                  <br />
                  スタッフが対応いたします。
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.sender_type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 shadow-md'
                    }`}
                  >
                    {message.sender_type === 'admin' && (
                      <p className="text-xs font-bold mb-1 opacity-70">
                        {message.sender_name || 'スタッフ'}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力..."
                disabled={isSending || isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isSending || isLoading}
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FiSend className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
