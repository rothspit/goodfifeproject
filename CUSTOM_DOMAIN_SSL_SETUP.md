# 🌐 カスタムドメイン + SSL証明書セットアップガイド

**ドメイン**: `crm.h-mitsu.com`  
**対象サーバー**: `210.131.222.152`  
**完了日時**: 2025年12月15日

---

## 📋 セットアップ手順

### ✅ ステップ1: お名前.comでのDNS設定

1. **お名前.comにログイン**
   - URL: https://www.onamae.com/
   - アカウントでログイン

2. **DNS設定画面に移動**
   - 「DNS」→「ドメインのDNS設定」
   - または直接: https://navi.onamae.com/domain/dns

3. **対象ドメインを選択**
   - `h-mitsu.com` を選択
   - 「次へ」をクリック

4. **DNSレコード設定を追加**
   - 「DNSレコード設定を利用する」を選択
   - 「設定する」をクリック

5. **Aレコードを追加**

   | 項目 | 値 |
   |-----|---|
   | ホスト名 | `crm` |
   | TYPE | `A` |
   | VALUE | `210.131.222.152` |
   | TTL | `3600` |

6. **設定を保存**
   - 「確認画面へ進む」をクリック
   - 内容を確認して「設定する」をクリック

### ⏱️ DNS反映待機時間

DNS設定の反映には**5分〜24時間**かかります（通常は30分〜2時間）。

#### 反映状況の確認方法

**方法1: Windowsの場合**
```cmd
nslookup crm.h-mitsu.com
```

**方法2: Mac/Linuxの場合**
```bash
dig crm.h-mitsu.com
```

**方法3: オンラインツール**
- https://mxtoolbox.com/SuperTool.aspx?action=a%3acrm.h-mitsu.com
- https://www.whatsmydns.net/#A/crm.h-mitsu.com

**期待される結果**:
```
crm.h-mitsu.com -> 210.131.222.152
```

---

### ✅ ステップ2: サーバー側設定（準備完了）

**現在の状態**:
- ✅ Nginx設定ファイル作成済み: `/etc/nginx/conf.d/crm.h-mitsu.conf`
- ✅ Let's Encrypt certbot インストール済み
- ✅ Nginx再起動済み

---

### ✅ ステップ3: SSL証明書取得（DNS反映後）

DNS設定が反映された後、以下のコマンドでSSL証明書を取得します：

```bash
# サーバーにSSH接続
ssh -i ~/WIFEHP.pem root@210.131.222.152

# SSL証明書を自動取得（Nginx設定も自動更新）
certbot --nginx -d crm.h-mitsu.com --email your-email@example.com --agree-tos --no-eff-email

# または、手動でSSL証明書のみ取得
certbot certonly --webroot -w /var/www/letsencrypt -d crm.h-mitsu.com --email your-email@example.com --agree-tos --no-eff-email
```

**重要**: `your-email@example.com` を実際のメールアドレスに置き換えてください。

---

### ✅ ステップ4: Nginx設定更新（SSL証明書取得後）

SSL証明書が取得できたら、Nginx設定を更新してHTTPSを有効化します：

```nginx
# /etc/nginx/conf.d/crm.h-mitsu.conf

# HTTP server - Redirect to HTTPS
server {
    listen 80;
    server_name crm.h-mitsu.com;

    # Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name crm.h-mitsu.com;

    # SSL証明書設定
    ssl_certificate /etc/letsencrypt/live/crm.h-mitsu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.h-mitsu.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/crm.h-mitsu.com/chain.pem;

    # SSL最適化設定
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # セキュリティヘッダー
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # フロントエンド（Next.js）へのプロキシ
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # バックエンドAPI（Express）へのプロキシ
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Socket.IOへのプロキシ
    location /socket.io/ {
        proxy_pass http://localhost:5001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # アップロードファイルの静的配信
    location /uploads/ {
        alias /var/www/goodfifeproject/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 50M;
}
```

**Nginx設定テストと再起動**:
```bash
nginx -t
systemctl reload nginx
```

---

### ✅ ステップ5: Dialpad Webhook URLを更新

SSL証明書が有効化されたら、Dialpad WebhookのURLを更新します：

#### 方法1: Dialpad APIで更新（推奨）

```bash
# 既存のWebhookを削除
curl --request DELETE \
     --url https://dialpad.com/api/v2/webhooks/6164250429497344 \
     --header 'authorization: Bearer RGNAvLrraPJ7qFfwNrzXCsWwSEzmpzma4PzP8E4GjeuquWEbsSed9n9qc6USdUH9s5a4s36cPbCyNTcUPFAMSXbaNG7znpTdWrtm'

# 新しいWebhookを作成（HTTPS URLで）
curl --request POST \
     --url https://dialpad.com/api/v2/webhooks \
     --header 'accept: application/json' \
     --header 'authorization: Bearer RGNAvLrraPJ7qFfwNrzXCsWwSEzmpzma4PzP8E4GjeuquWEbsSed9n9qc6USdUH9s5a4s36cPbCyNTcUPFAMSXbaNG7znpTdWrtm' \
     --header 'content-type: application/json' \
     --data '{
  "hook_url": "https://crm.h-mitsu.com/api/dialpad/webhook",
  "secret": "goodfife_dialpad_secret_2025"
}'
```

#### 方法2: Dialpad管理画面で手動更新

1. Dialpad管理画面にログイン: https://dialpad.com/
2. Settings → API & Integrations → Webhooks
3. 既存のWebhookを削除
4. 新しいWebhookを作成:
   - **Webhook URL**: `https://crm.h-mitsu.com/api/dialpad/webhook`
   - **Secret**: `goodfife_dialpad_secret_2025`
   - **Events**: `call.created`, `call.ringing`, `call.incoming`, `call.answered`, `call.ended`

