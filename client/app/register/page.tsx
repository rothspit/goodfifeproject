'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { authApi } from '@/lib/api';
import { FiUser, FiPhone, FiLock, FiMail } from 'react-icons/fi';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone_number: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!formData.phone_number || !formData.password) {
      setError('電話番号とパスワードは必須です');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register({
        phone_number: formData.phone_number,
        password: formData.password,
        name: formData.name || undefined,
        email: formData.email || undefined,
      });

      // トークンとユーザー情報を保存
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // トップページへリダイレクト
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Header />
      
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-12 pb-32 md:pb-12">
        <div className="max-w-md mx-auto">
          {/* カード */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">新規会員登録</h1>
              <p className="text-gray-600">人妻の蜜へようこそ</p>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* 登録フォーム */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="090-1234-5678"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">ハイフンあり・なしどちらでもOK</p>
              </div>

              {/* お名前（任意） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  お名前（ニックネーム可）
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="山田太郎"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* メールアドレス（任意） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* パスワード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="6文字以上"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* パスワード確認 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード（確認） <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="もう一度入力"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* 登録ボタン */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '登録中...' : '新規登録する'}
              </button>
            </form>

            {/* ログインリンク */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                すでにアカウントをお持ちの方は
                <Link href="/login" className="text-primary-600 font-bold hover:underline ml-1">
                  ログイン
                </Link>
              </p>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-bold text-yellow-800 mb-2">ご注意</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 電話番号は本人確認に使用します</li>
              <li>• パスワードは忘れないようにメモしてください</li>
              <li>• 18歳未満の方はご利用いただけません</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
