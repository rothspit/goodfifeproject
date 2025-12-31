# 🎉 Dialpad連携セットアップ完了！

**完了日時**: 2025年12月15日 12:40（日本時間）

---

## ✅ 完了した設定

### 1. Cloudflare Tunnel（HTTPS）

Cloudflare Tunnelを使用して、HTTPSエンドポイントを作成しました。

- **HTTPS URL**: `https://dish-editorial-alleged-typically.trycloudflare.com`
- **ローカルポート**: 5000
- **ステータス**: ✅ 稼働中

### 2. Dialpad Webhook作成

- **Webhook ID**: `6164250429497344`
- **Webhook URL**: `https://dish-editorial-alleged-typically.trycloudflare.com/api/dialpad/webhook`
- **Secret**: `goodfife_dialpad_secret_2025`
- **ステータス**: ✅ 作成完了

### 3. サーバー環境変数設定

- **変数名**: `DIALPAD_WEBHOOK_SECRET`
- **値**: `goodfife_dialpad_secret_2025`
- **場所**: `/var/www/goodfifeproject/server/.env`
- **ステータス**: ✅ 設定完了・再起動済み

---

## 🔧 システム構成

```
Dialpad着信
    ↓
Dialpad Webhook (HTTPS)
    ↓
Cloudflare Tunnel
 (https://dish-editorial-alleged-typically.trycloudflare.com)
    ↓
サーバー localhost:5000
 (/api/dialpad/webhook)
    ↓
署名検証（HMAC SHA-256）
    ↓
Socket.IO → admin-room
    ↓
管理画面（WebSocket接続）
    ↓
CTIポップアップ自動表示
```

---

## ⚠️ 重要な注意事項

### Cloudflare Tunnelの特性

Cloudflare Tunnelは**無料の一時的なサービス**です：

1. **URLは24時間で変更される可能性があります**
   - 現在のURL: `https://dish-editorial-alleged-typically.trycloudflare.com`
   - サーバー再起動時に新しいURLが生成される

2. **プロセスが停止すると使えなくなります**
   - `cloudflared`プロセスが停止した場合、再起動が必要

3. **本番環境では推奨されません**
   - テスト・開発用途に最適
   - 本番環境では独自ドメインとSSL証明書の使用を推奨

---

## 🔄 Cloudflare Tunnelの管理

### トンネルの状態確認

```bash
ssh -i ~/WIFEHP.pem root@210.131.222.152
ps aux | grep cloudflared
cat /tmp/cloudflared.log
```

### トンネルの再起動

```bash
# 既存のプロセスを停止
pkill cloudflared

# 新しいトンネルを起動
nohup cloudflared tunnel --url http://localhost:5000 > /tmp/cloudflared.log 2>&1 &

# 新しいURLを確認（数秒待ってから）
sleep 5 && cat /tmp/cloudflared.log | grep https
```

### 新しいURLでWebhook更新

URLが変更された場合、Dialpadで新しいWebhookを作成する必要があります：

```bash
# 新しいURLを取得
NEW_URL=$(cat /tmp/cloudflared.log | grep -oP 'https://[a-z0-9\-]+\.trycloudflare\.com' | head -1)

# Webhookを更新
curl --request POST \
     --url https://dialpad.com/api/v2/webhooks \
     --header 'authorization: Bearer YOUR_API_TOKEN' \
     --header 'content-type: application/json' \
     --data "{
  \"hook_url\": \"${NEW_URL}/api/dialpad/webhook\",
  \"secret\": \"goodfife_dialpad_secret_2025\"
}"
```

---

## 🧪 動作テスト方法

### テスト1: エンドポイント確認

```bash
curl https://dish-editorial-alleged-typically.trycloudflare.com/api/dialpad/webhook
# 期待される結果: "Cannot GET /api/dialpad/webhook"
# （POSTメソッドのみ対応しているため、これは正常）
```

### テスト2: 開発用テストAPI

管理画面にログイン後、ブラウザのConsoleで：

```javascript
// JWTトークンを取得
const token = localStorage.getItem('token');

// テスト着信を送信
fetch('http://210.131.222.152:5000/api/dialpad/test-call', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customerPhone: '09012345678',
    incomingNumber: '0501748XXXX'
  })
}).then(res => res.json()).then(console.log);
```

### テスト3: 実際の着信テスト

1. Dialpadで設定した電話番号に発信
2. 管理画面にCTIポップアップが自動表示されることを確認

