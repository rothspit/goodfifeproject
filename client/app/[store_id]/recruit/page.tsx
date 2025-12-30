'use client';

import { useParams } from 'next/navigation';

import Header from '@/components/Header';
import Link from 'next/link';
import { FiHeart, FiUsers, FiArrowRight } from 'react-icons/fi';

export default function RecruitPage() {
  const params = useParams();
  const storeId = params.store_id as string;
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Header storeId={storeId} />
      
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            求人情報
          </h1>
          <p className="text-xl md:text-2xl text-gray-600">
            人妻の蜜で一緒に働きませんか？
          </p>
          <p className="text-lg text-gray-500 mt-4">
            キャスト・スタッフともに大募集中！
          </p>
        </div>

        {/* 求人カード */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* キャスト求人 */}
          <Link
            href="/recruit/cast"
            className="group bg-gradient-to-br from-pink-500 via-pink-400 to-rose-400 rounded-3xl p-8 md:p-12 text-white shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              {/* アイコン */}
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                <FiHeart className="text-6xl" />
              </div>
              
              {/* タイトル */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                キャスト求人
              </h2>
              
              {/* 説明 */}
              <p className="text-lg md:text-xl mb-6 opacity-90">
                あなたらしく、自由に働ける
              </p>
              
              {/* 特徴 */}
              <ul className="space-y-2 mb-8 text-left w-full max-w-xs">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  高収入・完全日払い制
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  完全自由シフト
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  未経験者大歓迎
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  週1日・1日2時間〜OK
                </li>
              </ul>
              
              {/* ボタン */}
              <div className="inline-flex items-center bg-white text-pink-600 px-6 py-3 rounded-full font-bold text-lg group-hover:bg-pink-50 transition-colors">
                詳細を見る
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* スタッフ求人 */}
          <Link
            href="/recruit/staff"
            className="group bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-400 rounded-3xl p-8 md:p-12 text-white shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              {/* アイコン */}
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                <FiUsers className="text-6xl" />
              </div>
              
              {/* タイトル */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                スタッフ求人
              </h2>
              
              {/* 説明 */}
              <p className="text-lg md:text-xl mb-6 opacity-90">
                やりがいと安定を手に入れる
              </p>
              
              {/* 特徴 */}
              <ul className="space-y-2 mb-8 text-left w-full max-w-xs">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  高時給・昇給制度あり
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  シフト自由（週2日〜）
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  未経験者大歓迎
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  社会保険完備
                </li>
              </ul>
              
              {/* ボタン */}
              <div className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-full font-bold text-lg group-hover:bg-blue-50 transition-colors">
                詳細を見る
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* お問い合わせセクション */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              お気軽にお問い合わせください
            </h3>
            <p className="text-gray-600 mb-6">
              ご不明な点がございましたら、お電話またはLINEでお気軽にお問い合わせください
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="tel:050-1748-7999"
                className="inline-flex items-center justify-center bg-primary-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg"
              >
                📞 050-1748-7999
              </a>
              
              <a
                href="#"
                className="inline-flex items-center justify-center bg-green-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-600 transition-colors shadow-lg"
              >
                💬 LINE で相談
              </a>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              受付時間：10:00〜22:00（年中無休）
            </p>
          </div>
        </div>

        {/* 店舗情報 */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
            店舗情報
          </h3>
          
          <div className="space-y-3 text-gray-700">
            <div className="flex">
              <span className="font-bold w-32">店舗名：</span>
              <span>人妻の蜜</span>
            </div>
            <div className="flex">
              <span className="font-bold w-32">エリア：</span>
              <span>西船橋</span>
            </div>
            <div className="flex">
              <span className="font-bold w-32">電話番号：</span>
              <a href="tel:050-1748-7999" className="text-primary-600 hover:underline">
                050-1748-7999
              </a>
            </div>
            <div className="flex">
              <span className="font-bold w-32">営業時間：</span>
              <span>10:00〜24:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
