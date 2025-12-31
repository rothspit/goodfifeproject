# 顧客管理システム (Customer Management System)

## 概要

人妻の蜜の顧客管理システムは、CTI連携による自動顧客情報表示、本日の受注管理、出勤キャスト管理、料金計算などの機能を提供します。

## 📊 データベース構造

### 新規テーブル

1. **stores** - 店舗情報
   - 店舗ID、名前、住所、電話番号

2. **orders** - 受注情報
   - 受注日時、店舗、顧客、キャスト、開始時間、時間、場所種別
   - 料金（基本料金、指名料、交通費、オプション料、割引、合計）
   - メモ、ステータス、指名フラグ

3. **customer_notes** - 顧客メモ
   - 顧客ID、タイトル、内容、作成者、作成日時

4. **hotels** - ホテルリスト
   - 店舗ID、ホテル名、住所、交通費、メモ

5. **price_plans** - 料金プラン
   - 店舗ID、キャストID（NULL可）、時間、料金

### 拡張テーブル

**users** テーブルに以下のカラムを追加:
- `customer_type` - 顧客タイプ（会員、ビジター）
- `home_address` - 自宅住所
- `company_name` - 会社名
- `total_orders` - 総注文数
- `total_spent` - 総利用金額
- `last_visit_date` - 最終利用日
- `notes` - 顧客メモ

**casts** テーブルに以下のカラムを追加:
- `nomination_fee` - 指名料

## 🔌 API エンドポイント

すべてのエンドポイントは認証が必要です（JWT トークン）

### 基本URL
```
http://localhost:5000/api/customer-management
```

### エンドポイント一覧

#### 1. 本日の受注リスト取得
```
GET /today-orders?store_id={店舗ID}
```

**レスポンス:**
```json
{
  "success": true,
  "date": "2024-12-14",
  "orders": [
    {
      "id": 1,
      "order_date": "2024-12-14",
      "customer_name": "山田太郎",
      "phone_number": "09012345678",
      "cast_name": "あまね",
      "start_time": "14:00:00",
      "duration": 90,
      "total_price": 25000,
      "status": "confirmed"
    }
  ]
}
```

#### 2. 顧客情報取得（電話番号検索）
```
GET /customer/:phone_number
```

**レスポンス:**
```json
{
  "success": true,
  "customer": {
    "id": 1,
    "phone_number": "09012345678",
    "name": "山田太郎",
    "customer_type": "member",
    "home_address": "東京都...",
    "total_orders": 15,
    "total_spent": 350000
  },
  "reservations": [
    {
      "id": 1,
      "order_date": "2024-12-10",
      "cast_name": "あまね",
      "total_price": 25000
    }
  ],
  "notes": [
    {
      "id": 1,
      "title": "要注意",
      "content": "予約の変更が多い",
      "created_at": "2024-12-01 10:00:00"
    }
  ]
}
```

#### 3. 本日出勤のキャスト取得
```
GET /working-casts?store_id={店舗ID}
```

**レスポンス:**
```json
{
  "success": true,
  "date": "2024-12-14",
  "casts": [
    {
      "id": 1,
      "name": "あまね",
      "age": 28,
      "nomination_fee": 3000,
      "start_time": "10:00:00",
      "end_time": "20:00:00",
      "bookings": [
        {
          "start_time": "14:00:00",
          "duration": 90
        }
      ]
    }
  ]
}
```

#### 4. 料金プラン取得
```
GET /price-plans?store_id={店舗ID}&cast_id={キャストID}
```

**レスポンス:**
```json
{
  "success": true,
  "plans": [
    {
      "id": 1,
      "store_id": "nishifunabashi",
      "cast_id": null,
      "duration": 60,
      "price": 15000
    },
    {
      "id": 2,
      "store_id": "nishifunabashi",
      "cast_id": null,
      "duration": 90,
      "price": 22000
    }
  ]
}
```

#### 5. ホテルリスト取得
```
GET /hotels?store_id={店舗ID}
```

**レスポンス:**
```json
{
  "success": true,
  "hotels": [
    {
      "id": 1,
      "name": "ホテル〇〇",
      "address": "千葉県船橋市...",
      "transportation_fee": 0,
      "notes": "駅から徒歩5分"
    }
  ]
}
```

#### 6. 店舗一覧取得
```
GET /stores
```

**レスポンス:**
```json
{
  "success": true,
  "stores": [
    {
      "id": "nishifunabashi",
      "name": "人妻の蜜 西船橋店",
      "address": "千葉県船橋市...",
      "phone": "047-xxx-xxxx"
    }
  ]
}
```

