# ⚠️ DNS設定が必要です - crm.h-mitsu.com

## 🔴 問題発見

現在、`crm.h-mitsu.com` のDNSレコードが**誤ったIPアドレス**を指しています。

### 現在の設定（間違い）
```
crm.h-mitsu.com → 210.131.222.152 ❌
```

### 正しい設定
```
crm.h-mitsu.com → 162.43.91.102 ✅
```

## 📋 修正手順

### 1. DNSプロバイダーにログイン

h-mitsu.com ドメインを管理しているDNSプロバイダー（レジストラ）にログインしてください。

一般的なプロバイダー例：
- お名前.com
- ムームードメイン
- Cloudflare
- AWS Route 53
- さくらインターネット
- など

### 2. DNSレコード編集

**変更するレコード:**

| タイプ | ホスト名 | 現在の値（誤り） | 新しい値（正） |
|---|---|---|---|
| A | crm | 210.131.222.152 | **162.43.91.102** |

**設定例（プロバイダーによって画面が異なります）:**

```
レコードタイプ: A
ホスト名: crm
値/IPアドレス: 162.43.91.102
TTL: 3600（または1時間）
```

### 3. DNS反映待ち

DNSの変更は即座には反映されません。通常以下の時間がかかります：

- **最短**: 5-10分
- **標準**: 30分-1時間
- **最大**: 24-48時間（TTL設定による）

### 4. DNS反映確認

以下のコマンドで確認してください：

#### Windows
```cmd
nslookup crm.h-mitsu.com
```

#### Mac/Linux
```bash
dig crm.h-mitsu.com +short
# または
host crm.h-mitsu.com
```

**期待される結果:**
```
162.43.91.102
```

### 5. オンラインDNSチェッカーで確認（推奨）

複数の地域から確認できるツール：
- https://www.whatsmydns.net/#A/crm.h-mitsu.com
- https://dnschecker.org/

## ✅ 完了している設定

以下は**既に設定完了**しています：

1. ✅ **Nginx インストール & 起動**
   - バージョン: 1.26.3
   - ステータス: 稼働中

2. ✅ **Certbot インストール**
   - Let's Encrypt対応
   - 自動更新設定準備完了

3. ✅ **Nginx設定ファイル作成**
   - `/etc/nginx/conf.d/crm.h-mitsu.com.conf`
   - フロントエンド: localhost:3010
   - バックエンドAPI: localhost:5010

4. ✅ **ファイアウォール設定**
   - ポート 80 (HTTP): 開放済み
   - ポート 443 (HTTPS): 開放済み

5. ✅ **SSL証明書検証ディレクトリ作成**
   - `/usr/share/nginx/html/.well-known/acme-challenge/`

## 🚀 DNS反映後の作業

DNS設定が正しいIPアドレス（162.43.91.102）を指すようになったら、以下のコマンドを**サーバーで実行**してください：

### SSL証明書取得コマンド

```bash
# サーバーにSSH接続
ssh root@162.43.91.102

# SSL証明書取得（自動設定）
sudo certbot --nginx -d crm.h-mitsu.com --non-interactive --agree-tos --email info@h-mitsu.com --redirect

# 証明書自動更新の有効化
sudo systemctl start certbot-renew.timer
sudo systemctl enable certbot-renew.timer
```

### 確認コマンド

```bash
# SSL証明書の確認
sudo certbot certificates

# HTTPSアクセステスト
curl -I https://crm.h-mitsu.com

# ブラウザでアクセス
# https://crm.h-mitsu.com
```

## 📊 現在の状況まとめ

| 項目 | ステータス |
|---|---|
| サーバーIP | 162.43.91.102 |
| DNS設定 | ❌ 要修正（210.131.222.152 → 162.43.91.102） |
| Nginx | ✅ 起動中 |
| Certbot | ✅ インストール済み |
| ファイアウォール | ✅ ポート開放済み |
| SSL証明書 | ⏳ DNS修正後に取得 |

## 🔧 トラブルシューティング

### DNSが反映されない場合

1. **TTL値確認**: 前の設定のTTLが長い場合、その時間待つ必要があります
2. **キャッシュクリア**: ローカルDNSキャッシュをクリア
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

3. **複数のDNSサーバーで確認**: 
   - Google DNS: 8.8.8.8
   - Cloudflare DNS: 1.1.1.1
   ```bash
   nslookup crm.h-mitsu.com 8.8.8.8
   ```

### 古いIPアドレスについて

`210.131.222.152` は別のサーバーのIPアドレスのようです。
もしこのIPで何か重要なサービスが動いている場合は、移行計画を立ててください。

## 📞 次のアクション

1. **今すぐ**: DNSレコードを 162.43.91.102 に変更
2. **5-60分後**: DNS反映確認（nslookup/dig）
3. **反映確認後**: SSL証明書取得コマンド実行
4. **完了**: https://crm.h-mitsu.com でアクセス確認

---

**緊急連絡先**  
サーバーIP: 162.43.91.102  
ドメイン: crm.h-mitsu.com  
作成日: 2025-12-17
