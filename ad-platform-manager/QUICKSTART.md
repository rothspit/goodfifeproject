# 広告媒体一括更新システム - クイックスタート

**⏱️ 所要時間**: 約5分

---

## 🚀 最速起動手順

### 1. バックエンド起動（1分）

```bash
# バックエンドディレクトリへ移動
cd /home/user/webapp/ad-platform-manager/backend

# 依存関係インストール
npm install

# Playwrightブラウザインストール（初回のみ）
npx playwright install chromium
npx playwright install-deps

# 開発サーバー起動
npm run dev
```

**✅ 起動確認**: `http://localhost:5001/health` にアクセス

期待されるレスポンス:
```json
{
  "status": "ok",
  "service": "広告媒体一括更新システム API",
  "version": "1.0.0",
  "timestamp": "2025-12-16T07:35:00.000Z"
}
```

---

### 2. フロントエンド起動（1分）

**別のターミナルで実行:**

```bash
# フロントエンドディレクトリへ移動
cd /home/user/webapp/ad-platform-manager/frontend

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

**✅ 起動確認**: `http://localhost:3010` にアクセス

---

## 🎯 動作確認（3分）

### 1. 広告媒体一覧確認

1. ブラウザで `http://localhost:3010` を開く
2. 「📡 広告媒体管理」タブをクリック
3. シティヘブンネット、デリヘルタウンが表示されることを確認

### 2. 配信テスト

1. 「🚀 一括配信」タブをクリック
2. 配信タイプ「👩 キャスト情報」を選択
3. 「シティヘブンネット」にチェック
4. 「🚀 1媒体に配信」ボタンをクリック
5. 配信結果が表示されることを確認

### 3. ログ確認

1. 「📊 配信ログ」タブをクリック
2. 配信履歴が表示されることを確認

---

## 🔧 トラブルシューティング

### ポートが既に使用されている

#### バックエンド (5001)
```bash
# 5001ポートを使用しているプロセスを確認
lsof -i :5001

# 必要に応じてプロセスを終了
kill -9 <PID>
```

#### フロントエンド (3010)
```bash
# 3010ポートを使用しているプロセスを確認
lsof -i :3010

# 必要に応じてプロセスを終了
kill -9 <PID>
```

### データベース接続エラー

**.envファイルを確認:**
```bash
cd /home/user/webapp/ad-platform-manager/backend
cat .env
```

**必要な設定:**
```
DB_HOST=162.43.91.102
DB_PORT=3306
DB_USER=hitozumano_mitu
DB_PASSWORD=Hjmitsu^90
DB_NAME=hitozumano_mitu
```

### Playwrightエラー

```bash
# システム依存関係を再インストール
cd /home/user/webapp/ad-platform-manager/backend
npx playwright install-deps

# Chromiumブラウザを再インストール
npx playwright install chromium
```

---

## 📚 次のステップ

### 開発を続ける

1. **新しい広告媒体を追加**
   - `backend/src/services/platforms/` に新しいサービスクラスを作成
   - HeavenNetService.ts を参考にする

2. **UIをカスタマイズ**
   - `frontend/app/components/` のコンポーネントを編集
   - Tailwind CSSでスタイル調整

3. **APIを拡張**
   - `backend/src/controllers/` にコントローラーを追加
   - `backend/src/routes/` にルートを追加

### ドキュメント

- **完全ガイド**: [README.md](README.md)
- **システム概要**: `/home/user/webapp/AD_PLATFORM_SYSTEM_SUMMARY.md`
- **進捗レポート**: `/home/user/webapp/AD_PLATFORM_PROGRESS_REPORT.md`

---

## 🎉 完了！

これで広告媒体一括更新システムが起動しました。

**管理画面**: http://localhost:3010  
**API**: http://localhost:5001

お疲れさまでした！
