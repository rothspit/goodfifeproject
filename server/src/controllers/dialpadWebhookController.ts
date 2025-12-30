import { Request, Response } from 'express';
import crypto from 'crypto';

// Socket.ioインスタンスを保存するための変数
let io: any = null;

export const setSocketIO = (socketIO: any) => {
  io = socketIO;
};

// Dialpad Webhookの署名検証
const verifyDialpadSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  if (!secret || !signature) {
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

// Dialpad Webhookを受信
export const receiveDialpadWebhook = (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-dialpad-signature'] as string;
    const secret = process.env.DIALPAD_WEBHOOK_SECRET;

    // 署名検証（secretが設定されている場合のみ）
    if (secret && signature) {
      const rawBody = JSON.stringify(req.body);
      const isValid = verifyDialpadSignature(rawBody, signature, secret);
      
      if (!isValid) {
        console.error('❌ Dialpad webhook signature verification failed');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = req.body;
    console.log('📞 Dialpad webhook received:', JSON.stringify(event, null, 2));

    // イベントタイプを確認
    const eventType = event.event_type || event.type;
    
    // 着信イベントの処理
    if (eventType === 'call.created' || eventType === 'call.ringing' || eventType === 'call.incoming') {
      handleIncomingCall(event);
    } else if (eventType === 'call.answered') {
      handleCallAnswered(event);
    } else if (eventType === 'call.ended') {
      handleCallEnded(event);
    } else {
      console.log(`ℹ️ Unhandled event type: ${eventType}`);
    }

    // Dialpadに200を返す（必須）
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('❌ Error processing Dialpad webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 着信イベントの処理
const handleIncomingCall = (event: any) => {
  console.log('📞 Incoming call detected');

  // Dialpadのイベントペイロードから必要な情報を抽出
  const callData = event.data || event.payload || event;
  
  // デバッグ: 受信したデータの完全な構造をログ出力
  console.log('🔍 DEBUG - Full event structure:', JSON.stringify(event, null, 2));
  console.log('🔍 DEBUG - callData structure:', JSON.stringify(callData, null, 2));
  console.log('🔍 DEBUG - Available keys in callData:', Object.keys(callData));
  
  // 顧客の電話番号を取得（発信者番号） - より多くのパターンを試す
  const customerPhone = callData.caller_number || 
                        callData.from_number || 
                        callData.external_number ||
                        callData.caller?.phone_number ||
                        callData.caller_id ||
                        event.caller_id ||
                        callData.from ||
                        event.from;
  
  // 着信した電話番号を取得（受信側の番号） - より多くのパターンを試す
  const incomingNumber = callData.callee_number || 
                         callData.to_number || 
                         callData.target_number ||
                         callData.callee?.phone_number ||
                         callData.target ||
                         event.target ||
                         callData.to ||
                         event.to;

  // 通話ID
  const callId = callData.call_id || callData.id || event.call_id;

  // ユーザー情報
  const userId = callData.user_id || callData.target_user_id;
  const userName = callData.user_name || callData.target_name;

  console.log('🔍 DEBUG - Extracted values:');
  console.log('  customerPhone:', customerPhone);
  console.log('  incomingNumber:', incomingNumber);
  console.log('  callId:', callId);

  if (!customerPhone) {
    console.error('❌ No customer phone number found in webhook data');
    console.error('💡 Available data structure:', JSON.stringify(callData, null, 2));
    return;
  }

  // 店舗を自動識別
  const storeName = identifyStore(incomingNumber);

  // CTIポップアップ用のデータ
  const ctiData = {
    type: 'incoming_call',
    callId,
    customerPhone: normalizePhoneNumber(customerPhone),
    incomingNumber: normalizePhoneNumber(incomingNumber),
    storeName, // 店舗名を追加
    userId,
    userName,
    timestamp: new Date().toISOString(),
    rawData: callData, // デバッグ用
  };

  console.log('🔔 Broadcasting incoming call to admin clients:', ctiData);

  // Socket.ioで管理画面に通知
  if (io) {
    io.to('admin-room').emit('incoming_call', ctiData);
    console.log('✅ Incoming call broadcasted');
  } else {
    console.error('❌ Socket.IO not initialized');
  }
};

// 通話応答イベントの処理
const handleCallAnswered = (event: any) => {
  console.log('✅ Call answered');
  
  const callData = event.data || event.payload || event;
  const callId = callData.call_id || callData.id;

  if (io) {
    io.to('admin-room').emit('call_answered', {
      type: 'call_answered',
      callId,
      timestamp: new Date().toISOString(),
    });
  }
};

// 通話終了イベントの処理
const handleCallEnded = (event: any) => {
  console.log('📵 Call ended');
  
  const callData = event.data || event.payload || event;
  const callId = callData.call_id || callData.id;
  const duration = callData.duration;

  if (io) {
    io.to('admin-room').emit('call_ended', {
      type: 'call_ended',
      callId,
      duration,
      timestamp: new Date().toISOString(),
    });
  }
};

// 電話番号を正規化（ハイフンを削除、国番号を0に変換）
const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // 数字のみに変換
  let normalized = phone.replace(/\D/g, '');
  
  // 日本の国番号 (81) を先頭の0に変換
  if (normalized.startsWith('81')) {
    normalized = '0' + normalized.substring(2);
  }
  
  return normalized;
};

// 着信番号から店舗を識別
const identifyStore = (incomingNumber: string): string => {
  if (!incomingNumber) return '不明';
  
  const normalized = normalizePhoneNumber(incomingNumber);
  
  // 店舗番号マッピング
  const storeMapping: { [key: string]: string } = {
    '05017439555': '西船橋店',
    '05017487999': '西船橋店公式',
    '05017446444': '西船橋店タウン',
    '05017459797': '葛西店ヘブン',
    '05017459665': 'アイドル学園 西船橋',
    '05017442606': '錦糸町店',
    '05017438883': '松戸店',
  };

  // 完全一致で検索
  if (storeMapping[normalized]) {
    return storeMapping[normalized];
  }

  // プレフィックスマッチング（最初の8桁で判定）
  const prefix = normalized.substring(0, 8);
  for (const [number, store] of Object.entries(storeMapping)) {
    if (number.startsWith(prefix)) {
      return store;
    }
  }

  return '不明';
};

// テスト用エンドポイント（開発環境でのテスト用）
export const testIncomingCall = (req: Request, res: Response) => {
  const { customerPhone, incomingNumber } = req.body;

  if (!customerPhone) {
    return res.status(400).json({ error: 'customerPhone is required' });
  }

  const normalizedIncoming = normalizePhoneNumber(incomingNumber || '05017487999');
  const storeName = identifyStore(normalizedIncoming);

  const ctiData = {
    type: 'incoming_call',
    callId: 'test-' + Date.now(),
    customerPhone: normalizePhoneNumber(customerPhone),
    incomingNumber: normalizedIncoming,
    storeName, // 店舗名を追加
    userId: 'test-user',
    userName: 'Test User',
    timestamp: new Date().toISOString(),
    isTest: true,
  };

  console.log('🧪 Test incoming call:', ctiData);

  if (io) {
    io.to('admin-room').emit('incoming_call', ctiData);
    res.json({ success: true, message: 'Test call broadcasted', data: ctiData });
  } else {
    res.status(500).json({ error: 'Socket.IO not initialized' });
  }
};
