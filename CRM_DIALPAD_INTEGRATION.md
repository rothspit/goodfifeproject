# 📞 CRM管理システム Dialpad CTI連携ガイド

## 🎯 概要

新しいCRM管理システムに、既存のDialpad CTI連携機能を統合しました。
電話着信時に自動的にポップアップウィンドウが開き、顧客情報が即座に表示されます。

---

## ✅ 実装完了内容

### 1. CTIリスナーコンポーネント
- Socket.IO によるリアルタイム接続
- 着信イベントの自動受信
- 接続ステータスの表示（画面右下）

### 2. CTIポップアップウィンドウ
- 着信時に自動的にポップアップ表示
- 顧客情報の即座表示
  - 名前、電話番号、顧客タイプ
  - メールアドレス、自宅住所
  - 総注文数、最終来店日
  - 自宅交通費
  - 備考・メモ
- 直近の利用履歴（最大5件）
- 店舗の自動判定

### 3. バックエンド連携
- 既存のDialpad Webhook受信エンドポイント使用
- Socket.IO admin-roomでリアルタイム配信
- 顧客検索APIとの連携

---

## 🔧 使用方法

### 管理画面での確認

1. **CRM管理画面にログイン**
   ```
   URL: https://9090-iwlhxuzhfaqbr3cqpityv-de59bda9.sandbox.novita.ai
   電話番号: admin
   パスワード: admin123
   ```

2. **CTI接続ステータスを確認**
   - 画面右下に接続ステータスが表示されます
   - 緑色 = CTI接続中（正常）
   - 赤色 = CTI未接続（エラー）

3. **着信を待つ**
   - Dialpadで電話を受信すると自動的にポップアップが表示されます

---

## 🧪 テスト方法

### 方法1: Dialpad実機テスト

1. CRM管理画面を開いておく
2. Dialpadアカウントに電話をかける
3. 着信時に自動的にCTIポップアップが表示される
4. 顧客情報と利用履歴が表示される

### 方法2: テストAPI使用

既存のテストエンドポイントを使用：

```bash
# 管理画面でログイン後、JWTトークンを取得

# テスト着信を送信
curl -X POST http://162.43.91.102:5000/api/dialpad/test-call \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerPhone": "09012345678",
    "incomingNumber": "0501748XXXX"
  }'
```

管理画面を開いていると、CTIポップアップが表示されます。

---

## 📊 システムフロー

```
┌──────────────┐
│   Dialpad    │  1. 着信イベント
│   (電話)     │     (Webhook)
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│  バックエンドサーバー             │
│  /api/dialpad/webhook            │
│  ・Webhook受信                   │
│  ・顧客検索                      │
│  ・店舗判定                      │
└──────┬──────────────────────────┘
       │
       ▼  2. Socket.IO通知
┌─────────────────────────────────┐
│  WebSocket (Socket.IO)           │
│  admin-room                      │
│  ・管理者にブロードキャスト       │
└──────┬──────────────────────────┘
       │
       ▼  3. イベント受信
┌─────────────────────────────────┐
│  CRM管理画面                     │
│  CTIListener コンポーネント      │
│  ・incoming_call イベント受信    │
│  ・ポップアップ開く              │
└──────┬──────────────────────────┘
       │
       ▼  4. ポップアップ表示
┌─────────────────────────────────┐
│  CTIポップアップウィンドウ       │
│  /cti-popup?phone=...            │
│  ・顧客情報表示                  │
│  ・利用履歴表示                  │
│  ・メモ表示                      │
└─────────────────────────────────┘
```

---

## 🛠️ 技術詳細

### フロントエンド実装

#### 1. CTIListener コンポーネント
ファイル: `/crm-admin/app/components/CTIListener.tsx`

主な機能：
- Socket.IO接続の確立
- admin-roomへの参加
- `incoming_call` イベントのリッスン
- ポップアップウィンドウの制御
- 接続ステータスの表示

```typescript
const newSocket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

newSocket.on('incoming_call', (data: IncomingCallData) => {
  handleIncomingCall(data);
});
```

#### 2. CTIポップアップページ
ファイル: `/crm-admin/app/cti-popup/page.tsx`

表示内容：
- ヘッダー（電話番号、店舗情報）
- 顧客情報カード
  - 名前、電話番号
  - 顧客タイプ（新規/常連/VIP）
  - メール、自宅住所、交通費
  - 総注文数、最終来店日
  - 備考
- 利用履歴リスト（最大5件）
- Call ID（デバッグ情報）

### バックエンド連携

既存のDialpad統合を使用：

**Webhookエンドポイント:**
```
POST /api/dialpad/webhook
```

