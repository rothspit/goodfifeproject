'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPhone, FiLock, FiUser } from 'react-icons/fi';

export default function CastLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cast_id: '',
    password: '',
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

    if (!formData.cast_id || !formData.password) {
      setError('キャストIDとパスワードを入力してください');
      return;
    }

    setIsLoading(true);

    try {
      // キャスト認証API呼び出し
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/cast-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ログインに失敗しました');
      }

      // トークンとキャスト情報を保存
      localStorage.setItem('cast_token', data.token);
      localStorage.setItem('cast', JSON.stringify(data.cast));

      // キャストマイページへリダイレクト
      window.location.href = '/cast/mypage';
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
            キャスト専用ページ
          </h1>
          <p className="text-gray-600">人妻の蜜</p>
        </div>

        {/* ログインカード */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mb-4">
              <FiUser className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">キャストログイン</h2>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* ログインフォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* キャストID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                キャストID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="cast_id"
                  value={formData.cast_id}
                  onChange={handleChange}
                  placeholder="キャストIDを入力"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
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
                  placeholder="パスワードを入力"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-bold hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'ログイン中...' : 'ログインする'}
            </button>
          </form>

          {/* パスワード忘れた */}
          <div className="mt-6 text-center">
            <Link href="/cast/forgot-password" className="text-sm text-gray-500 hover:text-pink-600">
              パスワードをお忘れの方
            </Link>
          </div>
        </div>

        {/* 管理者へのリンク */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            管理者の方は
            <Link href="/admin/login" className="text-pink-600 font-bold hover:underline ml-1">
              こちら
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
