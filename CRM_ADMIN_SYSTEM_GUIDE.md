# 人妻の蜜 CRM管理システム 完全ガイド

## 🎯 システム概要

顧客管理専用のCRMシステムを構築しました。このシステムは電話による顧客検索、予約管理、KPI可視化、データインポート、CTI連携などの機能を提供します。

### システム構成

- **フロントエンド**: Next.js 14 (React) - ポート 8080
- **バックエンド API**: Express.js (Node.js 20) - ポート 5000
- **データベース**: MySQL 8.0
- **サーバー**: Rocky Linux 10.0 (162.43.91.102)

## 🔑 アクセス情報

### 管理画面アクセス

**ローカル開発環境:**
- URL: https://8080-iwlhxuzhfaqbr3cqpityv-de59bda9.sandbox.novita.ai
- 電話番号: `admin`
- パスワード: `admin123`

**本番サーバー (162.43.91.102):**
- バックエンドAPI: http://162.43.91.102:5000
- 管理者アカウント: `admin` / `admin123`

### データベース接続情報

- Host: `localhost` (サーバー内)
- Port: `3306`
- Database: `hitoduma_crm`
- User: `crm_user`
- Password: `CRM@Pass2024!`

## 📋 主要機能

### 1. 顧客検索画面 🔍

**機能概要:**
- 電話番号による顧客検索（ハイフンなし入力）
- 顧客詳細情報の表示
- 利用履歴の一覧表示

**使用方法:**
1. トップページから「顧客検索」タブを選択
2. 電話番号を入力（例: 09012345678）
3. 「検索」ボタンをクリック
4. 顧客情報と利用履歴が表示されます

**表示される情報:**
- 顧客ID、名前、電話番号
- 顧客タイプ (新規/常連/VIP)
- メールアドレス、自宅住所
- 自宅交通費、総注文数
- 最終来店日、備考
- 過去の予約履歴（店舗、キャスト、コース、金額、ステータス）

### 2. 予約管理画面 📅

**機能概要:**
- 本日の予約一覧表示
- 別の日付の予約検索
- 予約詳細情報の確認
- 売上集計の自動計算

**使用方法:**
1. 「予約管理」タブを選択
2. 本日の予約が自動的に表示されます
3. 別の日を確認する場合は、日付を選択
4. 予約件数と売上合計が自動計算されます

**表示される情報:**
- 時間、店舗、顧客情報
- キャスト名、場所（自宅/ホテル）
- コース時間、料金
- ステータス（保留/確定/完了/キャンセル）

### 3. ダッシュボード 📊

**KPI表示:**
- 本日の売上
- 本日の予約件数
- 新規顧客数（今月）
- リピート率（過去30日）
- 平均客単価
- キャスト稼働率（本日）

**グラフ機能:**
- 過去7日間の売上推移
- 日別の予約件数

**レポート生成:**
- 日次レポート自動生成
- 月次レポート自動生成
- JSON形式でダウンロード可能

### 4. データ取込（CSVインポート） 📥

**対応データ:**
1. 顧客データ
2. キャスト情報
3. 売上データ（過去の予約履歴）

**顧客データCSVフォーマット:**
```csv
phone_number,name,email,customer_type,home_address,home_transportation_fee,notes
09012345678,山田太郎,yamada@example.com,regular,東京都新宿区1-2-3,3000,VIP顧客
```

**キャストデータCSVフォーマット:**
```csv
name,display_name,age,height,bust,waist,hip,blood_type,description,nomination_fee,is_available
Tanaka Yuki,ゆき,25,165,88,60,90,A,明るい性格です,3000,1
```

**売上データCSVフォーマット:**
```csv
business_date,order_datetime,store_id,customer_phone,cast_name,start_time,duration,location,base_price,nomination_fee,transportation_fee,option_price,discount,total_price,options,memo,order_status
2024-12-16,2024-12-16 19:00:00,1,09012345678,ゆき,19:00,90,自宅,15000,3000,2500,0,0,20500,オプションなし,指名,completed
```

**使用方法:**
1. 「データ取込」タブを選択
2. インポート種類を選択（顧客/キャスト/売上）
3. CSVファイルを選択
4. 「インポート開始」ボタンをクリック
5. 結果が表示されます（成功件数、スキップ件数、エラー詳細）

## 🔧 API エンドポイント一覧

### 認証
- `POST /api/auth/login` - ログイン
- `GET /api/auth/profile` - プロフィール取得

### 顧客管理
- `GET /api/customers` - 全顧客取得
- `GET /api/customers/search?phone_number={電話番号}` - 顧客検索
- `GET /api/customers/:id` - 顧客詳細取得
- `GET /api/customers/:id/orders` - 顧客の予約履歴取得
- `POST /api/customers` - 顧客作成
- `PUT /api/customers/:id` - 顧客更新
- `POST /api/customers/import` - 顧客CSVインポート

### 予約管理
- `GET /api/reservations` - 全予約取得
- `GET /api/reservations?date={日付}` - 日付別予約取得
- `GET /api/reservations/:id` - 予約詳細取得
- `POST /api/reservations` - 予約作成
- `PUT /api/reservations/:id` - 予約更新
- `DELETE /api/reservations/:id` - 予約キャンセル
- `POST /api/reservations/import` - 売上CSVインポート

### キャスト管理
- `GET /api/casts` - 全キャスト取得
- `GET /api/casts/:id` - キャスト詳細取得
- `POST /api/casts` - キャスト作成
- `PUT /api/casts/:id` - キャスト更新
- `POST /api/casts/import` - キャストCSVインポート

