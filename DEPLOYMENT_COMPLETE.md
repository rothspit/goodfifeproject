# 🎉 デプロイ完了報告 - 受注データインポートシステム

**デプロイ日時**: 2025-12-16 00:30 JST  
**ステータス**: ✅ デプロイ成功

---

## ✅ デプロイ完了項目

### 1. バックエンド (Backend) ✅
- ✅ `orderImportController.js` → `/var/www/goodfifeproject/server/dist/controllers/`
- ✅ `orderImport.js` (routes) → `/var/www/goodfifeproject/server/dist/routes/`
- ✅ `database.ts` (updated with orders table) → `/var/www/goodfifeproject/server/src/config/`
- ✅ ルート登録済み: `/api/order-import` は `index.js` に登録済み
- ✅ バックエンド再起動完了 (PM2 PID: 42878)
- ✅ APIエンドポイント動作確認: 認証レスポンス正常

### 2. フロントエンド (Frontend) ✅
- ✅ `page.tsx` → `/var/www/goodfifeproject/client/app/admin/order-import/`
- ✅ `layout.tsx` (updated) → `/var/www/goodfifeproject/client/app/admin/`
- ✅ メニュー項目「受注データインポート」追加済み
- ✅ フロントエンド再起動完了 (PM2 PID: 43002)

### 3. PM2 サービス状態 ✅
```
┌────┬──────────────────────┬────────┬───────────┐
│ id │ name                 │ status │ cpu/mem   │
├────┼──────────────────────┼────────┼───────────┤
│ 1  │ goodfife-backend     │ online │ 0% / 56MB │
│ 0  │ goodfife-frontend    │ online │ 0% / 61MB │
└────┴──────────────────────┴────────┴───────────┘
```

---

## 🔧 必須設定: Google API Key

### ⚠️ 重要: このステップを完了しないとインポート機能が使えません

Google Sheets APIを使用するため、APIキーの設定が必要です。

### 手順:

#### 1. Google Cloud Console でAPIキーを取得

1. https://console.cloud.google.com/ にアクセス
2. プロジェクトを選択（または新規作成）
3. 左メニュー「APIとサービス」→「ライブラリ」
4. 「Google Sheets API」を検索して有効化
5. 「認証情報」→「認証情報を作成」→「APIキー」
6. 生成されたAPIキーをコピー

#### 2. サーバーに環境変数を設定

```bash
# サーバーにSSH接続
ssh -i /home/user/uploaded_files/WIFEHP.pem root@210.131.222.152

# .envファイルを編集
cd /var/www/goodfifeproject/server
nano .env

# 以下の行を追加（your_api_key_here を実際のキーに置き換え）
GOOGLE_API_KEY=your_api_key_here

# Ctrl+O で保存、Ctrl+X で終了

# バックエンドを再起動
pm2 restart goodfife-backend

# 完了！
exit
```

---

## 🚀 使い方

### 1. 管理画面にアクセス

URL: **https://crm.h-mitsu.com/admin**

ログイン:
- 電話番号: `09000000000`
- パスワード: `Admin@2025`

### 2. 左メニューから「受注データインポート」をクリック

新しいメニュー項目が追加されています（アップロードアイコン付き）

### 3. Googleスプレッドシートを準備

#### スプレッドシートのフォーマット:

| A列: 名前 | B列: 電話番号 | C列: 金額 | D列: 利用場所 | E列: キャスト | F列: オプション | G列: メモ |
|----------|-------------|---------|------------|-----------|------------|---------|
| 山田太郎 | 09012345678 | 30000   | 新宿ホテル  | あいり     | 3Pコース    | 次回割引 |
| 田中花子 | 08098765432 | 25000   | 自宅       | みゆき     | 延長1時間   | VIP会員 |

#### 共有設定:
1. スプレッドシートを開く
2. 右上「共有」ボタンをクリック
3. 「リンクを知っている全員」に変更
4. 「閲覧者」権限でOK

#### スプレッドシートIDを取得:
URLから取得します:
```
https://docs.google.com/spreadsheets/d/【このID部分をコピー】/edit
```

### 4. インポート実行

1. スプレッドシートIDを貼り付け
2. データ範囲を確認（デフォルト: `A:H`）
3. 受注日を選択
4. 年度と月を選択
5. 「スプレッドシートからデータを取得」ボタンをクリック
6. プレビューテーブルでデータを確認
7. 「データベースにインポート」ボタンで完了！

---

## 📊 機能説明

### 自動リンク機能
- 電話番号で既存顧客を自動検索
- 既存顧客: 受注履歴に追加
- 新規顧客: 自動登録

### 電話番号正規化
- ハイフン、括弧、スペースを自動除去
- 数字のみに統一

### エラーハンドリング
- 電話番号不正: エラーリストに表示
- トランザクション処理: エラー時は全てロールバック
- 詳細なエラーメッセージ表示

---

## 🔌 APIエンドポイント

すべて認証（Bearer Token）が必要です。

### 1. データ取得
```http
POST /api/order-import/fetch
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "spreadsheetId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  "range": "A:H"
}

Response:
{
  "success": true,
  "header": ["名前", "電話番号", ...],
  "data": [...],
  "count": 10
}
```

### 2. データインポート
```http
POST /api/order-import/import
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "orders": [
    {
      "name": "山田太郎",
      "phone": "09012345678",
      "amount": 30000,
      "location": "新宿ホテル",
      "cast": "あいり",
      "options": "3Pコース",
      "memo": "次回割引"
    }
  ],
  "orderDate": "2025-12-15",
  "fiscalYear": 2025,
  "fiscalMonth": 12
}

Response:
{
  "success": true,
  "message": "10件のデータをインポートしました",
  "imported": 10,
  "errors": []
}
```

