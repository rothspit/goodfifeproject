'use client';

import { useState } from 'react';
import AdminLayout from '@/app/components/AdminLayout';

interface OrderData {
  name: string;
  phone: string;
  amount: number;
  location: string;
  cast: string;
  options: string;
  memo: string;
}

export default function OrderImportPage() {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [range, setRange] = useState('A:G');
  const [orderDate, setOrderDate] = useState('');
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
  const [fiscalMonth, setFiscalMonth] = useState(new Date().getMonth() + 1);
  const [previewData, setPreviewData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // スプレッドシートIDをURLから抽出
  const extractSheetId = (input: string) => {
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input;
  };

  // スプレッドシートデータを取得
  const handleFetchData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const sheetId = extractSheetId(spreadsheetId);

      const response = await fetch('/api/order-import/fetch-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          spreadsheetId: sheetId,
          range,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPreviewData(result.data);
        setMessage(`✅ ${result.count}件のデータを取得しました`);
      } else {
        setMessage(`❌ エラー: ${result.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // データをインポート
  const handleImport = async () => {
    if (!orderDate) {
      setMessage('❌ 受注日を指定してください');
      return;
    }

    if (previewData.length === 0) {
      setMessage('❌ データがありません');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/order-import/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orders: previewData,
          orderDate,
          fiscalYear,
          fiscalMonth,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ ${result.imported}件のデータをインポートしました`);
        setPreviewData([]);
      } else {
        setMessage(`❌ エラー: ${result.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">受注データインポート</h1>

        {/* スプレッドシート設定 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Googleスプレッドシート設定</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                スプレッドシートURL または ID
              </label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/xxxxx/edit または xxxxx"
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                ※ スプレッドシートは公開設定にするか、サービスアカウントで共有してください
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                取得範囲（デフォルト: A:G）
              </label>
              <input
                type="text"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="A:G"
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                データ項目: 名前 | 番号 | 金額 | 利用場所 | 利用キャスト | 利用オプション | メモ
              </p>
            </div>

            <button
              onClick={handleFetchData}
              disabled={loading || !spreadsheetId}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? '取得中...' : 'データを取得'}
            </button>
          </div>
        </div>

        {/* 受注日設定 */}
        {previewData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">2. 受注日設定</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">受注日</label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">年度</label>
                <input
                  type="number"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">月</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={fiscalMonth}
                  onChange={(e) => setFiscalMonth(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* プレビュー */}
        {previewData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">3. データプレビュー</h2>

            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">電話番号</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">利用場所</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">キャスト</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">オプション</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">メモ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.slice(0, 10).map((order, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{order.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{order.phone}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">¥{order.amount.toLocaleString()}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{order.location}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{order.cast}</td>
                      <td className="px-3 py-2 text-sm">{order.options}</td>
                      <td className="px-3 py-2 text-sm">{order.memo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">
                  他 {previewData.length - 10}件（合計: {previewData.length}件）
                </p>
              )}
            </div>

            <button
              onClick={handleImport}
              disabled={loading || !orderDate}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'インポート中...' : `${previewData.length}件をインポート実行`}
            </button>
          </div>
        )}

        {/* メッセージ */}
        {message && (
          <div className={`p-4 rounded ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
