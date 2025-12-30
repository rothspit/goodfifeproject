# 受注データインポートシステム - 実装完了

## 📋 概要

Googleスプレッドシートから顧客の受注データを一括インポートするシステムを実装しました。

## ✅ 実装済み機能

### 1. データ項目 (スプレッドシート列)

| 列 | 項目名 | 説明 |
|----|--------|------|
| A | 名前 | 顧客名 |
| B | 番号（電話番号） | 顧客の電話番号（自動正規化） |
| C | 金額 | 受注金額 |
| D | 利用場所 | ホテル名または自宅 |
| E | 利用キャスト | 担当キャスト名 |
| F | 利用オプション | 利用されたオプションサービス |
| G | メモ注意事項 | 備考・注意事項 |
| - | 受注日 | インポート時に年月日を指定 |

### 2. バックエンド実装

#### ファイル: `server/src/controllers/orderImportController.ts`

```typescript
// 3つの主要エンドポイント:

1. fetchSheetData() - Googleスプレッドシートからデータを取得
   POST /api/order-import/fetch
   { spreadsheetId, range }

2. importOrders() - データをデータベースにインポート
   POST /api/order-import/import
   { orders[], orderDate, fiscalYear, fiscalMonth }

3. getCustomerOrders() - 顧客の受注履歴を取得
   GET /api/order-import/customer/:customerId

4. getOrderStatistics() - 年度・月ごとの統計
   GET /api/order-import/statistics
```

#### データベーステーブル: `orders`

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,                      -- 顧客ID（自動リンク）
  customer_name VARCHAR(100),       -- 顧客名
  customer_phone VARCHAR(20),       -- 電話番号（正規化済み）
  amount INT,                       -- 金額
  location VARCHAR(255),            -- 利用場所（ホテル名/自宅）
  cast_name VARCHAR(100),           -- キャスト名
  options TEXT,                     -- オプション
  memo TEXT,                        -- メモ
  order_date DATE,                  -- 受注日
  fiscal_year INT,                  -- 年度
  fiscal_month INT,                 -- 月
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3. フロントエンド実装

#### ファイル: `client/app/admin/order-import/page.tsx`

- **スプレッドシート設定フォーム**
  - スプレッドシートID入力
  - データ範囲指定（デフォルト: A:H）
  - 受注日、年度、月の選択

- **データプレビュー**
  - インポート前のデータ確認テーブル
  - 全7項目を一覧表示

- **インポート実行**
  - ワンクリックでデータベースに一括登録
  - エラー詳細表示

- **使い方ガイド**
  - ステップバイステップの手順
  - スプレッドシートフォーマット例

#### 管理画面メニューに追加済み
- **メニュー項目**: 「受注データインポート」
- **アイコン**: FiUpload (アップロード)
- **パス**: `/admin/order-import`

### 4. 自動リンク機能

- **電話番号による顧客識別**
  - 電話番号で既存顧客を自動検索
  - 既存顧客の場合: `user_id` を自動リンク
  - 新規顧客の場合: `users` テーブルに自動登録

- **電話番号正規化**
  - ハイフン、括弧などを自動除去
  - 数字のみに統一

### 5. 年度・月管理

- 受注データを年度・月単位で管理
- 統計API で集計可能:
  - 受注件数
  - 合計金額
  - 平均金額
  - ユニーク顧客数

## 🚀 デプロイ手順

### 必要な環境変数

```bash
# .env ファイルに追加
GOOGLE_API_KEY=your_google_api_key_here
```

### Google API設定

1. Google Cloud Console にアクセス
2. プロジェクトを作成または選択
3. Google Sheets API を有効化
4. 認証情報を作成 → APIキー
5. APIキーを `.env` に設定

### サーバーデプロイ

```bash
# 1. ファイルをサーバーにコピー
scp -r server/src/controllers/orderImportController.ts \
       server/src/routes/orderImport.ts \
       root@210.131.222.152:/var/www/goodfifeproject/server/src/

# 2. database.ts を更新
scp server/src/config/database.ts \
    root@210.131.222.152:/var/www/goodfifeproject/server/src/config/

# 3. index.ts にルートを登録 (既に完了)
# /api/order-import が登録済み

# 4. googleapis パッケージをインストール (既に完了)
ssh root@210.131.222.152 "cd /var/www/goodfifeproject/server && npm install googleapis"

# 5. ビルド＆再起動
ssh root@210.131.222.152 "cd /var/www/goodfifeproject/server && \
  NODE_OPTIONS='--max-old-space-size=4096' npm run build && \
  pm2 restart goodfife-backend"
```

### フロントエンドデプロイ