---

## 📱 使い方

### 日常の使用方法

1. **管理画面にログイン**
   ```
   http://210.131.222.152:3000/admin
   ```

2. **WebSocket接続確認**
   - 開発モードの場合、画面右下に🟢（接続中）が表示される

3. **電話を待つ**
   - 特別な操作は不要
   - 着信があると自動的にCTIポップアップが表示される

4. **ポップアップで確認**
   - 顧客情報
   - 顧客メモ（黄色背景）
   - 直近5件の利用履歴
   - 店舗自動識別

5. **アクション**
   - 「詳細を確認」→ 顧客詳細画面
   - 「新規受注を入力」→ 受注入力画面

---

## 🏪 店舗の自動識別

Dialpadからの着信番号で店舗を自動判定：

| 着信番号 | 店舗名 |
|---------|--------|
| `050-1748-XXXX` | 人妻の蜜 西船橋 |
| `050-1749-XXXX` | 人妻の蜜 錦糸町 |
| `050-1750-XXXX` | 人妻の蜜 葛西 |
| `050-1751-XXXX` | 人妻の蜜 松戸 |

---

## 🚀 本番環境への移行（推奨）

Cloudflare Tunnelはテスト用です。本番環境では以下を推奨します：

### オプション1: 独自ドメイン + Let's Encrypt SSL

**メリット**:
- 永続的なURL
- 無料SSL証明書
- プロフェッショナル

**手順**:
1. ドメインを取得（既存のドメインを使用可）
2. サブドメインを設定（例: `api.yourdomain.com`）
3. Let's Encrypt SSL証明書をインストール
4. NginxでリバースプロキシをWebhookエンドポイントに設定

### オプション2: ngrok有料プラン

**メリット**:
- 固定URL
- 簡単なセットアップ
- 追加設定不要

**料金**: 月額$10〜

---

## 📊 監視とログ

### サーバーログの確認

```bash
# バックエンドログ
pm2 logs goodfife-backend --lines 50

# Cloudflare Tunnelログ
cat /tmp/cloudflared.log

# リアルタイムログ
pm2 logs goodfife-backend
```

### 着信ログの例

正常に動作している場合、以下のようなログが表示されます：

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

---

## 🆘 トラブルシューティング

### 問題1: ポップアップが表示されない

**確認事項**:
1. ブラウザのポップアップブロッカーを確認
2. WebSocket接続状態を確認（開発モードで🟢表示）
3. サーバーログを確認

### 問題2: Webhook URLが動作しない

**確認事項**:
1. Cloudflare Tunnelが起動しているか確認
   ```bash
   ps aux | grep cloudflared
   ```
2. URLが変更されていないか確認
   ```bash
   cat /tmp/cloudflared.log | grep https
   ```
3. サーバーが起動しているか確認
   ```bash
   pm2 status
   ```

### 問題3: 署名検証エラー

**確認事項**:
1. 環境変数が設定されているか確認
   ```bash
   grep DIALPAD_WEBHOOK_SECRET /var/www/goodfifeproject/server/.env
   ```
2. サーバーを再起動
   ```bash
   pm2 restart goodfife-backend
   ```

---

## 📞 サポート情報

### 関連ドキュメント

- `QUICK_START_DIALPAD.md` - 簡易セットアップガイド
- `DIALPAD_SETUP_MANUAL.md` - 完全マニュアル
- `DIALPAD_INTEGRATION_DEPLOYMENT.md` - 技術仕様

### システムURL

- **管理画面**: http://210.131.222.152:3000/admin
- **バックエンドAPI**: http://210.131.222.152:5000
- **Cloudflare Tunnel**: https://dish-editorial-alleged-typically.trycloudflare.com

---

## ✅ セットアップ完了チェックリスト

- [x] Cloudflare Tunnelインストール
- [x] Cloudflare Tunnel起動
- [x] HTTPS URL取得
- [x] Dialpad Webhook作成
- [x] 環境変数設定
- [x] サーバー再起動
- [ ] 実際の着信テスト（次のステップ）

---

**セットアップは完了しました！🎉**

次は実際に電話をかけて、CTIポップアップが自動表示されるか確認してください。

何か問題があれば、上記のトラブルシューティングセクションを参照してください。

---

**作成日**: 2025年12月15日  
**最終更新**: 2025年12月15日  
**バージョン**: 1.0.0
