'use client'

import { useParams } from 'next/navigation';
import Link from 'next/link'
import Header from '@/components/Header'
import { Clock, Phone, MapPin, CreditCard, Heart, Shield, Users } from 'lucide-react'

export default function SystemPage() {
  const params = useParams();
  const storeId = params.store_id as string;
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Header storeId={storeId} />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white py-16 mt-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">料金システム</h1>
          <p className="text-pink-100 text-lg">明朗会計・安心のご利用料金</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 基本料金 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            <Clock className="mr-3 text-pink-600" size={32} />
            基本料金
          </h2>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-pink-600 to-pink-500 text-white">
                    <th className="px-6 py-4 text-left">コース時間</th>
                    <th className="px-6 py-4 text-right">料金</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-pink-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">60分</td>
                    <td className="px-6 py-4 text-right text-2xl font-bold text-pink-600">¥15,000</td>
                  </tr>
                  <tr className="border-b hover:bg-pink-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">90分</td>
                    <td className="px-6 py-4 text-right text-2xl font-bold text-pink-600">¥22,000</td>
                  </tr>
                  <tr className="border-b hover:bg-pink-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">120分</td>
                    <td className="px-6 py-4 text-right text-2xl font-bold text-pink-600">¥28,000</td>
                  </tr>
                  <tr className="border-b hover:bg-pink-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">150分</td>
                    <td className="px-6 py-4 text-right text-2xl font-bold text-pink-600">¥35,000</td>
                  </tr>
                  <tr className="border-b hover:bg-pink-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">180分</td>
                    <td className="px-6 py-4 text-right text-2xl font-bold text-pink-600">¥42,000</td>
                  </tr>
                  <tr className="hover:bg-pink-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">延長30分</td>
                    <td className="px-6 py-4 text-right text-2xl font-bold text-pink-600">¥7,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-gradient-to-r from-pink-100 to-pink-50 px-6 py-4">
              <p className="text-sm text-gray-700">
                <Shield className="inline mr-2 text-pink-600" size={16} />
                ※料金は全て税込価格です
              </p>
            </div>
          </div>
        </section>

        {/* オプション料金 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            <Heart className="mr-3 text-pink-600" size={32} />
            オプション料金
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-800">3Pプレイ</h3>
                <span className="text-2xl font-bold text-pink-600">+¥10,000</span>
              </div>
              <p className="text-gray-600 text-sm">キャスト2名での楽しいひとときを</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-800">お泊まり</h3>
                <span className="text-2xl font-bold text-pink-600">¥80,000〜</span>
              </div>
              <p className="text-gray-600 text-sm">22:00〜翌10:00（12時間）</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-800">コスプレ</h3>
                <span className="text-2xl font-bold text-pink-600">+¥3,000</span>
              </div>
              <p className="text-gray-600 text-sm">お好みの衣装をご指定ください</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-800">出張料金</h3>
                <span className="text-2xl font-bold text-pink-600">+¥3,000</span>
              </div>
              <p className="text-gray-600 text-sm">西船橋駅から徒歩15分圏内</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-800">甘え・Mプレイ</h3>
                <span className="text-2xl font-bold text-pink-600">+¥5,000</span>
              </div>
              <p className="text-gray-600 text-sm">特別なプレイスタイル</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-800">指名料</h3>
                <span className="text-2xl font-bold text-pink-600">無料</span>
              </div>
              <p className="text-gray-600 text-sm">お気に入りのキャストを指名</p>
            </div>
          </div>
        </section>

        {/* 支払い方法 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            <CreditCard className="mr-3 text-pink-600" size={32} />
            お支払い方法
          </h2>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-pink-100 rounded-full p-3">
                  <CreditCard className="text-pink-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">現金</h3>
                  <p className="text-gray-600">後払い制となっております</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-100 rounded-full p-3">
                  <CreditCard className="text-pink-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">クレジットカード</h3>
                  <p className="text-gray-600">VISA / MasterCard / JCB / AMEX</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-100 rounded-full p-3">
                  <CreditCard className="text-pink-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">電子マネー</h3>
                  <p className="text-gray-600">PayPay / 楽天Pay / LINE Pay</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-100 rounded-full p-3">
                  <CreditCard className="text-pink-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">銀行振込</h3>
                  <p className="text-gray-600">事前振込も承ります</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 利用規約 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            <Users className="mr-3 text-pink-600" size={32} />
            ご利用案内
          </h2>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-pink-600 font-bold mr-3">●</span>
                <span className="text-gray-700">18歳未満の方のご利用は固くお断りいたします。</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 font-bold mr-3">●</span>
                <span className="text-gray-700">初回ご利用のお客様は身分証明書のご提示をお願いしております。</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 font-bold mr-3">●</span>
                <span className="text-gray-700">当日キャンセルは全額キャンセル料を頂戴いたします。</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 font-bold mr-3">●</span>
                <span className="text-gray-700">キャストへの本番行為・撮影・盗撮は固くお断りいたします。</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 font-bold mr-3">●</span>
                <span className="text-gray-700">泥酔状態でのご利用はお断りさせていただく場合がございます。</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 font-bold mr-3">●</span>
                <span className="text-gray-700">キャストへの連絡先交換や店外デートは禁止しております。</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 font-bold mr-3">●</span>
                <span className="text-gray-700">お客様都合による指名変更は変更料¥2,000を頂戴いたします。</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 営業時間・アクセス */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            <MapPin className="mr-3 text-pink-600" size={32} />
            営業時間・アクセス
          </h2>
          
          <div className="bg-gradient-to-br from-pink-600 to-pink-500 rounded-2xl shadow-xl p-8 text-white">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">人妻の蜜</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Clock className="mr-3" size={20} />
                    <span>営業時間: 9:00〜翌6:00</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-3" size={20} />
                    <span>エリア: 西船橋</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-3" size={20} />
                    <span>050-1748-7999</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">対応エリア</h3>
                <p className="text-pink-100 leading-relaxed">
                  西船橋駅周辺を中心に、出張サービスも承っております。<br />
                  詳しいエリアについてはお電話にてお問い合わせください。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/casts"
            className="inline-block bg-gradient-to-r from-pink-600 to-pink-500 text-white px-12 py-4 rounded-full text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            キャストを探す
          </Link>
          
          <div className="mt-8">
            <a
              href="tel:050-1748-7999"
              className="inline-flex items-center space-x-2 text-pink-600 font-bold text-xl hover:text-pink-700"
            >
              <Phone size={24} />
              <span>050-1748-7999</span>
            </a>
            <p className="text-gray-600 mt-2">お電話でのご予約も受け付けております</p>
          </div>
        </div>
      </div>
    </div>
  )
}
