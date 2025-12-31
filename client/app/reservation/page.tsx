'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { castApi, reservationApi } from '@/lib/api';
import type { Cast } from '@/types';
import { FiCalendar, FiClock, FiUser, FiPhone, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';

function ReservationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const castIdParam = searchParams.get('cast_id');

  const [casts, setCasts] = useState<Cast[]>([]);
  const [selectedCast, setSelectedCast] = useState<Cast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    cast_id: '',
    reservation_date: '',
    start_time: '',
    duration: 60,
    course: '60分コース',
    total_price: 15000,
    special_requests: '',
  });

  // コース一覧
  const courses = [
    { name: '60分コース', duration: 60, price: 15000 },
    { name: '90分コース', duration: 90, price: 22000 },
    { name: '120分コース', duration: 120, price: 28000 },
    { name: '150分コース', duration: 150, price: 35000 },
    { name: '180分コース', duration: 180, price: 42000 },
  ];

  useEffect(() => {
    fetchCasts();
  }, []);

  useEffect(() => {
    if (castIdParam && casts.length > 0) {
      const cast = casts.find((c) => c.id === Number(castIdParam));
      if (cast) {
        setSelectedCast(cast);
        setFormData({ ...formData, cast_id: String(cast.id) });
      }
    }
  }, [castIdParam, casts]);

  const fetchCasts = async () => {
    try {
      const response = await castApi.getCasts();
      setCasts(response.data.casts || []);
    } catch (error) {
      console.error('キャスト取得エラー:', error);
    }
  };

  const handleCastChange = (castId: string) => {
    const cast = casts.find((c) => c.id === Number(castId));
    setSelectedCast(cast || null);
    setFormData({ ...formData, cast_id: castId });
  };

  const handleCourseChange = (courseName: string) => {
    const course = courses.find((c) => c.name === courseName);
    if (course) {
      setFormData({
        ...formData,
        course: courseName,
        duration: course.duration,
        total_price: course.price,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!formData.cast_id || !formData.reservation_date || !formData.start_time) {
      setError('キャスト、日付、時間を選択してください');
      return;
    }

    // ログインチェック
    const token = localStorage.getItem('token');
    if (!token) {
      setError('予約するにはログインが必要です');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return;
    }

    setLoading(true);

    try {
      await reservationApi.createReservation({
        cast_id: Number(formData.cast_id),
        reservation_date: formData.reservation_date,
        start_time: formData.start_time,
        duration: formData.duration,
        course: formData.course,
        total_price: formData.total_price,
        special_requests: formData.special_requests || undefined,
      });

      setSuccess(true);
      
      // 3秒後にマイページへリダイレクト
      setTimeout(() => {
        router.push('/mypage');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || '予約に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 成功画面
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <Header />
        <div className="h-20"></div>
        <div className="container mx-auto px-4 py-12 pb-32 md:pb-12">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-white text-4xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">予約が完了しました！</h1>
            <p className="text-gray-600 mb-6">
              ご予約ありがとうございます。<br />
              確認のお電話を差し上げる場合がございます。
            </p>
            <Link
              href="/mypage"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors"
            >
              マイページで確認
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Header />
      
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-8 pb-32 md:pb-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">ご予約フォーム</h1>
          <p className="text-gray-600">以下の項目をご入力ください</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: フォーム */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* エラーメッセージ */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* キャスト選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="inline mr-2" />
                    キャストを選択 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.cast_id}
                    onChange={(e) => handleCastChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">キャストを選択してください</option>
                    {casts.map((cast) => (
                      <option key={cast.id} value={cast.id}>
                        {cast.name}（{cast.age}歳）
                      </option>
                    ))}
                  </select>
                </div>

                {/* 日付選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="inline mr-2" />
                    ご利用日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.reservation_date}
                    onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* 時間選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiClock className="inline mr-2" />
                    開始時刻 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">営業時間: 9:00〜翌6:00</p>
                </div>

                {/* コース選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    コース選択 <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {courses.map((course) => (
                      <label
                        key={course.name}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.course === course.name
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="course"
                            value={course.name}
                            checked={formData.course === course.name}
                            onChange={(e) => handleCourseChange(e.target.value)}
                            className="mr-3"
                          />
                          <span className="font-medium">{course.name}</span>
                        </div>
                        <span className="font-bold text-primary-600">¥{course.price.toLocaleString()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 特別なご要望 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMessageSquare className="inline mr-2" />
                    特別なご要望・備考（任意）
                  </label>
                  <textarea
                    value={formData.special_requests}
                    onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                    rows={4}
                    placeholder="コスプレのご希望、プレイ内容のご要望など"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* 注意事項 */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-bold text-yellow-800 mb-2">ご注意事項</h3>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>予約確定後、店舗から確認のお電話を差し上げる場合がございます</li>
                    <li>指名料（¥2,000）、交通費（¥2,000〜）、ホテル代は別途必要です</li>
                    <li>キャンセルは2時間前までに必ずご連絡ください</li>
                  </ul>
                </div>

                {/* 予約ボタン */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? '予約中...' : 'この内容で予約する'}
                </button>
              </form>
            </div>
          </div>

          {/* 右カラム: 予約内容確認 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">予約内容</h2>
              
              {selectedCast && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">キャスト</div>
                  <div className="font-bold text-lg">{selectedCast.name}（{selectedCast.age}歳）</div>
                </div>
              )}

              {formData.reservation_date && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">ご利用日</div>
                  <div className="font-bold">
                    {new Date(formData.reservation_date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </div>
                </div>
              )}

              {formData.start_time && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">開始時刻</div>
                  <div className="font-bold">{formData.start_time}</div>
                </div>
              )}

              {formData.course && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">コース</div>
                  <div className="font-bold">{formData.course}</div>
                </div>
              )}

              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">料金</div>
                <div className="text-2xl font-bold text-primary-600">
                  ¥{formData.total_price.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ※指名料・交通費・ホテル代は別途
                </div>
              </div>

              {/* お問い合わせ */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">お電話でのご予約も受付中</p>
                  <a
                    href="tel:050-1748-7999"
                    className="flex items-center justify-center gap-2 text-xl font-bold text-primary-600 hover:text-primary-700"
                  >
                    <FiPhone />
                    050-1748-7999
                  </a>
                  <p className="text-xs text-gray-500 mt-2">営業時間 9:00〜6:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReservationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <Header />
        <div className="h-20"></div>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <ReservationContent />
    </Suspense>
  );
}
