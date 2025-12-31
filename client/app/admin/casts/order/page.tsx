'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { castApi } from '@/lib/api';
import type { Cast } from '@/types';

export default function CastOrderPage() {
  const router = useRouter();
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCasts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCasts = async () => {
    try {
      const response = await castApi.getCasts({ admin: true });
      if (response.data.casts) {
        setCasts(response.data.casts);
      }
    } catch (error) {
      console.error('キャスト取得エラー:', error);
      alert('キャストの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    
    const newCasts = [...casts];
    [newCasts[index - 1], newCasts[index]] = [newCasts[index], newCasts[index - 1]];
    setCasts(newCasts);
  };

  const moveDown = (index: number) => {
    if (index === casts.length - 1) return;
    
    const newCasts = [...casts];
    [newCasts[index], newCasts[index + 1]] = [newCasts[index + 1], newCasts[index]];
    setCasts(newCasts);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const orders = casts.map((cast, index) => ({
        id: cast.id,
        display_order: index + 1,
      }));

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/casts/display-order/bulk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orders }),
      });

      const data = await response.json();

      if (data.success) {
        alert('並び順を保存しました');
        router.push('/admin/casts');
      } else {
        throw new Error(data.message || '保存に失敗しました');
      }
    } catch (error: any) {
      console.error('保存エラー:', error);
      alert(error.message || '並び順の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">キャスト並び順設定</h1>
            <p className="text-gray-600">上下矢印ボタンで並び順を変更してください</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiX size={20} />
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave size={20} />
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {casts.map((cast, index) => (
            <div
              key={cast.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-16 text-center">
                <div className="text-2xl font-bold text-gray-400">{index + 1}</div>
              </div>

              <div className="w-16 h-20 flex-shrink-0">
                <img
                  src={cast.primary_image || `https://placehold.co/390x520/FFB6C1/000000?text=${encodeURIComponent(cast.name)}`}
                  alt={cast.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-800">{cast.name}</h3>
                  {cast.is_new && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {cast.age}歳 / T{cast.height || '---'} / {cast.cup_size || '-'}カップ
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="上に移動"
                >
                  <FiArrowUp size={20} />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === casts.length - 1}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="下に移動"
                >
                  <FiArrowDown size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-600">
        全 {casts.length} 名
      </div>
    </div>
  );
}
