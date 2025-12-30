'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface IncomingCallData {
  type: 'incoming_call';
  callId: string;
  customerPhone: string;
  incomingNumber: string;
  timestamp: string;
  customer?: any;
  store?: string;
  isTest?: boolean;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://162.43.91.102:5000';

export default function CTIListener() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastCall, setLastCall] = useState<IncomingCallData | null>(null);

  useEffect(() => {
    // Socket.IO接続
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ CTI WebSocket connected');
      setConnected(true);
      
      // 管理者ルームに参加
      newSocket.emit('join-admin');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ CTI WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('CTI connection error:', error);
    });

    // 着信イベントをリッスン
    newSocket.on('incoming_call', (data: IncomingCallData) => {
      console.log('📞 Incoming call:', data);
      setLastCall(data);
      handleIncomingCall(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleIncomingCall = (data: IncomingCallData) => {
    // CTIポップアップウィンドウを開く
    const width = 500;
    const height = 700;
    const left = window.screen.width - width - 50;
    const top = 50;

    const popup = window.open(
      `/cti-popup?phone=${encodeURIComponent(data.customerPhone)}&callId=${data.callId}&incoming=${encodeURIComponent(data.incomingNumber)}&store=${data.store || ''}`,
      'CTI_Popup',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      // ポップアップがブロックされた場合、通知を表示
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('着信通知', {
          body: `${data.customerPhone} からの着信`,
          icon: '/phone-icon.png',
        });
      }
    }

    // 音声通知（オプション）
    playNotificationSound();
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
      console.log('Notification sound not available');
    }
  };

  // 通知権限をリクエスト
  useEffect(() => {
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 接続ステータス表示 */}
      <div className={`
        flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm
        ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
      `}>
        <div className={`
          w-2 h-2 rounded-full
          ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}
        `} />
        <span className="font-medium">
          {connected ? 'CTI接続中' : 'CTI未接続'}
        </span>
      </div>

      {/* 最新の着信情報（デバッグ用） */}
      {lastCall && process.env.NODE_ENV === 'development' && (
        <div className="mt-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg text-xs">
          <p className="font-bold">最新着信</p>
          <p>電話番号: {lastCall.customerPhone}</p>
          <p>Call ID: {lastCall.callId}</p>
          {lastCall.isTest && <p className="text-red-600">※テスト着信</p>}
        </div>
      )}
    </div>
  );
}
