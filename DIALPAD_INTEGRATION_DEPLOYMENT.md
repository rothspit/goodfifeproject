# Dialpad CTI連携 デプロイメント完了報告

## 📋 実装概要

DialpadAPIと連携した着信ポップアップ機能を完全実装しました。着信時に自動的にCTIポップアップが表示され、顧客情報を即座に確認できます。

## ✅ 実装済み機能

### 1. Dialpad Webhook連携
- **エンドポイント**: `POST /api/dialpad/webhook`
- **機能**: Dialpadからの着信イベントをリアルタイム受信
- **セキュリティ**: HMAC SHA-256署名検証による安全な通信
- **対応イベント**:
  - `call.created` / `call.ringing` / `call.incoming`: 着信検知
  - `call.answered`: 通話開始
  - `call.ended`: 通話終了

### 2. Socket.IOリアルタイム通知
- **接続方式**: WebSocket (フォールバック: polling)
- **認証**: JWT トークンベース
- **ルーム管理**: 管理者は自動的に `admin-room` に参加
- **イベント配信**: 
  - `incoming_call`: 着信通知（CTIポップアップトリガー）
  - `call_answered`: 通話開始通知
  - `call_ended`: 通話終了通知

### 3. CTIポップアップ自動表示
- **トリガー**: 着信イベント受信時に自動実行
- **ウィンドウサイズ**: 500x700px（リサイズ可能）
- **表示内容**:
  - 顧客基本情報（名前、種別、累計利用回数・金額）
  - 顧客メモ（最大3件、黄色背景で強調表示）
  - 直近5件の利用履歴（ステータスごとに色分け表示）
  - アクションボタン（詳細確認・新規受注）
- **店舗自動識別**:
  ```
  050-1748-XXXX → 人妻の蜜 西船橋
  050-1749-XXXX → 人妻の蜜 錦糸町
  050-1750-XXXX → 人妻の蜜 葛西
  050-1751-XXXX → 人妻の蜜 松戸
  ```

### 4. CTIListener Component
- **配置**: 管理画面レイアウト（`/admin/*`）に常駐
- **機能**:
  - WebSocket接続の自動確立・維持
  - 接続状態の監視（開発モード時に画面右下に表示）
  - 着信イベント受信時の自動ポップアップ処理
  - オプション: 通知音再生（`/sounds/phone-ring.mp3`）

## 📁 新規・更新ファイル

### Backend（サーバー側）

#### 新規ファイル
1. **`server/src/controllers/dialpadWebhookController.ts`**
   - Dialpad Webhookの受信・処理
   - 署名検証ロジック
   - Socket.IO経由の通知配信
   - イベントタイプ別ハンドラー

2. **`server/src/routes/dialpadWebhook.ts`**
   - `/api/dialpad/webhook`: Dialpadからのコールバック（認証不要）
   - `/api/dialpad/test-call`: テスト用エンドポイント（認証必須）

#### 更新ファイル
3. **`server/src/index.ts`**
   - Dialpad Webhookルートの登録
   - Socket.IOインスタンスの連携
   - CORS設定の更新

4. **`server/src/controllers/socketController.ts`**
   - `admin-room` への自動参加ロジック追加
   - 管理者ロール判定処理

5. **`server/src/routes/receipts.ts`**
   - インポート関数名の修正（ビルドエラー解消）

### Frontend（クライアント側）

#### 新規ファイル
6. **`client/components/CTIListener.tsx`**
   - WebSocket接続管理
   - 着信イベントリスナー
   - CTIポップアップの自動表示
   - 接続状態の可視化（開発モード）

#### 更新ファイル
7. **`client/app/admin/layout.tsx`**
   - CTIListenerコンポーネントの組み込み
   - 管理画面全体で着信監視を有効化

### ドキュメント

8. **`DIALPAD_CTI_SETUP_GUIDE.md`**
   - Dialpad管理画面での設定手順
   - Webhook URL設定方法
   - シークレットキーの生成と設定
   - テスト方法と検証手順

9. **`CUSTOMER_MANAGEMENT_COMPLETE_GUIDE.md`**
   - 顧客管理システム完全マニュアル
   - CTI機能の使い方
   - トラブルシューティング

## 🔧 技術仕様

### Backend Stack
- **Framework**: Express.js + Node.js
- **WebSocket**: Socket.IO v4
- **認証**: JWT (JSON Web Tokens)
- **セキュリティ**: HMAC SHA-256署名検証
- **言語**: TypeScript

### Frontend Stack
- **Framework**: Next.js 15 (App Router)
- **WebSocket Client**: socket.io-client
- **UI**: React + Tailwind CSS
- **言語**: TypeScript

### データベース
- **DB**: SQLite (本番移行時はMySQL対応)
- **テーブル**: customers, orders, stores, customer_notes

## 🌐 APIエンドポイント

### Dialpad Webhook
```
POST /api/dialpad/webhook
Headers:
  x-dialpad-signature: <HMAC署名>
Body:
  {
    "event_type": "call.incoming",
    "data": {
      "call_id": "xxx",
      "caller_number": "09012345678",
      "callee_number": "0501748XXXX",
      "user_id": "xxx",
      "user_name": "xxx"
    }
  }
```

### テスト用エンドポイント
```
POST /api/dialpad/test-call
Headers:
  Authorization: Bearer <JWT_TOKEN>
Body:
  {
    "customerPhone": "09012345678",
    "incomingNumber": "0501748XXXX"
  }
```

## 🚀 デプロイ手順

### 1. コードの取得
```bash
cd /var/www/goodfifeproject
git pull origin genspark_ai_developer
```

