'use client';

import { useState, useEffect } from 'react';
import { authAPI } from './lib/api';
import CustomerSearch from './components/CustomerSearch';
import ReservationManagement from './components/ReservationManagement';
import Dashboard from './components/Dashboard';
import ImportManagement from './components/ImportManagement';
import CTIListener from './components/CTIListener';

type Tab = 'search' | 'reservations' | 'dashboard' | 'import';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (user && user.role === 'admin') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const result = await authAPI.login(phone, password);
      if (result.user?.role === 'admin') {
        setIsAuthenticated(true);
      } else {
        setLoginError('管理者権限が必要です');
        authAPI.logout();
      }
    } catch (error: any) {
      setLoginError(error.response?.data?.error || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setPhone('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">
            人妻の蜜 CRM管理画面
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>
            {loginError && (
              <p className="text-red-600 text-sm">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              人妻の蜜 CRM管理システム
            </h1>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              顧客検索
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reservations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              予約管理
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ダッシュボード
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'import'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              データ取込
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' && <CustomerSearch />}
        {activeTab === 'reservations' && <ReservationManagement />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'import' && <ImportManagement />}
      </main>

      {/* CTI Listener - Dialpad連携 */}
      <CTIListener />
    </div>
  );
}
