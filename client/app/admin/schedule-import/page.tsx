'use client';

import { useState } from 'react';
import { FiUpload, FiCalendar, FiCheck, FiAlertCircle, FiDownload } from 'react-icons/fi';

interface ScheduleData {
  castName: string;
  schedules: { [date: string]: string };
}

export default function ScheduleImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // ファイル選択
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  // CSVファイルをアップロードしてパース
  const handleUpload = async () => {
    if (!file) {
      alert('CSVファイルを選択してください');
      return;
    }

    setLoading(true);
    setImportResult(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('csv', file);

      const response = await fetch('https://crm.h-mitsu.com/api/schedule-import/upload', {
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
      alert(`${result.count}人分のスケジュールを読み込みました`);
    } catch (error: any) {
      console.error('アップロードエラー:', error);
      alert('CSVの解析に失敗しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // スケジュールをインポート
  const handleImport = async () => {
    if (previewData.length === 0) {
      alert('インポートするデータがありません');
      return;
    }

    const totalSchedules = previewData.reduce((sum, cast) => sum + Object.keys(cast.schedules).length, 0);

    if (!confirm(`${previewData.length}人分、合計${totalSchedules}件のスケジュールをインポートしますか？\n既存のスケジュールは更新されます。`)) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://crm.h-mitsu.com/api/schedule-import/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ schedules: previewData }),
      });

      if (!response.ok) {
        throw new Error('インポートに失敗しました');
      }

      const result = await response.json();
      setImportResult(result);
      alert(result.message);
      
      // 成功したらプレビューデータとファイルをクリア
      if (result.success) {
        setPreviewData([]);
        setFile(null);
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
            <FiCalendar className="mr-2" />
            出勤スケジュール取り込み
          </h1>
          <p className="text-gray-600 mt-2">CSVファイルから出勤スケジュールを一括インポートします</p>
        </div>

        {/* ファイルアップロードフォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FiUpload className="mr-2" />
            CSVファイル選択
          </h2>

          <div className="space-y-4">
            {/* ファイル選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSVファイル <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              {file && (
                <p className="text-sm text-green-600 mt-2">
                  選択中: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* アップロードボタン */}
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-400"
            >
              <FiDownload className="mr-2" />
              {loading ? '解析中...' : 'CSVファイルを解析'}
            </button>
          </div>
        </div>

        {/* プレビュー */}
        {previewData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiCheck className="mr-2 text-green-500" />
              プレビュー ({previewData.length}人分)
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {previewData.map((cast, index) => {
                const scheduleCount = Object.keys(cast.schedules).length;
                const scheduleDates = Object.keys(cast.schedules).sort();
                const startDate = scheduleDates[0];
                const endDate = scheduleDates[scheduleDates.length - 1];

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{cast.castName}</h3>
                      <span className="text-sm text-gray-600">
                        {scheduleCount}日分（{startDate} 〜 {endDate}）
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {Object.entries(cast.schedules).slice(0, 8).map(([date, time]) => (
                        <div key={date} className="bg-gray-50 p-2 rounded">
                          <div className="font-medium text-gray-700">{date}</div>
                          <div className="text-gray-600">{time}</div>
                        </div>
                      ))}
                      {Object.keys(cast.schedules).length > 8 && (
                        <div className="bg-gray-100 p-2 rounded flex items-center justify-center">
                          <span className="text-gray-500">
                            他 {Object.keys(cast.schedules).length - 8}日
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
            {importResult.skipped > 0 && (
              <p className="text-yellow-700 mt-2">スキップ: {importResult.skipped}件</p>
            )}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-red-700 mb-2">エラー詳細:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {importResult.errors.map((err: any, index: number) => (
                    <li key={index} className="text-sm text-red-600">
                      {err.castName}: {err.error}
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
            <li>出勤スケジュールのCSVファイルを準備します</li>
            <li>「ファイルを選択」ボタンからCSVファイルを選択します</li>
            <li>「CSVファイルを解析」ボタンでプレビューを確認します</li>
            <li>データを確認後、「インポート」ボタンで登録完了です</li>
            <li>同じ日付のスケジュールは自動的に更新されます</li>
          </ol>
          
          <div className="mt-4 p-4 bg-white rounded border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📊 CSVファイルのフォーマット</h4>
            <div className="text-xs text-blue-800 space-y-2">
              <p><strong>1行目（ヘッダー）:</strong></p>
              <div className="bg-gray-50 p-2 rounded font-mono">
                "女の子の名前","2025年12月16(火)","2025年12月17(水)",...
              </div>
              
              <p className="mt-2"><strong>2行目以降（データ）:</strong></p>
              <div className="bg-gray-50 p-2 rounded font-mono">
                "風花（ふうか）","16:00～翌06:00","16:00～翌06:00",...
              </div>
              
              <p className="mt-2"><strong>対応している時間形式:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code>16:00～23:00</code> - 通常の時間帯</li>
                <li><code>16:00～翌06:00</code> - 翌日までの時間帯</li>
                <li><code>出勤</code> - 時間未定（09:00～23:00として登録）</li>
                <li><code>休み</code> または 空欄 - スキップ</li>
              </ul>

              <p className="mt-2"><strong>キャスト名:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>括弧内のひらがなは自動的に除去されます</li>
                <li>例: "風花（ふうか）" → "風花"</li>
                <li>データベースに登録済みのキャスト名と一致する必要があります</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-2">⚠️ 注意事項</h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-yellow-800">
              <li>CSVファイルの文字コードは UTF-8 または Shift-JIS に対応</li>
              <li>キャスト名がデータベースに存在しない場合はスキップされます</li>
              <li>既存のスケジュールは自動的に上書きされます</li>
              <li>日付形式は "YYYY年MM月DD(曜)" の形式が必要です</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
