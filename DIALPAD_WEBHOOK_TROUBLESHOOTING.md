# Dialpad Webhook トラブルシューティング

**日時**: 2025年12月15日 23:08 (JST)  
**問題**: 実際の電話着信時にCTIポップアップが表示されない

---

## 🔍 問題の診断結果

### ✅ 正常動作している項目
- ✅ Socket.IO接続: 正常
- ✅ Admin-room参加: 成功
- ✅ テスト着信API (`/api/dialpad/test-call`): 正常動作
- ✅ CTIポップアップ表示: テスト時は正常
- ✅ 店舗自動識別: 全7店舗で動作確認済み
- ✅ HTTPS/SSL: 正常 (crm.h-mitsu.com)
- ✅ Webhook エンドポイント: アクセス可能

### ❌ 問題点
- ❌ **Dialpad Webhook イベントがサーバーに届いていない**
- ❌ 実際の電話着信時、サーバーログに `call.incoming` 等のイベントが記録されない

---

## 🚨 根本原因

**Dialpadの管理画面でWebhook設定が未完了、または誤設定の可能性**

---

## 📋 Dialpad Webhook 設定確認手順

### 方法1: Dialpad管理画面からの確認

1. **Dialpadにログイン**
   ```
   https://dialpad.com
   ```

2. **設定画面にアクセス**
   - 右上のアイコン → **Settings**
   - 左メニューから **Developer** または **API & Webhooks** を探す
   
   **直接アクセスURL (試してください):**
   - https://dialpad.com/settings/developer
   - https://dialpad.com/admin/webhooks
   - https://dialpad.com/settings/integrations

3. **Webhook設定を確認**
   
   #### 必須項目:
   
   | 項目 | 正しい値 |
   |------|---------|
   | **Webhook URL** | `https://crm.h-mitsu.com/api/dialpad/webhook` |
   | **Status** | `Active` (有効) |
   | **HTTP Method** | `POST` |
   
   #### 選択すべきイベント (5つすべてチェック):
   - ☑️ `call.created`
   - ☑️ `call.ringing`
   - ☑️ `call.incoming`
   - ☑️ `call.answered`
   - ☑️ `call.ended`

4. **Webhook IDの確認**
   - 既存のWebhook ID: `6562518787432448`
   - このIDが存在するか確認
   - 存在しない場合は新規作成が必要

---

### 方法2: Dialpad API経由での確認 (開発者向け)

#### Webhookリストを取得:
```bash
curl -X GET "https://dialpad.com/api/v2/webhooks" \
  -H "Authorization: Bearer YOUR_DIALPAD_API_KEY" \
  -H "Content-Type: application/json"
```

#### Webhook詳細を取得:
```bash
curl -X GET "https://dialpad.com/api/v2/webhooks/6562518787432448" \
  -H "Authorization: Bearer YOUR_DIALPAD_API_KEY" \
  -H "Content-Type: application/json"
```

---

## 🔧 Webhook設定の修正方法

### ケース1: Webhookが存在しない場合

**新規作成手順:**

1. Dialpad管理画面で **Add Webhook** または **Create Webhook** ボタンをクリック

2. 以下の情報を入力:
   ```
   Name: Goodfife CRM CTI Integration
   URL: https://crm.h-mitsu.com/api/dialpad/webhook
   Events: call.created, call.ringing, call.incoming, call.answered, call.ended
   Status: Active
   ```

3. **Secret Token** (オプション):
   - 自動生成される場合は、そのまま使用
   - サーバー側の `.env` ファイルに設定:
     ```bash
     DIALPAD_WEBHOOK_SECRET=生成されたシークレット
     ```

4. **Test** ボタンでテスト送信を実行

5. サーバーログで受信を確認:
   ```bash
   ssh -i /home/user/uploaded_files/WIFEHP.pem root@210.131.222.152 \
     "pm2 logs goodfife-backend --lines 20"
   ```

---

### ケース2: Webhookが存在するが動作しない場合

**修正手順:**

1. **URLを確認**: `https://crm.h-mitsu.com/api/dialpad/webhook` (http**s**であることを確認)

2. **イベントタイプを確認**: 5つすべてがチェックされているか

3. **Statusを確認**: `Active` になっているか

4. **Webhook を削除して再作成**:
   - 既存のWebhookを削除
   - 上記の「ケース1」の手順で新規作成

---

## 🧪 動作確認テスト

