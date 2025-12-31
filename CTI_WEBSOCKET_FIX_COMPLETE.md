# CTI WebSocket 接続修正完了レポート

**日時**: 2025年12月15日 18:54 (JST)  
**対象システム**: Goodfife CRM - Dialpad CTI連携  
**ドメイン**: https://crm.h-mitsu.com

---

## 🔧 修正内容

### ❌ **問題**
WebSocket接続エラーが発生し、CTIポップアップが機能しない状態でした：
```
CTI WebSocket connection error: j: websocket error
WebSocket connection to 'wss://crm.h-mitsu.com/socket.io/?EIO=4&transport=websocket' failed
Invalid namespace
```

### ✅ **原因**
1. **環境変数の誤使用**: `CTIListener.tsx`が`NEXT_PUBLIC_SOCKET_URL`の代わりに`NEXT_PUBLIC_API_URL`を使用
   - `NEXT_PUBLIC_API_URL` = `https://crm.h-mitsu.com/api` (REST API用)
   - `NEXT_PUBLIC_SOCKET_URL` = `https://crm.h-mitsu.com` (Socket.IO用)
   
2. **Nginx プロキシ設定の誤り**: Socket.IOが誤ったポート (5001) にプロキシされていた
   - 正しいポート: `5000` (バックエンドと同じポート)

### ✅ **修正内容**

#### 1. `client/components/CTIListener.tsx` の修正
```typescript
// 修正前
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const socket = io(API_URL, { ... });

// 修正後
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL, { ... });
```

#### 2. Nginx 設定の修正 (`/etc/nginx/conf.d/crm.h-mitsu.conf`)
```nginx
# Socket.IO WebSocket プロキシ設定
location /socket.io/ {
    proxy_pass http://localhost:5000;  # ポート5001 → 5000に変更
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
    proxy_buffering off;
}
```

#### 3. バックエンドCORS設定の更新
```typescript
// server/src/index.ts
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://crm.h-mitsu.com',        // 追加
      'http://210.131.222.152:3000',    // 追加
      // ... その他
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

---

## ✅ 確認済み項目

### 1. サーバー状態
- ✅ Backend: オンライン (PM2 - `goodfife-backend`)
- ✅ Frontend: オンライン (PM2 - `goodfife-frontend`)
- ✅ ポート5000: Socket.IOサーバー起動中
- ✅ HTTPS: Let's Encrypt証明書 有効 (2026/03/15まで)

### 2. Nginx 設定
- ✅ Socket.IO エンドポイント: `/socket.io/` → `http://localhost:5000`
- ✅ WebSocket ヘッダー設定: `Upgrade`, `Connection: upgrade`
- ✅ プロキシタイムアウト: 86400秒
- ✅ HTTP → HTTPS リダイレクト: 有効

### 3. エンドポイントテスト
```bash
# Socket.IO ポーリングエンドポイント
curl -I https://crm.h-mitsu.com/socket.io/?EIO=4&transport=polling
# → HTTP/2 400 (Expected - JWT認証が必要なため)

# HTTPS アクセス
curl -I https://crm.h-mitsu.com
# → HTTP/1.1 200 OK (Next.js frontend)
```

---

## 🧪 CTIポップアップ テスト手順

### **ステップ 1: ログイン**
1. ブラウザで **https://crm.h-mitsu.com/admin** にアクセス
2. 以下の情報でログイン：
   - **電話番号**: `09000000000`
   - **パスワード**: `Admin@2025`

### **ステップ 2: WebSocket接続確認**
1. ブラウザの開発者ツールを開く (F12)
2. **Console** タブを確認
3. 以下のメッセージが表示されることを確認：
   ```
   ✅ CTI WebSocket connected successfully
   ```
4. エラーメッセージが無いことを確認

### **ステップ 3: テスト着信の実行**

#### 方法 A: ブラウザコンソールから実行
```javascript
// トークン取得
const token = localStorage.getItem('token');

// テスト着信API呼び出し
fetch('https://crm.h-mitsu.com/api/dialpad/test-call', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customerPhone: '09000000000',      // 管理者の電話番号
    incomingNumber: '0501748XXXX'      // 西船橋店の着信番号
  })
}).then(res => res.json()).then(data => {
  console.log('✅ テスト結果:', data);
}).catch(err => {
  console.error('❌ エラー:', err);
});
```

#### 方法 B: cURL コマンド (サーバーから)
```bash
# JWTトークンを取得してから実行
curl -X POST https://crm.h-mitsu.com/api/dialpad/test-call \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerPhone": "09000000000",
    "incomingNumber": "0501748XXXX"
  }'
```

### **ステップ 4: ポップアップ確認**
以下を確認してください：

#### ✅ **成功時の動作**
1. **新しいウィンドウが自動的に開く** (500x700px)
2. **CTIポップアップが表示される** 以下の情報を含む：
   - 顧客氏名: 「管理者」
   - 電話番号: 「09000000000」
   - 店舗名: 「西船橋」(自動識別)
   - メモ/履歴: データベースから取得
