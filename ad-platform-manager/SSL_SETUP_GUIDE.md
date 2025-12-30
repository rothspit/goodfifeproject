# SSL証明書セットアップガイド - crm.h-mitsu.com

## ✅ 完了事項

1. **Nginx インストール完了**
   - バージョン: nginx/1.26.3
   - 自動起動: 有効

2. **Certbot インストール完了**
   - バージョン: certbot 4.2.0
   - python3-certbot-nginx プラグイン導入済み

3. **Nginx設定ファイル作成完了**
   - ファイル: `/etc/nginx/conf.d/crm.h-mitsu.com.conf`
   - フロントエンド: localhost:3010 へプロキシ
   - バックエンドAPI: localhost:5010 へプロキシ

4. **ファイアウォール設定完了**
   - ポート80 (HTTP): 開放
   - ポート443 (HTTPS): 開放

## 📋 次のステップ

### 1. DNSレコード設定確認

crm.h-mitsu.com のAレコードが 162.43.91.102 を指していることを確認してください。

**設定例（お使いのDNSプロバイダで設定）:**
```
タイプ: A
ホスト名: crm
値: 162.43.91.102
TTL: 3600
```

### 2. DNS設定確認コマンド

```bash
# ローカルPCで実行
nslookup crm.h-mitsu.com

# または
dig crm.h-mitsu.com +short
```

**期待される結果:** `162.43.91.102`

### 3. SSL証明書取得（DNS設定完了後）

サーバーで以下のコマンドを実行:

```bash
# Let's Encrypt証明書の取得
sudo certbot --nginx -d crm.h-mitsu.com

# または、対話なしで実行する場合:
sudo certbot --nginx -d crm.h-mitsu.com --non-interactive --agree-tos --email your@email.com
```

### 4. 自動更新の有効化

```bash
# 証明書の自動更新タイマーを有効化
sudo systemctl start certbot-renew.timer
sudo systemctl enable certbot-renew.timer

# 状態確認
sudo systemctl status certbot-renew.timer
```

## 🔧 トラブルシューティング

### DNS設定が反映されない場合

1. **TTLの確認**: 前の設定のTTLが長い場合、反映に時間がかかります
2. **キャッシュクリア**: ローカルDNSキャッシュをクリア
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac/Linux
   sudo dscacheutil -flushcache
   ```

### SSL証明書取得に失敗する場合

1. **DNS確認**: crm.h-mitsu.com が正しく解決されるか確認
2. **ポート開放確認**: 
   ```bash
   sudo firewall-cmd --list-all
   # http と https が表示されることを確認
   ```
3. **Nginx動作確認**:
   ```bash
   sudo systemctl status nginx
   curl -I http://crm.h-mitsu.com
   ```

### 証明書更新テスト

```bash
# ドライラン（実際には更新しない）
sudo certbot renew --dry-run
```

## 📡 現在のアクセスURL

### SSL取得前（現在）
- HTTP: http://crm.h-mitsu.com

### SSL取得後
- HTTPS: https://crm.h-mitsu.com
- HTTP自動リダイレクト: http → https

## 🎯 SSL証明書取得後の確認事項

1. **HTTPS動作確認**
   ```bash
   curl -I https://crm.h-mitsu.com
   ```

2. **SSL証明書情報確認**
   ```bash
   sudo certbot certificates
   ```

3. **ブラウザでアクセス**
   - https://crm.h-mitsu.com にアクセス
   - 鍵マーク（🔒）が表示されることを確認

## ⚙️ Nginx設定ファイル

**場所:** `/etc/nginx/conf.d/crm.h-mitsu.com.conf`

**現在の設定:**
- フロントエンド: `http://localhost:3010` → `http://crm.h-mitsu.com/`
- バックエンドAPI: `http://localhost:5010/api/` → `http://crm.h-mitsu.com/api/`
- ヘルスチェック: `http://localhost:5010/health` → `http://crm.h-mitsu.com/health`

**SSL取得後、Certbotが自動的に:**
- HTTPS設定を追加
- HTTP→HTTPSリダイレクトを設定
- SSL証明書パスを設定

## 📞 サポート

問題が発生した場合は、以下の情報を確認:

```bash
# Nginxエラーログ
sudo tail -50 /var/log/nginx/error.log

# Certbotログ
sudo tail -50 /var/log/letsencrypt/letsencrypt.log

# システムログ
sudo journalctl -u nginx -n 50
```

---

**作成日:** 2025-12-17  
**サーバーIP:** 162.43.91.102  
**ドメイン:** crm.h-mitsu.com
