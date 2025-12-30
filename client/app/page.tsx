'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MapPin, Phone, Clock, Heart } from 'lucide-react';
import { notoSerifJP } from '@/lib/fonts';

interface Store {
  id: number;
  store_id: string;
  name: string;
  display_name: string;
  address: string;
  phone: string;
  business_hours: string;
  is_active: boolean;
}

export default function BrandTopPage() {
  const [stores, setStores] = useState<Store[]>([
    {
      id: 1,
      store_id: 'nishifuna',
      name: '西船橋店',
      display_name: '人妻の蜜 西船橋店',
      address: '〒273-0031 千葉県船橋市西船橋',
      phone: '050-1748-7999',
      business_hours: '9:00〜6:00',
      is_active: true
    },
    {
      id: 2,
      store_id: 'kinshicho',
      name: '錦糸町店',
      display_name: '人妻の蜜 錦糸町店',
      address: '〒130-0022 東京都墨田区錦糸町',
      phone: '050-XXXX-XXXX',
      business_hours: '9:00〜6:00',
      is_active: true
    },
    {
      id: 3,
      store_id: 'kasai',
      name: '葛西店',
      display_name: '人妻の蜜 葛西店',
      address: '〒134-0084 東京都江戸川区葛西',
      phone: '050-XXXX-XXXX',
      business_hours: '9:00〜6:00',
      is_active: true
    },
    {
      id: 4,
      store_id: 'matsudo',
      name: '松戸店',
      display_name: '人妻の蜜 松戸店',
      address: '〒271-0091 千葉県松戸市本町',
      phone: '050-XXXX-XXXX',
      business_hours: '9:00〜6:00',
      is_active: true
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="text-rose-600 w-8 h-8 animate-pulse" />
              <h1 className={`${notoSerifJP.className} text-4xl font-black tracking-wider`}>
                <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 bg-clip-text text-transparent drop-shadow-lg">人妻の蜜</span>
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                ブランドについて
              </a>
              <a href="#stores" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                店舗一覧
              </a>
              <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                お問い合わせ
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* メインビジュアル */}
      <section className="relative py-20 md:py-32 bg-gradient-to-r from-primary-500 via-pink-500 to-purple-500">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className={`${notoSerifJP.className} text-5xl md:text-7xl font-black mb-6 animate-fade-in tracking-widest drop-shadow-2xl`}>
            人妻の蜜
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            誠実で良い子が多いお店
          </p>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto">
            関東エリアに展開する人妻専門デリヘル。<br />
            30代〜80代まで幅広い年齢層のお客様にご愛顧いただいております。
          </p>
          <a 
            href="#stores" 
            className="inline-block bg-white text-primary-600 px-10 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            店舗を選ぶ
          </a>
        </div>
      </section>

      {/* ブランドについて */}
      <section id="about" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            人妻の蜜について
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-primary-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">誠実なサービス</h3>
              <p className="text-gray-600">
                お客様一人ひとりに真心を込めた対応を心がけています。
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-pink-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">関東エリア展開</h3>
              <p className="text-gray-600">
                西船橋、錦糸町、葛西、松戸の4店舗でサービスを提供しています。
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-purple-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">安心の営業時間</h3>
              <p className="text-gray-600">
                朝9:00から早朝6:00まで、お客様のご都合に合わせて営業しています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 店舗一覧 */}
      <section id="stores" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            店舗一覧
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {stores.map((store) => (
              <div 
                key={store.id}
                className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all"
              >
                <h3 className="text-2xl font-bold mb-4 text-primary-600">
                  {store.display_name}
                </h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary-600" />
                    <a 
                      href={`tel:${store.phone.replace(/-/g, '')}`}
                      className="hover:text-primary-600 transition-colors"
                    >
                      {store.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <span>{store.business_hours}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link 
                    href={`/${store.store_id}`}
                    className="inline-block bg-primary-600 text-white px-6 py-2 rounded-full font-bold hover:bg-primary-700 transition-colors"
                  >
                    この店舗を見る →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* お問い合わせ */}
      <section id="contact" className="py-16 md:py-24 bg-gradient-to-r from-primary-500 to-pink-500">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            お問い合わせ
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            ご不明な点やご質問がございましたら、<br />
            各店舗までお気軽にお問い合わせください。
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {stores.map((store) => (
              <a
                key={store.id}
                href={`tel:${store.phone.replace(/-/g, '')}`}
                className="bg-white text-primary-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                {store.name}: {store.phone}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="text-primary-400 w-6 h-6" />
            <p className="text-2xl font-bold">人妻の蜜</p>
          </div>
          <p className="text-gray-400 mb-4">
            関東エリアの人妻専門デリヘル
          </p>
          <div className="flex justify-center gap-6 mb-6 flex-wrap">
            {stores.map((store) => (
              <Link 
                key={store.id}
                href={`/${store.store_id}`}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {store.name}
              </Link>
            ))}
          </div>
          <p className="text-sm text-gray-400">
            © 2024 人妻の蜜. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
