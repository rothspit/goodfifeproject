# DNS設定変更が必要

## 現在の状況

**新しいドメイン**: `system.h-mitsu.com`  
**サーバーIP**: `162.43.91.102`

### 問題
現在、`system.h-mitsu.com` のDNS Aレコードが誤ったIPアドレスを指しています：

```
現在のDNS: system.h-mitsu.com → 210.131.222.152 ❌
正しいDNS: system.h-mitsu.com → 162.43.91.102 ✅
```

## 必要な作業

### 1. DNS設定変更

DNSプロバイダー（お名前.com、ムームードメイン、など）の管理画面で、以下のAレコードを設定してください：

```
種別: A
ホスト名: system
値: 162.43.91.102
TTL: 3600（または自動）
```

### 2. DNS伝播待機

DNS設定変更後、完全に反映されるまで **5分〜最大48時間** かかる場合があります。

#### 確認方法

```bash
# コマンドラインで確認
nslookup system.h-mitsu.com

# または
dig system.h-mitsu.com

# 正しく設定されていれば、以下のように表示されるはずです：
# system.h-mitsu.com.  IN  A  162.43.91.102
```

オンラインツールでも確認できます：
- https://www.whatsmydns.net/#A/system.h-mitsu.com

### 3. SSL証明書取得（DNS反映後）

DNS設定が正しく反映されたら、サーバーで以下のコマンドを実行してSSL証明書を取得します：

```bash
# サーバーにSSH接続
ssh root@162.43.91.102

# SSL証明書取得
sudo certbot --nginx -d system.h-mitsu.com --non-interactive --agree-tos --email info@h-mitsu.com --redirect
```

## 現在の設定状況

### ✅ 完了している設定

1. **Nginx設定** - `/etc/nginx/conf.d/system.h-mitsu.com.conf` 作成済み
2. **リバースプロキシ** - フロントエンド(3010)とバックエンド(5010)の設定完了
3. **SELinux** - Nginx接続許可設定済み
4. **ファイアウォール** - ポート80/443開放済み

### ⏳ DNS反映待ち

- DNSのAレコード変更
- SSL証明書取得（DNS反映後）

## 完了後のアクセスURL

DNS設定完了とSSL証明書取得後、以下のURLでアクセス可能になります：

- **メイン管理画面**: https://system.h-mitsu.com
- **バックエンドAPI**: https://system.h-mitsu.com/api/
- **ヘルスチェック**: https://system.h-mitsu.com/health

## 注意事項

1. `crm.h-mitsu.com` は既にSSL設定済みで正常動作中です
2. 両方のドメインが同じアプリケーションを指します
3. `system.h-mitsu.com` を主要ドメインとして使用する場合、`crm.h-mitsu.com` の設定は削除可能です

---

**最終更新**: 2025年12月17日  
**ステータス**: DNS設定変更待ち