### テスト1: サーバー側エンドポイント確認
```bash
# GETリクエスト (エラーメッセージが返ればOK)
curl -X GET https://crm.h-mitsu.com/api/dialpad/webhook

# 期待される応答:
# "Cannot GET /api/dialpad/webhook" ← これが正常
```

### テスト2: POSTリクエストのシミュレーション
```bash
# Dialpadからのwebhookをシミュレート
curl -X POST https://crm.h-mitsu.com/api/dialpad/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "call.incoming",
    "call_id": "test-12345",
    "target": "+815017439555",
    "caller_id": "+819000000000",
    "direction": "inbound"
  }'
```

### テスト3: 実際の電話でテスト

1. **ログ監視を開始**:
   ```bash
   ssh -i /home/user/uploaded_files/WIFEHP.pem root@210.131.222.152 \
     "pm2 logs goodfife-backend --lines 0"
   ```

2. **店舗番号に電話をかける**:
   - 西船橋店: 050-1743-9555
   - 錦糸町店: 050-1744-2606
   - 松戸店: 050-1743-8883

3. **ログに以下が表示されれば成功**:
   ```
   📞 Dialpad webhook received: call.incoming
   📞 CTI Data: { callId: '...', customerPhone: '09000000000', ... }
   ```

---

## 📊 現在のシステム状態

### サーバー側 (正常動作中)
- **Backend**: `pm2 online` on port 5000
- **Frontend**: `pm2 online` on port 3000
- **Nginx**: HTTPS reverse proxy 動作中
- **Socket.IO**: WebSocket接続 正常
- **Database**: MySQL接続 正常

### Webhook エンドポイント
- **URL**: https://crm.h-mitsu.com/api/dialpad/webhook
- **SSL証明書**: Let's Encrypt (有効期限: 2026/03/15)
- **アクセス**: 外部から到達可能 ✅

### テスト用API
- **テスト着信API**: `POST /api/dialpad/test-call`
- **動作状況**: 正常 ✅
- **使用例**:
  ```bash
  TOKEN=$(curl -s -X POST https://crm.h-mitsu.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"phone_number":"09000000000","password":"Admin@2025"}' \
    | jq -r '.token')
  
  curl -X POST https://crm.h-mitsu.com/api/dialpad/test-call \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"customerPhone":"09000000000","incomingNumber":"05017439555"}'
  ```

---

## ✅ 次のステップ

### 優先順位1: Dialpad Webhook設定を確認・修正
1. Dialpad管理画面にアクセス
2. Webhook設定を確認
3. 必要に応じて修正または再作成
4. テスト送信を実行

### 優先順位2: 実際の電話でテスト
1. 管理画面 (`https://crm.h-mitsu.com/admin`) を開く
2. ブラウザコンソールを開く (F12)
3. 店舗番号に電話をかける
4. CTIポップアップが最前面に表示されることを確認

### 優先順位3: ポップアップ動作確認
- ✅ **ポップアップ最前面表示**: 修正完了
- 実装内容:
  - `alwaysRaised=yes` を追加
  - 3秒間、100msごとに `focus()` を実行
  - ブラウザの制限を回避

---

## 📞 サポート情報

### 問題が解決しない場合

1. **Dialpadサポートに問い合わせ**:
   - Webhookが正しく設定されているか確認
   - Webhook送信ログを確認してもらう

2. **Dialpad管理者権限の確認**:
   - Webhook設定には管理者権限が必要
   - アカウントの権限を確認

3. **ファイアウォール/ネットワーク設定**:
   - Dialpadからの接続が許可されているか確認
   - サーバー側のファイアウォール設定を確認

---

## 📝 関連ドキュメント

- `CTI_POPUP_TEST_SUCCESS.md` - CTIポップアップテスト成功記録
- `SOCKET_IO_CONNECTION_FIXED.md` - Socket.IO接続修正記録
- `SSL_SETUP_COMPLETE.md` - SSL証明書設定完了記録
- `DIALPAD_SETUP_COMPLETE.md` - Dialpad初期設定完了記録
- `STORE_IDENTIFICATION_COMPLETE.md` - 店舗自動識別機能完了記録

---

## 🔗 重要なリンク

- **管理画面**: https://crm.h-mitsu.com/admin
- **ログイン**: `09000000000` / `Admin@2025`
- **GitHub PR**: https://github.com/rothspit/goodfifeproject/pull/1
- **Dialpad管理**: https://dialpad.com/settings/developer

---

**最終更新**: 2025年12月15日 23:08 (JST)
