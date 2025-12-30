'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiFileText,
  FiCheck,
  FiX,
  FiSend,
  FiFilter,
} from 'react-icons/fi';
import { receiptApi } from '@/lib/api';

interface ReceiptRequest {
  id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  amount: number;
  name_on_receipt: string;
  address: string | null;
  email: string | null;
  phone_number: string | null;
  notes: string | null;
  request_date: string;
  status: string;
  admin_notes: string | null;
  receipt_number: string | null;
  created_at: string;
}

export default function AdminReceiptsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ReceiptRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ReceiptRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'issue'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // 管理者認証チェック
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/admin/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await receiptApi.getAllRequests(statusFilter);
      setRequests(response.data.requests);
    } catch (error) {
      console.error('申請一覧取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request: ReceiptRequest, type: 'approve' | 'reject' | 'issue') => {
    setSelectedRequest(request);
    setModalType(type);
    setAdminNotes('');
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      if (modalType === 'approve') {
        await receiptApi.approve(selectedRequest.id, adminNotes);
        alert('申請を承認しました');
      } else if (modalType === 'reject') {
        await receiptApi.reject(selectedRequest.id, adminNotes);
        alert('申請を却下しました');
      } else if (modalType === 'issue') {
        await receiptApi.issue(selectedRequest.id);
        alert('領収書を発行しました');
      }

      setShowModal(false);
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || '処理に失敗しました');
    } finally {
      setProcessing(false);
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

  const getStatusCount = (status: string) => {
    return requests.filter((r) => r.status === status).length;
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">電子領収書管理</h1>
              <p className="text-sm text-gray-600">領収書の申請・承認・発行管理</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">審査中</div>
            <div className="text-3xl font-bold text-yellow-600">
              {requests.filter((r) => r.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">承認済み</div>
            <div className="text-3xl font-bold text-blue-600">
              {requests.filter((r) => r.status === 'approved').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">発行済み</div>
            <div className="text-3xl font-bold text-green-600">
              {requests.filter((r) => r.status === 'issued').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">却下</div>
            <div className="text-3xl font-bold text-red-600">
              {requests.filter((r) => r.status === 'rejected').length}
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FiFilter className="text-gray-600" />
            <span className="font-bold text-gray-700">ステータスフィルター</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'issued', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  statusFilter === status
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all'
                  ? '全て'
                  : status === 'pending'
                  ? '審査中'
                  : status === 'approved'
                  ? '承認済み'
                  : status === 'issued'
                  ? '発行済み'
                  : '却下'}
              </button>
            ))}
          </div>
        </div>

        {/* 申請一覧 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <FiFileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">申請がありません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">申請ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">申請日</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">お客様</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">宛名</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">金額</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">ステータス</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">#{request.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(request.request_date)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{request.user_name}</div>
                        <div className="text-sm text-gray-500">{request.user_phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{request.name_on_receipt}</div>
                        {request.address && (
                          <div className="text-xs text-gray-500">{request.address}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-pink-600">
                          {formatCurrency(request.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                        {request.receipt_number && (
                          <div className="text-xs text-gray-500 mt-1 font-mono">
                            {request.receipt_number}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(request, 'approve')}
                                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-blue-700 transition-all"
                                title="承認"
                              >
                                <FiCheck size={14} />
                                承認
                              </button>
                              <button
                                onClick={() => handleAction(request, 'reject')}
                                className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-red-700 transition-all"
                                title="却下"
                              >
                                <FiX size={14} />
                                却下
                              </button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <button
                              onClick={() => handleAction(request, 'issue')}
                              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-green-700 transition-all"
                              title="発行"
                            >
                              <FiSend size={14} />
                              発行
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* モーダル */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {modalType === 'approve'
                ? '申請を承認'
                : modalType === 'reject'
                ? '申請を却下'
                : '領収書を発行'}
            </h2>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="mb-2">
                <span className="text-sm text-gray-600">お客様:</span>
                <span className="ml-2 font-bold">{selectedRequest.user_name}</span>
              </div>
              <div className="mb-2">
                <span className="text-sm text-gray-600">宛名:</span>
                <span className="ml-2 font-bold">{selectedRequest.name_on_receipt}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">金額:</span>
                <span className="ml-2 font-bold text-pink-600">
                  {formatCurrency(selectedRequest.amount)}
                </span>
              </div>
              {selectedRequest.notes && (
                <div className="mt-2 pt-2 border-t">
                  <div className="text-sm text-gray-600 mb-1">お客様からの備考:</div>
                  <div className="text-sm">{selectedRequest.notes}</div>
                </div>
              )}
            </div>

            {(modalType === 'approve' || modalType === 'reject') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  管理者コメント {modalType === 'reject' && '（必須）'}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={3}
                  placeholder="コメントを入力してください"
                />
              </div>
            )}

            {modalType === 'issue' && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  この操作で領収書が発行されます。発行後は取り消せません。
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={confirmAction}
                disabled={processing || (modalType === 'reject' && !adminNotes)}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                  modalType === 'approve'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : modalType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processing ? '処理中...' : '実行'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={processing}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
