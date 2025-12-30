'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { authApi } from '@/lib/api';
import { FiPhone, FiLock } from 'react-icons/fi';
import { saveAuth, getStorageStatus } from '@/lib/authStorage';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone_number: '',
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

    if (!formData.phone_number || !formData.password) {
      setError('電話番号とパスワードを入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        phone_number: formData.phone_number,
        password: formData.password,
      });

      console.log('ログイン成功:', response.data);

      // トークンとユーザー情報を保存（localStorage, sessionStorage, cookieの3箇所）
      const token = response.data.token;
      const user = response.data.user;
      
      console.log('✅ ログイン成功 - トークンとユーザー情報受信完了');
      console.log('トークン:', token.substring(0, 20) + '...');
      console.log('ユーザー情報:', user);
      
      // 統合ストレージに保存
      const saveSuccess = saveAuth(token, user);
      
      if (!saveSuccess) {
        console.error('❌ 認証情報の保存に失敗');
        setError('ブラウザの設定により、ログイン情報を保存できません。Cookie、localStorage、sessionStorageをすべて有効にしてください。');
        setIsLoading(false);
        return;
      }

      // 保存確認（複数回チェック）
      setTimeout(() => {
        const status = getStorageStatus();
        
        console.log('📦 保存確認（500ms後）:', status);
        
        // 少なくとも1箇所に保存されていればOK
        const anyStorageHasData = 
          (status.localStorage.token && status.localStorage.user) ||
          (status.sessionStorage.token && status.sessionStorage.user) ||
          (status.cookie.token && status.cookie.user);
        
        if (!anyStorageHasData) {
          console.error('❌ 全ストレージへの保存失敗！');
          setError('ログイン情報の保存に失敗しました。ブラウザの設定を確認してください。');
          setIsLoading(false);
          return;
        }
        
        console.log('✅ マイページへリダイレクト');
        console.log('リダイレクト実行...');
        
        // window.location.href を使用して完全リロード
        window.location.href = '/mypage?logged_in=true';
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ログインに失敗しました');
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">ログイン</h1>
              <p className="text-gray-600">人妻の蜜</p>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* ログインフォーム */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* ログインボタン */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'ログイン中...' : 'ログインする'}
              </button>
            </form>

            {/* 新規登録リンク */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                アカウントをお持ちでない方は
                <Link href="/register" className="text-primary-600 font-bold hover:underline ml-1">
                  新規登録
                </Link>
              </p>
            </div>

            {/* パスワード忘れた */}
            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-primary-600">
                パスワードをお忘れの方
              </Link>
            </div>
          </div>

          {/* お問い合わせ */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">ログインでお困りの方はお電話ください</p>
            <a
              href="tel:050-1748-7999"
              className="inline-flex items-center justify-center bg-white border-2 border-primary-600 text-primary-600 px-6 py-2 rounded-full font-bold hover:bg-primary-50 transition-colors"
            >
              <FiPhone className="mr-2" />
              050-1748-7999
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
