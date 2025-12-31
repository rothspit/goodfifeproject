'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiShield, FiSend, FiLock } from 'react-icons/fi';

export default function ContactManagerPage() {
  const router = useRouter();
  const [cast, setCast] = useState<any>(null);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const castStr = localStorage.getItem('cast');
    if (!castStr) {
      router.push('/cast/login');
      return;
    }

    const castData = JSON.parse(castStr);
    setCast(castData);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      alert('件名とメッセージを入力してください');
      return;
    }

    setSending(true);
    try {
      // TODO: 責任者へのメッセージ送信API
      alert('責任者にメッセージを送信しました。返信をお待ちください。');
      setFormData({ subject: '', message: '' });
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
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FiShield />
                責任者に直接連絡
              </h1>
              <p className="text-pink-100 text-sm">秘密厳守でお話しできます</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 注意事項 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <FiLock className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-blue-800 mb-2">秘密厳守について</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• このメッセージは責任者のみが閲覧できます</li>
                  <li>• 他のスタッフには一切公開されません</li>
                  <li>• あなたのプライバシーは完全に守られます</li>
                  <li>• 相談内容は外部に漏れることはありません</li>
                </ul>
              </div>
            </div>
          </div>

          {/* メッセージフォーム */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">メッセージを送信</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  件名
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="相談したいことの件名を入力..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メッセージ
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="ご相談内容を詳しく入力してください..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  rows={10}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.message.length} / 1000文字
                </p>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg font-bold hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                <FiSend />
                {sending ? '送信中...' : '責任者に送信する'}
              </button>
            </form>
          </div>

          {/* サポート情報 */}
          <div className="bg-gray-50 rounded-xl p-6 mt-6">
            <h3 className="font-bold text-gray-800 mb-3">こんな時にご利用ください</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 勤務条件についての相談</li>
              <li>• 職場環境についての改善提案</li>
              <li>• 個人的な悩みや不安</li>
              <li>• その他、誰にも言えないこと</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              ※ 通常24時間以内に返信いたします
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
