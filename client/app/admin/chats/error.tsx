'use client';

import { useEffect } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('チャット管理エラー:', error);
  }, [error]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="text-red-600 text-2xl flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-red-800 mb-2">
              チャット管理ページでエラーが発生しました
            </h2>
            <p className="text-red-700 mb-2">{error.message}</p>
            {error.digest && (
              <p className="text-sm text-red-600 mb-4">エラーID: {error.digest}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                再試行
              </button>
              <button
                onClick={() => (window.location.href = '/admin')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
              >
                ダッシュボードに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
