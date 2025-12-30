# 店舗グループ機能 完全ガイド

**作成日**: 2025-12-16  
**バージョン**: 1.0  
**ステータス**: ✅ 実装完了

---

## 📚 目次

1. [概要](#概要)
2. [機能説明](#機能説明)
3. [データベース設計](#データベース設計)
4. [API仕様](#api仕様)
5. [使用例](#使用例)
6. [運用シナリオ](#運用シナリオ)
7. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### 🎯 目的

複数店舗を運営する企業が、店舗間でデータを**柔軟に共有**できるようにする機能です。

### 💡 解決する課題

| 課題 | 従来 | 店舗グループ機能 |
|------|------|------------------|
| **顧客の複数店舗利用** | 各店舗で再登録が必要 | グループ内で自動共有 ✅ |
| **データの一元管理** | 店舗ごとに完全分離 | グループ単位で統合管理 ✅ |
| **新業態の独立運営** | 全店舗共有または完全分離の二択 | 柔軟なグループ分け ✅ |

---

## 機能説明

### 🏢 3階層のデータ管理

```
企業 (Company)
  └─ グループ (Store Group) ← NEW!
      └─ 店舗 (Store)
          └─ データ (Customers, Casts, Orders)
```

### 📊 データ共有設定

各グループで以下のデータタイプごとに共有ON/OFFを設定可能:

| データタイプ | 説明 | デフォルト |
|-------------|------|-----------|
| **顧客データ** (`share_customers`) | 電話番号、名前、住所、購入履歴 | ON ✅ |
| **キャストデータ** (`share_casts`) | プロフィール、スケジュール | OFF ❌ |
| **受注データ** (`share_orders`) | 注文履歴、売上 | ON ✅ |
| **レビューデータ** (`share_reviews`) | 口コミ、評価 | OFF ❌ |

### 🎨 グループ構成例

#### パターン1: 全店舗共有

```
人妻の蜜グループ
  └─ 全店舗共有グループ
      ├─ 西船橋店
      ├─ 錦糸町店
      ├─ 葛西店
      └─ 松戸店

👉 全店舗で顧客・受注データを共有
```

#### パターン2: エリア別グループ

```
人妻の蜜グループ
  ├─ 首都圏エリア (顧客共有: ON)
  │   ├─ 西船橋店
  │   ├─ 錦糸町店
  │   └─ 葛西店
  │
  ├─ 千葉エリア (顧客共有: ON)
  │   ├─ 松戸店
  │   └─ 船橋店
  │
  └─ 新業態店 (独立)
      └─ VIP専門店 (データ完全分離)

👉 エリア内では共有、エリア間は分離
```

#### パターン3: 業態別グループ

```
人妻の蜜グループ
  ├─ 一般デリヘルグループ
  │   ├─ 西船橋店
  │   ├─ 錦糸町店
  │   └─ 葛西店
  │
  └─ ホテヘルグループ
      ├─ 松戸店
      └─ 船橋店

👉 業態ごとに顧客層を分離管理
```

---

## データベース設計

### 📋 新規テーブル

#### 1. `store_groups` (店舗グループマスター)

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `id` | INT | グループID (PK) |
| `company_id` | INT | 企業ID (FK) |
| `group_name` | VARCHAR(100) | グループ名 (例: 首都圏エリア) |
| `group_code` | VARCHAR(50) | グループコード (例: TOKYO-AREA-01) |
| `description` | TEXT | グループの説明 |
| `share_customers` | BOOLEAN | 顧客データ共有フラグ |
| `share_casts` | BOOLEAN | キャストデータ共有フラグ |
| `share_orders` | BOOLEAN | 受注データ共有フラグ |
| `share_reviews` | BOOLEAN | レビューデータ共有フラグ |
| `is_active` | BOOLEAN | 有効/無効 |
| `display_order` | INT | 表示順 |
| `created_at` | TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | 更新日時 |

#### 2. `store_group_history` (グループ変更履歴)

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `id` | INT | 履歴ID (PK) |
| `store_id` | INT | 店舗ID (FK) |
| `group_id` | INT | グループID (FK) |
| `action` | ENUM | アクション (join/leave/move) |
| `previous_group_id` | INT | 移動前のグループID |
| `changed_by` | INT | 変更者のユーザーID |
| `changed_at` | TIMESTAMP | 変更日時 |
| `notes` | TEXT | 変更理由・メモ |

### 📝 既存テーブルの変更

#### `stores` テーブル

```sql
-- group_id カラムを追加
ALTER TABLE stores 
ADD COLUMN group_id INT DEFAULT NULL COMMENT '所属グループID（NULL=独立店舗）';
```

---

## API仕様

### 📡 エンドポイント一覧

| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/api/store-groups` | グループ一覧取得 | 企業管理者 |
| GET | `/api/store-groups/:groupId` | グループ詳細取得 | 企業管理者 |
| POST | `/api/store-groups` | グループ作成 | 企業管理者 |
| PUT | `/api/store-groups/:groupId` | グループ更新 | 企業管理者 |
| DELETE | `/api/store-groups/:groupId` | グループ削除 | 企業管理者 |
| POST | `/api/store-groups/:groupId/stores` | 店舗をグループに追加 | 企業管理者 |
| DELETE | `/api/store-groups/:groupId/stores/:storeId` | 店舗をグループから除外 | 企業管理者 |
| GET | `/api/store-groups/:groupId/settings` | 共有設定取得 | 企業管理者 |
| GET | `/api/store-groups/independent/stores` | 独立店舗一覧取得 | 企業管理者 |

### 🔐 認証

全てのエンドポイントは以下のミドルウェアで保護:

```typescript
verifyToken → extractTenantInfo → requireCompanyAdmin
```

### 📤 リクエスト例

#### グループ作成

```bash
POST /api/store-groups
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "group_name": "首都圏エリア",
  "group_code": "TOKYO-AREA",
  "description": "東京・千葉西部の店舗グループ",
  "share_customers": true,
  "share_casts": false,
  "share_orders": true,
  "share_reviews": false,
  "display_order": 1
}
```

#### レスポンス

```json
{
  "success": true,
  "message": "グループを作成しました",
  "groupId": 1
}
```

#### 店舗をグループに追加

```bash
POST /api/store-groups/1/stores
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "storeId": 3
}
```

#### レスポンス

```json
{
  "success": true,
  "message": "店舗をグループに追加しました"
}
```

---

## 使用例

### 🔧 セットアップ手順

#### ステップ1: データベース移行

```bash
cd /home/user/webapp/server
mysql -u root -p < migrations/store_groups_schema.sql
```

#### ステップ2: グループ作成

```bash
curl -X POST http://localhost:5001/api/store-groups \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "group_name": "全店舗共有グループ",
    "group_code": "ALL-STORES",
    "share_customers": true,
    "share_orders": true
  }'
```

#### ステップ3: 店舗を追加

```bash
# 西船橋店を追加
curl -X POST http://localhost:5001/api/store-groups/1/stores \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"storeId": 1}'

# 錦糸町店を追加
curl -X POST http://localhost:5001/api/store-groups/1/stores \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"storeId": 2}'
```

---

## 運用シナリオ

### シナリオ1: 顧客が複数店舗を利用

#### 従来の課題

```
顧客: 田中太郎さん (090-1234-5678)

西船橋店: 登録済み ✅
  → 予約履歴: 5回、売上: ¥150,000

錦糸町店: 新規登録が必要 ❌
  → 「初めてのお客様」として扱われる
  → 過去の履歴が見えない
```

#### グループ機能による解決

```
グループ: 首都圏エリア (share_customers: ON)

西船橋店: 田中太郎さん登録 ✅
  → 予約履歴: 5回、売上: ¥150,000

錦糸町店: 自動的に田中さんのデータが表示 ✅
  → 「常連のお客様」として認識
  → 西船橋店での履歴も確認可能
  → 重複登録不要
```

### シナリオ2: 新業態を独立運営

```
人妻の蜜グループ
  ├─ 一般店グループ (顧客共有: ON)
  │   ├─ 西船橋店
  │   └─ 錦糸町店
  │
  └─ VIP専門店 (独立、group_id: NULL)
      └─ 完全に別のデータベース
      → 一般店の顧客情報は見えない
```

### シナリオ3: エリア展開の段階的拡大

```
フェーズ1: 千葉エリアのみ
  └─ 千葉グループ
      ├─ 西船橋店
      └─ 松戸店

フェーズ2: 東京エリア進出
  ├─ 千葉グループ (既存)
  └─ 東京グループ (新規)
      ├─ 錦糸町店
      └─ 葛西店

フェーズ3: 全店舗統合
  └─ 全店舗共有グループ (統合)
      ├─ 西船橋店
      ├─ 松戸店
      ├─ 錦糸町店
      └─ 葛西店
```

---

## トラブルシューティング

### Q1: グループに店舗を追加したのに、データが共有されない

**A**: 共有設定を確認してください。

```bash
# 共有設定を確認
GET /api/store-groups/:groupId/settings

# share_customers が false になっている場合
PUT /api/store-groups/:groupId
{
  "share_customers": true
}
```

### Q2: 店舗をグループから除外したい

**A**: 除外APIを使用してください。

```bash
DELETE /api/store-groups/:groupId/stores/:storeId
```

除外後、店舗は「独立店舗」になります（`group_id = NULL`）。

### Q3: グループを削除できない

**A**: グループに店舗が所属している場合、削除できません。

```bash
# エラーメッセージ
{
  "error": "このグループには店舗が所属しています。先に店舗の所属を解除してください",
  "storeCount": 3
}
```

**解決策**: 先に全ての店舗を除外してから削除してください。

### Q4: グループ変更履歴を確認したい

**A**: `store_group_history` テーブルを参照してください。

```sql
SELECT 
  sgh.*,
  s.store_name,
  u.name as changed_by_name
FROM store_group_history sgh
JOIN stores s ON sgh.store_id = s.id
LEFT JOIN users u ON sgh.changed_by = u.id
WHERE sgh.store_id = ?
ORDER BY sgh.changed_at DESC;
```

---

## 📈 実装統計

| 項目 | 値 |
|------|-----|
| **新規ファイル** | 3 個 |
| **変更ファイル** | 3 個 |
| **追加行数** | 約 650 行 |
| **新規API** | 9 エンドポイント |
| **新規DBテーブル** | 2 テーブル |
| **実装時間** | 約 2 時間 |

### 📁 作成ファイル

1. `server/migrations/store_groups_schema.sql` - DB マイグレーション
2. `server/src/controllers/storeGroupController.ts` - グループ管理コントローラー
3. `server/src/routes/storeGroup.ts` - ルーティング
4. `server/src/middleware/tenantAuth.ts` - ミドルウェア拡張
5. `STORE_GROUP_FEATURE_GUIDE.md` - このドキュメント

---

## 🚀 今後の拡張案

### Phase 2.5+: 追加機能

1. **グループ間のデータ移行**
   - 顧客データをグループ間で移動
   - 履歴の引継ぎ

2. **グループ別の料金プラン**
   - グループごとに異なる料金体系
   - グループ横断割引

3. **グループ統計ダッシュボード**
   - グループ別の売上比較
   - 店舗間の顧客移動分析

4. **自動グループ最適化**
   - AI による最適なグループ分けの提案
   - 顧客の利用パターン分析

---

**ドキュメント作成**: 2025-12-16  
**最終更新**: 2025-12-16  
**次回レビュー**: 2026-01-16