**Socket.IOイベント:**
```javascript
io.to('admin-room').emit('incoming_call', {
  type: 'incoming_call',
  callId: 'xxx',
  customerPhone: '09012345678',
  incomingNumber: '0501748XXXX',
  store: 'nishifuna',
  customer: { ... },
  timestamp: '2024-12-16T10:00:00Z'
});
```

---

## 🔐 Dialpad設定（既存設定の確認）

### 必要な環境変数

サーバーの `.env` ファイルを確認：

```bash
# サーバー上で確認
ssh -i ~/WIFEHP.pem root@162.43.91.102
cat /root/hitoduma-crm/server/.env | grep DIALPAD
```

必要な設定：
```
DIALPAD_WEBHOOK_SECRET=your-webhook-secret-key
```

### Webhook設定確認

Dialpad Developer Portalで以下を確認：

1. **Webhook URL:**
   ```
   https://crm.h-mitsu.com/api/dialpad/webhook
   または
   http://162.43.91.102:5000/api/dialpad/webhook
   ```

2. **Webhook Subscriptions:**
   - call_event subscription
   - call_states: ["ringing", "answered", "ended"]

3. **Secret Key:**
   - 環境変数と一致していることを確認

---

## 📱 ポップアップ表示の仕組み

### ポップアップウィンドウの位置

```javascript
const width = 500;
const height = 700;
const left = window.screen.width - width - 50;  // 右端から50px
const top = 50;  // 上から50px
```

### ポップアップがブロックされた場合

ブラウザでポップアップが許可されていない場合：
1. ブラウザ通知を表示（権限がある場合）
2. コンソールにエラーログを出力

**ポップアップ許可設定:**
- Chrome: 設定 → プライバシーとセキュリティ → サイトの設定 → ポップアップとリダイレクト
- 管理画面のドメインを許可リストに追加

---

## 🎨 UI/UX機能

### 接続ステータスインジケーター
画面右下に常時表示：
- 緑色 + 点滅: CTI接続中（正常）
- 赤色: CTI未接続

### 顧客タイプ別カラー
- **VIP**: 赤色バッジ
- **常連**: 黄色バッジ
- **新規**: 緑色バッジ

### 新規顧客の場合
顧客が見つからない場合：
- 黄色の警告メッセージ表示
- 「新規顧客登録が必要」と表示
- 電話番号のみ表示

---

## 🔍 トラブルシューティング

### 問題1: CTIポップアップが表示されない

**確認事項:**
1. 画面右下の接続ステータスが緑色か確認
2. ブラウザのポップアップがブロックされていないか確認
3. ブラウザコンソールでエラーがないか確認

**解決策:**
```javascript
// ブラウザコンソールで接続状態を確認
// CTI WebSocket connected が表示されているか確認
```

### 問題2: CTI接続が赤色（未接続）

**原因:**
- バックエンドサーバーが起動していない
- Socket.IOポートが開いていない
- CORS設定の問題

**解決策:**
```bash
# サーバー上でバックエンドを確認
ssh -i ~/WIFEHP.pem root@162.43.91.102
pm2 status
pm2 logs hitoduma-backend
```

### 問題3: 顧客情報が表示されない

**原因:**
- 顧客データがデータベースに登録されていない
- 電話番号の形式が一致しない

**確認:**
```bash
# データベースで顧客を検索
mysql -u crm_user -p'CRM@Pass2024!' hitoduma_crm
SELECT * FROM users WHERE phone_number = '09012345678';
```

---

## 📈 今後の拡張

### 実装済み
- ✅ リアルタイム着信通知
- ✅ 顧客情報の自動表示
- ✅ 利用履歴の表示
- ✅ 店舗の自動判定

### 今後の改善案
- ⏳ 音声通知（着信音）
- ⏳ 通話メモの入力機能
- ⏳ 通話履歴の自動記録
- ⏳ 複数着信の管理
- ⏳ CTIポップアップのサイズ調整機能

---

## 🎯 まとめ

### 実装完了
✅ Dialpad CTI連携機能を新しいCRM管理システムに統合完了
✅ 着信時の自動ポップアップ表示
✅ 顧客情報と利用履歴の即座表示
✅ 既存のDialpad Webhook設定をそのまま使用可能

### アクセスURL
**CRM管理画面:**
https://9090-iwlhxuzhfaqbr3cqpityv-de59bda9.sandbox.novita.ai

**ログイン:**
- 電話番号: `admin`
- パスワード: `admin123`

### 動作確認
1. 上記URLにアクセスしてログイン
2. 画面右下の接続ステータスが緑色になることを確認
3. Dialpadで電話を受信するか、テストAPIを使用
4. CTIポップアップが自動的に開くことを確認

---

**作成日:** 2024年12月16日  
**バージョン:** 1.0.0  
**ステータス:** ✅ 実装完了・動作確認済み
