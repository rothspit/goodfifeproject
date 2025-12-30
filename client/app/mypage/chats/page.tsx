'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { FiMessageSquare, FiSend, FiUser, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { io, Socket } from 'socket.io-client';

interface ChatRoom {
  cast_id: number;
  cast_name: string;
  cast_image: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  approval_status?: string;
}

interface Message {
  id: number;
  sender_id: number;
  sender_type: 'user' | 'cast';
  receiver_id: number;
  receiver_type: 'user' | 'cast';
  message: string;
  is_read: boolean;
  created_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ChatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedCastId, setSelectedCastId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 認証チェック
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      
      // Socket.io接続
      const socket = io(API_BASE_URL, {
        auth: { token }
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket接続成功');
        socket.emit('join', { userId: userData.id, userType: 'user' });
      });

      socket.on('newMessage', (message: Message) => {
        console.log('新しいメッセージ受信:', message);
        setMessages(prev => [...prev, message]);
        scrollToBottom();
        
        // チャットルーム一覧を更新
        fetchChatRooms();
      });

      socket.on('messageRead', (data: { messageId: number }) => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === data.messageId ? { ...msg, is_read: true } : msg
          )
        );
      });

      fetchChatRooms();

      return () => {
        socket.disconnect();
      };
    } catch (error) {
      console.error('初期化エラー:', error);
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/chats/user/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('チャットルーム取得失敗');

      const data = await response.json();
      setChatRooms(data.rooms || []);
    } catch (error) {
      console.error('チャットルーム取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (castId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/chats/user/messages/${castId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('メッセージ取得失敗');

      const data = await response.json();
      setMessages(data.messages || []);
      
      // 既読にする
      await fetch(`${API_BASE_URL}/api/chats/user/read/${castId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('メッセージ取得エラー:', error);
    }
  };

  const handleSelectCast = (castId: number) => {
    setSelectedCastId(castId);
    fetchMessages(castId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCastId || !user) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/chats/user/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          castId: selectedCastId,
          message: newMessage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'メッセージ送信失敗');
      }

      const data = await response.json();
      
      // Socket.ioで送信
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', {
          senderId: user.id,
          senderType: 'user',
          receiverId: selectedCastId,
          receiverType: 'cast',
          message: newMessage
        });
      }

      setMessages(prev => [...prev, data.data]);
      setNewMessage('');
      scrollToBottom();
      fetchChatRooms(); // 一覧を更新
    } catch (error: any) {
      console.error('メッセージ送信エラー:', error);
      alert(error.message || 'メッセージの送信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedRoom = chatRooms.find(room => room.cast_id === selectedCastId);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Header />
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/mypage" className="text-pink-600 hover:text-pink-700">
            ← マイページに戻る
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FiMessageSquare className="text-pink-600" />
          キャストとのチャット
        </h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          <div className="flex h-full">
            {/* チャットルーム一覧 */}
            <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
                </div>
              ) : chatRooms.length > 0 ? (
                <div>
                  {chatRooms.map((room) => (
                    <button
                      key={room.cast_id}
                      onClick={() => handleSelectCast(room.cast_id)}
                      className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-all text-left ${
                        selectedCastId === room.cast_id ? 'bg-pink-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={room.cast_image || '/placeholder-cast.png'}
                            alt={room.cast_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {room.unread_count > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {room.unread_count}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{room.cast_name}</p>
                          <p className="text-sm text-gray-600 truncate">{room.last_message || 'メッセージなし'}</p>
                          {room.approval_status === 'pending' && (
                            <p className="text-xs text-yellow-600 mt-1">承認待ち</p>
                          )}
                          {room.approval_status === 'rejected' && (
                            <p className="text-xs text-red-600 mt-1">承認拒否</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <FiMessageSquare className="text-gray-300 mb-4" size={64} />
                  <p className="text-gray-500 mb-4">まだチャットがありません</p>
                  <Link
                    href="/casts"
                    className="bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition-all"
                  >
                    キャストを探す
                  </Link>
                </div>
              )}
            </div>

            {/* メッセージエリア */}
            <div className="flex-1 flex flex-col">
              {selectedCastId && selectedRoom ? (
                <>
                  {/* ヘッダー */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedRoom.cast_image || '/placeholder-cast.png'}
                        alt={selectedRoom.cast_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{selectedRoom.cast_name}</p>
                        {selectedRoom.approval_status === 'approved' && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <FiCheckCircle size={12} />
                            承認済み
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* メッセージ一覧 */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isMyMessage = message.sender_type === 'user' && message.sender_id === user.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`p-3 rounded-lg ${
                                isMyMessage
                                  ? 'bg-pink-600 text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p className="break-words">{message.message}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                              <span>{new Date(message.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMyMessage && (
                                <span>{message.is_read ? <FiCheckCircle size={12} className="text-blue-500" /> : <FiCheck size={12} />}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* 入力エリア */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    {selectedRoom.approval_status === 'approved' || !selectedRoom.approval_status ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="メッセージを入力..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          disabled={sending}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={sending || !newMessage.trim()}
                          className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <FiSend />
                          送信
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        {selectedRoom.approval_status === 'pending' && '承認待ちです'}
                        {selectedRoom.approval_status === 'rejected' && 'このキャストとのチャットは利用できません'}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FiUser size={64} className="mx-auto mb-4 text-gray-300" />
                    <p>チャットを開始するには、左からキャストを選択してください</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