### 2. サーバー側のビルドと再起動
```bash
# 依存関係のインストール（初回のみ）
cd /var/www/goodfifeproject/server
npm install

# TypeScriptビルド
npm run build

# PM2で再起動
pm2 restart goodfife-backend
pm2 logs goodfife-backend --nostream
```

### 3. クライアント側のビルドと再起動
```bash
cd /var/www/goodfifeproject/client
npm install  # 依存関係のインストール（初回のみ）
npm run build
pm2 restart goodfife-frontend
pm2 logs goodfife-frontend --nostream
```

### 4. 環境変数の設定
`.env` ファイルに以下を追加:
```bash
# Dialpad Webhook Secret (Dialpad管理画面で生成)
DIALPAD_WEBHOOK_SECRET=your_webhook_secret_here

# JWT Secret (既存の設定を確認)
JWT_SECRET=your_jwt_secret_here
```

### 5. 動作確認
```bash
# サーバー起動確認
pm2 status

# ログ確認
pm2 logs --nostream

# ポート確認
netstat -tulpn | grep node
```

## 🔍 Dialpad管理画面での設定

### Step 1: Webhookの作成
1. Dialpad管理画面にログイン
2. Settings → API & Integrations → Webhooks
3. "Create Webhook" をクリック

### Step 2: Webhook URLの設定
```
URL: http://210.131.222.152:5000/api/dialpad/webhook
または
URL: https://yourdomain.com/api/dialpad/webhook
```

### Step 3: イベントの選択
以下のイベントを有効化:
- ✅ `call.created`
- ✅ `call.ringing`
- ✅ `call.incoming`
- ✅ `call.answered`
- ✅ `call.ended`

### Step 4: Secretの設定
1. "Generate Secret" をクリック
2. 生成されたシークレットをコピー
3. サーバーの `.env` ファイルに `DIALPAD_WEBHOOK_SECRET` として保存

### Step 5: Webhookの保存とテスト
1. "Save" をクリック
2. "Test Webhook" で接続確認
3. ログに `📞 Dialpad webhook received` が表示されればOK

## 🧪 テスト方法

### 1. WebSocket接続テスト
管理画面にログインし、開発モードで右下に接続状態が表示されることを確認:
- 🟢 接続中: WebSocket正常
- 🔴 切断: 接続エラー

### 2. テスト着信の送信
```bash
curl -X POST http://localhost:5000/api/dialpad/test-call \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerPhone": "09012345678",
    "incomingNumber": "0501748XXXX"
  }'
```

### 3. 実際の着信テスト
1. Dialpadで設定した電話番号に発信
2. 管理画面にCTIポップアップが自動表示されることを確認
3. 顧客情報・メモ・履歴が正しく表示されることを確認

## 📊 動作ログ例

### 正常な着信処理
```
✅ CTI WebSocket connected
✅ Joined admin-room for CTI notifications
📞 Dialpad webhook received: {"event_type":"call.incoming",...}
📞 Incoming call detected
🔔 Broadcasting incoming call to admin clients
✅ Incoming call broadcasted
📞 Incoming call received: {customerPhone: "09012345678", ...}
✅ CTI popup opened for 09012345678
```

### エラー例と対処法
```
❌ Dialpad webhook signature verification failed
→ DIALPAD_WEBHOOK_SECRETの設定を確認

❌ Socket.IO not initialized
→ server/src/index.tsでsetSocketIO()が呼ばれているか確認

❌ Failed to open CTI popup - popup blocker may be active
→ ブラウザのポップアップブロッカーを無効化
```

## 🔐 セキュリティ

1. **Webhook署名検証**: すべてのDialpad Webhookリクエストは署名検証
2. **JWT認証**: Socket.IO接続は必ず認証トークン必須
3. **管理者権限チェック**: admin-roomへの参加は管理者のみ
4. **CORS設定**: 許可されたオリジンからのみ接続可能

## 📱 対応ブラウザ

- ✅ Chrome / Edge (推奨)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE11: 非対応（WebSocket非対応のため）

## 🎯 今後の拡張予定

1. **通知音のカスタマイズ**: 着信音の選択機能
2. **複数同時着信対応**: ポップアップのスタック表示
3. **着信履歴の記録**: 通話ログのDB保存
4. **通話メモ機能**: 通話中・通話後のメモ入力
5. **統計レポート**: 着信数・応答率・平均通話時間

## 📝 コミット情報

- **コミットID**: `70d06f6`
- **ブランチ**: `genspark_ai_developer`
- **日時**: 2025-12-15
- **変更ファイル**: 9ファイル
- **追加行数**: 1,674行

## 🔗 関連リソース

- GitHub Repository: https://github.com/rothspit/goodfifeproject
- Pull Request: https://github.com/rothspit/goodfifeproject/pull/1
- Dialpad API Documentation: https://developers.dialpad.com/
- Socket.IO Documentation: https://socket.io/docs/v4/

## ✅ チェックリスト

- [x] Webhook受信エンドポイント実装
- [x] 署名検証機能実装
- [x] Socket.IO通知機能実装
- [x] CTIListenerコンポーネント実装
- [x] 管理画面への組み込み
- [x] CTIポップアップ画面実装
- [x] 店舗自動識別機能
- [x] テスト用エンドポイント実装
- [x] ドキュメント作成
- [x] ローカルビルド成功
- [ ] Xserverへのデプロイ（SSH接続待ち）
- [ ] 本番環境での動作確認
- [ ] Dialpad Webhook設定

---

**作成日**: 2025-12-15  
**更新日**: 2025-12-15  
**バージョン**: 1.0.0  
**ステータス**: 実装完了、デプロイ待機中
