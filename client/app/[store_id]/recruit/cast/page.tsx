'use client';

import Header from '@/components/Header';
import Link from 'next/link';
import { FiArrowLeft, FiCheck, FiHeart, FiDollarSign, FiClock, FiUsers, FiShield, FiPhone } from 'react-icons/fi';

export default function CastRecruitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Header />
      
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-12">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Link
            href="/recruit"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            求人トップに戻る
          </Link>
        </div>

        {/* ヒーローセクション */}
        <div className="bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400 rounded-3xl p-8 md:p-12 text-white mb-12 shadow-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            キャスト大募集！
          </h1>
          <p className="text-xl md:text-2xl mb-6">
            人妻の蜜で一緒に働きませんか？
          </p>
          <p className="text-lg opacity-90">
            未経験者大歓迎！あなたのペースで無理なく働けます
          </p>
        </div>

        {/* 特徴セクション */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            当店で働く<span className="text-primary-600">6つのメリット</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* メリット1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 p-3 rounded-full mr-4">
                  <FiDollarSign className="text-pink-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">高収入</h3>
              </div>
              <p className="text-gray-600">
                業界トップクラスの高収入！完全日払い制で、働いたその日にお給料をお渡しします。
              </p>
            </div>

            {/* メリット2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 p-3 rounded-full mr-4">
                  <FiClock className="text-pink-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">自由シフト</h3>
              </div>
              <p className="text-gray-600">
                完全自由出勤制！あなたの都合に合わせて働けます。週1日、1日2時間からOK！
              </p>
            </div>

            {/* メリット3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 p-3 rounded-full mr-4">
                  <FiHeart className="text-pink-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">未経験歓迎</h3>
              </div>
              <p className="text-gray-600">
                初めての方も安心！丁寧な研修とサポート体制で、ゼロからしっかりサポートします。
              </p>
            </div>

            {/* メリット4 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 p-3 rounded-full mr-4">
                  <FiShield className="text-pink-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">安心・安全</h3>
              </div>
              <p className="text-gray-600">
                女性スタッフ常駐で安心！トラブル時も即対応します。完全個室待機でプライバシーも守ります。
              </p>
            </div>

            {/* メリット5 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 p-3 rounded-full mr-4">
                  <FiUsers className="text-pink-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">アットホーム</h3>
              </div>
              <p className="text-gray-600">
                スタッフ・キャスト同士の仲が良く、働きやすい環境です。困ったときは気軽に相談できます。
              </p>
            </div>

            {/* メリット6 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 p-3 rounded-full mr-4">
                  <FiCheck className="text-pink-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">充実待遇</h3>
              </div>
              <p className="text-gray-600">
                各種手当充実！交通費支給、制服貸与、ノルマ・罰金なし。寮完備で遠方の方も安心です。
              </p>
            </div>
          </div>
        </section>

        {/* 給与システム */}
        <section className="mb-12 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            給与システム
          </h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-pink-500 pl-6 py-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                基本バック率：50%〜60%
              </h3>
              <p className="text-gray-600 text-lg">
                業界最高水準のバック率！頑張り次第でさらにアップも可能です。
              </p>
            </div>

            <div className="border-l-4 border-pink-500 pl-6 py-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                完全日払い制
              </h3>
              <p className="text-gray-600 text-lg">
                働いたその日にお給料をお渡し！急な出費にも対応できます。
              </p>
            </div>

            <div className="border-l-4 border-pink-500 pl-6 py-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                各種手当充実
              </h3>
              <ul className="text-gray-600 text-lg space-y-2">
                <li>• 入店祝い金：最大10万円</li>
                <li>• 交通費全額支給</li>
                <li>• 指名料バック</li>
                <li>• 本指名料バック</li>
                <li>• 新人期間特別バック</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 応募資格 */}
        <section className="mb-12 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            応募資格
          </h2>
          
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-start">
              <FiCheck className="text-pink-600 text-2xl mr-3 flex-shrink-0 mt-1" />
              <p className="text-lg text-gray-700">
                <strong>年齢：</strong>18歳以上（高校生不可）〜40代まで
              </p>
            </div>
            <div className="flex items-start">
              <FiCheck className="text-pink-600 text-2xl mr-3 flex-shrink-0 mt-1" />
              <p className="text-lg text-gray-700">
                <strong>経験：</strong>未経験者大歓迎！丁寧に指導します
              </p>
            </div>
            <div className="flex items-start">
              <FiCheck className="text-pink-600 text-2xl mr-3 flex-shrink-0 mt-1" />
              <p className="text-lg text-gray-700">
                <strong>容姿：</strong>一般的な容姿があればOK！
              </p>
            </div>
            <div className="flex items-start">
              <FiCheck className="text-pink-600 text-2xl mr-3 flex-shrink-0 mt-1" />
              <p className="text-lg text-gray-700">
                <strong>その他：</strong>週1日、1日2時間からOK！学生・主婦・OL・フリーター歓迎
              </p>
            </div>
          </div>
        </section>

        {/* よくある質問 */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            よくある質問
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <summary className="font-bold text-lg text-gray-800">
                Q. 未経験でも大丈夫ですか？
              </summary>
              <p className="mt-4 text-gray-600">
                A. もちろん大丈夫です！当店のキャストの約70%が未経験からスタートしています。丁寧な研修と先輩キャストのサポートがあるので安心してください。
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <summary className="font-bold text-lg text-gray-800">
                Q. どのくらい稼げますか？
              </summary>
              <p className="mt-4 text-gray-600">
                A. 平均して1日3〜5万円程度です。週3日勤務で月収30〜50万円、週5日勤務で月収50〜80万円も可能です。頑張り次第で100万円以上も！
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <summary className="font-bold text-lg text-gray-800">
                Q. 身バレが心配です...
              </summary>
              <p className="mt-4 text-gray-600">
                A. 顔出しNG、写真なしでの出勤も可能です。また、源氏名での登録、写真加工も対応しています。プライバシー保護は徹底しています。
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <summary className="font-bold text-lg text-gray-800">
                Q. 働く時間は自由に決められますか？
              </summary>
              <p className="mt-4 text-gray-600">
                A. はい、完全自由シフト制です。週1日、1日2時間からOK！急な予定が入っても柔軟に対応できます。
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <summary className="font-bold text-lg text-gray-800">
                Q. 寮はありますか？
              </summary>
              <p className="mt-4 text-gray-600">
                A. はい、完備しています。敷金・礼金・保証人不要で即日入居可能です。家具・家電付きですぐに生活できます。
              </p>
            </details>
          </div>
        </section>

        {/* 応募フォーム */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              まずは気軽にご応募ください！
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              お電話・LINEでのご応募も受付中
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <a
                href="tel:050-1748-7999"
                className="inline-flex items-center justify-center bg-white text-pink-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                <FiPhone className="mr-2 text-xl" />
                050-1748-7999
              </a>
              
              <Link
                href="/recruit/cast/apply"
                className="inline-flex items-center justify-center bg-white text-pink-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Web応募フォーム
              </Link>
            </div>

            <p className="mt-6 text-sm opacity-75">
              受付時間：24時間365日対応
            </p>
          </div>
        </section>

        {/* 店舗情報 */}
        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            店舗情報
          </h2>
          
          <div className="max-w-2xl mx-auto space-y-4 text-gray-700">
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
              <a href="tel:050-1748-7999" className="text-pink-600 hover:underline">
                050-1748-7999
              </a>
            </div>
            <div className="flex">
              <span className="font-bold w-32">営業時間：</span>
              <span>10:00〜24:00</span>
            </div>
            <div className="flex">
              <span className="font-bold w-32">面接：</span>
              <span>24時間365日対応（予約制）</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
