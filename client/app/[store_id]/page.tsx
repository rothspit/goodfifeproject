'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import AgeVerification from '@/components/AgeVerification';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { FiSearch, FiClock, FiStar, FiMessageCircle, FiPhone, FiZap, FiBell, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { blogApi, reviewApi, announcementApi, instantPrincessApi } from '@/lib/api';
import WeeklySchedule from '@/components/WeeklySchedule';
import CustomerChat from '@/components/CustomerChat';
import type { Cast, Blog, Review, Announcement } from '@/types';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface InstantPrincess {
  id: number;
  cast_id: number;
  cast_name: string;
  cast_age: number;
  cast_image: string;
  is_active: boolean;
  start_time?: string;
  end_time?: string;
}

export default function Home() {
  const params = useParams();
  const storeId = params.store_id as string;
  const [instantPrincesses, setInstantPrincesses] = useState<InstantPrincess[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [instantRes, blogsRes, reviewsRes, announcementsRes] = await Promise.all([
        instantPrincessApi.getAvailable(),
        blogApi.getRecentBlogs(5),
        reviewApi.getRecentReviews(5),
        announcementApi.getAnnouncements({ limit: 5 }),
      ]);

      setInstantPrincesses(instantRes.data.princesses || []);
      setRecentBlogs(blogsRes.data.blogs || []);
      setRecentReviews(reviewsRes.data.reviews || []);
      setAnnouncements(announcementsRes.data.announcements || []);
    } catch (error) {
      console.error('データ取得エラー:', error);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchFilters.name) params.append('name', searchFilters.name);
    if (searchFilters.date) params.append('date', searchFilters.date);
    if (searchFilters.time) params.append('time', searchFilters.time);
    
    window.location.href = `/casts?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <AgeVerification />
      <Header storeId={storeId} />

      {/* スペーサー（ヘッダー分） */}
      <div className="h-20"></div>

      {/* ヒーロースライダー */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation
          loop
          className="h-[400px] md:h-[600px]"
        >
          <SwiperSlide>
            <div className="relative w-full h-full bg-gradient-to-r from-primary-500 to-pink-500 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">人妻の蜜</h1>
                <p className="text-xl md:text-2xl mb-6">誠実で良い子が多いお店</p>
                <p className="text-lg md:text-xl">西船橋 営業時間 9:00〜6:00</p>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">30代〜80代の方に人気</h2>
                <p className="text-lg md:text-xl mb-6">幅広い年齢層に対応</p>
                <Link
                  href="/casts"
                  className="inline-block bg-white text-primary-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all"
                >
                  キャスト一覧を見る
                </Link>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative w-full h-full bg-gradient-to-r from-pink-600 to-red-500 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">リアルタイムチャット対応</h2>
                <p className="text-lg md:text-xl mb-6">キャストと直接やり取りできます</p>
                <a
                  href="tel:050-1748-7999"
                  className="inline-block bg-white text-primary-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all flex items-center gap-2 mx-auto w-fit"
                >
                  <FiPhone size={24} />
                  050-1748-7999
                </a>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* お知らせアコーディオン */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-xl p-1 -mt-20 relative z-10">
          <div className="bg-white rounded-xl overflow-hidden">
            <button
              onClick={() => setAnnouncementOpen(!announcementOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-pink-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FiBell className="text-pink-600 text-2xl" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">お知らせ</h2>
                {announcements.length > 0 && (
                  <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {announcements.length}件
                  </span>
                )}
              </div>
              {announcementOpen ? (
                <FiChevronUp className="text-gray-600 text-2xl" />
              ) : (
                <FiChevronDown className="text-gray-600 text-2xl" />
              )}
            </button>

            {announcementOpen && (
              <div className="px-6 pb-6 space-y-3 border-t border-gray-100">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-xs font-medium text-pink-600 bg-white px-3 py-1 rounded-full shadow-sm">
                          {new Date(announcement.created_at).toLocaleDateString('ja-JP')}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-bold text-gray-800 mb-2">{announcement.title}</h3>
                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {announcement.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">現在お知らせはありません</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 週間出勤予定表 */}
      <WeeklySchedule className="py-8 md:py-12" />

      {/* 検索セクション */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
            <FiSearch className="inline mr-2" />
            キャスト検索
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="名前で検索"
              value={searchFilters.name}
              onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="date"
              placeholder="利用日"
              value={searchFilters.date}
              onChange={(e) => setSearchFilters({ ...searchFilters, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="time"
              placeholder="利用時間"
              value={searchFilters.time}
              onChange={(e) => setSearchFilters({ ...searchFilters, time: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleSearch}
              className="bg-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-700 transition-all shadow-lg"
            >
              検索する
            </button>
            <Link
              href="/casts"
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all"
            >
              詳細検索
            </Link>
          </div>
        </div>
      </section>



      {/* 即姫（出勤連動） */}
      {instantPrincesses.length > 0 && (
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-2xl shadow-2xl p-1">
            <div className="bg-white rounded-xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <FiZap className="text-orange-500 animate-pulse" />
                <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-transparent bg-clip-text">
                  即姫
                </span>
                <span className="text-sm md:text-base font-normal text-gray-600 ml-2">
                  （出勤中のキャストのみ表示）
                </span>
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                今すぐご案内可能なキャストです。出勤スケジュールと自動連動しています。
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {instantPrincesses.map((princess) => (
                  <Link
                    key={princess.id}
                    href={`/casts/${princess.cast_id}`}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 border-2 border-orange-300 hover:border-orange-500"
                  >
                    <div className="relative h-48 md:h-64 bg-gradient-to-br from-yellow-200 to-orange-200">
                      {princess.cast_image ? (
                        <img
                          src={princess.cast_image}
                          alt={princess.cast_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/600x800/FFD700/000000?text=${encodeURIComponent(princess.cast_name)}`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-orange-600">
                          {princess.cast_name}
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        ⚡ 即姫
                      </div>
                      {princess.start_time && princess.end_time && (
                        <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs text-center">
                          <FiClock className="inline mr-1" />
                          {princess.start_time.slice(0, 5)} 〜 {princess.end_time.slice(0, 5)}
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{princess.cast_name}</h3>
                      <p className="text-sm text-gray-600">{princess.cast_age}歳</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-6">
                <a
                  href="tel:050-1748-7999"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                >
                  <FiPhone size={20} />
                  今すぐ予約する
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ブログ新着 */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <FiMessageCircle className="text-primary-600" />
          キャストブログ新着
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentBlogs.map((blog) => (
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
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-primary-600">{blog.cast_name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(blog.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{blog.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{blog.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 口コミ新着 */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <FiStar className="text-gold-600" />
          口コミ新着
        </h2>
        <div className="space-y-4">
          {recentReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
            >
              <div className="flex items-start gap-4">
                {review.cast_image && (
                  <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden">
                    <img
                      src={review.cast_image}
                      alt={review.cast_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/casts/${review.cast_id}`}
                      className="font-bold text-primary-600 hover:underline"
                    >
                      {review.cast_name}
                    </Link>
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
      </section>

      {/* 電話番号セクション */}
      <section className="container mx-auto px-4 py-12 md:py-16 mb-20 md:mb-0">
        <div className="bg-gradient-to-r from-primary-500 to-pink-500 rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">お電話でのご予約はこちら</h2>
          <p className="text-lg md:text-xl mb-6">営業時間 9:00〜6:00</p>
          <a
            href="tel:050-1748-7999"
            className="inline-block bg-white text-primary-600 px-10 py-4 rounded-full text-2xl md:text-3xl font-bold hover:bg-gray-100 transition-all shadow-lg"
          >
            <FiPhone className="inline mr-2" />
            050-1748-7999
          </a>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8 pb-24 md:pb-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-bold mb-2">人妻の蜜</p>
          <p className="text-sm text-gray-400">〒273-0031 千葉県船橋市西船橋</p>
          <p className="text-sm text-gray-400 mt-4">© 2024 人妻の蜜. All rights reserved.</p>
        </div>
      </footer>

      {/* お客様チャット */}
      <CustomerChat />
    </div>
  );
}
