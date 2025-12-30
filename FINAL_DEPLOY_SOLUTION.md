# 🎯 完全デプロイ解決ガイド

## 📋 現在の状況

### ✅ 完了した作業
- マルチ店舗対応実装（動的ルーティング）
- 顧客管理・CTI連携システム実装
- データベース設計・マイグレーション作成
- 管理画面（受注ボタン）実装
- フロントエンド・バックエンドのコード修正
- 「人妻の蜜」ブランドロゴのフォント高級化
- GitHub にすべてのコードをプッシュ

### ❌ 未解決の問題
本番サーバー（210.131.222.152）に最新コードがデプロイされていない

---

## 🚀 解決方法：ワンコマンドデプロイ

### ✨ 推奨：完全自動デプロイ

**このコマンド1つで、すべて自動修正されます！**

```bash
ssh root@210.131.222.152 'cd /var/www/goodfifeproject && git fetch origin && git reset --hard origin/genspark_ai_developer && chmod +x fix-all-v2.sh && ./fix-all-v2.sh'
```

**実行時間:** 約10〜15分  
**必要な操作:** なし（全自動）

---

## 📦 fix-all-v2.sh が実行する処理

### 1. コード更新
```bash
git fetch origin
git reset --hard origin/genspark_ai_developer
```

### 2. バックエンド修正
```bash
cd server
npm install                      # 依存関係インストール
npm run build                    # TypeScript → JavaScript ビルド
# .env ファイル作成（DB接続情報設定）
mysql < migrations/*.sql         # データベースマイグレーション
pm2 start npm --name "goodfife-backend" -- start
```

### 3. フロントエンド修正
```bash
cd client
rm -rf .next node_modules/.cache  # キャッシュクリア
npm install                       # 依存関係インストール
# .env.local 作成（API URL設定）
npm run build                     # Next.js ビルド
pm2 start npm --name "goodfife-frontend" -- start -- -p 3000
```

### 4. 確認
```bash
pm2 status                        # プロセス状態確認
curl http://localhost:5000/api/health  # API動作確認
curl http://localhost:3000        # フロントエンド確認
```

---

## ✅ デプロイ後の確認手順

### 1. SSH接続して状態確認
```bash
ssh root@210.131.222.152
pm2 status
```

**期待される出力:**
```
┌─────────────────────┬──────┬─────────┬──────┐
│ name                │ mode │ status  │ cpu  │
├─────────────────────┼──────┼─────────┼──────┤
│ goodfife-backend    │ N/A  │ online  │ 0%   │
│ goodfife-frontend   │ N/A  │ online  │ 0%   │
└─────────────────────┴──────┴─────────┴──────┘
```

### 2. ログ確認（エラーがないか）
```bash
pm2 logs goodfife-backend --lines 20
pm2 logs goodfife-frontend --lines 20
```

### 3. ポート確認
```bash
netstat -tlnp | grep -E '3000|5000'
```

**期待される出力:**
```
tcp6  0  0 :::5000  :::*  LISTEN  1234/node
tcp6  0  0 :::3000  :::*  LISTEN  5678/node
```

### 4. API動作確認
```bash
curl http://localhost:5000/api/health
```

**期待される出力:**
```json
{"status":"ok"}
```

### 5. ブラウザでアクセス
**URL:** http://210.131.222.152:3000/admin/login

**重要:** 必ず `Ctrl + Shift + R` でキャッシュクリアしてからアクセス！

---

## 🔐 管理画面ログイン情報

| 項目 | 情報 |
|------|------|
| **URL** | http://210.131.222.152:3000/admin/login |
| **電話番号** | 09000000000 |
| **パスワード** | admin123 |

**⚠️ セキュリティ注意:**  
初回ログイン後、必ずパスワードを変更してください！

---

## 🎯 CTI受注機能の使い方

1. 管理画面にログイン
2. 右上の緑色の「**受注**」ボタンをクリック
3. 電話番号で顧客を検索
4. 顧客情報を確認/新規登録
5. キャストを選択
6. 受注内容を確認して登録

---

## 🛠️ トラブルシューティング

### ❌ エラー: "TypeError: Failed to fetch"
**原因:** バックエンドAPIが起動していない、またはブラウザキャッシュ

**解決方法:**
1. サーバーでバックエンドの状態確認
   ```bash
   ssh root@210.131.222.152
   pm2 status
   pm2 logs goodfife-backend --lines 50
   ```

2. バックエンドが停止している場合
   ```bash
   cd /var/www/goodfifeproject
   ./fix-all-v2.sh
   ```

3. ブラウザのキャッシュクリア
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)
   - または開発者ツール（F12）→ Application → Clear storage

