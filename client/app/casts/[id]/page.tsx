'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { castApi } from '@/lib/api';
import type { Cast } from '@/types';
import { FiStar, FiCalendar, FiClock, FiHeart, FiMessageCircle, FiPhone, FiMapPin, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function CastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cast, setCast] = useState<Cast | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchCastDetail();
    }
  }, [params.id]);

  const fetchCastDetail = async () => {
    try {
      const response = await castApi.getCastById(Number(params.id));
      setCast(response.data.cast);
    } catch (error) {
      console.error('キャスト詳細取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <Header />
        <div className="h-20"></div>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!cast) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <Header />
        <div className="h-20"></div>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">キャストが見つかりません</h1>
          <Link href="/casts" className="text-primary-600 hover:underline">
            キャスト一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  // 画像がない場合はデフォルト画像を使用
  const images = cast.images && cast.images.length > 0 
    ? cast.images 
    : cast.primary_image 
      ? [{ id: 0, image_url: cast.primary_image, is_primary: 1, display_order: 0 }]
      : [{ id: 0, image_url: `https://placehold.co/390x520/FFB6C1/000000?text=${encodeURIComponent(cast.name)}`, is_primary: 1, display_order: 0 }];
  
  const totalImages = images.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalImages);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalImages) % totalImages);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      <Header />
      
      <div className="h-20"></div>

      {/* 背景装飾 - 左側の縦書きテキスト */}
      <div className="fixed left-0 top-1/4 z-0 pointer-events-none hidden lg:block">
        <div className="relative">
          <div 
            className="text-6xl font-bold text-pink-100 opacity-40"
            style={{ 
              writingMode: 'vertical-rl',
              textOrientation: 'upright',
              letterSpacing: '0.5rem',
              padding: '2rem 0'
            }}
          >
            <div className="mb-8">熟女</div>
            <div className="mb-8">人妻</div>
            <div className="mb-8">の</div>
            <div className="mb-8">魅力</div>
          </div>
        </div>
      </div>

      {/* 背景装飾 - 右側のパターン */}
      <div className="fixed right-0 top-1/4 z-0 pointer-events-none hidden lg:block">
        <div className="relative">
          <div 
            className="text-6xl font-bold text-pink-100 opacity-40"
            style={{ 
              writingMode: 'vertical-rl',
              textOrientation: 'upright',
              letterSpacing: '0.5rem',
              padding: '2rem 0'
            }}
          >
            <div className="mb-8">大人</div>
            <div className="mb-8">の</div>
            <div className="mb-8">女性</div>
            <div className="mb-8">の</div>
            <div className="mb-8">癒し</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pb-32 md:pb-8 relative z-10">
        {/* パンくずリスト */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary-600">トップ</Link>
          <span className="mx-2">/</span>
          <Link href="/casts" className="hover:text-primary-600">キャスト一覧</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{cast.name}</span>
        </div>

        {/* Profile装飾ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-20 h-px bg-gradient-to-r from-transparent to-pink-300"></div>
            <div className="text-pink-400 text-4xl font-serif italic">Profile</div>
            <div className="w-20 h-px bg-gradient-to-l from-transparent to-pink-300"></div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">{cast.name}</h1>
        </div>

        {/* 2カラムレイアウト：画像と基本情報 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* 左カラム：画像スライダー */}
          {images.length > 0 && (
            <div>
              <div className="relative">
                {/* メイン画像 */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={images[currentSlide].image_url}
                    alt={`${cast.name} - ${currentSlide + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* 前へボタン */}
                  {totalImages > 1 && (
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                    >
                      <FiChevronLeft size={20} />
                    </button>
                  )}

                  {/* 次へボタン */}
                  {totalImages > 1 && (
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                    >
                      <FiChevronRight size={20} />
                    </button>
                  )}

                  {/* 画像カウンター */}
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                    {currentSlide + 1} / {totalImages}
                  </div>
                </div>

                {/* サムネイル */}
                {totalImages > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <button
                        key={img.id}
                        onClick={() => setCurrentSlide(index)}
                        className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden transition-all ${
                          index === currentSlide
                            ? 'ring-3 ring-pink-500 scale-105'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.image_url}
                          alt={`thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 右カラム：基本情報 */}
          <div className="space-y-6">
            {/* 基本プロフィール */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-3 border-b-2 border-pink-200">
                基本情報
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">年齢</span>
                  <span className="text-2xl font-bold text-pink-600">{cast.age}歳</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-pink-100">
                  <span className="text-gray-600 font-medium">身長</span>
                  <span className="text-xl font-bold text-gray-800">{cast.height}cm</span>
                </div>
                <div className="py-2 border-t border-pink-100">
                  <div className="text-gray-600 font-medium mb-2">スリーサイズ</div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">バスト</div>
                      <div className="text-lg font-bold text-pink-600">
                        {cast.bust}
                        <span className="text-sm ml-1">({cast.cup_size})</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">ウエスト</div>
                      <div className="text-lg font-bold text-purple-600">{cast.waist}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">ヒップ</div>
                      <div className="text-lg font-bold text-pink-600">{cast.hip}</div>
                    </div>
                  </div>
                </div>
                {cast.blood_type && (
                  <div className="flex justify-between items-center py-2 border-t border-pink-100">
                    <span className="text-gray-600 font-medium">血液型</span>
                    <span className="text-lg font-bold text-gray-800">{cast.blood_type}型</span>
                  </div>
                )}
                {cast.weight && (
                  <div className="flex justify-between items-center py-2 border-t border-pink-100">
                    <span className="text-gray-600 font-medium">体重</span>
                    <span className="text-lg font-bold text-gray-800">{cast.weight}kg</span>
                  </div>
                )}
              </div>
            </div>

            {/* 出勤情報 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <FiCalendar className="text-pink-500" size={24} />
                <h2 className="text-xl font-bold text-gray-800">出勤情報</h2>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['月', '火', '水', '木', '金', '土', '日'].map((day, index) => (
                  <div
                    key={day}
                    className={`text-center py-3 rounded-lg font-bold text-sm ${
                      index % 2 === 0
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                ※ 最新の出勤情報はお電話でお問い合わせください
              </p>
            </div>
          </div>
        </div>

        {/* 対応可能オプション */}
        {(cast.threesome_ok || cast.home_visit_ok || cast.clothing_request_ok || cast.overnight_ok || cast.sweet_sadist_ok || cast.hairless ||
          cast.deep_kiss || cast.body_lip || cast.sixtynine || cast.fellatio || cast.sumata || cast.instant_cunnilingus || cast.instant_fellatio || cast.anal_fuck || cast.anal_ok || cast.sm_ok ||
          cast.rotor || cast.vibrator || cast.mini_electric_massager || cast.remote_vibrator_meetup || cast.toy_ok || cast.cosplay_ok ||
          cast.no_panties_visit || cast.no_bra_visit || cast.pantyhose || cast.pantyhose_rip || cast.night_crawling_set || cast.lotion_bath || cast.lotion_ok || cast.holy_water) && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">対応可能オプション</h2>
          
          {/* 基本オプション */}
          {(cast.threesome_ok || cast.home_visit_ok || cast.clothing_request_ok || cast.overnight_ok || cast.sweet_sadist_ok || cast.hairless) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-pink-600 mb-3">基本オプション</h3>
            <div className="flex flex-wrap gap-2">
              {cast.threesome_ok && (
                <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium border border-pink-200">
                  3P可能
                </span>
              )}
              {cast.home_visit_ok && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium border border-purple-200">
                  自宅訪問OK
                </span>
              )}
              {cast.clothing_request_ok && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                  服装リクエストOK
                </span>
              )}
              {cast.overnight_ok && (
                <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-200">
                  お泊まりOK
                </span>
              )}
              {cast.sweet_sadist_ok && (
                <span className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium border border-rose-200">
                  甘サドプレイOK
                </span>
              )}
              {cast.hairless && (
                <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium border border-pink-200">
                  パイパン
                </span>
              )}
            </div>
          </div>
          )}

          {/* プレイ内容 */}
          {(cast.deep_kiss || cast.body_lip || cast.sixtynine || cast.fellatio || cast.sumata || cast.instant_cunnilingus || cast.instant_fellatio || cast.anal_fuck || cast.anal_ok || cast.sm_ok) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-pink-600 mb-3">プレイ内容</h3>
            <div className="flex flex-wrap gap-2">
              {cast.deep_kiss && (
                <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium border border-red-200">
                  Dキス
                </span>
              )}
              {cast.body_lip && (
                <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium border border-pink-200">
                  全身リップ
                </span>
              )}
              {cast.sixtynine && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium border border-purple-200">
                  69
                </span>
              )}
              {cast.fellatio && (
                <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium border border-pink-200">
                  フェラ
                </span>
              )}
              {cast.sumata && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                  素股
                </span>
              )}
              {cast.instant_cunnilingus && (
                <span className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium border border-rose-200">
                  即クンニ
                </span>
              )}
              {cast.instant_fellatio && (
                <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium border border-pink-200">
                  即尺
                </span>
              )}
              {cast.anal_fuck && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium border border-purple-200">
                  アナルファックAF
                </span>
              )}
              {cast.anal_ok && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium border border-purple-200">
                  アナルOK
                </span>
              )}
              {cast.sm_ok && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                  SM OK
                </span>
              )}
            </div>
          </div>
          )}

          {/* グッズ使用 */}
          {(cast.rotor || cast.vibrator || cast.mini_electric_massager || cast.remote_vibrator_meetup || cast.toy_ok || cast.cosplay_ok) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-pink-600 mb-3">グッズ使用</h3>
            <div className="flex flex-wrap gap-2">
              {cast.rotor && (
                <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium border border-pink-200">
                  ローター
                </span>
              )}
              {cast.vibrator && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium border border-purple-200">
                  バイブ
                </span>
              )}
              {cast.mini_electric_massager && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                  ミニ電マ
                </span>
              )}
              {cast.remote_vibrator_meetup && (
                <span className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium border border-rose-200">
                  とびっこ待ち合わせ
                </span>
              )}
              {cast.toy_ok && (
                <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium border border-pink-200">
                  おもちゃOK
                </span>
              )}
              {cast.cosplay_ok && (
                <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-200">
                  コスプレOK
                </span>
              )}
            </div>
          </div>
          )}

          {/* 特殊オプション */}
          {(cast.no_panties_visit || cast.no_bra_visit || cast.pantyhose || cast.pantyhose_rip || cast.night_crawling_set || cast.lotion_bath || cast.lotion_ok || cast.holy_water) && (
          <div>
            <h3 className="text-sm font-semibold text-pink-600 mb-3">特殊オプション</h3>
            <div className="flex flex-wrap gap-2">
              {cast.no_panties_visit && (
                <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium border border-pink-200">
                  ノーパン訪問
                </span>
              )}
              {cast.no_bra_visit && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium border border-purple-200">
                  ノーブラ訪問
                </span>
              )}
              {cast.pantyhose && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                  パンスト
                </span>
              )}
              {cast.pantyhose_rip && (
                <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-200">
                  パンスト破き
                </span>
              )}
              {cast.night_crawling_set && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                  夜這いセット
                </span>
              )}
              {cast.lotion_bath && (
                <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium border border-pink-200">
                  ローション風呂
                </span>
              )}
              {cast.lotion_ok && (
                <span className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium border border-rose-200">
                  ローションOK
                </span>
              )}
              {cast.holy_water && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                  聖水
                </span>
              )}
            </div>
          </div>
          )}
        </div>
        )}

        {/* その他情報 */}
        {(cast.has_children || cast.smoking_ok || cast.tattoo || cast.hobby || cast.specialty) && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">その他情報</h2>
          <div className="flex flex-wrap gap-2">
            {cast.has_children && (
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                出産経験あり
              </span>
            )}
            {cast.smoking_ok && (
              <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                喫煙する
              </span>
            )}
            {cast.tattoo && (
              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium border border-purple-200">
                刺青あり
              </span>
            )}
            {cast.hobby && (
              <div className="w-full py-2">
                <span className="text-sm text-gray-600 font-medium">趣味:</span>
                <span className="ml-2 text-sm text-gray-800">{cast.hobby}</span>
              </div>
            )}
            {cast.specialty && (
              <div className="w-full py-2">
                <span className="text-sm text-gray-600 font-medium">特技:</span>
                <span className="ml-2 text-sm text-gray-800">{cast.specialty}</span>
              </div>
            )}
          </div>
        </div>
        )}

        {/* 2カラムレイアウト：コメント */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* 左カラム：キャストコメント */}
          <div className="space-y-8">
            {/* キャストコメント */}
            {cast.cast_comment && (
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FiMessageCircle className="text-pink-500" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">キャストコメント</h2>
                </div>
                <div className="bg-white/80 rounded-xl p-5 leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {cast.cast_comment}
                </div>
              </div>
            )}

            {/* 店長コメント */}
            {cast.manager_comment && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FiStar className="text-indigo-500" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">店長コメント</h2>
                </div>
                <div className="bg-white/80 rounded-xl p-5 leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {cast.manager_comment}
                </div>
              </div>
            )}
          </div>

          {/* 右カラム：店長コメント */}
          <div className="space-y-8">
            {/* 店長コメント（右カラム用） */}
            {cast.manager_comment && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FiStar className="text-indigo-500" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">店長コメント</h2>
                </div>
                <div className="bg-white/80 rounded-xl p-5 leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {cast.manager_comment}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 写メ日記（ブログ） */}
        {cast.blogs && cast.blogs.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiMessageCircle className="text-pink-600" />
            写メ日記
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cast.blogs.map((blog: any) => (
              <div
                key={blog.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
              >
                {blog.image_url && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(blog.created_at).toLocaleDateString('ja-JP')}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{blog.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{blog.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* 口コミ */}
        {cast.reviews && cast.reviews.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiStar className="text-gold-600" />
            口コミ
          </h2>
          <div className="space-y-4">
            {cast.reviews.map((review: any) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800">
                        {review.user_name || '匿名'}
                      </span>
                      <div className="flex items-center gap-1 text-gold-600">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={i < review.rating ? 'fill-current' : ''}
                            size={16}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                    <div className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* 予約カード */}
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">ご予約・お問い合わせ</h2>
            <p className="text-pink-100">お気軽にお電話ください</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <FiPhone size={32} />
              <div>
                <div className="text-sm opacity-80">人妻の蜜 / 西船橋</div>
                <div className="text-3xl font-bold tracking-wider">050-1748-7999</div>
              </div>
            </div>
            <div className="text-center text-sm opacity-80">
              <FiClock className="inline mr-2" />
              営業時間：9:00 〜 翌6:00
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <button className="bg-white text-pink-600 py-4 rounded-xl font-bold hover:bg-pink-50 transition-colors flex items-center justify-center gap-2">
              <FiPhone />
              電話予約
            </button>
            <button className="bg-white/20 hover:bg-white/30 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
              <FiHeart />
              お気に入り登録
            </button>
          </div>

          <div className="mt-6 text-center text-sm opacity-80">
            <div className="flex items-center justify-center gap-2">
              <FiMapPin />
              <span>千葉県船橋市 / 西船橋駅周辺</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
