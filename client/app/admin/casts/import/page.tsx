'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUpload, FiDownload, FiArrowLeft, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function CastImportPage() {
  const router = useRouter();
  const [csvData, setCsvData] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  // CSVファイルの読み込み
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
      };
      reader.readAsText(file);
    }
  };

  // CSVインポート実行
  const handleImport = async () => {
    if (!csvData.trim()) {
      alert('CSVデータを入力してください');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const response = await api.post('/cast-import/import', { csvData });
      setResult(response.data);
      
      if (response.data.success) {
        alert(`${response.data.summary.success}件のキャストをインポートしました！`);
      }
    } catch (error: any) {
      console.error('インポートエラー:', error);
      alert('インポートに失敗しました: ' + (error.response?.data?.message || error.message));
    } finally {
      setImporting(false);
    }
  };

  // テンプレートダウンロード
  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/cast-import/template', {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cast_import_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('テンプレートダウンロードエラー:', error);
      alert('テンプレートのダウンロードに失敗しました');
    }
  };

  // サンプルデータ生成
  const handleGenerateSample = async () => {
    const count = prompt('生成するサンプル数を入力してください（最大30）', '10');
    if (!count) return;

    setGenerating(true);
    try {
      const response = await api.post('/cast-import/generate-sample', {
        count: parseInt(count) || 10,
      });

      if (response.data.success) {
        setCsvData(response.data.csvData);
        alert(`${response.data.count}件のサンプルデータを生成しました`);
      }
    } catch (error) {
      console.error('サンプル生成エラー:', error);
      alert('サンプルデータの生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/casts"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft />
            キャスト一覧に戻る
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">CSVインポート</h1>
        <p className="text-gray-600">CSVファイルからキャスト情報を一括登録できます</p>
      </div>

      {/* 手順説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
          <FiAlertCircle />
          インポート手順
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>CSVテンプレートをダウンロード、またはサンプルデータを生成</li>
          <li>Excelなどでキャスト情報を入力・編集</li>
          <li>UTF-8形式のCSVファイルとして保存</li>
          <li>ファイルをアップロード、またはテキストエリアに貼り付け</li>
          <li>「インポート実行」ボタンをクリック</li>
        </ol>
      </div>

      {/* アクションボタン */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleDownloadTemplate}
          className="bg-green-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <FiDownload />
          テンプレートをダウンロード
        </button>

        <button
          onClick={handleGenerateSample}
          disabled={generating}
          className="bg-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <FiUpload />
          {generating ? '生成中...' : 'サンプルデータ生成'}
        </button>

        <label className="bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <FiUpload />
          CSVファイルを選択
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* CSVデータ入力エリア */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">CSVデータ</h2>
        <textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="CSVデータをここに貼り付けるか、上のボタンからファイルをアップロードしてください"
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {csvData ? `${csvData.split('\n').length - 1}行のデータ` : 'データなし'}
          </div>
          <button
            onClick={handleImport}
            disabled={importing || !csvData.trim()}
            className="bg-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiUpload />
            {importing ? 'インポート中...' : 'インポート実行'}
          </button>
        </div>
      </div>

      {/* インポート結果 */}
      {result && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">インポート結果</h2>
          
          {/* サマリー */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-800">{result.summary.total}</div>
              <div className="text-sm text-gray-600">総数</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{result.summary.success}</div>
              <div className="text-sm text-gray-600">成功</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{result.summary.failed}</div>
              <div className="text-sm text-gray-600">失敗</div>
            </div>
          </div>

          {/* 成功リスト */}
          {result.imported.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                <FiCheck />
                インポート成功 ({result.imported.length}件)
              </h3>
              <div className="bg-green-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                {result.imported.map((item: any) => (
                  <div key={item.id} className="text-sm text-green-800 mb-1">
                    行{item.row}: {item.name} (ID: {item.id})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* エラーリスト */}
          {result.errors.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                <FiX />
                エラー ({result.errors.length}件)
              </h3>
              <div className="bg-red-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                {result.errors.map((error: any, index: number) => (
                  <div key={index} className="mb-3 pb-3 border-b border-red-200 last:border-0">
                    <div className="text-sm font-bold text-red-800">行{error.row}</div>
                    <div className="text-sm text-red-700">{error.error}</div>
                    <div className="text-xs text-red-600 mt-1">
                      {JSON.stringify(error.data)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 完了ボタン */}
          <div className="mt-6 flex justify-end">
            <Link
              href="/admin/casts"
              className="bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 transition-colors"
            >
              キャスト一覧へ戻る
            </Link>
          </div>
        </div>
      )}

      {/* CSV形式説明 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">CSV形式の説明</h2>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-bold mb-2">必須項目</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code className="bg-gray-100 px-2 py-1 rounded">name</code> - キャスト名</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">age</code> - 年齢（数値）</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">任意項目</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>身体情報: height, weight, bust, waist, hip, cup_size</li>
              <li>基本情報: blood_type, hobby, specialty, profile</li>
              <li>フラグ: is_new, smoking_ok, tattoo, has_children</li>
              <li>サービス: threesome_ok, hairless, home_visit_ok, overnight_ok など</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">ブール値の指定</h3>
            <p className="ml-4">
              true値: <code className="bg-gray-100 px-2 py-1 rounded">true</code>, 
              <code className="bg-gray-100 px-2 py-1 rounded">1</code>, 
              <code className="bg-gray-100 px-2 py-1 rounded">yes</code>, 
              <code className="bg-gray-100 px-2 py-1 rounded">はい</code>, 
              <code className="bg-gray-100 px-2 py-1 rounded">○</code>
            </p>
            <p className="ml-4">
              false値: <code className="bg-gray-100 px-2 py-1 rounded">false</code>, 
              <code className="bg-gray-100 px-2 py-1 rounded">0</code>, 
              <code className="bg-gray-100 px-2 py-1 rounded">no</code>, 
              空欄
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
