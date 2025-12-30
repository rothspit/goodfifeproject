# ts-node エラー修正ガイド

## ❌ エラー内容
```
[PM2][ERROR] Interpreter ts-node is NOT AVAILABLE in PATH.
```

## 🔍 原因
PM2がTypeScriptファイルを直接実行しようとしているが、`ts-node`がインストールされていないか、PATHに存在しない。

## ✅ 解決方法

### 推奨: ビルド版スクリプト実行

本番環境では **TypeScriptをビルドしてJavaScriptで実行** するのがベストプラクティスです。

```bash
ssh root@210.131.222.152
cd /var/www/goodfifeproject
git fetch origin
git reset --hard origin/genspark_ai_developer
chmod +x fix-all-v2.sh
./fix-all-v2.sh
```

**このスクリプトが実行する内容:**
1. ✅ TypeScriptをJavaScriptにビルド (`npm run build`)
2. ✅ ビルドされたJavaScriptを実行 (`node dist/index.js`)
3. ✅ ts-nodeは不要

---

## 📋 手動修正手順

### ステップ1: バックエンドのビルド

```bash
cd /var/www/goodfifeproject/server
npm install
npm run build  # TypeScript → JavaScriptへコンパイル
```

### ステップ2: PM2でJavaScriptを実行

```bash
# 古いプロセスを削除
pm2 stop goodfife-backend
pm2 delete goodfife-backend

# ビルドされたJavaScriptで起動
pm2 start dist/index.js --name "goodfife-backend"

# または package.jsonのstartスクリプトを使用
pm2 start npm --name "goodfife-backend" -- start
```

### ステップ3: 確認

```bash
pm2 status
pm2 logs goodfife-backend --lines 20
curl http://localhost:5000/api/health
netstat -tlnp | grep 5000
```

---

## 🛠️ package.json の設定

バックエンドの`server/package.json`が以下のように設定されていることを確認:

```json
{
  "scripts": {
    "dev": "nodemon --watch src --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

**説明:**
- `dev`: 開発環境用（ts-node使用）
- `build`: TypeScriptをJavaScriptにコンパイル
- `start`: 本番環境用（コンパイル済みJavaScriptを実行）

---

## 🔄 ビルドプロセスの流れ

```
src/index.ts         →  [npm run build]  →  dist/index.js
src/controllers/*.ts →  [tsc compiler]   →  dist/controllers/*.js
src/routes/*.ts      →                   →  dist/routes/*.js
```

**tsconfig.json設定:**
```json
{
  "compilerOptions": {
    "outDir": "./dist",      // 出力先
    "rootDir": "./src"       // ソース元
  }
}
```

---

## ⚡ クイックコマンド集

### 完全修正（推奨）
```bash
ssh root@210.131.222.152 'cd /var/www/goodfifeproject && git fetch origin && git reset --hard origin/genspark_ai_developer && chmod +x fix-all-v2.sh && ./fix-all-v2.sh'
```

### バックエンドのみ再起動
```bash
cd /var/www/goodfifeproject/server
npm run build
pm2 restart goodfife-backend
```

### フルリビルド
```bash
cd /var/www/goodfifeproject/server
rm -rf dist node_modules
npm install
npm run build
pm2 delete goodfife-backend
pm2 start dist/index.js --name "goodfife-backend"
```

---

## 🆘 それでもエラーが出る場合

### 1. TypeScriptがインストールされているか確認
```bash
cd /var/www/goodfifeproject/server
npm list typescript
```

### 2. ビルドエラーをチェック
```bash
cd /var/www/goodfifeproject/server
npm run build 2>&1 | tee build.log
```

### 3. dist/フォルダが存在するか確認
```bash
ls -la /var/www/goodfifeproject/server/dist/
# index.js, controllers/, routes/ などが存在するはず
```

### 4. PM2ログを確認
```bash
pm2 logs goodfife-backend --lines 50
pm2 logs goodfife-backend --err --lines 50
```

---

## 📌 重要ポイント

| 環境 | 実行方法 | 必要なもの |
|------|----------|-----------|
| **開発** | `ts-node src/index.ts` | ts-node, typescript |
| **本番** | `node dist/index.js` | ビルド済みJS |

**本番環境では:**
- ❌ `ts-node`を使わない
- ✅ `npm run build`でビルド
- ✅ `node dist/index.js`で実行

---

## 📍 アクセス情報（修正後）

| 項目 | URL / 情報 |
|------|-----------|
| 管理画面 | http://210.131.222.152:3000/admin/login |
| 電話番号 | 09000000000 |
| パスワード | admin123 |
| バックエンドAPI | http://210.131.222.152:5000/api |

**ブラウザで `Ctrl + Shift + R` を押してキャッシュクリア！**

---

## 🎯 まとめ

1. **fix-all-v2.sh** を実行すれば、すべて自動修正されます
2. 本番環境では **TypeScriptをビルドしてから実行** が鉄則
3. `ts-node`は開発環境専用で、本番では不要

**最新コード:** GitHub PR #1  
**ブランチ:** genspark_ai_developer  
**デプロイスクリプト:** fix-all-v2.sh
