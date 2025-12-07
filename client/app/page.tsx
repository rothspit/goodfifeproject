'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { FiSearch, FiClock, FiStar, FiMessageCircle, FiPhone } from 'react-icons/fi';
import { castApi, blogApi, reviewApi, announcementApi } from '@/lib/api';
import type { Cast, Blog, Review, Announcement } from '@/types';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function Home() {
  const [availableCasts, setAvailableCasts] = useState<Cast[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
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
      const [castsRes, blogsRes, reviewsRes, announcementsRes] = await Promise.all([
        castApi.getAvailableCasts(),
        blogApi.getRecentBlogs(5),
        reviewApi.getRecentReviews(5),
        announcementApi.getAnnouncements({ limit: 5 }),
      ]);

      setAvailableCasts(castsRes.data.casts || []);
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
      <Header />

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

      {/* 検索セクション */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 -mt-20 relative z-10">
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

      {/* すぐに呼べるキャスト */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <FiClock className="text-primary-600" />
          すぐに呼べるキャスト
        </h2>

        {availableCasts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {availableCasts.map((cast) => (
              <Link
                key={cast.id}
                href={`/casts/${cast.id}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="relative h-48 md:h-64 bg-gradient-to-br from-pink-200 to-purple-200">
                  {cast.primary_image ? (
                    <img
                      src={cast.primary_image}
                      alt={cast.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  {cast.is_new && (
                    <div className="absolute top-2 left-2 bg-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      NEW
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{cast.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {cast.age}歳 / {cast.height || '---'}cm
                  </p>
                  {cast.avg_rating && (
                    <div className="flex items-center gap-1 text-sm text-gold-600">
                      <FiStar className="fill-current" />
                      <span className="font-bold">{cast.avg_rating.toFixed(1)}</span>
                      <span className="text-gray-500">({cast.review_count})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600">現在出勤中のキャストはいません</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/casts"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-700 transition-all"
          >
            全てのキャストを見る
          </Link>
        </div>
      </section>

      {/* お知らせ */}
      <section className="container mx-auto px-4 py-8 md:py-12 bg-white/50 rounded-2xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">お知らせ</h2>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-xs text-gray-500">
                  {new Date(announcement.created_at).toLocaleDateString('ja-JP')}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-800 mb-1">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
    </div>
  );
}
