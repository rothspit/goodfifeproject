'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiMenu, FiX, FiPhone, FiUser, FiLogIn } from 'react-icons/fi';
import { notoSerifJP } from '@/lib/fonts';

interface HeaderProps {
  storeId?: string;
}

export default function Header({ storeId }: HeaderProps = {}) {
  const baseUrl = storeId ? `/${storeId}` : '';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // ログイン状態を確認
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // スクロール時のヘッダー固定
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <>
      {/* スティッキーヘッダー */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* ロゴ */}
            <Link href={storeId ? `/${storeId}` : "/"} className="flex items-center space-x-2 group">
              <div className={`${notoSerifJP.className} text-3xl font-black tracking-wider relative`}>
                <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 bg-clip-text text-transparent drop-shadow-lg group-hover:from-rose-700 group-hover:via-pink-700 group-hover:to-rose-800 transition-all duration-300">
                  人妻の蜜
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-rose-400 to-transparent opacity-70"></span>
              </div>
            </Link>

            {/* デスクトップメニュー */}
            <nav className="hidden md:flex items-center space-x-8 relative z-10">
              <Link
                href={storeId ? `/${storeId}` : "/"}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium cursor-pointer"
                onClick={(e) => {
                  console.log('トップリンクがクリックされました');
                }}
              >
                トップ
              </Link>
              <Link
                href={`${baseUrl}/casts`}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium cursor-pointer"
                onClick={(e) => {
                  console.log('キャスト一覧リンクがクリックされました');
                }}
              >
                キャスト一覧
              </Link>
              <Link
                href={`${baseUrl}/schedule`}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium cursor-pointer"
              >
                今日の出勤
              </Link>
              <Link
                href={`${baseUrl}/system`}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium cursor-pointer"
              >
                システム・料金
              </Link>
              <Link
                href={`${baseUrl}/rankings`}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium cursor-pointer"
              >
                ランキング
              </Link>
              <Link
                href={`${baseUrl}/diary`}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium cursor-pointer"
              >
                写メ日記
              </Link>
              <Link
                href={`${baseUrl}/recruit`}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium cursor-pointer"
              >
                求人情報
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    href="/mypage"
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium cursor-pointer"
                  >
                    マイページ
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium cursor-pointer"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-colors font-medium cursor-pointer"
                  >
                    新規登録
                  </Link>
                </>
              )}
            </nav>

            {/* ハンバーガーメニュー */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <Link
                href={storeId ? `/${storeId}` : "/"}
                className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                トップ
              </Link>
              <Link
                href={`${baseUrl}/casts`}
                className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                キャスト一覧
              </Link>
              <Link
                href={`${baseUrl}/schedule`}
                className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                今日の出勤
              </Link>
              <Link
                href={`${baseUrl}/system`}
                className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                システム・料金
              </Link>
              <Link
                href={`${baseUrl}/rankings`}
                className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                ランキング
              </Link>
              <Link
                href={`${baseUrl}/diary`}
                className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                写メ日記
              </Link>
              <Link
                href={`${baseUrl}/recruit`}
                className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                求人情報
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    href="/mypage"
                    className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    マイページ
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left text-gray-700 hover:text-primary-600 transition-colors font-medium py-2"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    className="block bg-primary-600 text-white px-6 py-3 rounded-full hover:bg-primary-700 transition-colors font-medium text-center cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    新規登録
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* スティッキーフッター（モバイル） */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t shadow-lg">
        <div className="flex items-center justify-around py-3">
          <a
            href="tel:050-1748-7999"
            className="flex flex-col items-center justify-center space-y-1 text-primary-600 hover:text-primary-700"
          >
            <FiPhone size={24} />
            <span className="text-xs font-medium">電話する</span>
          </a>

          {isLoggedIn ? (
            <Link
              href="/mypage"
              className="flex flex-col items-center justify-center space-y-1 text-gray-700 hover:text-primary-600 cursor-pointer"
            >
              <FiUser size={24} />
              <span className="text-xs font-medium">マイページ</span>
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="flex flex-col items-center justify-center space-y-1 text-gray-700 hover:text-primary-600 cursor-pointer"
              >
                <FiUser size={24} />
                <span className="text-xs font-medium">新規登録</span>
              </Link>
              <Link
                href="/login"
                className="flex flex-col items-center justify-center space-y-1 text-gray-700 hover:text-primary-600 cursor-pointer"
              >
                <FiLogIn size={24} />
                <span className="text-xs font-medium">ログイン</span>
              </Link>
            </>
          )}

          <Link
            href={`${baseUrl}/recruit`}
            className="flex flex-col items-center justify-center space-y-1 text-gold-600 hover:text-gold-700 cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-medium">求人</span>
          </Link>
        </div>
      </div>
    </>
  );
}
