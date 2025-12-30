'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiFileText,
  FiPlus,
  FiCheck,
  FiX,
  FiClock,
  FiDownload,
  FiArrowLeft,
} from 'react-icons/fi';
import { receiptApi } from '@/lib/api';

interface ReceiptRequest {
  id: number;
  amount: number;
  name_on_receipt: string;
  request_date: string;
  status: string;
  receipt_number: string | null;
  admin_notes: string | null;
  created_at: string;
}

interface Receipt {
  id: number;
  receipt_number: string;
  amount: number;
  name_on_receipt: string;
  issue_date: string;
  created_at: string;
}

export default function MyReceiptsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'requests' | 'receipts'>('requests');
  const [requests, setRequests] = useState<ReceiptRequest[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    name_on_receipt: '',
    address: '',
    email: '',
    phone_number: '',
    notes: '',
  });

  useEffect(() => {
    // 認証チェック
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'requests') {
        const response = await receiptApi.getMyRequests();
        setRequests(response.data.requests);
      } else {
        const response = await receiptApi.getMyReceipts();
        setReceipts(response.data.receipts);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.name_on_receipt) {
      alert('金額と宛名は必須です');
      return;
    }

    try {
      await receiptApi.createRequest({
        ...formData,
        amount: parseInt(formData.amount),
      });

      alert('領収書の申請を受け付けました');
      setShowRequestForm(false);
      setFormData({
        amount: '',
        name_on_receipt: '',
        address: '',
        email: '',
        phone_number: '',
        notes: '',
      });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || '申請に失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      issued: 'bg-green-100 text-green-800',
    };

    const labels = {
      pending: '審査中',
      approved: '承認済み',
      rejected: '却下',
      issued: '発行済み',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/mypage"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">電子領収書</h1>
              <p className="text-sm text-gray-600">領収書の申請・確認ができます</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* タブ */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-4 font-bold transition-colors ${
                activeTab === 'requests'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              申請状況
            </button>
            <button
              onClick={() => setActiveTab('receipts')}
              className={`flex-1 px-6 py-4 font-bold transition-colors ${
                activeTab === 'receipts'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              発行済み領収書
            </button>
          </div>
        </div>

        {/* 申請ボタン */}
        {activeTab === 'requests' && (
          <div className="mb-6">
            <button
              onClick={() => setShowRequestForm(!showRequestForm)}
              className="flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 transition-all"
            >
              <FiPlus />
              領収書を申請する
            </button>
          </div>
        )}

        {/* 申請フォーム */}
        {showRequestForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">領収書申請フォーム</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    金額（円） *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    宛名 *
                  </label>
                  <input
                    type="text"
                    value={formData.name_on_receipt}
                    onChange={(e) => setFormData({ ...formData, name_on_receipt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="株式会社〇〇 または 個人名"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    住所
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="〒000-0000 東京都..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    備考
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows={3}
                    placeholder="特記事項があれば記入してください"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-pink-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-700 transition-all"
                >
                  申請する
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 申請一覧 */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <FiFileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">申請がありません</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg text-gray-800">
                          {request.name_on_receipt}
                        </p>
                        <p className="text-sm text-gray-600">
                          申請日: {formatDate(request.request_date)}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-pink-600">
                        {formatCurrency(request.amount)}
                      </p>
                    </div>
                    {request.admin_notes && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                        <p className="text-sm font-bold text-gray-700 mb-1">管理者コメント</p>
                        <p className="text-sm text-gray-600">{request.admin_notes}</p>
                      </div>
                    )}
                    {request.status === 'issued' && request.receipt_number && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">領収書番号:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {request.receipt_number}
                        </code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 領収書一覧 */}
        {activeTab === 'receipts' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {receipts.length === 0 ? (
              <div className="text-center py-12">
                <FiFileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">発行済みの領収書がありません</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {receipts.map((receipt) => (
                  <div key={receipt.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg text-gray-800">
                          {receipt.name_on_receipt}
                        </p>
                        <p className="text-sm text-gray-600">
                          発行日: {formatDate(receipt.issue_date)}
                        </p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono mt-1 inline-block">
                          {receipt.receipt_number}
                        </code>
                      </div>
                      <button
                        onClick={() => router.push(`/receipts/${receipt.receipt_number}`)}
                        className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-pink-700 transition-all"
                      >
                        <FiDownload />
                        表示
                      </button>
                    </div>
                    <p className="text-2xl font-bold text-pink-600">
                      {formatCurrency(receipt.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
