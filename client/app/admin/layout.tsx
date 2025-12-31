'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  FiHome, 
  FiUsers, 
  FiCalendar,
  FiBell, 
  FiClock, 
  FiFileText, 
  FiMessageSquare, 
  FiThumbsUp,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiGift,
  FiKey,
  FiShoppingCart,
  FiPhone
} from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';
import CTIListener from '@/components/CTIListener';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // ログインページの場合は認証チェックをスキップ
    if (pathname === '/admin/login') {
      return;
    }

    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userStr || !token) {
      router.push('/admin/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      
      // 管理者チェック（役割がadminかどうか）
      if (userData.role !== 'admin') {
        alert('管理者権限がありません');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error('ユーザーデータの解析エラー:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  const menuItems = [
    { href: '/admin', icon: FiHome, label: 'ダッシュボード' },
    { href: '/admin/customer-management/orders', icon: FiShoppingCart, label: '顧客管理・受注' },
    { href: '/admin/customer-management/search', icon: FiUsers, label: '顧客検索' },
    { href: '/admin/customer-management/cti', icon: FiPhone, label: 'CTIポップアップ' },
    { href: '/admin/casts', icon: FiUsers, label: 'キャスト管理' },
    { href: '/admin/cast-credentials', icon: FiKey, label: 'キャストIDパス管理' },
    { href: '/admin/schedules', icon: FiCalendar, label: '出勤スケジュール' },
    { href: '/admin/announcements', icon: FiBell, label: 'お知らせ管理' },
    { href: '/admin/immediate', icon: FiClock, label: '即姫管理' },
    { href: '/admin/blogs', icon: FiFileText, label: 'ブログ管理' },
    { href: '/admin/reviews', icon: FiThumbsUp, label: '口コミ承認' },
    { href: '/admin/receipts', icon: FiFileText, label: '電子領収書管理' },
    { href: '/admin/chats', icon: FiMessageSquare, label: 'チャット管理' },
    { href: '/admin/points', icon: FiGift, label: 'ポイント管理' },
    { href: '/admin/twitter', icon: FaXTwitter, label: 'X連携' },
    { href: '/admin/settings', icon: FiSettings, label: 'システム設定' },
  ];

  // ログインページの場合はレイアウトなしで表示
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // 認証中
  if (!user) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-800"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <h1 className="text-xl font-bold text-pink-600">人妻の蜜 - 管理画面</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              ようこそ、<span className="font-bold">{user.name}</span>さん
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <FiLogOut />
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-[57px]">
        {/* サイドバー */}
        <aside
          className={`fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] bg-white shadow-lg z-20 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } w-64`}
        >
          <nav className="p-4 space-y-2 overflow-y-auto h-full">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-pink-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-57px)]">
          {children}
        </main>
      </div>

      {/* モバイル用オーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* CTI着信リスナー */}
      <CTIListener />
    </div>
  );
}