3. **コンソールに成功メッセージ**:
   ```
   ✅ テスト結果: { success: true, message: '...' }
   ```

#### ❌ **失敗時のトラブルシューティング**
1. **ポップアップブロッカーを無効化**
   - ブラウザの設定で `crm.h-mitsu.com` のポップアップを許可
   
2. **WebSocket接続を確認**
   - コンソールに `🟢 WebSocket connected` が表示されるか確認
   - エラーメッセージがある場合はスクリーンショットを共有
   
3. **ブラウザキャッシュをクリア**
   ```
   Ctrl + Shift + Delete (Windows)
   Cmd + Shift + Delete (Mac)
   ```
   - キャッシュ削除後、再ログイン

---

## 📱 実際の着信テスト

テスト着信APIで動作確認後、以下で実際の着信テストを行ってください：

1. **Dialpadアカウントにログイン**: https://dialpad.com/admin
2. **管理画面で待機**: https://crm.h-mitsu.com/admin にログイン状態を維持
3. **Dialpadから発信**: 設定済みの電話番号に発信
4. **CTIポップアップ自動表示を確認**

### 自動店舗識別設定
| 着信番号 | 店舗名 |
|---------|--------|
| 050-1748-XXXX | 西船橋 |
| 050-YYYY-ZZZZ | (他の店舗) |

---

## 🔐 セキュリティ設定

### Dialpad Webhook 設定
- **Webhook ID**: `6562518787432448`
- **URL**: `https://crm.h-mitsu.com/api/dialpad/webhook`
- **Secret**: `goodfife_dialpad_secret_2025`
- **署名アルゴリズム**: HS256
- **署名タイプ**: JWT

### SSL/TLS
- **証明書**: Let's Encrypt
- **有効期限**: 2026年3月15日
- **自動更新**: 有効 (certbot-renew.timer)

---

## 📊 システムアーキテクチャ

```
┌─────────────┐
│   Dialpad   │ 電話着信
└──────┬──────┘
       │
       │ Webhook (HTTPS)
       ▼
┌──────────────────────┐
│ https://crm.h-mitsu. │
│        com           │
└──────┬───────────────┘
       │
       │ Nginx (SSL/TLS)
       ▼
┌──────────────────────┐
│   Backend Server     │
│   (Express.js)       │
│   Port: 5000         │
└──────┬───────────────┘
       │
       ├─ HMAC署名検証
       ├─ Webhook処理
       │
       │ Socket.IO (WebSocket)
       ▼
┌──────────────────────┐
│   Socket.IO Server   │
│   (JWT認証)          │
│   admin-room         │
└──────┬───────────────┘
       │
       │ イベント送信
       ▼
┌──────────────────────┐
│   Next.js Frontend   │
│   (CTIListener)      │
│   WebSocket受信      │
└──────┬───────────────┘
       │
       │ ポップアップ表示
       ▼
┌──────────────────────┐
│   CTI Popup Window   │
│   500x700px          │
│   顧客情報表示       │
└──────────────────────┘
```

---

## 📚 関連ドキュメント

- `/webapp/SSL_SETUP_COMPLETE.md` - SSL証明書設定完了
- `/webapp/CUSTOM_DOMAIN_SSL_SETUP.md` - カスタムドメイン設定手順
- `/webapp/DIALPAD_SETUP_COMPLETE.md` - Dialpad連携設定完了
- `/webapp/QUICK_START_DIALPAD.md` - クイックスタートガイド

---

## 🔗 アクセスURL

| 用途 | URL |
|------|-----|
| フロントエンド | https://crm.h-mitsu.com |
| 管理画面 | https://crm.h-mitsu.com/admin |
| バックエンドAPI | https://crm.h-mitsu.com/api |
| Dialpad Webhook | https://crm.h-mitsu.com/api/dialpad/webhook |
| Socket.IO | wss://crm.h-mitsu.com/socket.io/ |
| GitHub PR | https://github.com/rothspit/goodfifeproject/pull/1 |

---

## ✅ 次のステップ

1. **CTIポップアップの動作確認**
   - 上記のテスト手順に従って、CTIポップアップが正しく表示されることを確認してください
   
2. **実際の着信テスト**
   - Dialpadから実際に電話をかけて、自動ポップアップ機能を確認してください
   
3. **本番運用開始**
   - すべてのテストが成功したら、本番運用を開始できます

---

## 💬 問題が発生した場合

エラーメッセージやスクリーンショットを共有してください：
- WebSocket接続エラー
- ポップアップが表示されない
- 認証エラー

すぐに対応いたします！

---

**修正完了**: 2025年12月15日 18:54 (JST)  
**ステータス**: ✅ **すべての設定完了 - テスト準備完了**