### 店舗管理
- `GET /api/stores` - 全店舗取得

### ダッシュボード
- `GET /api/dashboard/kpis` - KPI取得
- `GET /api/dashboard/sales?start={開始日}&end={終了日}` - 売上データ取得

### レポート
- `GET /api/reports/daily?date={日付}` - 日次レポート生成
- `GET /api/reports/monthly?year={年}&month={月}` - 月次レポート生成

### CTI連携
- `POST /api/cti/incoming-call` - 着信時の顧客情報取得
- `GET /api/cti/customer-lookup?phone={電話番号}` - 電話番号で顧客検索

## 🚀 本番サーバーへのデプロイ手順

### フロントエンドのデプロイ

```bash
# 1. サーバーに接続
ssh -i ~/WIFEHP.pem root@162.43.91.102

# 2. プロジェクトディレクトリに移動
cd /root

# 3. フロントエンドコードをアップロード
# ローカルから実行:
scp -i ~/WIFEHP.pem -r /path/to/crm-admin root@162.43.91.102:/root/

# 4. サーバー上で依存関係をインストール
cd /root/crm-admin
npm install

# 5. ビルド
npm run build

# 6. PM2で起動
pm2 start npm --name "crm-admin" -- start
pm2 save
```

### 環境変数設定

フロントエンド `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://162.43.91.102:5000
```

バックエンド `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=crm_user
DB_PASSWORD=CRM@Pass2024!
DB_NAME=hitoduma_crm
CLIENT_URL=http://162.43.91.102:8080
```

## 💡 活用例

### 1. 電話応対時の顧客情報確認
```
お客様から電話 → 電話番号を聞く → 
顧客検索画面で検索 → 過去の利用履歴を確認 → 
適切な対応を行う
```

### 2. 本日の予約確認
```
出勤時 → 予約管理画面を開く → 
本日の予約一覧を確認 → 
キャスト・時間・場所を把握
```

### 3. 月末の売上集計
```
ダッシュボードを開く → 
月次レポート生成を選択 → 
年月を指定 → レポートダウンロード → 
売上分析・顧客分析を実施
```

### 4. 既存顧客データの一括登録
```
既存Excelデータ → CSV形式で保存 → 
データ取込画面を開く → 
顧客データを選択 → CSVをアップロード → 
イ��ポート完了
```

## 🔄 CTI連携の使い方

### Webhookエンドポイント

電話システム（Dialpadなど）から着信時に以下のAPIを呼び出します:

```bash
POST http://162.43.91.102:5000/api/cti/incoming-call
Content-Type: application/json

{
  "phone_number": "09012345678",
  "call_id": "call_123456",
  "timestamp": "2024-12-16T10:00:00Z"
}
```

**レスポンス例:**
```json
{
  "found": true,
  "customer": {
    "id": 5,
    "name": "山田太郎",
    "phone_number": "09012345678",
    "customer_type": "regular",
    "total_orders": 12,
    "last_visit_date": "2024-12-10"
  },
  "recentOrders": [
    {
      "id": 45,
      "order_datetime": "2024-12-10 19:00:00",
      "store_name": "西船橋店",
      "cast_name": "ゆき",
      "total_price": 20500
    }
  ]
}
```

## 📊 データベーススキーマ

### 主要テーブル

**users (顧客・管理者)**
- id, phone_number, name, email
- customer_type (new/regular/vip)
- home_address, home_transportation_fee
- total_orders, last_visit_date
- notes, role, created_at, updated_at

**orders (予約・売上)**
- id, business_date, order_datetime
- store_id, customer_id, cast_id
- start_time, duration, location
- base_price, nomination_fee, transportation_fee
- option_price, discount, total_price
- nomination_status, order_status

**casts (キャスト)**
- id, name, display_name
- age, height, bust, waist, hip
- blood_type, description, preferences
- nomination_fee, is_available

**stores (店舗)**
- id, name, address, phone_number

**customer_notes (顧客メモ)**
- id, customer_id, note_type
- content, created_at

## 🛠️ トラブルシューティング

### フロントエンドが起動しない
```bash
cd /home/user/webapp/crm-admin
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### バックエンドAPIが応答しない
```bash
# サーバー上で確認
ssh -i ~/WIFEHP.pem root@162.43.91.102
pm2 status
pm2 logs hitoduma-backend
pm2 restart hitoduma-backend
```

### データベース接続エラー
```bash
# MySQL接続確認
mysql -u crm_user -p'CRM@Pass2024!' hitoduma_crm
```

### ポートが開いていない
```bash
# ファイアウォール確認（サーバー上）
ss -tlnp | grep -E '(5000|8080)'
```

## 📈 今後の拡張予定

### 実装予定の機能
1. ✅ 顧客検索 - 完了
2. ✅ 予約管理 - 完了
3. ✅ ダッシュボード - 完了
4. ✅ CSVインポート - 完了
5. ✅ CTI連携API - 完了
6. ⏳ Freee会計連携 - 未実装
7. ⏳ メール自動送信 - 未実装
8. ⏳ SMS通知機能 - 未実装

### Freee連携 (今後実装)

Freee APIを使用した自動連携:
- 売上データの自動登録
- 請求書の自動生成
- 取引先管理の同期

## 📞 サポート

システムに関する質問や問題が発生した場合は、以下の情報を準備してください:
- エラーメッセージ
- 操作手順
- 発生日時
- ブラウザ情報

---

**最終更新日:** 2024年12月16日
**バージョン:** 1.0.0
**作成者:** AI Developer