---

### ✅ ステップ6: Cloudflare Tunnelの停止（オプション）

カスタムドメインとSSL証明書が有効化されたら、Cloudflare Tunnelは不要になります：

```bash
# SSH接続
ssh -i ~/WIFEHP.pem root@210.131.222.152

# Cloudflare Tunnelプロセスを停止
pkill cloudflared

# プロセスの停止を確認
ps aux | grep cloudflared
```

---

## 🧪 動作確認

### テスト1: DNS解決確認

```bash
nslookup crm.h-mitsu.com
# 期待される結果: 210.131.222.152
```

### テスト2: HTTPアクセス（HTTPSへのリダイレクト確認）

```bash
curl -I http://crm.h-mitsu.com
# 期待される結果: HTTP/1.1 301 Moved Permanently
# Location: https://crm.h-mitsu.com/
```

### テスト3: HTTPSアクセス

```bash
curl -I https://crm.h-mitsu.com
# 期待される結果: HTTP/2 200
```

### テスト4: SSL証明書確認

```bash
curl -vI https://crm.h-mitsu.com 2>&1 | grep -i "SSL certificate"
# または
openssl s_client -connect crm.h-mitsu.com:443 -servername crm.h-mitsu.com
```

### テスト5: Dialpad Webhookエンドポイント確認

```bash
curl https://crm.h-mitsu.com/api/dialpad/webhook
# 期待される結果: "Cannot GET /api/dialpad/webhook"
# （POSTメソッドのみ対応しているため、これは正常）
```

---

## 📊 最終的なシステム構成

```
Dialpad着信
    ↓
Dialpad Webhook (HTTPS)
    ↓
https://crm.h-mitsu.com/api/dialpad/webhook
    ↓
Nginx (Let's Encrypt SSL)
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

## ✅ セットアップ完了チェックリスト

- [ ] お名前.comでDNS設定完了（Aレコード追加）
- [ ] DNS反映確認（`nslookup crm.h-mitsu.com` で `210.131.222.152` が返る）
- [ ] SSL証明書取得（`certbot --nginx -d crm.h-mitsu.com`）
- [ ] Nginx設定更新（HTTPS有効化）
- [ ] Nginx再起動・動作確認
- [ ] Dialpad Webhook URL更新（`https://crm.h-mitsu.com/api/dialpad/webhook`）
- [ ] Cloudflare Tunnel停止（オプション）
- [ ] HTTPSアクセステスト成功
- [ ] Dialpad Webhookエンドポイントテスト成功
- [ ] 実際の着信テストで自動ポップアップ確認

---

## 🆘 トラブルシューティング

### 問題1: DNS設定が反映されない

**確認事項**:
1. お名前.comでの設定内容を再確認
   - ホスト名: `crm` (先頭に `@` や `.` は不要)
   - TYPE: `A`
   - VALUE: `210.131.222.152`
2. TTL（有効期限）を短く設定（3600秒 = 1時間）
3. 設定から30分〜2時間待つ
4. ブラウザのキャッシュをクリア

### 問題2: SSL証明書取得に失敗

**原因**:
- DNS設定が反映されていない
- ポート80がブロックされている
- Nginxが正しく動作していない

**解決方法**:
```bash
# ポート80の確認
netstat -tlnp | grep :80

# Nginx動作確認
systemctl status nginx

# Nginxログ確認
tail -f /var/log/nginx/error.log

# Let's Encrypt詳細ログで確認
certbot --nginx -d crm.h-mitsu.com --email your@email.com --agree-tos --no-eff-email --verbose
```

### 問題3: HTTPSアクセスできない

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
   ```

---

## 🔄 SSL証明書の自動更新

Let's Encryptの証明書は90日間有効です。自動更新を有効化します：

```bash
# 自動更新タイマーを有効化
systemctl enable certbot-renew.timer
systemctl start certbot-renew.timer

# タイマーの状態確認
systemctl status certbot-renew.timer

# 手動更新テスト（実際には更新しない）
certbot renew --dry-run
```

---

## 🌐 アクセスURL

### 本番環境（カスタムドメイン + SSL）
- **フロントエンド**: https://crm.h-mitsu.com
- **管理画面**: https://crm.h-mitsu.com/admin
- **バックエンドAPI**: https://crm.h-mitsu.com/api
- **Dialpad Webhook**: https://crm.h-mitsu.com/api/dialpad/webhook

### IPアドレス直接アクセス（HTTP）
- **フロントエンド**: http://210.131.222.152:3000
- **管理画面**: http://210.131.222.152:3000/admin
- **バックエンドAPI**: http://210.131.222.152:5000

---

## 📞 次のステップ

DNS設定が完了したら、以下の手順で進めます：

1. **DNS反映確認**（5分〜2時間待機）
   ```bash
   nslookup crm.h-mitsu.com
   ```

2. **SSL証明書取得**（DNS反映後すぐ実行可能）
   ```bash
   ssh -i ~/WIFEHP.pem root@210.131.222.152
   certbot --nginx -d crm.h-mitsu.com --email your@email.com --agree-tos --no-eff-email
   ```

3. **Dialpad Webhook更新**（SSL証明書取得後）
   - 新しいURL: `https://crm.h-mitsu.com/api/dialpad/webhook`

4. **動作確認**
   - HTTPSアクセステスト
   - 実際の着信テスト

---

**作成日**: 2025年12月15日  
**最終更新**: 2025年12月15日  
**バージョン**: 1.0.0