### 3. 顧客受注履歴取得
```http
GET /api/order-import/customer/{customerId}?fiscalYear=2025&fiscalMonth=12
Authorization: Bearer {token}

Response:
{
  "success": true,
  "orders": [...],
  "count": 5
}
```

### 4. 統計情報取得
```http
GET /api/order-import/statistics?fiscalYear=2025&fiscalMonth=12
Authorization: Bearer {token}

Response:
{
  "success": true,
  "statistics": [
    {
      "fiscal_year": 2025,
      "fiscal_month": 12,
      "order_count": 50,
      "total_amount": 1500000,
      "avg_amount": 30000,
      "unique_customers": 35
    }
  ]
}
```

---

## 🗄️ データベーステーブル: `orders`

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,                          -- 顧客ID (自動リンク)
  customer_name VARCHAR(100) NOT NULL,  -- 顧客名
  customer_phone VARCHAR(20) NOT NULL,  -- 電話番号
  amount INT NOT NULL,                  -- 金額
  location VARCHAR(255),                -- 利用場所
  cast_name VARCHAR(100),               -- キャスト名
  options TEXT,                         -- オプション
  memo TEXT,                            -- メモ
  order_date DATE NOT NULL,             -- 受注日
  fiscal_year INT NOT NULL,             -- 年度
  fiscal_month INT NOT NULL,            -- 月
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_customer_phone (customer_phone),
  INDEX idx_order_date (order_date),
  INDEX idx_fiscal (fiscal_year, fiscal_month)
);
```

---

## ✅ テスト方法

### 1. APIエンドポイントテスト

```bash
# 認証なしテスト（401エラーが正常）
curl -X POST https://crm.h-mitsu.com/api/order-import/fetch \
  -H "Content-Type: application/json" \
  -d '{"spreadsheetId":"test"}'

# 期待される結果: {"message":"認証トークンがありません"}
```

### 2. フロントエンドテスト

1. https://crm.h-mitsu.com/admin にアクセス
2. ログイン
3. 左メニューに「受注データインポート」が表示されるか確認
4. クリックしてページが開くか確認

### 3. 完全テスト（Google API Key設定後）

1. テスト用Googleスプレッドシートを作成
2. サンプルデータを入力
3. 共有設定を「リンクを知っている全員」に変更
4. 管理画面からインポート実行
5. データベースを確認:
   ```bash
   ssh root@210.131.222.152
   mysql -u root -p goodfife_db
   SELECT * FROM orders LIMIT 10;
   ```

---

## 🐛 トラブルシューティング

### エラー: "スプレッドシートの取得に失敗しました"

**原因1**: Google API Key未設定
→ 上記「必須設定」を実行してください

**原因2**: スプレッドシートが非公開
→ 共有設定を「リンクを知っている全員」に変更

**原因3**: スプレッドシートIDが間違っている
→ URLから正しいIDをコピー

### エラー: "認証トークンがありません"

管理画面からログインしてください。

### エラー: "データのインポートに失敗しました"

**原因**: データベース接続エラー

```bash
# データベース状態確認
ssh root@210.131.222.152
mysql -u root -p
SHOW DATABASES;
USE goodfife_db;
SHOW TABLES;
```

### メニューに「受注データインポート」が表示されない

フロントエンドを再起動:
```bash
ssh root@210.131.222.152
pm2 restart goodfife-frontend
```

ブラウザのキャッシュをクリア:
- Chrome: Ctrl+Shift+R (強制リロード)

---

## 📋 チェックリスト

デプロイ後に確認:

- [x] バックエンドファイルがデプロイされている
- [x] フロントエンドファイルがデプロイされている
- [x] PM2でバックエンドが起動している
- [x] PM2でフロントエンドが起動している
- [x] APIエンドポイントが応答する
- [ ] **Google API Keyを設定する（必須！）**
- [ ] 管理画面で「受注データインポート」メニューが表示される
- [ ] テストインポートを実行して動作確認

---

## 🎯 次のステップ

### 1. 今すぐやること
**Google API Keyの設定**（上記「必須設定」参照）

### 2. テスト
- サンプルスプレッドシートでインポートテスト
- エラーハンドリングの確認
- 顧客ページで受注履歴が表示されるか確認

### 3. 本番運用
- 実際のデータでインポート開始
- 定期的なバックアップ設定
- 統計機能の活用

---

## 📞 サポート

問題が発生した場合:

1. **ログ確認**
   ```bash
   ssh root@210.131.222.152
   pm2 logs goodfife-backend --lines 50
   pm2 logs goodfife-frontend --lines 50
   ```

2. **データベース確認**
   ```bash
   mysql -u root -p goodfife_db
   SHOW TABLES;
   SELECT * FROM orders LIMIT 10;
   ```

3. **APIテスト**
   ```bash
   curl https://crm.h-mitsu.com/api/order-import/fetch
   ```

---

## 🎉 まとめ

### ✅ デプロイ完了
- バックエンド: `/api/order-import` エンドポイント稼働中
- フロントエンド: 管理画面に新メニュー追加済み
- データベース: `orders` テーブル準備完了

### ⚠️ 次に必要なこと
**Google API Keyの設定**を完了してください。

### 🚀 準備完了後
すぐにGoogleスプレッドシートからの受注データインポートが利用可能になります！

---

**デプロイ実施者**: GenSpark AI Developer  
**デプロイ日時**: 2025-12-16 00:30 JST  
**ステータス**: ✅ 成功（Google API Key設定待ち）
