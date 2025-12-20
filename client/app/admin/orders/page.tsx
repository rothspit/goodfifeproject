'use client';

import { useEffect, useState } from 'react';
import { ordersApi } from '@/lib/admin/api';
import { FiSearch, FiFilter, FiCalendar, FiDollarSign, FiUpload } from 'react-icons/fi';

interface Order {
  id: number;
  order_number: string;
  business_date: string;
  customer_name: string;
  customer_phone: string;
  cast_name: string;
  total_price: number;
  status: string;
  order_datetime: string;
  location_type: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, statusFilter, dateFilter, orders]);

  const fetchOrders = async () => {
    try {
      const response = await ordersApi.getAll();
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error('注文データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(
        (o) =>
          o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customer_phone?.includes(searchQuery)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter((o) => o.business_date === dateFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prompt for year and month
    const year = prompt('年を入力してください (例: 2025):', '2025');
    const month = prompt('月を入力してください (例: 11):', '11');
    
    if (!year || !month) {
      alert('年月の指定が必要です');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('year', year);
    formData.append('month', month);

    setImporting(true);

    try {
      const response = await fetch('http://162.43.91.102:5000/api/orders/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(`インポート完了！\n新規: ${result.imported}件\n更新: ${result.updated}件\nスキップ: ${result.skipped}件`);
        fetchOrders();
      } else {
        alert(`インポート失敗: ${result.error || result.details}`);
      }
    } catch (error: any) {
      console.error('インポートエラー:', error);
      alert(`インポート失敗: ${error.message}`);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
  };

  const statusLabels: Record<string, string> = {
    completed: '完了',
    confirmed: '確定',
    in_progress: '進行中',
    cancelled: 'キャンセル',
    draft: '下書き',
  };

  const locationLabels: Record<string, string> = {
    hotel: 'ホテル',
    home: '自宅',
    other: 'その他',
  };

  const totalSales = filteredOrders.reduce((sum, order) => sum + order.total_price, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">受注管理</h1>
          <p className="text-gray-600 mt-1">予約・注文の管理</p>
        </div>

        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <FiUpload />
            {importing ? '取り込み中...' : 'Excelから取り込み'}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">総件数</p>
              <p className="text-3xl font-bold text-gray-800">{filteredOrders.length}</p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <FiFilter size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">合計売上</p>
              <p className="text-3xl font-bold text-gray-800">¥{totalSales.toLocaleString()}</p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-lg">
              <FiDollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">平均単価</p>
              <p className="text-3xl font-bold text-gray-800">
                ¥{filteredOrders.length > 0 ? Math.round(totalSales / filteredOrders.length).toLocaleString() : 0}
              </p>
            </div>
            <div className="bg-purple-500 text-white p-3 rounded-lg">
              <FiCalendar size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="注文番号、顧客名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべてのステータス</option>
            <option value="draft">下書き</option>
            <option value="confirmed">確定</option>
            <option value="in_progress">進行中</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 注文リスト */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">注文番号</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">営業日</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">顧客情報</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">キャスト</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">場所</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">金額</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-blue-600">{order.order_number}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(order.order_datetime).toLocaleString('ja-JP')}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-800">
                    {new Date(order.business_date).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="font-medium text-gray-800">{order.customer_name || '未設定'}</div>
                      <div className="text-gray-600">{order.customer_phone || '-'}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-800">{order.cast_name || '未設定'}</td>
                  <td className="py-4 px-6 text-sm text-gray-800">
                    {locationLabels[order.location_type] || order.location_type}
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-gray-800">
                    ¥{order.total_price.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[order.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center text-gray-500">注文が見つかりませんでした</div>
        )}
      </div>
    </div>
  );
}
