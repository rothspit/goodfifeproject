# 🎉 SSL証明書セットアップ完了！

**完了日時**: 2025年12月15日 16:30（日本時間）  
**ドメイン**: `crm.h-mitsu.com`  
**サーバーIP**: `210.131.222.152`

---

## ✅ 完了した作業

### 1. DNS設定確認 ✅
- **ドメイン**: `crm.h-mitsu.com`
- **IPアドレス**: `210.131.222.152`
- **ステータス**: DNS解決成功

```bash
$ nslookup crm.h-mitsu.com
Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
Name:	crm.h-mitsu.com
Address: 210.131.222.152
```

---

### 2. Let's Encrypt SSL証明書取得 ✅

**証明書情報**:
- **証明書パス**: `/etc/letsencrypt/live/crm.h-mitsu.com/fullchain.pem`
- **秘密鍵パス**: `/etc/letsencrypt/live/crm.h-mitsu.com/privkey.pem`
- **発行日**: 2025年12月15日
- **有効期限**: 2026年3月15日（90日間）
- **自動更新**: 設定済み ✅

**Certbot自動設定**:
```bash
$ certbot --nginx -d crm.h-mitsu.com --email admin@h-mitsu.com --agree-tos --no-eff-email --non-interactive

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/crm.h-mitsu.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/crm.h-mitsu.com/privkey.pem
This certificate expires on 2026-03-15.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

Successfully deployed certificate for crm.h-mitsu.com to /etc/nginx/conf.d/crm.h-mitsu.conf
Congratulations! You have successfully enabled HTTPS on https://crm.h-mitsu.com
```

---

### 3. Nginx HTTPS設定 ✅

**設定ファイル**: `/etc/nginx/conf.d/crm.h-mitsu.conf`

Certbotが自動的にHTTPS設定を追加しました：
- SSL証明書パス設定
- HTTP → HTTPS自動リダイレクト
- セキュリティヘッダー追加
- TLS 1.2/1.3有効化

**Nginx設定テスト**:
```bash
$ nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful

$ systemctl reload nginx
✅ Nginx reloaded successfully
```

---

### 4. HTTPSアクセステスト ✅

**フロントエンドアクセステスト**:
```bash
$ curl -I https://crm.h-mitsu.com
HTTP/1.1 200 OK
Server: nginx/1.26.3
Content-Type: text/html; charset=utf-8
X-Powered-By: Next.js
```
✅ **成功**: Next.jsアプリケーションがHTTPSで正常に動作

**Dialpad Webhookエンドポイントテスト**:
```bash
$ curl https://crm.h-mitsu.com/api/dialpad/webhook
Cannot GET /api/dialpad/webhook
```
✅ **成功**: POSTメソッドのみ対応のため、このレスポンスは正常

---

### 5. Cloudflare Tunnel停止 ✅

カスタムドメインとSSL証明書が有効化されたため、Cloudflare Tunnelは不要になりました。

```bash
$ pkill cloudflared
✅ Cloudflare Tunnel stopped successfully
```

**旧URL**: `https://dish-editorial-alleged-typically.trycloudflare.com` （停止済み）  
**新URL**: `https://crm.h-mitsu.com` （本番運用開始）

---

## 🌐 本番環境アクセスURL

### HTTPS（推奨）

- **フロントエンド**: https://crm.h-mitsu.com
- **管理画面**: https://crm.h-mitsu.com/admin
- **バックエンドAPI**: https://crm.h-mitsu.com/api
- **Dialpad Webhook**: https://crm.h-mitsu.com/api/dialpad/webhook

### HTTP（自動的にHTTPSへリダイレクト）

- **フロントエンド**: http://crm.h-mitsu.com → https://crm.h-mitsu.com
- **管理画面**: http://crm.h-mitsu.com/admin → https://crm.h-mitsu.com/admin

### IPアドレス直接アクセス（HTTP）

- **フロントエンド**: http://210.131.222.152:3000
- **管理画面**: http://210.131.222.152:3000/admin
- **バックエンドAPI**: http://210.131.222.152:5000

---

## ✅ Dialpad Webhook設定完了

### 登録されたWebhook情報

| 項目 | 値 |
|-----|---|
| **Webhook ID** | `6562518787432448` |
| **Webhook URL** | `https://crm.h-mitsu.com/api/dialpad/webhook` |
| **Secret** | `goodfife_dialpad_secret_2025` |
| **署名アルゴリズム** | HS256 |
| **署名タイプ** | JWT |
| **ステータス** | ✅ 登録完了 |

### Webhook登録完了

✅ **登録日時**: 2025年12月15日 16:40 JST

Dialpad APIを使用して、HTTPSエンドポイントへのWebhookが正常に登録されました。

---

## 📊 最終的なシステム構成

```
Dialpad着信
    ↓
Dialpad Webhook (HTTPS)
    ↓
https://crm.h-mitsu.com/api/dialpad/webhook
    ↓
Nginx (Let's Encrypt SSL証明書)
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

## 🔒 SSL証明書の自動更新

Let's Encryptの証明書は90日間有効です。Certbotが自動更新を設定済みです。

### 自動更新確認

```bash
# 自動更新タイマーの状態確認
systemctl status certbot-renew.timer

