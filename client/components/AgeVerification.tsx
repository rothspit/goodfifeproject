'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AgeVerification() {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 年齢認証済みかチェック
    const verified = localStorage.getItem('age_verified');
    if (!verified) {
      setShow(true);
    }
  }, []);

  const handleVerify = (isAdult: boolean) => {
    if (isAdult) {
      localStorage.setItem('age_verified', 'true');
      setShow(false);
    } else {
      // 18歳未満の場合は外部サイトへリダイレクト
      window.location.href = 'https://www.yahoo.co.jp';
    }
  };

  const handleEnter = () => {
    localStorage.setItem('age_verified', 'true');
    setShow(false);
    // 本日の出勤表に遷移
    router.push('/schedule');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-95 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-4">
        {/* メインコンテンツ */}
        <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-3xl shadow-2xl overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-8 px-6 text-center">
            <h1 className="text-4xl font-bold mb-2">人妻の蜜</h1>
            <p className="text-pink-100 text-lg">西船橋エリア最高峰の人妻デリヘル</p>
          </div>

          {/* 画像エリア */}
          <div className="relative h-80 md:h-96 bg-gradient-to-br from-pink-100 to-purple-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                {/* アイコン代わりの装飾 */}
                <div className="flex justify-center space-x-4 mb-6">
                  <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-3xl">👩</span>
                  </div>
                  <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-3xl">💕</span>
                  </div>
                  <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-3xl">👩</span>
                  </div>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  最もコスパの高い<br />人妻デリヘル誕生
                </h2>
                
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <div className="bg-white px-6 py-3 rounded-full shadow-md">
                    <span className="text-pink-600 font-bold">💰 60分 ¥15,000〜</span>
                  </div>
                  <div className="bg-white px-6 py-3 rounded-full shadow-md">
                    <span className="text-purple-600 font-bold">⭐ 高品質サービス</span>
                  </div>
                  <div className="bg-white px-6 py-3 rounded-full shadow-md">
                    <span className="text-pink-600 font-bold">🔥 即姫多数在籍</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 年齢確認コンテンツ */}
          <div className="p-8 md:p-12 text-center space-y-6">
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-6">
              <p className="text-xl font-bold text-gray-800 mb-2">
                ⚠️ 年齢確認
              </p>
              <p className="text-gray-700 leading-relaxed">
                このサイトには、アダルトコンテンツが含まれています。<br />
                <span className="font-bold text-red-600">18歳未満の方</span>のアクセスは固くお断りしています。
              </p>
            </div>

            <p className="text-lg text-gray-700 font-medium">
              あなたは18歳以上ですか？
            </p>

            {/* ボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
              <button
                onClick={handleEnter}
                className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xl font-bold rounded-full hover:from-pink-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3"
              >
                <span>✓</span>
                <span>はい、18歳以上です</span>
              </button>

              <button
                onClick={() => handleVerify(false)}
                className="w-full sm:w-auto px-12 py-5 bg-gray-300 text-gray-700 text-xl font-bold rounded-full hover:bg-gray-400 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                いいえ、18歳未満です
              </button>
            </div>

            {/* 今すぐ女の子を選ぶボタン */}
            <div className="mt-8 pt-8 border-t-2 border-pink-200">
              <button
                onClick={handleEnter}
                className="w-full max-w-md mx-auto px-10 py-6 bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white text-2xl font-bold rounded-2xl hover:from-pink-600 hover:via-pink-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-pink-500/50 flex items-center justify-center space-x-3 animate-pulse hover:animate-none"
              >
                <span className="text-3xl">💖</span>
                <span>今すぐ女の子を選ぶ</span>
                <span className="text-3xl">💖</span>
              </button>
              <p className="text-sm text-gray-500 mt-3">
                本日の出勤表をご覧いただけます
              </p>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              ※このサイトを利用することで、
              <a href="/terms" className="text-pink-600 hover:underline">利用規約</a>
              および
              <a href="/privacy" className="text-pink-600 hover:underline">プライバシーポリシー</a>
              に同意したものとみなされます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
