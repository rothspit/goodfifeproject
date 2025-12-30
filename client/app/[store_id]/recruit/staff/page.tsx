'use client';

import Header from '@/components/Header';
import Link from 'next/link';
import { FiArrowLeft, FiCheck, FiUsers, FiDollarSign, FiClock, FiTrendingUp, FiShield, FiPhone } from 'react-icons/fi';

export default function StaffRecruitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
        <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400 rounded-3xl p-8 md:p-12 text-white mb-12 shadow-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            スタッフ大募集！
          </h1>
          <p className="text-xl md:text-2xl mb-6">
            人妻の蜜で一緒にお店を盛り上げませんか？
          </p>
          <p className="text-lg opacity-90">
            未経験者大歓迎！あなたのやる気を応援します
          </p>
        </div>

        {/* 募集職種 */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            募集職種
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ドライバー */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm mr-3">募集中</span>
                ドライバー
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>仕事内容：</strong>キャストの送迎業務</p>
                <p><strong>時給：</strong>1,500円〜2,000円</p>
                <p><strong>勤務時間：</strong>10:00〜24:00（シフト制）</p>
                <p><strong>資格：</strong>普通自動車免許（AT限定可）</p>
                <p className="text-sm text-gray-600 mt-4">
                  ※社用車貸与、ガソリン代支給、運転が好きな方大歓迎！
                </p>
              </div>
            </div>

            {/* 電話受付 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm mr-3">募集中</span>
                電話受付スタッフ
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>仕事内容：</strong>電話予約受付、キャスト管理</p>
                <p><strong>時給：</strong>1,300円〜1,800円</p>
                <p><strong>勤務時間：</strong>10:00〜24:00（シフト制）</p>
                <p><strong>資格：</strong>特になし（未経験OK）</p>
                <p className="text-sm text-gray-600 mt-4">
                  ※女性スタッフ活躍中、明るく対応できる方歓迎！
                </p>
              </div>
            </div>

            {/* マネージャー */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm mr-3">募集中</span>
                マネージャー候補
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>仕事内容：</strong>店舗運営全般、スタッフ管理</p>
                <p><strong>月給：</strong>30万円〜50万円</p>
                <p><strong>勤務時間：</strong>10:00〜24:00（応相談）</p>
                <p><strong>資格：</strong>マネジメント経験者優遇</p>
                <p className="text-sm text-gray-600 mt-4">
                  ※キャリアアップ可能、独立支援制度あり！
                </p>
              </div>
            </div>

            {/* Webデザイナー */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm mr-3">募集中</span>
                Web担当
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>仕事内容：</strong>HP管理、SNS運営、デザイン</p>
                <p><strong>時給：</strong>1,500円〜2,500円</p>
                <p><strong>勤務時間：</strong>週2〜3日、在宅勤務OK</p>
                <p><strong>資格：</strong>Webデザイン・SNS運営経験者</p>
                <p className="text-sm text-gray-600 mt-4">
                  ※完全リモート可能、副業OK！
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            当店で働く<span className="text-blue-600">6つのメリット</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* メリット1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FiDollarSign className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">高時給</h3>
              </div>
              <p className="text-gray-600">
                業界トップクラスの高時給！週払い・日払いも対応可能です。
              </p>
            </div>

            {/* メリット2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FiClock className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">シフト自由</h3>
              </div>
              <p className="text-gray-600">
                週2日〜、1日4時間〜OK！あなたのライフスタイルに合わせて働けます。
              </p>
            </div>

            {/* メリット3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FiUsers className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">未経験歓迎</h3>
              </div>
              <p className="text-gray-600">
                丁寧な研修制度で未経験でも安心！先輩スタッフがしっかりサポートします。
              </p>
            </div>

            {/* メリット4 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FiTrendingUp className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">昇給制度</h3>
              </div>
              <p className="text-gray-600">
                頑張り次第で昇給・昇格のチャンス！キャリアアップを全力でサポートします。
              </p>
            </div>

            {/* メリット5 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FiShield className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">安定環境</h3>
              </div>
              <p className="text-gray-600">
                安定した経営基盤で長く働ける！社会保険完備、有給休暇あり。
              </p>
            </div>

            {/* メリット6 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FiCheck className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">充実待遇</h3>
              </div>
              <p className="text-gray-600">
                交通費全額支給、制服貸与、社員割引など、各種手当が充実！
              </p>
            </div>
          </div>
        </section>

        {/* 給与・待遇 */}
        <section className="mb-12 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            給与・待遇
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-l-4 border-blue-500 pl-6 py-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                給与体系
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• ドライバー：時給1,500円〜2,000円</li>
                <li>• 電話受付：時給1,300円〜1,800円</li>
                <li>• マネージャー：月給30万円〜50万円</li>
                <li>• Web担当：時給1,500円〜2,500円</li>
                <li>• 昇給あり（年2回査定）</li>
                <li>• 各種インセンティブあり</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-6 py-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                待遇・福利厚生
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• 交通費全額支給</li>
                <li>• 社会保険完備（雇用・労災・健康・厚生年金）</li>
                <li>• 有給休暇あり</li>
                <li>• 制服貸与</li>
                <li>• 社員割引あり</li>
                <li>• 独立支援制度あり（マネージャー職）</li>
                <li>• 週払い・日払い対応可能</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-6 py-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                勤務時間
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• 営業時間：10:00〜24:00</li>
                <li>• シフト制（週2日〜OK）</li>
                <li>• 1日4時間〜勤務可能</li>
                <li>• 残業ほぼなし</li>
                <li>• 副業OK（要相談）</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 応募資格 */}
        <section className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            応募資格
          </h2>
          
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-start">
              <FiCheck className="text-blue-600 text-2xl mr-3 flex-shrink-0 mt-1" />
              <p className="text-lg text-gray-700">
                <strong>年齢：</strong>18歳以上（高校生不可）
              </p>
            </div>
            <div className="flex items-start">
              <FiCheck className="text-blue-600 text-2xl mr-3 flex-shrink-0 mt-1" />
              <p className="text-lg text-gray-700">
                <strong>経験：</strong>未経験者大歓迎！風俗業界未経験でもOK
              </p>
            </div>
            <div className="flex items-start">
              <FiCheck className="text-blue-600 text-2xl mr-3 flex-shrink-0 mt-1" />
              <p className="text-lg text-gray-700">
                <strong>学歴：</strong>不問（学生・フリーター・主婦（夫）歓迎）
              </p>
            </div>
            <div className="flex items-start">
              <FiCheck className="text-blue-600 text-2xl mr-3 flex-shrink-0 mt-1" />
              <p className="text-lg text-gray-700">
                <strong>その他：</strong>明るく元気な方、責任感のある方、長く働きたい方歓迎
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
                A. はい、大丈夫です！当店のスタッフの多くが未経験からスタートしています。丁寧な研修とOJTで、しっかりサポートします。
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <summary className="font-bold text-lg text-gray-800">
                Q. シフトはどのくらい自由ですか？
              </summary>
              <p className="mt-4 text-gray-600">
                A. 週2日、1日4時間からOKです。学業や家事との両立も可能です。急なシフト変更も相談に乗ります。
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <summary className="font-bold text-lg text-gray-800">
                Q. 服装や髪型の規定はありますか？
              </summary>
              <p className="mt-4 text-gray-600">
                A. 基本的には自由です。ただし、清潔感のある身だしなみをお願いしています。制服は支給します。
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <summary className="font-bold text-lg text-gray-800">
                Q. 女性スタッフはいますか？
              </summary>
              <p className="mt-4 text-gray-600">
                A. はい、電話受付や事務スタッフに女性が活躍しています。女性も安心して働ける環境です。
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <summary className="font-bold text-lg text-gray-800">
                Q. 昇給・昇格のチャンスはありますか？
              </summary>
              <p className="mt-4 text-gray-600">
                A. はい、年2回の査定で昇給のチャンスがあります。また、マネージャーへの昇格や独立支援制度もあります。
              </p>
            </details>
          </div>
        </section>

        {/* 応募フォーム */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              まずは気軽にご応募ください！
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              お電話・LINEでのご応募も受付中
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <a
                href="tel:050-1748-7999"
                className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                <FiPhone className="mr-2 text-xl" />
                050-1748-7999
              </a>
              
              <Link
                href="/recruit/staff/apply"
                className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Web応募フォーム
              </Link>
            </div>

            <p className="mt-6 text-sm opacity-75">
              受付時間：10:00〜22:00（年中無休）
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
              <a href="tel:050-1748-7999" className="text-blue-600 hover:underline">
                050-1748-7999
              </a>
            </div>
            <div className="flex">
              <span className="font-bold w-32">営業時間：</span>
              <span>10:00〜24:00</span>
            </div>
            <div className="flex">
              <span className="font-bold w-32">面接：</span>
              <span>随時受付中（予約制）</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