#### 7. 受注作成・更新
```
POST /orders
```

**リクエストボディ:**
```json
{
  "order_date": "2024-12-14",
  "order_datetime": "2024-12-14 14:00:00",
  "store_id": "nishifunabashi",
  "customer_id": 1,
  "cast_id": 1,
  "start_time": "2024-12-14 14:00:00",
  "duration": 90,
  "location_type": "hotel",
  "location_name": "ホテル〇〇",
  "address": "千葉県船橋市...",
  "base_price": 22000,
  "nomination_fee": 3000,
  "transportation_fee": 0,
  "option_fee": 0,
  "discount": 0,
  "total_price": 25000,
  "options": ["パンスト", "ローション"],
  "memo": "14時ちょうどに到着希望",
  "status": "pending",
  "is_nomination": true
}
```

**レスポンス（新規作成）:**
```json
{
  "success": true,
  "message": "受注を登録しました",
  "order_id": 1
}
```

**レスポンス（更新）:**
```json
{
  "success": true,
  "message": "受注情報を更新しました",
  "order_id": 1
}
```

## 🚀 機能概要

### 1. CTI連携による自動顧客情報表示
- 電話着信時に電話番号から自動的に顧客情報を検索
- 予約履歴・メモを即座に表示

### 2. 本日の受注管理
- 当日の受注を一覧表示
- 店舗別フィルタリング
- ステータス管理（pending, confirmed, completed, cancelled）
- 9時を基準とした日付切り替え（深夜帯対応）

### 3. 出勤キャスト管理
- 本日出勤のキャスト一覧
- 予約状況の可視化（空き時間の確認）
- 指名料金の表示

### 4. 自動料金計算
- 時間別基本料金
- 指名料
- 交通費（ホテル別、自宅出張）
- オプション料金
- 手動割引調整

### 5. 場所選択
- ホテルリストから選択
- 顧客登録住所（自宅）を利用
- 自動交通費設定

### 6. 途中保存機能
- 受注入力の途中保存
- 後から編集可能

### 7. 本日の受注一覧表示
- 時系列での受注表示
- ステータスごとの色分け
- キャスト・顧客情報の表示

### 8. 空き時間の可視化
- 各キャストの予約状況
- 空き時間の確認
- ダブルブッキング防止

## 📝 今後の実装予定

### フロントエンド（Next.js）
1. 顧客管理画面
   - 顧客検索・一覧
   - 顧客詳細表示
   - 予約履歴・メモ表示

2. 受注入力フォーム
   - ステップ形式の入力画面
   - 料金自動計算
   - キャスト空き時間表示

3. 本日の受注一覧
   - カレンダー表示
   - タイムテーブル表示
   - ステータス管理

4. CTIポップアップ
   - 電話着信時の自動表示
   - 顧客情報の即時表示

## 🔧 技術スタック

- **バックエンド**: Node.js + Express + TypeScript
- **データベース**: SQLite (better-sqlite3)
- **認証**: JWT
- **フロントエンド（予定）**: Next.js 15 + TypeScript + Tailwind CSS

## 📚 使用方法

### バックエンド起動

```bash
cd server
npm install
npm run build
pm2 start npm --name "goodfife-backend" -- start
```

### APIテスト

```bash
# ヘルスチェック
curl http://localhost:5000/api/health

# 店舗一覧取得（要認証）
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/customer-management/stores
```

## 🔐 認証

すべてのAPIエンドポイントは認証が必要です。

**ヘッダーに以下を含める必要があります:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## ⚠️ 注意事項

1. 日付の基準時刻は9時です（深夜0時〜8時59分は前日扱い）
2. SQLiteデータベースファイルは `/server/database.sqlite`
3. PM2で管理された場合、再起動時も自動で起動します
4. マイグレーションファイルは `/server/migrations/create_customer_management_system.sql`

## 🎯 マイグレーション実行

データベーステーブルを作成するには、SQLiteデータベースでマイグレーションを実行してください:

```bash
cd server
sqlite3 database.sqlite < migrations/create_customer_management_system.sql
```

または、初回起動時に自動的にテーブルが作成されます。

---

## サポート

問題が発生した場合は、以下を確認してください:

1. PM2ログ: `pm2 logs goodfife-backend`
2. データベース接続: `ls -la server/database.sqlite`
3. ポート使用状況: `lsof -i :5000`
