'use client';

import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ExcelSheet {
  index: number;
  name: string;
  rowCount: number;
  colCount: number;
}

interface Column {
  index: number;
  name: string;
  sample: string;
}

interface Customer {
  phone_number: string;
  name: string;
  email: string;
  home_address: string;
  notes: string;
  customer_type: string;
  home_transportation_fee: number;
  status: 'new' | 'existing';
  action: string;
  existing_id?: number;
  existing_name?: string;
  existing_orders?: number;
  last_visit?: string;
}

interface ImportStats {
  total: number;
  new: number;
  existing: number;
}

export default function CustomerImportPage() {
  // ファイル関連
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  // Excel関連
  const [sheets, setSheets] = useState<ExcelSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [columns, setColumns] = useState<Column[]>([]);
  const [headers, setHeaders] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  // 行範囲
  const [startRow, setStartRow] = useState<number>(2); // データは2行目から
  const [endRow, setEndRow] = useState<number | ''>(''); // 空 = 最終行まで
  
  // カラムマッピング
  const [columnMapping, setColumnMapping] = useState<{
    phone: number | '';
    name: number | '';
    email: number | '';
    address: number | '';
    notes: number | '';
    birthDate: number | '';
    customerType: number | '';
    transportFee: number | '';
  }>({
    phone: '',
    name: '',
    email: '',
    address: '',
    notes: '',
    birthDate: '',
    customerType: '',
    transportFee: ''
  });
  
  // インポート結果
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<ImportStats | null>(null);
  
  // UI状態
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  
  // 電話番号検索
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);

  // ===== Step 1: ファイルアップロード =====
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSheets([]);
      setSelectedSheet('');
      setCustomers([]);
      setStats(null);
      setMessage('');
      setCurrentStep(1);
    }
  };

  const handleUploadExcel = async () => {
    if (!file) {
      alert('Excelファイルを選択してください');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_BASE_URL}/customer-import/upload-excel`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      setSheets(response.data.sheets);
      setFileName(response.data.filePath);
      setMessage(`✅ ${response.data.sheets.length}個のシートを検出しました`);
      setCurrentStep(2);
    } catch (error: any) {
      console.error('Excelアップロードエラー:', error);
      setMessage(`❌ ${error.response?.data?.error || 'Excelファイルのアップロードに失敗しました'}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== Step 2: シート選択＆プレビュー =====
  const handleSheetChange = async (sheetName: string) => {
    setSelectedSheet(sheetName);
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/customer-import/preview-sheet`,
        {
          fileName,
          sheetName,
          startRow: 1, // ヘッダー含む
          endRow: 21 // 最初の20行
        }
      );

      setHeaders(response.data.headers);
      setPreviewData(response.data.data);
      setColumns(response.data.columns);
      setMessage(`✅ シート「${sheetName}」をプレビューしました（${response.data.totalRows}行のデータ）`);
      setCurrentStep(3);
    } catch (error: any) {
      console.error('シートプレビューエラー:', error);
      setMessage(`❌ ${error.response?.data?.error || 'シートのプレビューに失敗しました'}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== Step 3: カラムマッピング =====
  const handleColumnMappingChange = (field: string, colIndex: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: colIndex === '' ? '' : parseInt(colIndex)
    }));
  };

  const handleParseExcel = async () => {
    if (columnMapping.phone === '') {
      alert('「電話番号」列を必ず指定してください');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/customer-import/parse-excel`,
        {
          fileName,
          sheetName: selectedSheet,
          startRow,
          endRow: endRow === '' ? null : endRow,
          columnMapping
        }
      );

      setCustomers(response.data.customers);
      setStats(response.data.stats);
      setMessage(`✅ ${response.data.message}`);
      setCurrentStep(4);
    } catch (error: any) {
      console.error('Excel解析エラー:', error);
      setMessage(`❌ ${error.response?.data?.error || 'Excelファイルの解析に失敗しました'}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== Step 4: 一括インポート =====
  const handleImport = async () => {
    if (customers.length === 0) {
      alert('インポートする顧客データがありません');
      return;
    }

    if (!confirm(`${customers.length}件の顧客データをインポートしますか？`)) {
      return;
    }

    setImporting(true);
    setMessage('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/customer-import/import`,
        { customers }
      );

      const results = response.data.results;
      setMessage(
        `✅ インポート完了！\n新規登録: ${results.created}件\n更新: ${results.updated}件\n失敗: ${results.failed}件`
      );
      
      // 成功したらリセット
      if (results.failed === 0) {
        setTimeout(() => {
          setCustomers([]);
          setStats(null);
          setFile(null);
          setCurrentStep(1);
        }, 3000);
      }
    } catch (error: any) {
      console.error('インポートエラー:', error);
      setMessage(`❌ ${error.response?.data?.error || 'インポートに失敗しました'}`);
    } finally {
      setImporting(false);
    }
  };

  // ===== 電話番号検索 =====
  const handleSearch = async () => {
    if (!searchPhone) {
      alert('電話番号を入力してください');
      return;
    }

    setLoading(true);
    setSearchResult(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/customer-import/search?phone=${encodeURIComponent(searchPhone)}`
      );

      setSearchResult(response.data);
    } catch (error: any) {
      console.error('検索エラー:', error);
      alert('顧客の検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">顧客Excel一括インポート</h1>

        {/* メッセージ表示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
          }`}>
            <pre className="whitespace-pre-wrap font-sans">{message}</pre>
          </div>
        )}

        {/* ステップインジケーター */}
        <div className="mb-8 flex items-center justify-center space-x-4">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 4 && <div className="w-16 h-1 bg-gray-300 mx-2"></div>}
            </div>
          ))}
        </div>

        {/* ===== Step 1: ファイル選択 ===== */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📁 Step 1: Excelファイル選択</h2>
          
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          {file && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">選択ファイル: <strong>{file.name}</strong></p>
            </div>
          )}

          <button
            onClick={handleUploadExcel}
            disabled={!file || loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '読み込み中...' : 'Excelファイルをアップロード'}
          </button>
        </div>

        {/* ===== Step 2: シート選択 ===== */}
        {sheets.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">📊 Step 2: シート選択</h2>
            
            <select
              value={selectedSheet}
              onChange={(e) => handleSheetChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            >
              <option value="">シートを選択してください</option>
              {sheets.map(sheet => (
                <option key={sheet.index} value={sheet.name}>
                  {sheet.name} ({sheet.rowCount}行 × {sheet.colCount}列)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ===== Step 3: カラムマッピング ===== */}
        {selectedSheet && columns.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">🔗 Step 3: カラムマッピング</h2>
            
            <p className="text-sm text-gray-600 mb-4">
              各項目に対応する列を選択してください。<span className="text-red-600">※電話番号は必須</span>
            </p>

            {/* 行範囲指定 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold mb-2">行範囲指定</h3>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <span className="mr-2">開始行:</span>
                  <input
                    type="number"
                    value={startRow}
                    onChange={(e) => setStartRow(parseInt(e.target.value) || 2)}
                    min="2"
                    className="w-20 p-2 border border-gray-300 rounded"
                  />
                </label>
                <label className="flex items-center">
                  <span className="mr-2">終了行:</span>
                  <input
                    type="number"
                    value={endRow}
                    onChange={(e) => setEndRow(e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="最終行"
                    min={startRow}
                    className="w-20 p-2 border border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-500">（空欄 = 最終行まで）</span>
                </label>
              </div>
            </div>

            {/* カラムマッピング */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">
                  電話番号 <span className="text-red-600">*</span>
                </label>
                <select
                  value={columnMapping.phone}
                  onChange={(e) => handleColumnMappingChange('phone', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">選択してください</option>
                  {columns.map(col => (
                    <option key={col.index} value={col.index}>
                      {col.name} (例: {col.sample})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">顧客名</label>
                <select
                  value={columnMapping.name}
                  onChange={(e) => handleColumnMappingChange('name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">選択してください</option>
                  {columns.map(col => (
                    <option key={col.index} value={col.index}>
                      {col.name} (例: {col.sample})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">メールアドレス</label>
                <select
                  value={columnMapping.email}
                  onChange={(e) => handleColumnMappingChange('email', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">選択してください</option>
                  {columns.map(col => (
                    <option key={col.index} value={col.index}>
                      {col.name} (例: {col.sample})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">住所</label>
                <select
                  value={columnMapping.address}
                  onChange={(e) => handleColumnMappingChange('address', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">選択してください</option>
                  {columns.map(col => (
                    <option key={col.index} value={col.index}>
                      {col.name} (例: {col.sample})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">備考</label>
                <select
                  value={columnMapping.notes}
                  onChange={(e) => handleColumnMappingChange('notes', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">選択してください</option>
                  {columns.map(col => (
                    <option key={col.index} value={col.index}>
                      {col.name} (例: {col.sample})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleParseExcel}
              disabled={columnMapping.phone === '' || loading}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '解析中...' : 'データを解析'}
            </button>
          </div>
        )}

        {/* ===== Step 4: プレビュー＆インポート ===== */}
        {customers.length > 0 && stats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">✅ Step 4: データプレビュー＆インポート</h2>
            
            {/* 統計 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">合計</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">{stats.new}</div>
                <div className="text-sm text-gray-600">新規登録</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.existing}</div>
                <div className="text-sm text-gray-600">更新</div>
              </div>
            </div>

            {/* データテーブル */}
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">状態</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">電話番号</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">顧客名</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">メール</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">処理</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.slice(0, 50).map((customer, idx) => (
                    <tr key={idx} className={customer.status === 'new' ? 'bg-green-50' : 'bg-yellow-50'}>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          customer.status === 'new' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {customer.status === 'new' ? '新規' : '既存'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{customer.phone_number}</td>
                      <td className="px-4 py-2 text-sm">{customer.name}</td>
                      <td className="px-4 py-2 text-sm">{customer.email}</td>
                      <td className="px-4 py-2 text-sm">{customer.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {customers.length > 50 && (
              <p className="text-sm text-gray-500 mb-4">※最初の50件を表示しています（全{customers.length}件）</p>
            )}

            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 font-bold text-lg"
            >
              {importing ? 'インポート中...' : `${customers.length}件の顧客データを一括インポート`}
            </button>
          </div>
        )}

        {/* ===== 電話番号検索 ===== */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">🔍 電話番号検索</h2>
          
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="電話番号を入力（例: 090-1234-5678）"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '検索中...' : '検索'}
            </button>
          </div>

          {searchResult && (
            <div className={`p-4 rounded-lg ${
              searchResult.found ? 'bg-green-50' : 'bg-gray-50'
            }`}>
              {searchResult.found ? (
                <div>
                  <h3 className="font-bold mb-2">顧客情報</h3>
                  <p><strong>顧客名:</strong> {searchResult.customer.name}</p>
                  <p><strong>電話番号:</strong> {searchResult.customer.phone_number}</p>
                  <p><strong>メール:</strong> {searchResult.customer.email}</p>
                  <p><strong>受注履歴:</strong> {searchResult.customer.total_orders || 0}件</p>
                  
                  {searchResult.customer.order_history?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-bold mb-2">最近の受注</h4>
                      <ul className="text-sm space-y-1">
                        {searchResult.customer.order_history.map((order: any) => (
                          <li key={order.id}>
                            {order.business_date} {order.start_time} - {order.cast_name} ({order.store_name})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">{searchResult.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
