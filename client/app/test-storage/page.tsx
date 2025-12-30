'use client';

import { useEffect, useState } from 'react';

export default function TestStoragePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [testResults, setTestResults] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (isMounted) {
      runTests();
    }
  }, [isMounted]);

  const runTests = async () => {
    if (typeof window === 'undefined') return;
    const results: any = {};
    
    // Test 1: localStorage write/read
    addLog('🧪 Test 1: localStorage書き込み');
    try {
      localStorage.setItem('test_key', 'test_value');
      const value = localStorage.getItem('test_key');
      results.localStorageWrite = value === 'test_value' ? '✅ 成功' : '❌ 失敗';
      addLog(`localStorage書き込み結果: ${results.localStorageWrite}`);
    } catch (e: any) {
      results.localStorageWrite = `❌ エラー: ${e.message}`;
      addLog(`localStorage書き込みエラー: ${e.message}`);
    }

    // Test 2: sessionStorage write/read
    addLog('🧪 Test 2: sessionStorage書き込み');
    try {
      sessionStorage.setItem('test_key', 'test_value');
      const value = sessionStorage.getItem('test_key');
      results.sessionStorageWrite = value === 'test_value' ? '✅ 成功' : '❌ 失敗';
      addLog(`sessionStorage書き込み結果: ${results.sessionStorageWrite}`);
    } catch (e: any) {
      results.sessionStorageWrite = `❌ エラー: ${e.message}`;
      addLog(`sessionStorage書き込みエラー: ${e.message}`);
    }

    // Test 3: Check existing auth data
    addLog('🧪 Test 3: 既存の認証データ確認');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    results.existingAuth = token && user ? '✅ 認証データあり' : '❌ 認証データなし';
    addLog(`認証データ: token=${!!token}, user=${!!user}`);

    // Test 4: Simulate login data save
    addLog('🧪 Test 4: ログインデータ保存シミュレーション');
    try {
      const testToken = 'test_token_123';
      const testUser = JSON.stringify({ id: 1, phone_number: '000-0000-0000' });
      
      localStorage.setItem('token', testToken);
      localStorage.setItem('user', testUser);
      sessionStorage.setItem('token', testToken);
      sessionStorage.setItem('user', testUser);
      
      // 即座に確認
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      results.loginDataSave = (savedToken === testToken && savedUser === testUser) ? '✅ 成功' : '❌ 失敗';
      addLog(`ログインデータ保存: ${results.loginDataSave}`);
      addLog(`保存確認: token=${!!savedToken}, user=${!!savedUser}`);
    } catch (e: any) {
      results.loginDataSave = `❌ エラー: ${e.message}`;
      addLog(`ログインデータ保存エラー: ${e.message}`);
    }

    // Test 5: Check browser info
    addLog('🧪 Test 5: ブラウザ情報確認');
    results.userAgent = navigator.userAgent;
    results.cookieEnabled = navigator.cookieEnabled ? '✅ 有効' : '❌ 無効';
    addLog(`Cookie有効: ${results.cookieEnabled}`);
    addLog(`UserAgent: ${navigator.userAgent.substring(0, 50)}...`);

    setTestResults(results);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Storage Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          <div className="space-y-2">
            {Object.entries(testResults).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                <span className="font-mono text-sm font-semibold">{key}:</span>
                <span className="font-mono text-sm">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Console Logs:</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="text-sm font-mono text-gray-700 border-b border-gray-100 pb-1">
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Storage Contents:</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">localStorage:</h3>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(
                  Object.keys(localStorage).reduce((acc: any, key) => {
                    acc[key] = localStorage.getItem(key);
                    return acc;
                  }, {}),
                  null,
                  2
                )}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">sessionStorage:</h3>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(
                  Object.keys(sessionStorage).reduce((acc: any, key) => {
                    acc[key] = sessionStorage.getItem(key);
                    return acc;
                  }, {}),
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={runTests}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            🔄 テスト再実行
          </button>
          <a
            href="/login"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 inline-block"
          >
            ログインページへ
          </a>
          <a
            href="/mypage"
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 inline-block"
          >
            マイページへ
          </a>
        </div>
      </div>
    </div>
  );
}
