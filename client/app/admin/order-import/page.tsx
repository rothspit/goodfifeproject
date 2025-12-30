'use client';

import { useState } from 'react';
import { FiUpload, FiDownload, FiCheck, FiAlertCircle } from 'react-icons/fi';

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
  const [range, setRange] = useState('A:H');
  const [orderDate, setOrderDate] = useState('');
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
  const [fiscalMonth, setFiscalMonth] = useState(new Date().getMonth() + 1);
  const [previewData, setPreviewData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Googleスプレッドシートからデータを取得
  const handleFetchData = async () => {
    if (!spreadsheetId) {
      alert('スプレッドシートIDを入力してください');
      return;
    }

    setLoading(true);
    setImportResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://crm.h-mitsu.com/api/order-import/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ spreadsheetId, range }),
      });

      if (!response.ok) {
        throw new Error('データの取得に失敗しました');
      }

      const result = await response.json();
      setPreviewData(result.data);
      alert(`${result.count}件のデータを読み込みました`);
    } catch (error: any) {
      console.error('取得エラー:', error);
      alert('データの取得に失敗しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // データをインポート
  const handleImport = async () => {
    if (previewData.length === 0) {
      alert('インポートするデータがありません');
      return;
    }

    if (!orderDate) {
      alert('受注日を指定してください');
      return;
    }

    if (!confirm(`${previewData.length}件のデータをインポートしますか？`)) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://crm.h-mitsu.com/api/order-import/import', {
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

      if (!response.ok) {
        throw new Error('インポートに失敗しました');
      }

      const result = await response.json();
      setImportResult(result);
      alert(result.message);
      
      // 成功したらプレビューデータをクリア
      if (result.success) {
        setPreviewData([]);
        setSpreadsheetId('');
      }
    } catch (error: any) {
      console.error('インポートエラー:', error);
      alert('インポートに失敗しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">受注データインポート</h1>
          <p className="text-gray-600 mt-2">Googleスプレッドシートから受注データをインポートします</p>
        </div>

        {/* 設定フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FiUpload className="mr-2" />
            スプレッドシート設定
          </h2>

          <div className="space-y-4">
            {/* スプレッドシートID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                スプレッドシートID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="例: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                スプレッドシートのURLから取得: https://docs.google.com/spreadsheets/d/<strong>スプレッドシートID</strong>/edit
              </p>
            </div>

            {/* 範囲 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                データ範囲
              </label>
              <input
                type="text"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="A:H"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                データ項目: 名前 | 電話番号 | 金額 | 利用場所 | キャスト | オプション | メモ
              </p>
            </div>

            {/* 受注日・年度・月 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  受注日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年度
                </label>
                <input
                  type="number"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  月
                </label>
                <select
                  value={fiscalMonth}
                  onChange={(e) => setFiscalMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}月</option>
                  ))}
                </select>
              </div>
            </div>

            {/* データ取得ボタン */}
            <button
              onClick={handleFetchData}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-400"
            >
              <FiDownload className="mr-2" />
              {loading ? 'データ取得中...' : 'スプレッドシートからデータを取得'}
            </button>
          </div>
        </div>

        {/* プレビューテーブル */}
        {previewData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiCheck className="mr-2 text-green-500" />
              プレビュー ({previewData.length}件)
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">電話番号</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">利用場所</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">キャスト</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">オプション</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">メモ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{order.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{order.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">¥{order.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{order.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{order.cast}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{order.options}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{order.memo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* インポートボタン */}
            <button
              onClick={handleImport}
              disabled={loading}
              className="mt-6 w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-400"
            >
              <FiUpload className="mr-2" />
              {loading ? 'インポート中...' : 'データベースにインポート'}
            </button>
          </div>
        )}

        {/* インポート結果 */}
        {importResult && (
          <div className={`rounded-lg shadow-md p-6 ${importResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              {importResult.success ? (
                <>
                  <FiCheck className="mr-2 text-green-500" />
                  インポート完了
                </>
              ) : (
                <>
                  <FiAlertCircle className="mr-2 text-red-500" />
                  インポートエラー
                </>
              )}
            </h2>
            <p className="text-gray-700">{importResult.message}</p>
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-red-700 mb-2">エラー詳細:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {importResult.errors.map((err: any, index: number) => (
                    <li key={index} className="text-sm text-red-600">
                      {err.name}: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 使い方ガイド */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-3">📝 使い方ガイド</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Googleスプレッドシートを作成し、データを入力します</li>
            <li>スプレッドシートを「リンクを知っている全員」に共有設定します</li>
            <li>スプレッドシートのURL からIDをコピーして上記に貼り付けます</li>
            <li>データ範囲を指定します（デフォルト: A〜H列）</li>
            <li>受注日、年度、月を選択します</li>
            <li>「データを取得」ボタンでプレビューを確認します</li>
            <li>データを確認後、「インポート」ボタンで登録完了です</li>
          </ol>
          
          <div className="mt-4 p-4 bg-white rounded border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📊 スプレッドシートのフォーマット (A〜G列)</h4>
            <div className="text-xs text-blue-800 font-mono">
              <div className="grid grid-cols-7 gap-2 mb-2 font-bold">
                <div>A: 名前</div>
                <div>B: 電話番号</div>
                <div>C: 金額</div>
                <div>D: 利用場所</div>
                <div>E: キャスト</div>
                <div>F: オプション</div>
                <div>G: メモ</div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-gray-600">
                <div>山田太郎</div>
                <div>09012345678</div>
                <div>30000</div>
                <div>新宿ホテル</div>
                <div>あいり</div>
                <div>3Pコース</div>
                <div>次回割引</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