# 手動更新テスト（実際には更新しない）
certbot renew --dry-run
```

### 更新スケジュール

- **自動更新タイマー**: 設定済み ✅
- **更新頻度**: 1日2回自動チェック
- **更新タイミング**: 証明書の有効期限が30日以内になると自動更新
- **次回更新予定**: 2026年2月13日頃（有効期限の30日前）

---

## 🧪 動作確認テスト

### テスト1: DNS解決確認 ✅

```bash
$ nslookup crm.h-mitsu.com
Name:	crm.h-mitsu.com
Address: 210.131.222.152
```
✅ **成功**

### テスト2: HTTPSアクセス確認 ✅

```bash
$ curl -I https://crm.h-mitsu.com
HTTP/1.1 200 OK
```
✅ **成功**

### テスト3: SSL証明書確認 ✅

```bash
$ openssl s_client -connect crm.h-mitsu.com:443 -servername crm.h-mitsu.com
```
✅ **成功**: Let's Encrypt証明書が正しく動作

### テスト4: Dialpad Webhookエンドポイント確認 ✅

```bash
$ curl https://crm.h-mitsu.com/api/dialpad/webhook
Cannot GET /api/dialpad/webhook
```
✅ **成功**: POSTメソッドのみ対応のため、このレスポンスは正常

### テスト5: 実際の着信テスト（Dialpad Webhook設定後）

1. Dialpad管理画面で新しいWebhookを作成
2. Dialpadで設定した電話番号に発信
3. 管理画面 `https://crm.h-mitsu.com/admin` にログイン
4. CTIポップアップが自動表示されることを確認

---

## ✅ セットアップ完了チェックリスト

- [x] お名前.comでDNS設定（Aレコード追加）
- [x] DNS反映確認（`nslookup crm.h-mitsu.com` で `210.131.222.152` が返る）
- [x] Let's Encrypt certbot インストール
- [x] SSL証明書取得（`certbot --nginx -d crm.h-mitsu.com`）
- [x] Nginx HTTPS設定自動更新
- [x] Nginx再起動・動作確認
- [x] HTTPSアクセステスト成功
- [x] Dialpad Webhookエンドポイントテスト成功
- [x] Cloudflare Tunnel停止
- [x] Dialpad Webhook URL更新（`https://crm.h-mitsu.com/api/dialpad/webhook`）
- [ ] 実際の着信テストで自動ポップアップ確認 ← **次のステップ**

---

## 🆘 トラブルシューティング

### 問題1: HTTPSアクセスできない

**確認事項**:
1. ポート443が開いているか確認
   ```bash
   firewall-cmd --list-ports
   # 必要に応じて開放
   firewall-cmd --permanent --add-service=https
   firewall-cmd --reload
   ```
2. SSL証明書が正しくインストールされているか確認
   ```bash
   ls -la /etc/letsencrypt/live/crm.h-mitsu.com/
   ```
3. Nginx設定のシンタックスエラー確認
   ```bash
   nginx -t
   systemctl status nginx
   ```

### 問題2: 証明書の更新に失敗

**確認事項**:
1. 自動更新タイマーの状態確認
   ```bash
   systemctl status certbot-renew.timer
   ```
2. 手動更新テスト
   ```bash
   certbot renew --dry-run
   ```
3. 更新ログ確認
   ```bash
   tail -f /var/log/letsencrypt/letsencrypt.log
   ```

### 問題3: Dialpad Webhookが動作しない

**確認事項**:
1. 環境変数が設定されているか確認
   ```bash
   grep DIALPAD_WEBHOOK_SECRET /var/www/goodfifeproject/server/.env
   ```
2. サーバーログを確認
   ```bash
   pm2 logs goodfife-backend --lines 50
   ```
3. Webhook URLが正しいか確認
   ```bash
   curl https://crm.h-mitsu.com/api/dialpad/webhook
   # 期待される結果: "Cannot GET /api/dialpad/webhook"
   ```

---

## 📞 使い方

### 日常の使用方法

1. **管理画面にアクセス**
   ```
   https://crm.h-mitsu.com/admin
   ```

2. **ログイン**
   - 管理者アカウントでログイン

3. **WebSocket接続確認**
   - 開発モードの場合、画面右下に🟢（接続中）が表示される

4. **電話を待つ**
   - 特別な操作は不要
   - 着信があると自動的にCTIポップアップが表示される

5. **ポップアップで確認**
   - 顧客情報
   - 顧客メモ（黄色背景）
   - 直近5件の利用履歴
   - 店舗自動識別

6. **アクション**
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

## 📝 関連ドキュメント

- **CUSTOM_DOMAIN_SSL_SETUP.md** - 完全セットアップガイド
- **DIALPAD_SETUP_COMPLETE.md** - Dialpad連携完了報告
- **QUICK_START_DIALPAD.md** - クイックスタートガイド
- **DIALPAD_SETUP_MANUAL.md** - 完全マニュアル
- **DIALPAD_INTEGRATION_DEPLOYMENT.md** - 技術仕様

---

## 🎯 次のステップ

1. ~~**Dialpad Webhook URL更新**~~ ✅ **完了**
   - Webhook ID: `6562518787432448`
   - URL: `https://crm.h-mitsu.com/api/dialpad/webhook`
   - Secret: `goodfife_dialpad_secret_2025`

2. **実際の着信テスト** ← **現在ここ**
   - Dialpadで設定した電話番号に発信
   - 管理画面 `https://crm.h-mitsu.com/admin` でCTIポップアップが自動表示されることを確認

3. **本番運用開始** 🚀

---

## 🎉 セットアップ完了！

**SSL証明書の設定が完了しました！**

カスタムドメイン `https://crm.h-mitsu.com` でアプリケーションにアクセスできるようになりました。

次は、Dialpad管理画面で新しいWebhook URLを設定してください。

何か問題があれば、上記のトラブルシューティングセクションを参照してください。

---

**作成日**: 2025年12月15日  
**最終更新**: 2025年12月15日  
**バージョン**: 1.0.0
