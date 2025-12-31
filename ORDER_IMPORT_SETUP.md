# 受注データインポートシステム セットアップガイド

**日時**: 2025年12月15日  
**機能**: Googleスプレッドシートから顧客の受注情報をインポート

---

## 📋 実装内容

### データ項目
1. 名前
2. 番号（電話番号）
3. 金額
4. 利用場所（ホテル名または自宅）
5. 利用キャスト
6. 利用オプション
7. メモ・注意事項
8. 受注日（インポート時に指定）

### 機能
- Googleスプレッドシートからデータ取得
- 年度・月・日で受注管理
- 顧客自動登録（電話番号で紐付け）
- 顧客ページに受注履歴表示

---

## 🗄️ データベーステーブル

### orders テーブル
```sql
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  amount INT NOT NULL,
  location VARCHAR(255),              -- ホテル名または自宅
  cast_name VARCHAR(100),
  options TEXT,
  memo TEXT,
  order_date DATE NOT NULL,
  fiscal_year INT NOT NULL,
  fiscal_month INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_customer_phone (customer_phone),
  INDEX idx_order_date (order_date),
  INDEX idx_fiscal (fiscal_year, fiscal_month)
);
```

---

## 🚀 セットアップ手順

### 1. Google Sheets API設定

#### 方法A: APIキーを使用（簡単・推奨）

1. **Google Cloud Consoleにアクセス**
   ```
   https://console.cloud.google.com/
   ```

2. **プロジェクトを作成またはselect**

3. **Google Sheets APIを有効化**
   - APIs & Services → Library
   - "Google Sheets API"を検索
   - "Enable"をクリック

4. **APIキーを作成**
   - APIs & Services → Credentials
   - "Create Credentials" → "API Key"
   - APIキーをコピー

5. **サーバーの.envに追加**
   ```bash
   ssh root@210.131.222.152
   cd /var/www/goodfifeproject/server
   nano .env
   
   # 以下を追加:
   GOOGLE_API_KEY=your_api_key_here
   ```

#### 方法B: サービスアカウント（高度な設定）

1. Service Accountを作成
2. JSONキーファイルをダウンロード
3. サーバーにアップロード
4. `.env`に設定:
   ```
   GOOGLE_SERVICE_ACCOUNT_KEY=/path/to/service-account-key.json
   ```

---

### 2. スプレッドシートの準備

#### スプレッドシート形式

| 名前 | 番号 | 金額 | 利用場所 | 利用キャスト | 利用オプション | メモ |
|------|------|------|----------|--------------|----------------|------|
| 田中太郎 | 090-1234-5678 | 25000 | アパホテル西船橋 | さくら | 120分コース | 初回割引適用 |
| 佐藤花子 | 080-9876-5432 | 30000 | 自宅 | まゆみ | 90分コース+オプション | - |

#### スプレッドシートの公開設定

**APIキー使用の場合** (簡単):
1. スプレッドシートを開く
2. 右上の「共有」をクリック
3. 「リンクを知っている全員」に変更
4. 権限: 「閲覧者」

**サービスアカウント使用の場合**:
1. スプレッドシートを開く
2. 右上の「共有」をクリック
3. サービスアカウントのメールアドレスを追加
4. 権限: 「閲覧者」

---

### 3. バックエンドのデプロイ

```bash
# サーバーにSSH接続
ssh root@210.131.222.152

# バックエンドディレクトリ
cd /var/www/goodfifeproject/server

# Google Sheets APIパッケージをインストール（済み）
npm install googleapis

# データベーステーブルを作成
# バックエンドを再起動すると自動的に作成されます
pm2 restart goodfife-backend

# ログ確認
pm2 logs goodfife-backend
```

---

### 4. フロントエンドのデプロイ

```bash
# フロントエンドディレクトリ
cd /var/www/goodfifeproject/client

# ビルド
npm run build

# 再起動
pm2 restart goodfife-frontend
```

---

## 📱 使用方法

### 1. インポート画面にアクセス
```
https://crm.h-mitsu.com/admin/orders/import
```

### 2. スプレッドシートURLを入力
```
例: https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit
または スプレッドシートID: 1ABC...XYZ
```

### 3. データを取得
- 「データを取得」ボタンをクリック
- プレビューが表示される

### 4. 受注日を設定
- 受注日: 2025-12-15
- 年度: 2025
- 月: 12

### 5. インポート実行
- 「インポート実行」ボタンをクリック
- 完了メッセージが表示される

---

## 🔌 API エンドポイント

### スプレッドシートデータ取得
```
POST /api/order-import/fetch-sheet
Authorization: Bearer {token}

Body:
{
  "spreadsheetId": "1ABC...XYZ",
  "range": "A:G"
}

Response:
{
  "success": true,
  "data": [...],
  "count": 50
}
```

### データインポート
```
POST /api/order-import/import
Authorization: Bearer {token}

Body:
{
  "orders": [...],
  "orderDate": "2025-12-15",
  "fiscalYear": 2025,
  "fiscalMonth": 12
}

Response:
{
  "success": true,
  "imported": 50,
  "message": "50件のデータをインポートしました"
}
```

### 顧客の受注履歴取得
```
GET /api/order-import/customer/{customerId}
Authorization: Bearer {token}

Query Parameters:
- fiscalYear: 2025
- fiscalMonth: 12

Response:
{
  "success": true,
  "orders": [...],
  "count": 10
}
```

### 統計情報取得
```
GET /api/order-import/statistics
Authorization: Bearer {token}

Query Parameters:
- fiscalYear: 2025
- fiscalMonth: 12

Response:
{
  "success": true,
  "statistics": [...]
}
```

---

## 🔧 トラブルシューティング

### スプレッドシートが取得できない

**原因1**: スプレッドシートが非公開
- **解決**: スプレッドシートを公開設定にする

**原因2**: APIキーが未設定
- **解決**: `.env`に`GOOGLE_API_KEY`を追加

**原因3**: Google Sheets APIが無効
- **解決**: Google Cloud ConsoleでAPIを有効化

### インポートが失敗する

**原因1**: 電話番号フォーマットが不正
- **解決**: スプレッドシートの電話番号を修正（数字のみ、またはハイフン付き）

**原因2**: 必須項目が空
- **解決**: 名前、番号、金額が入力されているか確認

**原因3**: データベース接続エラー
- **解決**: バックエンドのログを確認 (`pm2 logs goodfife-backend`)

---

## 📊 顧客ページとの連動

### 受注履歴表示

顧客詳細ページに受注履歴を表示するには:

```typescript
// /admin/customer-management/[id]/page.tsx

const fetchOrderHistory = async (customerId: number) => {
  const response = await fetch(
    `/api/order-import/customer/${customerId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  const result = await response.json();
  return result.orders;
};
```

---

## 📝 今後の拡張

### 1. 自動インポート
- 定期的にスプレッドシートをチェック
- 新規データを自動インポート

### 2. エクスポート機能
- 受注データをExcel/CSVでエクスポート
- 年度・月ごとの集計レポート

### 3. 統計ダッシュボード
- 月別売上グラフ
- キャスト別売上ランキング
- 利用場所の統計

---

## 🔗 関連ファイル

### バックエンド
- `/server/src/config/database.ts` - ordersテーブル定義
- `/server/src/controllers/orderImportController.ts` - インポートロジック
- `/server/src/routes/orderImport.ts` - APIルート

### フロントエンド
- `/client/app/admin/orders/import/page.tsx` - インポート画面

---

**作成日**: 2025年12月15日  
**ステータス**: 実装完了（デプロイ待ち）