### ❌ エラー: "404 /_next/static/..."
**原因:** Next.jsのビルドファイルが不完全

**解決方法:**
```bash
ssh root@210.131.222.152
cd /var/www/goodfifeproject
./emergency-fix.sh
```

### ❌ エラー: "[PM2][ERROR] Interpreter ts-node is NOT AVAILABLE"
**原因:** ts-nodeで直接実行しようとしている

**解決方法:**
```bash
ssh root@210.131.222.152
cd /var/www/goodfifeproject
./fix-all-v2.sh  # ← TypeScriptをビルドしてから実行
```

**詳細:** `TS_NODE_FIX.md` を参照

### ❌ データベース接続エラー
**確認:**
```bash
mysql -u hitozumano_mitu -p'Hjmitsu^90' -D hitozumano_mitu -e "SHOW TABLES;"
```

**マイグレーション再実行:**
```bash
cd /var/www/goodfifeproject
mysql -u hitozumano_mitu -p'Hjmitsu^90' -D hitozumano_mitu < server/migrations/create_admin_user.sql
mysql -u hitozumano_mitu -p'Hjmitsu^90' -D hitozumano_mitu < server/migrations/create_customer_management_tables.sql
```

---

## 📚 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| **FINAL_DEPLOY_SOLUTION.md** | 📄 このファイル - 完全デプロイガイド |
| **TS_NODE_FIX.md** | ts-node エラーの解決方法 |
| **QUICK_FIX.md** | Next.js ビルドエラーの緊急修正 |
| **ADMIN_CREDENTIALS.md** | 管理者ログイン情報 |
| **DEPLOYMENT_GUIDE.md** | 詳細なデプロイ手順 |
| **README_DEPLOY.md** | デプロイの簡易ガイド |

---

## 🚀 デプロイスクリプト一覧

| スクリプト | 用途 | 実行時間 |
|-----------|------|---------|
| **fix-all-v2.sh** | 🎯 完全修正（推奨） | 10〜15分 |
| **emergency-fix.sh** | フロントエンドのビルドエラー修正 | 5〜10分 |
| **fix-backend.sh** | バックエンドのみ修正 | 3〜5分 |
| **deploy.sh** | 基本デプロイ（旧版） | 5〜10分 |

---

## 📍 URL一覧

| サービス | URL |
|---------|-----|
| **管理画面（ログイン）** | http://210.131.222.152:3000/admin/login |
| **管理画面（ダッシュボード）** | http://210.131.222.152:3000/admin |
| **バックエンドAPI** | http://210.131.222.152:5000/api |
| **APIヘルスチェック** | http://210.131.222.152:5000/api/health |
| **ブランドトップ** | http://210.131.222.152/ |
| **西船橋店** | http://210.131.222.152/nishifuna |
| **錦糸町店** | http://210.131.222.152/kinshicho |
| **葛西店** | http://210.131.222.152/kasai |
| **松戸店** | http://210.131.222.152/matsudo |

---

## 🎯 まとめ

### 今すぐやること（1コマンド）
```bash
ssh root@210.131.222.152 'cd /var/www/goodfifeproject && git fetch origin && git reset --hard origin/genspark_ai_developer && chmod +x fix-all-v2.sh && ./fix-all-v2.sh'
```

### 確認すること
1. ✅ `pm2 status` で両方 online
2. ✅ `pm2 logs` でエラーなし
3. ✅ ブラウザで管理画面にアクセス（キャッシュクリア忘れずに！）
4. ✅ 「受注」ボタンが表示される

### 問題が起きたら
1. 📄 該当するドキュメント参照（上記一覧）
2. 🔍 PM2ログ確認 (`pm2 logs`)
3. 🔄 スクリプト再実行 (`./fix-all-v2.sh`)

---

## 📞 サポート

問題が解決しない場合は、以下の情報を提供してください：

```bash
# 1. PM2ステータス
pm2 status

# 2. バックエンドログ（最新50行）
pm2 logs goodfife-backend --lines 50 --nostream

# 3. フロントエンドログ（最新50行）
pm2 logs goodfife-frontend --lines 50 --nostream

# 4. ポート状態
netstat -tlnp | grep -E '3000|5000'

# 5. プロセス確認
ps aux | grep -E 'node|npm'

# 6. ビルドファイル確認
ls -la /var/www/goodfifeproject/server/dist/
ls -la /var/www/goodfifeproject/client/.next/

# 7. 環境変数確認
cat /var/www/goodfifeproject/server/.env
cat /var/www/goodfifeproject/client/.env.local
```

---

**最終更新:** 2024-12-13  
**GitHub PR:** https://github.com/rothspit/goodfifeproject/pull/1  
**ブランチ:** genspark_ai_developer  
**最新コミット:** 763541b
