'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiGift, FiUsers, FiTrendingUp, FiDollarSign, FiSearch } from 'react-icons/fi';
import { pointApi } from '@/lib/api';

interface UserPoints {
  user_id: number;
  points: number;
  total_earned: number;
  total_used: number;
  name: string;
  phone_number: string;
  usable_units?: number;
}

export default function PointsManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserPoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserPoints | null>(null);
  const [showUsePointsModal, setShowUsePointsModal] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(1000);

  useEffect(() => {
    // 管理者認証チェック
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await pointApi.getAllUserPoints();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('ユーザー一覧取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUsePoints = async () => {
    if (!selectedUser) return;

    if (pointsToUse % 1000 !== 0) {
      alert('ポイントは1000ポイント単位で使用してください');
      return;
    }

    if (pointsToUse > selectedUser.points) {
      alert('ポイント残高が不足しています');
      return;
    }

    try {
      await pointApi.adminUsePoints({
        user_id: selectedUser.user_id,
        points_to_use: pointsToUse,
      });

      alert(`${pointsToUse}ポイントを使用しました`);
      setShowUsePointsModal(false);
      setSelectedUser(null);
      setPointsToUse(1000);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'ポイント使用に失敗しました');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone_number?.includes(searchQuery)
  );

  const totalPoints = users.reduce((sum, user) => sum + user.points, 0);
  const totalEarned = users.reduce((sum, user) => sum + user.total_earned, 0);
  const totalUsed = users.reduce((sum, user) => sum + user.total_used, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <FiGift className="text-pink-600" />
            ポイント管理
          </h1>
          <p className="text-gray-600">顧客のポイント残高と使用履歴を管理</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">総ポイント残高</p>
              <FiDollarSign className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">pt</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">累計付与</p>
              <FiTrendingUp className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalEarned.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">pt</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">累計使用</p>
              <FiGift className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalUsed.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">pt</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">総ユーザー数</p>
              <FiUsers className="text-pink-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800">{users.length}</p>
            <p className="text-xs text-gray-500 mt-1">人</p>
          </div>
        </div>

        {/* 検索バー */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-2">
            <FiSearch className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ユーザー名または電話番号で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-gray-700"
            />
          </div>
        </div>

        {/* ユーザー一覧 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    電話番号
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    残高
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    使用可能単位
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    累計付与
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    累計使用
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      読み込み中...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      ユーザーが見つかりません
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.name || '未設定'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-bold text-pink-600">{user.points.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 ml-1">pt</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-semibold text-gray-800">
                          {Math.floor(user.points / 1000)}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">単位</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                        {user.total_earned.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                        {user.total_used.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUsePointsModal(true);
                          }}
                          disabled={user.points < 1000}
                          className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          ポイント使用
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ポイント使用モーダル */}
      {showUsePointsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">ポイント使用</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">ユーザー</p>
              <p className="font-medium text-gray-800">{selectedUser.name || '未設定'}</p>
              <p className="text-sm text-gray-500">{selectedUser.phone_number}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">現在の残高</p>
              <p className="text-2xl font-bold text-pink-600">
                {selectedUser.points.toLocaleString()} pt
              </p>
              <p className="text-sm text-gray-500">
                使用可能: {Math.floor(selectedUser.points / 1000)} 単位（1000pt × {Math.floor(selectedUser.points / 1000)}）
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                使用ポイント（1000pt単位）
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                max={Math.floor(selectedUser.points / 1000) * 1000}
                value={pointsToUse}
                onChange={(e) => setPointsToUse(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                ※ 1000ポイント単位でのみ使用可能です
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUsePointsModal(false);
                  setSelectedUser(null);
                  setPointsToUse(1000);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleUsePoints}
                className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors"
              >
                使用する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
