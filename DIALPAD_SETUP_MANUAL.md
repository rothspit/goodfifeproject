# 🚀 Dialpad連携 完全セットアップマニュアル

## 📋 目次
1. [Xserverへのデプロイ手順](#1-xserverへのデプロイ手順)
2. [Dialpad管理画面での設定](#2-dialpad管理画面での設定)
3. [動作確認とテスト](#3-動作確認とテスト)
4. [トラブルシューティング](#4-トラブルシューティング)

---

## 1. Xserverへのデプロイ手順

### ステップ1: サーバーにSSH接続

```bash
ssh -i ~/WIFEHP.pem root@210.131.222.152
```

### ステップ2: プロジェクトディレクトリに移動

```bash
cd /var/www/goodfifeproject
```

### ステップ3: 最新コードを取得

```bash
# 現在のブランチ確認
git branch

# 最新コードを取得
git pull origin genspark_ai_developer
```

**期待される出力:**
```
Updating 9ca080a..787e936
Fast-forward
 CUSTOMER_MANAGEMENT_COMPLETE_GUIDE.md          | 349 ++++++++++++
 DIALPAD_CTI_SETUP_GUIDE.md                     | 382 +++++++++++++
 DIALPAD_INTEGRATION_DEPLOYMENT.md              | 349 ++++++++++++
 client/app/admin/layout.tsx                    |   3 +
 client/components/CTIListener.tsx              | 144 +++++
 server/src/controllers/dialpadWebhookController.ts | 194 +++++++
 server/src/controllers/socketController.ts     |  20 +
 server/src/index.ts                            |   3 +
 server/src/routes/dialpadWebhook.ts            |  14 +
 server/src/routes/receipts.ts                  |   6 +-
 10 files changed, 2023 insertions(+), 3 deletions(-)
```

### ステップ4: サーバー側のビルド

```bash
cd /var/www/goodfifeproject/server

# TypeScriptビルド
npm run build
```

**期待される出力:**
```
> server@1.0.0 build
> tsc

# エラーがなければ成功
```

### ステップ5: クライアント側のビルド

```bash
cd /var/www/goodfifeproject/client

# Next.jsビルド
npm run build
```

**期待される出力:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (XX/XX)
✓ Finalizing page optimization

Route (app)                                     Size
...
├ ○ /admin/customer-management/cti              4.35 kB
```

### ステップ6: PM2でサービス再起動

```bash
# バックエンド再起動
pm2 restart goodfife-backend

# フロントエンド再起動
pm2 restart goodfife-frontend

# ステータス確認
pm2 status
```

**期待される出力:**
```
┌────┬────────────────────┬─────────┬─────────┐
│ id │ name               │ status  │ restart │
├────┼────────────────────┼─────────┼─────────┤
│ 0  │ goodfife-backend   │ online  │ X       │
│ 1  │ goodfife-frontend  │ online  │ X       │
└────┴────────────────────┴─────────┴─────────┘
```

### ステップ7: ログ確認

```bash
# バックエンドログ
pm2 logs goodfife-backend --nostream

# フロントエンドログ
pm2 logs goodfife-frontend --nostream
```

**確認ポイント:**
- ✅ `Server running on port 5000`
- ✅ `Database connected`
- ✅ `Socket.io initialized`

---

## 2. Dialpad管理画面での設定

### 📱 事前準備

1. **Dialpadアカウント**: 管理者権限が必要
2. **電話番号**: 着信を受ける電話番号を確認
3. **サーバーURL**: `http://210.131.222.152:5000` または独自ドメイン

---

### 🔧 Webhook設定手順（画面付き）

#### Step 1: Dialpad管理画面にログイン

1. https://dialpad.com/ にアクセス
2. 管理者アカウントでログイン

#### Step 2: API & Integrations設定画面に移動

```
左メニュー
  └─ Settings（設定）
       └─ Admin Settings（管理者設定）
            └─ API & Integrations（API・連携）
                 └─ Webhooks
```

または直接URL:
```
https://dialpad.com/settings/webhooks
```

#### Step 3: 新しいWebhookを作成

1. **「Create Webhook」**ボタンをクリック
2. フォームが表示されます

#### Step 4: Webhook URLを設定

**Webhook URL**欄に以下のいずれかを入力:

##### オプション1: IPアドレス直接指定（推奨・即座に使える）
```
http://210.131.222.152:5000/api/dialpad/webhook
```

##### オプション2: 独自ドメイン使用（SSL推奨）
```
https://yourdomain.com/api/dialpad/webhook
```

**⚠️ 重要**: 
- HTTPでも動作しますが、本番環境ではHTTPSを強く推奨
- SSL証明書がない場合はIPアドレス直接指定を使用

#### Step 5: Webhook Secretを生成

1. **「Generate Secret」**ボタンをクリック
2. シークレットキーが生成されます（例: `whsec_abcd1234efgh5678...`）
3. **このシークレットをコピー**してください（後で使います）

#### Step 6: イベントタイプを選択

**「Select Events」**セクションで以下のイベントをすべてチェック:

```
Call Events:
  ✅ call.created       （通話作成）
  ✅ call.ringing       （呼び出し中）
  ✅ call.incoming      （着信）
  ✅ call.answered      （応答）
  ✅ call.ended         （通話終了）
```

**その他のイベントはオプション**（今回は不要）

#### Step 7: Webhookを保存

1. **「Save」**ボタンをクリック
2. Webhookが保存されます

#### Step 8: Webhook IDを確認

保存後、Webhook一覧に表示されます:
```
Name: goodfifeproject-cti
URL: http://210.131.222.152:5000/api/dialpad/webhook
Status: Active
Webhook ID: wh_xxxxxxxxxxxxxx
```

**Webhook IDをメモ**してください。

---

### 🔐 サーバーにSecretを設定

#### Step 1: サーバーにSSH接続

```bash
ssh -i ~/WIFEHP.pem root@210.131.222.152
```

#### Step 2: .envファイルを編集

```bash
cd /var/www/goodfifeproject/server
nano .env
```

#### Step 3: Secretを追加

ファイルの最後に以下を追加:

```bash
# Dialpad Webhook Secret
DIALPAD_WEBHOOK_SECRET=whsec_abcd1234efgh5678...
```

**⚠️ 注意**: 
- `whsec_` の部分も含めて正確にコピーペースト
- シークレットは絶対に外部に漏らさないでください

#### Step 4: ファイルを保存

- **Ctrl + O** → Enter（保存）
- **Ctrl + X**（終了）

#### Step 5: サーバーを再起動

```bash
pm2 restart goodfife-backend
pm2 logs goodfife-backend --nostream
```

**確認ポイント:**
```
✅ Server running on port 5000
✅ Dialpad webhook secret configured  # この行が表示されればOK
```

---

### 🧪 Dialpad側でWebhookをテスト

#### Step 1: Dialpad管理画面に戻る

Webhooks設定画面で作成したWebhookを選択

#### Step 2: Test Webhookボタンをクリック

1. **「Test Webhook」**ボタンをクリック
2. テストペイロードが送信されます

#### Step 3: サーバーログを確認

```bash
pm2 logs goodfife-backend --nostream
```

**期待されるログ:**
```
📞 Dialpad webhook received: {
  "event_type": "test",
  ...
}
✅ Webhook signature verified
```

**エラーが出る場合:**
```
❌ Dialpad webhook signature verification failed
→ DIALPAD_WEBHOOK_SECRETが正しく設定されているか確認
```

---

## 3. 動作確認とテスト

### 🧪 テスト1: 開発用テストAPI

管理画面にログイン後、JWTトークンを取得してテスト:

#### Step 1: JWTトークンを取得

1. 管理画面にログイン: http://210.131.222.152:3000/admin/login
2. ブラウザの開発者ツールを開く（F12）
3. Console タブで以下を実行:

```javascript
localStorage.getItem('token')
```

4. 表示されたトークンをコピー（例: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`）

#### Step 2: テスト着信APIを呼び出し

ターミナルで以下を実行:

```bash
curl -X POST http://210.131.222.152:5000/api/dialpad/test-call \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "customerPhone": "09012345678",
    "incomingNumber": "0501748XXXX"
  }'
```

**期待されるレスポンス:**
```json
{
  "success": true,
  "message": "Test call broadcasted",
  "data": {
    "type": "incoming_call",
    "callId": "test-1234567890",
    "customerPhone": "09012345678",
    "incomingNumber": "0501748XXXX",
    ...
  }
}
```

#### Step 3: 管理画面でポップアップ確認

- ログイン済みの管理画面に**CTIポップアップが自動表示**されるはず
- 500x700pxのウィンドウが開く
- 顧客情報が表示される

---

### 🎯 テスト2: 実際の着信テスト

#### Step 1: 準備

1. 管理画面にログイン: http://210.131.222.152:3000/admin
2. 開発モードの場合、画面右下に🟢（接続中）が表示されていることを確認

#### Step 2: テスト着信

1. **Dialpadで設定した電話番号**（050-1748-XXXX など）に電話をかける
2. 携帯電話やIP電話から発信

#### Step 3: 結果確認

**成功の場合:**
1. ⏱️ 着信と同時に（1秒以内）CTIポップアップが自動表示
2. 🖥️ 500x700pxの別ウィンドウが開く
3. 📱 発信者の電話番号で顧客検索が実行される
4. 📊 顧客情報・メモ・履歴が表示される
5. 🏪 着信番号から店舗が自動識別される

**失敗の場合:**
- ❌ ポップアップが表示されない
  - → ブラウザのポップアップブロッカーを確認
  - → WebSocket接続状態を確認（開発モードで🟢表示）
  - → サーバーログを確認

---

### 📊 ログ確認ポイント

#### バックエンドログ（正常な場合）

```bash
pm2 logs goodfife-backend --lines 50
```

**期待されるログ:**
```
📞 Dialpad webhook received: {"event_type":"call.incoming",...}
✅ Webhook signature verified
📞 Incoming call detected
👤 Customer phone: 09012345678
📞 Incoming number: 0501748XXXX
🏪 Store identified: 西船橋
🔔 Broadcasting incoming call to admin clients
✅ Incoming call broadcasted to admin-room
```

#### フロントエンドログ（ブラウザ Console）

```
✅ CTI WebSocket connected
✅ Joined admin-room for CTI notifications
📞 Incoming call received: {customerPhone: "09012345678", ...}
✅ CTI popup opened for 09012345678
```

---

## 4. トラブルシューティング

### ❌ 問題1: Webhookが受信されない

**症状:**
- Dialpadから電話をかけてもサーバーログに何も表示されない

**原因と対処:**

1. **Webhook URLが間違っている**
   ```bash
   # 確認方法
   curl http://210.131.222.152:5000/api/dialpad/webhook
   # {"error":"Invalid signature"} と表示されればエンドポイントは存在
   ```
   - ✅ 対処: Dialpad管理画面でURLを確認・修正

2. **ファイアウォールでブロックされている**
   ```bash
   # サーバーのファイアウォール確認
   sudo ufw status
   # ポート5000が開いているか確認
   ```
   - ✅ 対処: ポート5000を開放

3. **サーバーが起動していない**
   ```bash
   pm2 status
   # goodfife-backend が online か確認
   ```
   - ✅ 対処: `pm2 restart goodfife-backend`

---

### ❌ 問題2: 署名検証エラー

**症状:**
```
❌ Dialpad webhook signature verification failed
```

**原因と対処:**

1. **DIALPAD_WEBHOOK_SECRETが設定されていない**
   ```bash
   cd /var/www/goodfifeproject/server
   grep DIALPAD_WEBHOOK_SECRET .env
   # 何も表示されなければ未設定
   ```
   - ✅ 対処: .envファイルに追加して再起動

2. **シークレットが間違っている**
   - ✅ 対処: Dialpad管理画面でシークレットを再生成して設定

3. **シークレットに余計な文字が入っている**
   - ✅ 対処: `whsec_` を含めて正確にコピー、改行なし

---

### ❌ 問題3: ポップアップが表示されない

**症状:**
- Webhookは受信されるがポップアップが開かない

**原因と対処:**

1. **ポップアップブロッカー**
   ```
   ブラウザ右上にポップアップブロックアイコンが表示される
   ```
   - ✅ 対処: サイトのポップアップを許可
   - Chrome: 設定 → プライバシーとセキュリティ → サイトの設定 → ポップアップとリダイレクト

2. **WebSocket接続が切れている**
   ```javascript
   // ブラウザのConsoleで確認
   // 🔴 切断 と表示される
   ```
   - ✅ 対処: ページをリロード、再ログイン

3. **管理者権限がない**
   - ✅ 対処: 管理者アカウントでログイン確認

4. **CTIListenerが読み込まれていない**
   ```javascript
   // ブラウザのConsoleで確認
   // "CTIListener: No token found" と表示される
   ```
   - ✅ 対処: 再ログイン、キャッシュクリア

---

### ❌ 問題4: 顧客情報が表示されない

**症状:**
- ポップアップは開くが「顧客が見つかりません」と表示される

**原因と対処:**

1. **電話番号が登録されていない**
   - ✅ 対処: 顧客検索画面で電話番号を確認・登録

2. **電話番号の形式が違う**
   ```
   DB: 090-1234-5678
   着信: 09012345678
   ```
   - ✅ システムは自動で正規化するので通常は問題なし
   - データベースを確認: `SELECT * FROM customers WHERE phone LIKE '%09012345678%'`

3. **APIエンドポイントエラー**
   ```bash
   # ブラウザのNetwork タブで確認
   # /api/customer-management/customer/09012345678
   # ステータスコード 500 などエラーが出ていないか
   ```
   - ✅ 対処: サーバーログを確認

---

### ❌ 問題5: 店舗が自動識別されない

**症状:**
- ポップアップは開くが店舗欄が空白

**原因と対処:**

1. **incomingNumberパラメータが渡されていない**
   ```javascript
   // ブラウザのConsoleで確認
   console.log(callData.incomingNumber) // undefined の場合
   ```
   - ✅ 対処: Dialpad Webhookペイロードを確認
   - `callee_number` または `to_number` フィールドが存在するか

2. **番号のマッピングが定義されていない**
   ```typescript
   // client/app/admin/customer-management/cti/page.tsx
   const storeMap = {
     '0501748': { id: 1, name: '人妻の蜜 西船橋' },
     '0501749': { id: 2, name: '人妻の蜜 錦糸町' },
     '0501750': { id: 3, name: '人妻の蜜 葛西' },
     '0501751': { id: 4, name: '人妻の蜜 松戸' },
   };
   ```
   - ✅ 対処: 新しい番号を追加

---

## 📚 よくある質問（FAQ）

### Q1: HTTPSは必須ですか？

**A:** HTTPでも動作しますが、本番環境では**HTTPS強く推奨**です。

理由:
- セキュリティ向上
- Dialpadが将来的にHTTPSのみサポートする可能性
- ブラウザのセキュリティ警告を回避

SSL証明書の取得方法:
- Let's Encrypt（無料）
- Cloudflare（無料、プロキシ経由）
- 有料SSL証明書

### Q2: 複数の電話番号を使えますか？

**A:** はい、可能です。

1つのWebhookで複数の番号に対応:
- 着信番号（incomingNumber）で店舗を自動判定
- 店舗ごとに異なる番号を割り当て可能

### Q3: 通知音を変更できますか？

**A:** はい、簡単に変更できます。

1. `/public/sounds/phone-ring.mp3` に音声ファイルを配置
2. または `CTIListener.tsx` で音声URLを変更:
   ```typescript
   const audio = new Audio('/sounds/your-custom-sound.mp3');
   ```

### Q4: 複数の管理者が同時に使えますか？

**A:** はい、可能です。

- 各管理者が管理画面にログイン
- WebSocketは各ユーザーごとに接続
- 着信時、すべての管理者にポップアップ表示
- 同時に複数のポップアップが開く

### Q5: 着信履歴は保存されますか？

**A:** 現在のバージョンでは**Webhookイベントのみログ出力**です。

将来の拡張予定:
- 着信履歴テーブルの追加
- 通話時間の記録
- 応答率の統計
- レポート機能

### Q6: DialpadのAPIキーは必要ですか？

**A:** **Webhookの場合は不要**です。

- Webhook方式: Dialpadから自動的にイベント送信
- API方式（今後の拡張）: APIキーが必要

---

## 📞 サポート情報

### 開発者向けリソース

- **Dialpad API Docs**: https://developers.dialpad.com/
- **Socket.IO Docs**: https://socket.io/docs/v4/
- **Next.js Docs**: https://nextjs.org/docs

### ログの確認方法

```bash
# リアルタイムログ（Ctrl+Cで終了）
pm2 logs

# 過去のログ（最新100行）
pm2 logs --lines 100 --nostream

# 特定のサービスのみ
pm2 logs goodfife-backend --lines 50 --nostream
```

### デバッグモード

開発環境（`NODE_ENV=development`）の場合:
- 画面右下に接続状態インジケーター表示（🟢/🔴）
- ブラウザConsoleに詳細ログ出力
- エラー時の詳細メッセージ表示

---

## ✅ セットアップ完了チェックリスト

### サーバー側
- [ ] 最新コードをpull
- [ ] `npm run build` 成功（server）
- [ ] `npm run build` 成功（client）
- [ ] `.env` に `DIALPAD_WEBHOOK_SECRET` 設定
- [ ] PM2でサービス再起動
- [ ] `pm2 status` で online 確認
- [ ] ログにエラーがないことを確認

### Dialpad側
- [ ] Webhook作成
- [ ] Webhook URL設定（http://210.131.222.152:5000/api/dialpad/webhook）
- [ ] イベント選択（call.created, call.ringing, call.incoming, call.answered, call.ended）
- [ ] Secret生成とコピー
- [ ] Webhook保存
- [ ] Test Webhook実行

### 動作確認
- [ ] テストAPI呼び出し成功
- [ ] 管理画面ログイン
- [ ] WebSocket接続確認（🟢表示）
- [ ] テスト着信実行
- [ ] CTIポップアップ自動表示確認
- [ ] 顧客情報表示確認
- [ ] 店舗自動識別確認

---

**すべてのチェックが完了したら、本番運用開始です！🎉**

---

**作成日**: 2025-12-15  
**バージョン**: 1.0.0  
**対象読者**: システム管理者・運用担当者
