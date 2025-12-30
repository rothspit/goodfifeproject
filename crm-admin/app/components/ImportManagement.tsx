'use client';

import { useState } from 'react';
import { customerAPI, castAPI, reservationAPI } from '../lib/api';
import * as XLSX from 'xlsx';

type ImportType = 'customer' | 'cast' | 'sales';

export default function ImportManagement() {
  const [importType, setImportType] = useState<ImportType>('customer');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError('');
    }
  };

  const convertExcelToCSV = async (excelFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // 最初のシートを取得
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // CSV形式に変換
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          
          // CSVファイルとして作成
          const blob = new Blob([csv], { type: 'text/csv' });
          const csvFile = new File([blob], excelFile.name.replace(/\.(xlsx?|xls)$/i, '.csv'), {
            type: 'text/csv'
          });
          
          resolve(csvFile);
        } catch (error) {
          reject(new Error('Excelファイルの変換に失敗しました'));
        }
      };
      
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
      reader.readAsBinaryString(excelFile);
    });
  };

  const handleImport = async () => {
    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    setImporting(true);
    setError('');
    setResult(null);

    try {
      let fileToImport = file;
      
      // Excelファイルの場合はCSVに変換
      if (file.name.match(/\.(xlsx?|xls)$/i)) {
        try {
          fileToImport = await convertExcelToCSV(file);
        } catch (conversionError: any) {
          setError(conversionError.message);
          setImporting(false);
          return;
        }
      }
      
      let importResult;
      
      switch (importType) {
        case 'customer':
          importResult = await customerAPI.importCSV(fileToImport);
          break;
        case 'cast':
          importResult = await castAPI.importCSV(fileToImport);
          break;
        case 'sales':
          importResult = await reservationAPI.importSalesCSV(fileToImport);
          break;
      }

      setResult(importResult);
    } catch (err: any) {
      setError(err.response?.data?.error || 'インポート中にエラーが発生しました');
    } finally {
      setImporting(false);
    }
  };

  const getImportTypeLabel = (type: ImportType) => {
    switch (type) {
      case 'customer': return '顧客データ';
      case 'cast': return 'キャスト情報';
      case 'sales': return '売上データ';
    }
  };

  const downloadExcelTemplate = () => {
    let headers: string[] = [];
    let sampleData: any[] = [];
    let filename = '';

    switch (importType) {
      case 'customer':
        headers = ['phone_number', 'name', 'email', 'customer_type', 'home_address', 'home_transportation_fee', 'notes'];
        sampleData = [
          ['09012345678', '山田太郎', 'yamada@example.com', 'regular', '東京都新宿区1-2-3', 3000, 'VIP顧客'],
          ['08012345678', '鈴木花子', 'suzuki@example.com', 'new', '東京都渋谷区4-5-6', 2500, '']
        ];
        filename = '顧客データテンプレート.xlsx';
        break;
      case 'cast':
        headers = ['name', 'display_name', 'age', 'height', 'bust', 'waist', 'hip', 'blood_type', 'description', 'nomination_fee', 'is_available'];
        sampleData = [
          ['Tanaka Yuki', 'ゆき', 25, 165, 88, 60, 90, 'A', '明るい性格です', 3000, 1],
          ['Sato Mika', 'みか', 23, 160, 85, 58, 88, 'B', '癒し系です', 3000, 1]
        ];
        filename = 'キャスト情報テンプレート.xlsx';
        break;
      case 'sales':
        headers = ['business_date', 'order_datetime', 'store_id', 'customer_phone', 'cast_name', 'start_time', 'duration', 'location', 'base_price', 'nomination_fee', 'transportation_fee', 'option_price', 'discount', 'total_price', 'options', 'memo', 'order_status'];
        sampleData = [
          ['2024-12-16', '2024-12-16 19:00:00', 1, '09012345678', 'ゆき', '19:00', 90, '自宅', 15000, 3000, 2500, 0, 0, 20500, 'オプションなし', '指名', 'completed'],
          ['2024-12-16', '2024-12-16 20:00:00', 1, '08012345678', '', '20:00', 60, 'ホテル', 12000, 0, 0, 0, 0, 12000, '', '', 'confirmed']
        ];
        filename = '売上データテンプレート.xlsx';
        break;
    }

    // Excelワークブックを作成
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'データ');

    // ファイルをダウンロード
    XLSX.writeFile(wb, filename);
  };

  const getCSVFormat = (type: ImportType) => {
    switch (type) {
      case 'customer':
        return `phone_number,name,email,customer_type,home_address,home_transportation_fee,notes
09012345678,山田太郎,yamada@example.com,regular,東京都新宿区1-2-3,3000,VIP顧客
08012345678,鈴木花子,suzuki@example.com,new,東京都渋谷区4-5-6,2500,`;
      case 'cast':
        return `name,display_name,age,height,bust,waist,hip,blood_type,description,nomination_fee,is_available
Tanaka Yuki,ゆき,25,165,88,60,90,A,明るい性格です,3000,1
Sato Mika,みか,23,160,85,58,88,B,癒し系です,3000,1`;
      case 'sales':
        return `business_date,order_datetime,store_id,customer_phone,cast_name,start_time,duration,location,base_price,nomination_fee,transportation_fee,option_price,discount,total_price,options,memo,order_status
2024-12-16,2024-12-16 19:00:00,1,09012345678,ゆき,19:00,90,自宅,15000,3000,2500,0,0,20500,オプションなし,指名,completed
2024-12-16,2024-12-16 20:00:00,1,08012345678,,20:00,60,ホテル,12000,0,0,0,0,12000,,,confirmed`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="dashboard-card">
        <h2 className="text-xl font-bold mb-4">データインポート</h2>
        
        {/* Import Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            インポート種類
          </label>
          <div className="flex gap-4">
            {(['customer', 'cast', 'sales'] as ImportType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setImportType(type);
                  setFile(null);
                  setResult(null);
                  setError('');
                }}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  importType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {getImportTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ExcelファイルまたはCSVファイルを選択
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              選択されたファイル: {file.name}
              {file.name.match(/\.(xlsx?|xls)$/i) && (
                <span className="ml-2 text-blue-600 font-medium">
                  (自動的にCSV形式に変換されます)
                </span>
              )}
            </p>
          )}
          
          {/* Template Download Button */}
          <div className="mt-3">
            <button
              onClick={downloadExcelTemplate}
              className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excelテンプレートをダウンロード
            </button>
          </div>
        </div>

        {/* Import Button */}
        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="btn-primary w-full"
        >
          {importing ? 'インポート中...' : 'インポート開始'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <h3 className="font-bold mb-2">インポート完了</h3>
            <ul className="space-y-1">
              <li>成功: {result.imported}件</li>
              <li>スキップ: {result.skipped}件</li>
              {result.errors.length > 0 && (
                <li className="text-red-600">
                  エラー: {result.errors.length}件
                  <ul className="ml-4 mt-1 text-sm">
                    {result.errors.slice(0, 5).map((err: string, idx: number) => (
                      <li key={idx}>• {err}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>...他{result.errors.length - 5}件</li>
                    )}
                  </ul>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Excel/CSV Format Guide */}
      <div className="dashboard-card">
        <h2 className="text-xl font-bold mb-4">
          Excelフォーマット例 ({getImportTypeLabel(importType)})
        </h2>
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>📊 Excel推奨:</strong> .xlsx, .xls形式のExcelファイルを直接アップロードできます。
            自動的にCSV形式に変換されます。
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto">
          <p className="text-xs text-gray-600 mb-2">
            ※Excelの1行目に以下の列名を入力し、2行目以降にデータを入力してください
          </p>
          <pre className="text-xs text-gray-800 font-mono whitespace-pre">
            {getCSVFormat(importType)}
          </pre>
        </div>
        
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <h3 className="font-semibold text-gray-800">注意事項:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li className="text-blue-600 font-medium">
              Excelファイル (.xlsx, .xls) またはCSVファイル (.csv) をアップロードできます
            </li>
            {importType === 'customer' && (
              <>
                <li>phone_number は必須項目です（ハイフンなし）</li>
                <li>customer_type は new/regular/vip のいずれか</li>
                <li>同じ電話番号のデータは更新されます</li>
              </>
            )}
            {importType === 'cast' && (
              <>
                <li>name は必須項目です</li>
                <li>is_available は 1（稼働中） or 0（休止中）</li>
                <li>同じnameのキャストは更新されます</li>
              </>
            )}
            {importType === 'sales' && (
              <>
                <li>business_date, order_datetime, customer_phone は必須</li>
                <li>customer_phone に一致する顧客が自動的に紐付けられます</li>
                <li>order_status は pending/confirmed/completed/cancelled</li>
                <li>cast_name が空の場合は指名なしとして登録されます</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Import History */}
      <div className="dashboard-card">
        <h2 className="text-xl font-bold mb-4">インポート履歴</h2>
        <p className="text-gray-500 text-center py-8">
          インポート履歴機能は今後実装予定です
        </p>
      </div>
    </div>
  );
}
