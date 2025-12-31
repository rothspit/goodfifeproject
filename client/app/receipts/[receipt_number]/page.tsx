'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { receiptApi } from '@/lib/api';
import { FiPrinter, FiDownload, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

interface Receipt {
  id: number;
  receipt_number: string;
  amount: number;
  name_on_receipt: string;
  address: string | null;
  issue_date: string;
  receipt_data: string;
  user_name: string;
  user_phone: string;
}

export default function ReceiptViewPage() {
  const params = useParams();
  const receipt_number = params.receipt_number as string;
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (receipt_number) {
      fetchReceipt();
    }
  }, [receipt_number]);

  const fetchReceipt = async () => {
    try {
      const response = await receiptApi.getByNumber(receipt_number);
      setReceipt(response.data.receipt);
    } catch (err: any) {
      setError(err.response?.data?.message || '領収書が見つかりません');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!receipt) return;

    // HTMLをBlobとして保存
    const blob = new Blob([receipt.receipt_data], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${receipt.receipt_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">領収書が見つかりません</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/mypage/receipts"
            className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 transition-all"
          >
            <FiArrowLeft />
            領収書一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 操作バー（印刷時非表示） */}
      <div className="bg-white shadow-md print:hidden sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/mypage/receipts"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft />
            戻る
          </Link>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition-all"
            >
              <FiDownload />
              ダウンロード
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-pink-700 transition-all"
            >
              <FiPrinter />
              印刷
            </button>
          </div>
        </div>
      </div>

      {/* 領収書表示 */}
      <div className="container mx-auto px-4 py-8">
        <div 
          className="bg-white shadow-lg"
          dangerouslySetInnerHTML={{ __html: receipt.receipt_data }}
        />
      </div>

      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