```bash
# 1. ファイルをサーバーにコピー
scp -r client/app/admin/order-import \
       root@210.131.222.152:/var/www/goodfifeproject/client/app/admin/

# 2. layout.tsx を更新
scp client/app/admin/layout.tsx \
    root@210.131.222.152:/var/www/goodfifeproject/client/app/admin/

# 3. ビルド＆再起動
ssh root@210.131.222.152 "cd /var/www/goodfifeproject/client && \
  npm run build && \
  pm2 restart goodfife-frontend"
```

## 📝 使い方

### 1. Googleスプレッドシート準備

```
A列: 名前 | B列: 電話番号 | C列: 金額 | D列: 利用場所 | E列: キャスト | F列: オプション | G列: メモ
----------|-------------|---------|------------|-----------|------------|--------
山田太郎  | 09012345678 | 30000   | 新宿ホテル  | あいり     | 3Pコース    | 次回割引
田中花子  | 08098765432 | 25000   | 自宅       | みゆき     | 延長1時間   | VIP会員
```

### 2. スプレッドシート共有設定

- スプレッドシートを開く
- 「共有」→「リンクを知っている全員」に変更
- URLからスプレッドシートIDをコピー
  ```
  https://docs.google.com/spreadsheets/d/【このID部分】/edit
  ```

### 3. 管理画面でインポート

1. `https://crm.h-mitsu.com/admin` にログイン
2. 左メニュー「受注データインポート」をクリック
3. スプレッドシートIDを貼り付け
4. データ範囲を確認（デフォルト: A:H）
5. 受注日、年度、月を選択
6. 「データを取得」ボタンをクリック
7. プレビューを確認
8. 「インポート」ボタンで登録完了

### 4. 顧客ページで受注履歴を確認

- 顧客詳細ページに受注履歴が自動表示
- 電話番号で自動リンク
- 年月でフィルタリング可能

## 🔧 トラブルシューティング

### エラー: "スプレッドシートの取得に失敗しました"

**原因**: 
- スプレッドシートIDが間違っている
- 共有設定が「制限付き」になっている
- GOOGLE_API_KEY が設定されていない

**解決方法**:
1. スプレッドシートURLからIDを再確認
2. 「リンクを知っている全員」に共有設定を変更
3. `.env` に `GOOGLE_API_KEY` を設定

### エラー: "電話番号が不正です"

**原因**: 電話番号が空欄または数字以外の文字のみ

**解決方法**:
- スプレッドシートのB列に正しい電話番号を入力
- ハイフンや括弧は自動で除去されるのでそのままでOK

### エラー: "データのインポートに失敗しました"

**原因**: データベース接続エラーまたはテーブル未作成

**解決方法**:
1. データベースが起動しているか確認
2. `orders` テーブルが作成されているか確認:
   ```sql
   SHOW TABLES LIKE 'orders';
   ```
3. 必要に応じてテーブルを作成（`database.ts` 参照）

## 📊 API エンドポイント

### 1. データ取得
```http
POST /api/order-import/fetch
Content-Type: application/json
Authorization: Bearer {token}

{
  "spreadsheetId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  "range": "A:H"
}
```

### 2. データインポート
```http
POST /api/order-import/import
Content-Type: application/json
Authorization: Bearer {token}

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
```

### 3. 顧客の受注履歴取得
```http
GET /api/order-import/customer/:customerId?fiscalYear=2025&fiscalMonth=12
Authorization: Bearer {token}
```

### 4. 統計取得
```http
GET /api/order-import/statistics?fiscalYear=2025&fiscalMonth=12
Authorization: Bearer {token}
```

## 🎯 次のステップ

### 推奨される機能拡張

1. **CSV インポート対応**
   - Googleスプレッドシートに加えて、CSVファイルからのインポート

2. **受注データ一覧画面**
   - `/admin/orders` で全受注データを表示
   - 年月でフィルタリング
   - エクスポート機能

3. **統計ダッシュボード**
   - 月次売上グラフ
   - キャスト別売上ランキング
   - オプション利用率

4. **自動バックアップ**
   - 定期的にデータベースをGoogleスプレッドシートにエクスポート

## 📝 コミット情報

```
commit 06602c2
Author: rothspit
Date: 2025-12-15

feat: add Google Spreadsheet order import system

- Created order import controller with Google Sheets API integration
- Added orders table to database schema for import data storage
- Built admin order import UI with preview and validation
- Implemented data import with customer auto-linking by phone number
- Added fiscal year/month tracking for order management
- Registered /api/order-import routes in server index
```

## 📞 サポート

問題が発生した場合:
1. ブラウザの開発者コンソール（F12）でエラーを確認
2. サーバーログを確認: `ssh root@210.131.222.152 "pm2 logs goodfife-backend --lines 50"`
3. データベース接続を確認

---

**実装完了日**: 2025-12-15  
**バージョン**: 1.0.0  
**ステータス**: ✅ 実装完了（デプロイ待ち）
