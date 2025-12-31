'use client';

import React, { useState, useEffect } from 'react';
import {
  FiThumbsUp,
  FiThumbsDown,
  FiCheck,
  FiX,
  FiTrash2,
  FiStar,
  FiUser,
  FiCalendar,
  FiRefreshCw,
  FiAlertCircle,
  FiClock,
} from 'react-icons/fi';
import { reviewApi, castApi } from '@/lib/api';
import Image from 'next/image';

interface Review {
  id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  cast_id: number;
  cast_name: string;
  cast_image: string | null;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Cast {
  id: number;
  name: string;
}

interface Stats {
  status: string;
  count: number;
}

const ReviewManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [casts, setCasts] = useState<Cast[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCastId, setFilterCastId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
    fetchCasts();
  }, [filterStatus, filterCastId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterCastId) params.cast_id = filterCastId;

      const response = await reviewApi.getAllReviews(params);
      setReviews(response.data.reviews);
      setTotal(response.data.total);
      setStats(response.data.stats);
    } catch (error) {
      console.error('レビュー取得エラー:', error);
      alert('レビューの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchCasts = async () => {
    try {
      const response = await castApi.getCasts();
      setCasts(response.data.casts);
    } catch (error) {
      console.error('キャスト取得エラー:', error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await reviewApi.updateReviewStatus(id, 'approved');
      fetchData();
    } catch (error) {
      console.error('承認エラー:', error);
      alert('承認に失敗しました');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('このレビューを却下しますか？')) return;

    try {
      await reviewApi.updateReviewStatus(id, 'rejected');
      fetchData();
    } catch (error) {
      console.error('却下エラー:', error);
      alert('却下に失敗しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このレビューを削除しますか？この操作は取り消せません。')) return;

    try {
      await reviewApi.deleteReview(id);
      fetchData();
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-full flex items-center gap-1">
            <FiClock />
            承認待ち
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full flex items-center gap-1">
            <FiCheck />
            承認済み
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full flex items-center gap-1">
            <FiX />
            却下
          </span>
        );
      default:
        return null;
    }
  };

  const getStatCount = (status: string) => {
    const stat = stats.find((s) => s.status === status);
    return stat ? stat.count : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FiThumbsUp className="text-pink-600" />
              クチコミ承認管理
            </h1>
            <p className="text-gray-600 mt-2">全{total}件のレビュー</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            更新
          </button>
        </div>

        {/* ステータス統計 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">全体</p>
                <p className="text-2xl font-bold text-gray-800">{total}</p>
              </div>
              <FiThumbsUp className="text-4xl text-gray-400" />
            </div>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">承認待ち</p>
                <p className="text-2xl font-bold text-yellow-800">{getStatCount('pending')}</p>
              </div>
              <FiClock className="text-4xl text-yellow-400" />
            </div>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">承認済み</p>
                <p className="text-2xl font-bold text-green-800">{getStatCount('approved')}</p>
              </div>
              <FiCheck className="text-4xl text-green-400" />
            </div>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">却下</p>
                <p className="text-2xl font-bold text-red-800">{getStatCount('rejected')}</p>
              </div>
              <FiX className="text-4xl text-red-400" />
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">すべてのステータス</option>
            <option value="pending">承認待ち</option>
            <option value="approved">承認済み</option>
            <option value="rejected">却下</option>
          </select>
          <select
            value={filterCastId || ''}
            onChange={(e) => setFilterCastId(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">すべてのキャスト</option>
            {casts.map((cast) => (
              <option key={cast.id} value={cast.id}>
                {cast.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* レビュー一覧 */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FiThumbsUp className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">レビューがありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-lg shadow-md p-6 transition ${
                review.status === 'pending' ? 'border-2 border-yellow-400' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* キャスト画像 */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-lg bg-gray-200 overflow-hidden">
                    {review.cast_image ? (
                      <Image
                        src={review.cast_image}
                        alt={review.cast_name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-pink-100">
                        <FiUser className="text-3xl text-pink-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* レビュー内容 */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">{review.cast_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FiUser />
                          {review.user_name || '匿名'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar />
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(review.status)}
                  </div>

                  {/* 評価 */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`${
                          i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {review.rating}.0
                    </span>
                  </div>

                  {/* コメント */}
                  {review.comment && (
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.comment}</p>
                  )}

                  {/* アクションボタン */}
                  <div className="flex gap-2">
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                        >
                          <FiCheck />
                          承認
                        </button>
                        <button
                          onClick={() => handleReject(review.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                        >
                          <FiX />
                          却下
                        </button>
                      </>
                    )}
                    {review.status === 'approved' && (
                      <button
                        onClick={() => handleReject(review.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
                      >
                        <FiThumbsDown />
                        承認取消
                      </button>
                    )}
                    {review.status === 'rejected' && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      >
                        <FiThumbsUp />
                        承認する
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition ml-auto"
                    >
                      <FiTrash2 />
                      削除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewManagementPage;
