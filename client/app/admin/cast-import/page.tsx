'use client';

import { useState } from 'react';
import { FiUpload, FiDownload, FiCheck, FiAlertCircle, FiUsers } from 'react-icons/fi';

interface CastData {
  name: string;
  name_hiragana: string;
  name_romaji: string;
  birth_date: string;
  age: number;
  join_date: string;
  height: number;
  bust: string;
  cup_size: string;
  waist: number;
  hip: number;
  catch_copy_10: string;
  catch_copy_20: string;
  style_type: string;
  personality_type: string;
  alcohol: string;
  smoking: string;
  is_new: boolean;
  shop_comment: string;
  girl_comment: string;
}

export default function CastImportPage() {
  const [importMethod, setImportMethod] = useState<'spreadsheet' | 'csv'>('csv');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [range, setRange] = useState('A:T');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // CSVファイルアップロード
  const handleCSVUpload = async () => {
    if (!csvFile) {
      alert('CSVファイルを選択してください');
      return;
    }

    setLoading(true);
    setImportResult(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('csv', csvFile);

      const response = await fetch('https://crm.h-mitsu.com/api/cast-import/upload-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('CSVの解析に失敗しました');
      }

      const result = await response.json();
      setPreviewData(result.data);
      alert(`${result.count}件のデータを読み込みました`);
    } catch (error: any) {
      console.error('CSVアップロードエラー:', error);
      alert('CSVの解析に失敗しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
      const response = await fetch('https://crm.h-mitsu.com/api/cast-import/fetch', {
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

  // CSVテンプレートダウンロード
  const handleDownloadTemplate = () => {
    const headers = [
      '名前', 'ひらがな', 'ローマ字', '生年月日', '年齢', '入店日',
      '身長', 'バスト', 'カップ', 'ウェスト', 'ヒップ',
      'キャッチコピー10文字', 'キャッチコピー20文字',
      'スタイル', 'タイプ', 'お酒', 'タバコ', '新人',
      'お店コメント', '女の子コメント'
    ];
    
    const sampleData = [
      '山田花子', 'やまだはなこ', 'yamada hanako', '1998-05-15', '26', '2024-01-10',
      '160', '85', 'C', '58', '86',
      '笑顔が素敵', 'いつも明るく元気です',
      'スレンダー', '癒し系', 'お酒好き', '吸わない', '0',
      'とても優しい女の子です', 'よろしくお願いします'
    ];

    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cast_import_template.csv';
    link.click();
  };

  // データをインポート
  const handleImport = async () => {
    if (previewData.length === 0) {
      alert('インポートするデータがありません');
      return;
    }

    if (!confirm(`${previewData.length}件のキャストをインポートしますか？\n既存の同名キャストは更新されます。`)) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://crm.h-mitsu.com/api/cast-import/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ casts: previewData }),
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
        setCsvFile(null);
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
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiUsers className="mr-2" />
            女性キャスト取り込み
          </h1>
          <p className="text-gray-600 mt-2">CSVファイルまたはGoogleスプレッドシートからキャストデータをインポートします</p>
        </div>

        {/* インポート方法選択 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">インポート方法を選択</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setImportMethod('csv')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                importMethod === 'csv'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              CSVファイル（推奨）
            </button>
            <button
              onClick={() => setImportMethod('spreadsheet')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                importMethod === 'spreadsheet'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Googleスプレッドシート
            </button>
          </div>
        </div>

        {/* CSV取り込みフォーム */}
        {importMethod === 'csv' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiUpload className="mr-2" />
              CSVファイル取り込み
            </h2>

            <div className="space-y-4">
              {/* テンプレートダウンロード */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>CSV形式:</strong> 20項目のヘッダー付きCSVファイルをアップロードしてください
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                >
                  <FiDownload className="mr-2" />
                  テンプレートダウンロード
                </button>
              </div>

              {/* ファイル選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSVファイル <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                {csvFile && (
                  <p className="text-sm text-green-600 mt-2">
                    選択中: {csvFile.name}
                  </p>
                )}
              </div>

              {/* CSVアップロードボタン */}
              <button
                onClick={handleCSVUpload}
                disabled={loading || !csvFile}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-400"
              >
                <FiUpload className="mr-2" />
                {loading ? 'CSVを解析中...' : 'CSVファイルを読み込む'}
              </button>
            </div>
          </div>
        )}

        {/* スプレッドシート取り込みフォーム */}
        {importMethod === 'spreadsheet' && (
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
                  placeholder="A:T"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  20項目: 名前 | ひらがな | ローマ字 | 生年月日 | 年齢 | 入店日 | 身長 | バスト | カップ | ウェスト | ヒップ | キャッチ10 | キャッチ20 | スタイル | タイプ | お酒 | タバコ | 新人 | お店コメント | 女の子コメント
                </p>
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
        )}

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
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ひらがな</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ローマ字</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">年齢</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">身長</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">3サイズ</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">キャッチ10</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">キャッチ20</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">新人</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((cast, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">{cast.name}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{cast.name_hiragana}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{cast.name_romaji}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{cast.age}歳</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{cast.height}cm</td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {cast.bust}-{cast.waist}-{cast.hip}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600">{cast.catch_copy_10}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{cast.catch_copy_20}</td>
                      <td className="px-3 py-2 text-sm">
                        {cast.is_new ? (
                          <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">新人</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">既存</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 詳細プレビュー（最初の1件のみ表示） */}
            {previewData.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">詳細プレビュー（1件目）</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">名前:</span> {previewData[0].name}</div>
                  <div><span className="font-medium">ひらがな:</span> {previewData[0].name_hiragana}</div>
                  <div><span className="font-medium">ローマ字:</span> {previewData[0].name_romaji}</div>
                  <div><span className="font-medium">生年月日:</span> {previewData[0].birth_date}</div>
                  <div><span className="font-medium">年齢:</span> {previewData[0].age}歳</div>
                  <div><span className="font-medium">入店日:</span> {previewData[0].join_date}</div>
                  <div><span className="font-medium">身長:</span> {previewData[0].height}cm</div>
                  <div><span className="font-medium">バスト:</span> {previewData[0].bust}</div>
                  <div><span className="font-medium">カップ:</span> {previewData[0].cup_size}</div>
                  <div><span className="font-medium">ウェスト:</span> {previewData[0].waist}cm</div>
                  <div><span className="font-medium">ヒップ:</span> {previewData[0].hip}cm</div>
                  <div><span className="font-medium">スタイル:</span> {previewData[0].style_type}</div>
                  <div><span className="font-medium">タイプ:</span> {previewData[0].personality_type}</div>
                  <div><span className="font-medium">お酒:</span> {previewData[0].alcohol}</div>
                  <div><span className="font-medium">タバコ:</span> {previewData[0].smoking}</div>
                  <div className="col-span-2">
                    <span className="font-medium">キャッチコピー10文字:</span> {previewData[0].catch_copy_10}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">キャッチコピー20文字:</span> {previewData[0].catch_copy_20}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">お店コメント:</span>
                    <p className="mt-1 text-gray-700">{previewData[0].shop_comment}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">女の子コメント:</span>
                    <p className="mt-1 text-gray-700">{previewData[0].girl_comment}</p>
                  </div>
                </div>
              </div>
            )}

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
            <li>Googleスプレッドシートを作成し、下記フォーマットでデータを入力します</li>
            <li>スプレッドシートを「リンクを知っている全員」に共有設定します</li>
            <li>スプレッドシートのURL からIDをコピーして上記に貼り付けます</li>
            <li>「データを取得」ボタンでプレビューを確認します</li>
            <li>データを確認後、「インポート」ボタンで登録完了です</li>
            <li>同じ名前のキャストが存在する場合は自動的に更新されます</li>
          </ol>
          
          <div className="mt-4 p-4 bg-white rounded border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📊 スプレッドシートのフォーマット (A〜T列 20項目)</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <div className="grid grid-cols-10 gap-1 font-bold mb-2">
                <div>A: 名前</div>
                <div>B: ひらがな</div>
                <div>C: ローマ字</div>
                <div>D: 生年月日</div>
                <div>E: 年齢</div>
                <div>F: 入店日</div>
                <div>G: 身長</div>
                <div>H: バスト</div>
                <div>I: カップ</div>
                <div>J: ウェスト</div>
              </div>
              <div className="grid grid-cols-10 gap-1 font-bold mb-2">
                <div>K: ヒップ</div>
                <div>L: キャッチ10</div>
                <div>M: キャッチ20</div>
                <div>N: スタイル</div>
                <div>O: タイプ</div>
                <div>P: お酒</div>
                <div>Q: タバコ</div>
                <div>R: 新人</div>
                <div>S: お店コメント</div>
                <div>T: 女の子コメント</div>
              </div>
              <div className="grid grid-cols-10 gap-1 text-gray-600 pt-2 border-t border-blue-200">
                <div>あいり</div>
                <div>あいり</div>
                <div>Airi</div>
                <div>1995-05-20</div>
                <div>29</div>
                <div>2024-01-15</div>
                <div>158</div>
                <div>88</div>
                <div>D</div>
                <div>58</div>
              </div>
              <div className="grid grid-cols-10 gap-1 text-gray-600">
                <div>86</div>
                <div>癒し系美女</div>
                <div>清楚で可愛らしい素敵な女性</div>
                <div>スレンダー</div>
                <div>癒し系</div>
                <div>飲める</div>
                <div>吸わない</div>
                <div>1</div>
                <div>とても...</div>
                <div>よろしく...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
