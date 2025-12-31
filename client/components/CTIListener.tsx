'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const CTIListener = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastCall, setLastCall] = useState<any>(null);

  useEffect(() => {
    // トークンを取得
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('CTIListener: No token found, skipping connection');
      return;
    }

    // Socket.IOに接続
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('✅ CTI WebSocket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ CTI WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ CTI WebSocket connection error:', error);
      setIsConnected(false);
    });

    // 管理者ルームに参加確認
    socketInstance.on('joined_admin_room', (data) => {
      console.log('✅ Joined admin-room for CTI notifications', data);
    });

    // 着信イベントを受信
    socketInstance.on('incoming_call', (data: any) => {
      console.log('📞 Incoming call received:', data);
      setLastCall(data);
      handleIncomingCall(data);
    });

    // 通話応答イベント
    socketInstance.on('call_answered', (data: any) => {
      console.log('✅ Call answered:', data);
    });

    // 通話終了イベント
    socketInstance.on('call_ended', (data: any) => {
      console.log('📵 Call ended:', data);
    });

    setSocket(socketInstance);

    // クリーンアップ
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleIncomingCall = (callData: any) => {
    const { customerPhone, incomingNumber, callId, userName } = callData;

    // CTIポップアップを開く
    const url = `/admin/customer-management/cti?phone=${customerPhone}${incomingNumber ? `&incoming=${incomingNumber}` : ''}`;
    const windowName = `cti-${callId || Date.now()}`;
    // alwaysRaisedを追加して常に最前面に表示
    const windowFeatures = 'width=500,height=700,resizable=yes,scrollbars=yes,left=100,top=100,alwaysRaised=yes';

    // 既存のポップアップがあれば閉じる（オプション）
    // const existingWindow = window.open('', windowName);
    // if (existingWindow) existingWindow.close();

    // 新しいポップアップを開く
    const popup = window.open(url, windowName, windowFeatures);

    if (popup) {
      // 最前面に表示し、フォーカスを当てる
      popup.focus();
      
      // 一定間隔でフォーカスを強制（ブラウザの制限を回避）
      const focusInterval = setInterval(() => {
        try {
          if (!popup.closed) {
            popup.focus();
          } else {
            clearInterval(focusInterval);
          }
        } catch (e) {
          clearInterval(focusInterval);
        }
      }, 100);
      
      // 3秒後にインターバルをクリア
      setTimeout(() => clearInterval(focusInterval), 3000);
      
      console.log(`✅ CTI popup opened for ${customerPhone}`);

      // 音声通知（オプション）
      playNotificationSound();
    } else {
      console.error('❌ Failed to open CTI popup - popup blocker may be active');
      alert(`着信: ${customerPhone}\nCTIポップアップがブロックされました。ポップアップを許可してください。`);
    }
  };

  // 通知音を再生（オプション）
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/phone-ring.mp3');
      audio.play().catch((error) => {
        console.log('Notification sound failed to play:', error);
      });
    } catch (error) {
      console.log('Notification sound not available:', error);
    }
  };

  // デバッグ用UI（開発環境のみ表示）
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <>
      {isDevelopment && (
        <div 
          style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            padding: '8px 12px',
            background: isConnected ? '#10b981' : '#ef4444',
            color: 'white',
            borderRadius: '8px',
            fontSize: '12px',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ fontWeight: 'bold' }}>
            CTI {isConnected ? '🟢 接続中' : '🔴 切断'}
          </div>
          {lastCall && (
            <div style={{ marginTop: '4px', fontSize: '11px' }}>
              最終着信: {lastCall.customerPhone}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CTIListener;
