# 🚨 緊急修正ガイド - Next.jsビルドエラー対応

## 問題
画面に以下のようなエラーが表示されています：
```
Failed to load resource: the server responded with a status of 404 (Not Found)
- app-pages-internals.js
- layout.js
- main-app.js
- 300%2ffavicon.ico
```

これは**Next.jsのビルドファイルが見つからない**エラーです。

---

## 🚀 解決方法

### **方法1: 緊急修正スクリプトを実行（最も確実）**

サーバーにログインして以下を実行してください：

```bash
ssh root@210.131.222.152
cd /var/www/goodfifeproject
./emergency-fix.sh
```

このスクリプトは以下を実行します：
- ✅ 古いビルドファイルを完全削除
- ✅ node_modulesを完全削除・再インストール
- ✅ npmキャッシュをクリア
- ✅ 環境変数を正しく設定
- ✅ Next.jsを完全再ビルド
- ✅ PM2プロセスを完全再作成

**所要時間**: 約5-10分

---

### **方法2: 手動で修正（コピペ）**

サーバーにログイン後、以下をすべてコピペして実行：

```bash
cd /var/www/goodfifeproject/client && \
rm -rf .next node_modules .cache && \
npm cache clean --force && \
npm install && \
cat > .env.local << 'ENVEOF'
NEXT_PUBLIC_API_URL=http://210.131.222.152:5000/api
NEXT_PUBLIC_SOCKET_URL=http://210.131.222.152:5000
ENVEOF
npm run build && \
pm2 delete goodfife-frontend || true && \
pm2 start npm --name "goodfife-frontend" -- start -- -p 3000 && \
sleep 5 && \
pm2 status
```

---

### **方法3: 最小限の修正（最速）**

時間がない場合は、これだけ試してください：

```bash
ssh root@210.131.222.152
cd /var/www/goodfifeproject/client
rm -rf .next
npm run build
pm2 restart goodfife-frontend
```

---

## ✅ 修正完了の確認

修正後、以下を確認してください：

1. **PM2ステータス確認**
   ```bash
   pm2 status
   ```
   → `goodfife-frontend` が `online` になっていること

2. **ログ確認（エラーがないか）**
   ```bash
   pm2 logs goodfife-frontend --lines 20
   ```
   → エラーメッセージが出ていないこと

3. **ブラウザでアクセス**
   - URL: http://210.131.222.152:3000
   - **必ず強制リロード**: `Ctrl + Shift + R`

4. **管理画面ログイン**
   - URL: http://210.131.222.152:3000/admin/login
   - 電話番号: `09000000000`
   - パスワード: `admin123`

---

## 🐛 まだエラーが出る場合

### チェック1: ビルドが成功しているか
```bash
ls -la /var/www/goodfifeproject/client/.next
```
→ `.next` ディレクトリにファイルがたくさんあればOK

### チェック2: ポート3000が使われているか
```bash
netstat -tlnp | grep 3000
```
または
```bash
lsof -i :3000
```
→ Node.jsプロセスが表示されればOK

### チェック3: PM2ログでエラー確認
```bash
pm2 logs goodfife-frontend --lines 50
```

### チェック4: プロセスを完全再起動
```bash
pm2 delete goodfife-frontend
pm2 start npm --name "goodfife-frontend" -- start -- -p 3000
```

---

## 📞 サポート情報

上記すべてを試してもエラーが解消しない場合は、以下の情報を収集してください：

```bash
# 1. PM2ステータス
pm2 status

# 2. フロントエンドログ
pm2 logs goodfife-frontend --lines 50 > frontend-logs.txt

# 3. ビルドディレクトリ確認
ls -laR /var/www/goodfifeproject/client/.next | head -100

# 4. 環境変数確認
cat /var/www/goodfifeproject/client/.env.local

# 5. ポート確認
netstat -tlnp | grep 3000
```

---

**最終更新**: 2024-12-13
**緊急度**: 高
