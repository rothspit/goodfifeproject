'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSend, FiUsers, FiMail } from 'react-icons/fi';

interface Customer {
  id: number;
  name: string;
  phone_number: string;
  last_visit: string;
  favorite: boolean;
}

export default function CastAppealPage() {
  const router = useRouter();
  const [cast, setCast] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const castStr = localStorage.getItem('cast');
    if (!castStr) {
      router.push('/cast/login');
      return;
    }

    const castData = JSON.parse(castStr);
    setCast(castData);

    // TODO: 実際のお客様データを取得
    setCustomers([
      {
        id: 1,
        name: '田中様',
        phone_number: '090-1234-5678',
        last_visit: '2024-12-05',
        favorite: true,
      },
      {
        id: 2,
        name: '山田様',
        phone_number: '090-2345-6789',
        last_visit: '2024-12-01',
        favorite: false,
      },
    ]);
  }, []);

  const handleSendAppeal = async () => {
    if (!selectedCustomer || !message.trim()) {
      alert('お客様とメッセージを入力してください');
      return;
    }

    setSending(true);
    try {
      // TODO: アプローチAPI呼び出し
      alert(`${selectedCustomer.name}にアプローチメッセージを送信しました！`);
      setMessage('');
      setSelectedCustomer(null);
    } catch (error) {
      alert('送信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/cast/mypage" className="hover:bg-white/20 p-2 rounded-lg transition-all">
              <FiArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">お客様へアプローチ</h1>
              <p className="text-pink-100 text-sm">お客様にアピールメッセージを送信</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* お客様一覧 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiUsers className="text-pink-600" />
              お客様一覧
            </h2>

            <div className="space-y-3">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedCustomer?.id === customer.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.phone_number}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        最終来店: {customer.last_visit}
                      </p>
                    </div>
                    {customer.favorite && (
                      <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-medium">
                        お気に入り登録済
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* メッセージ送信フォーム */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiMail className="text-pink-600" />
              アプローチメッセージ
            </h2>

            {selectedCustomer ? (
              <div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">送信先</p>
                  <p className="font-bold text-gray-800">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-600">{selectedCustomer.phone_number}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メッセージ
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="お客様へのメッセージを入力してください..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    rows={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length} / 500文字
                  </p>
                </div>

                <button
                  onClick={handleSendAppeal}
                  disabled={sending || !message.trim()}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-bold hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FiSend />
                  {sending ? '送信中...' : 'アプローチメッセージを送信'}
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiUsers className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500">
                  左側からお客様を選択してください
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
