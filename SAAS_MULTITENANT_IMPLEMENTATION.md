# 🚀 ShopMaster CRM: SaaS型マルチテナント実装

**実装日**: 2025-12-16  
**開発時間**: 進行中  
**目的**: 単一店舗向けシステムを複数店舗対応のSaaS型プラットフォームに変換

---

## 📋 実装概要

### 🎯 目標

**人妻の蜜CRM**を**複数企業・複数店舗対応のSaaS型顧客管理システム**に拡張し、将来的に他社へ販売可能なプラットフォームとして構築する。

### ✨ 主な変更点

1. **マルチテナント設計** - 企業・店舗ごとのデータ完全分離
2. **柔軟な権限管理** - 企業管理者、店舗管理者、スタッフの階層構造
3. **サブスクリプション管理** - プラン別の機能制限
4. **利用統計・監査ログ** - 運用監視とセキュリティ
5. **拡張性** - 新規企業・店舗の簡単な追加

---

## 🗂️ データベース設計

### 新規テーブル

#### 1. `companies` - 企業マスター

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INT | 企業ID（PK）|
| name | VARCHAR(255) | 企業名 |
| slug | VARCHAR(100) | URL識別子（例: hitozuma-group）|
| email | VARCHAR(255) | 企業代表メール |
| plan_type | ENUM | free, basic, standard, premium, enterprise |
| max_stores | INT | 最大店舗数 |
| max_users | INT | 最大ユーザー数 |
| status | ENUM | active, suspended, trial, cancelled |
| trial_ends_at | DATETIME | トライアル終了日 |

**役割**: 企業情報の管理、契約プランの設定

#### 2. `stores` - 店舗マスター（拡張）

既存の `stores` テーブルに以下を追加：

| カラム | 型 | 説明 |
|--------|-----|------|
| company_id | INT | 所属企業ID（FK）|
| code | VARCHAR(50) | 店舗コード |
| display_name | VARCHAR(255) | 店舗表示名 |
| slug | VARCHAR(100) | URL識別子 |
| business_hours | JSON | 営業時間（曜日別）|
| settings | JSON | 店舗固有設定 |

**役割**: 企業配下の各店舗情報

#### 3. `store_users` - 店舗別ユーザーマッピング

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INT | ID（PK）|
| store_id | INT | 店舗ID（FK）|
| user_id | INT | ユーザーID（FK）|
| role | ENUM | admin, manager, staff, readonly |
| permissions | JSON | 店舗ごとの権限 |
| is_active | BOOLEAN | 有効/無効 |

**役割**: ユーザーが複数店舗にアクセスする場合の管理

#### 4. `subscriptions` - サブスクリプション管理

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INT | ID（PK）|
| company_id | INT | 企業ID（FK）|
| plan_type | ENUM | プラン種別 |
| monthly_price | DECIMAL | 月額料金 |
| start_date | DATE | 開始日 |
| end_date | DATE | 終了日 |
| status | ENUM | active, cancelled, expired, trial |

**役割**: 課金・契約管理

#### 5. `usage_stats` - 利用統計

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INT | ID（PK）|
| company_id | INT | 企業ID |
| store_id | INT | 店舗ID（NULL=企業全体）|
| stat_date | DATE | 統計日 |
| total_customers | INT | 顧客総数 |
| total_orders | INT | 受注総数 |
| api_calls | INT | API呼び出し回数 |

**役割**: 利用状況の可視化、課金根拠

#### 6. `audit_logs` - 監査ログ

| カラム | 型 | 説明 |
|--------|-----|------|
| id | BIGINT | ID（PK）|
| company_id | INT | 企業ID |
| store_id | INT | 店舗ID |
| user_id | INT | ユーザーID |
| action | VARCHAR(100) | アクション種別 |
| resource_type | VARCHAR(100) | リソース種別 |
| changes | JSON | 変更内容 |
| ip_address | VARCHAR(45) | IPアドレス |

**役割**: セキュリティ監査、トラブルシューティング

### 既存テーブルへの追加

以下のテーブルに `company_id` と `store_id` を追加：

- `users` - ユーザー
- `casts` - キャスト
- `orders` - 受注
- `schedules` - スケジュール
- `blogs` - 写メ日記
- `reviews` - レビュー
- `chats` - チャット
- `announcements` - お知らせ
- `rankings` - ランキング
- `points` - ポイント
- `receipts` - 領収書

**目的**: 全データを企業・店舗ごとに分離

---

## 💻 バックエンド実装

### ミドルウェア

#### `tenantAuth.ts` - テナント分離ミドルウェア

**主要機能**:

1. **テナント情報抽出**
   ```typescript
   export const extractTenantInfo = async (req, res, next) => {
     // JWTからユーザーIDを取得
     // DBからユーザーの company_id, store_id を取得
     // req.companyId, req.storeId に設定
   }
   ```

2. **権限チェック**
   ```typescript
   export const requireCompanyAdmin = (req, res, next) => {
     if (req.userType !== 'company_admin') {
       return res.status(403).json({ error: '権限不足' });
     }
     next();
   }
   ```

3. **店舗アクセス権限チェック**
   ```typescript
   export const requireStoreAccess = async (req, res, next) => {
     // リクエストされた店舗にアクセス権があるか確認
     // 企業管理者は全店舗OK
     // それ以外は store_users テーブルで確認
   }
   ```

4. **監査ログ記録**
   ```typescript
   export const auditLog = (action, resourceType) => {
     return async (req, res, next) => {
       // レスポンス送信後に audit_logs に記録
     }
   }
   ```

### コントローラー

#### `companyController.ts` - 企業管理

**エンドポイント**:
- `GET /api/companies` - 企業一覧取得
- `GET /api/companies/:id` - 企業詳細取得
- `POST /api/companies` - 企業登録
- `PUT /api/companies/:id` - 企業更新
- `DELETE /api/companies/:id` - 企業削除
- `GET /api/companies/:id/stats` - 企業統計
- `GET /api/companies/:id/subscription` - サブスクリプション情報

**主要機能**:
- 企業のCRUD操作
- 店舗数・ユーザー数の統計取得
- サブスクリプション管理

#### `storeManagementController.ts` - 店舗管理

**エンドポイント**:
- `GET /api/stores` - 店舗一覧取得（企業内）
- `GET /api/stores/:id` - 店舗詳細取得
- `POST /api/stores` - 店舗作成
- `PUT /api/stores/:id` - 店舗更新
- `DELETE /api/stores/:id` - 店舗削除
- `GET /api/stores/:id/staff` - スタッフ一覧
- `POST /api/stores/:id/staff` - スタッフ追加
- `DELETE /api/stores/:id/staff/:userId` - スタッフ削除

**主要機能**:
- 店舗のCRUD操作
- スタッフのアサイン管理
- 店舗別統計

### ルート

#### `company.ts` - 企業管理ルート

```typescript
router.use(verifyToken);              // JWT認証
router.use(extractTenantInfo);        // テナント情報抽出
router.get('/', getAllCompanies);     // 一覧
router.post('/', createCompany);      // 作成
router.get('/:id', getCompany);       // 詳細
router.put('/:id', requireCompanyAdmin, updateCompany);  // 更新
```

#### `storeManagement.ts` - 店舗管理ルート

```typescript
router.use(verifyToken);
router.use(extractTenantInfo);
router.get('/', getStores);                             // 一覧
router.post('/', requireCompanyAdmin, createStore);     // 作成
router.put('/:id', requireStoreAdmin, updateStore);     // 更新
router.get('/:id/staff', getStoreStaff);                // スタッフ
```

---

## 🔒 セキュリティとデータ分離

### テナント分離戦略

#### 1. **クエリレベルでのフィルタリング**

全てのクエリに自動的にテナントフィルタを追加：

```typescript
// 企業管理者の場合
SELECT * FROM customers 
WHERE company_id = ? AND ...

// 店舗管理者・スタッフの場合
SELECT * FROM customers 
WHERE store_id = ? AND ...
```

#### 2. **ミドルウェアでの自動チェック**

```typescript
// リクエストごとにテナント情報を検証
app.use('/api/customers', verifyToken, extractTenantInfo, customersRoutes);
```

#### 3. **外部キー制約**

データベースレベルでの整合性保証：

```sql
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
```

### 権限階層

```
System Admin（将来の運営側）
  ↓
Company Admin（企業管理者）- 全店舗アクセス可能
  ↓
Store Admin（店舗管理者）- 割り当てられた店舗のみ
  ↓
Staff（スタッフ）- 読み取りと基本操作
  ↓
Customer（顧客）- 自分のデータのみ
```

---

## 📊 サブスクリプションプラン（想定）

### プラン設計

| プラン | 月額料金 | 店舗数 | ユーザー数 | 顧客数 | 機能 |
|--------|----------|--------|------------|--------|------|
| **Free** | ¥0 | 1 | 3 | 100 | 基本機能のみ |
| **Basic** | ¥19,800 | 1 | 5 | 1,000 | Excel/CSVインポート、CTI連携 |
| **Standard** | ¥49,800 | 3 | 10 | 5,000 | 複数店舗、レポート |
| **Premium** | ¥99,800 | 10 | 30 | 無制限 | API連携、カスタマイズ |
| **Enterprise** | 要相談 | 無制限 | 無制限 | 無制限 | 専用サポート、オンプレ対応 |

### 制限の実装

```typescript
// プラン制限チェック
const checkPlanLimits = async (companyId) => {
  const company = await getCompany(companyId);
  const currentStores = await getStoreCount(companyId);
  
  if (currentStores >= company.max_stores) {
    throw new Error('店舗数の上限に達しています');
  }
}
```

---

## 🔄 既存システムからの移行

### 移行手順

#### Phase 1: データベーススキーマ追加

```bash
# マイグレーション実行
cd /home/user/webapp/server
mysql -u root -p < migrations/saas_multitenant_schema.sql
```

**実行内容**:
1. `companies`, `subscriptions`, `store_users` 等の新規テーブル作成
2. 既存テーブルに `company_id`, `store_id` カラム追加
3. インデックス作成
4. 初期データ投入（人妻の蜜グループ）

#### Phase 2: 既存データの移行

```sql
-- 既存店舗を企業に紐付け
UPDATE stores SET company_id = 1 WHERE code IN ('nishifuna', 'kinshicho', 'kasai', 'matsudo');

-- 既存ユーザーに企業・店舗を設定
UPDATE users SET company_id = 1, user_type = 'company_admin' WHERE role = 'admin';
UPDATE users SET company_id = 1, user_type = 'customer' WHERE role = 'user';

-- 既存データに company_id, store_id を設定
UPDATE casts SET company_id = 1, store_id = (SELECT id FROM stores WHERE code = 'nishifuna' LIMIT 1);
UPDATE orders SET company_id = 1, store_id = (SELECT id FROM stores WHERE code = 'nishifuna' LIMIT 1);
-- 他のテーブルも同様
```

#### Phase 3: バックエンドコード更新

**既存APIの修正例**:

```typescript
// Before（単一店舗）
export const getCustomers = async (req, res) => {
  const [customers] = await pool.execute('SELECT * FROM users WHERE role = "user"');
  res.json({ customers });
}

// After（マルチテナント対応）
export const getCustomers = async (req: TenantRequest, res) => {
  const [customers] = await pool.execute(
    'SELECT * FROM users WHERE company_id = ? AND store_id = ? AND role = "user"',
    [req.companyId, req.storeId]
  );
  res.json({ customers });
}
```

**適用対象**:
- すべてのコントローラー
- すべてのルート

#### Phase 4: フロントエンド対応

1. **企業・店舗選択UI**
   ```tsx
   // 管理画面ヘッダーに追加
   <CompanySelector />
   <StoreSelector />
   ```

2. **APIリクエストにテナント情報を含める**
   ```typescript
   // すべてのAPIコールで自動的に含まれる（JWT内に含まれているため）
   ```

3. **権限に応じた表示切り替え**
   ```tsx
   {userType === 'company_admin' && (
     <CompanyManagementMenu />
   )}
   ```

---

## 🎨 フロントエンド（今後の実装）

### 必要なUI

#### 1. **企業管理画面**
- `/admin/company` - 企業情報管理
- `/admin/company/subscription` - サブスクリプション管理
- `/admin/company/stats` - 統計ダッシュボード

#### 2. **店舗管理画面**
- `/admin/stores` - 店舗一覧・作成
- `/admin/stores/:id/edit` - 店舗編集
- `/admin/stores/:id/staff` - スタッフ管理

#### 3. **店舗切り替え**
- ヘッダーにドロップダウン
- 企業管理者は全店舗表示
- スタッフは割り当て店舗のみ

#### 4. **権限管理**
- ユーザー一覧
- 権限編集UI

---

## 📈 利用統計・レポート

### 自動収集される統計

- **日次統計**:
  - 顧客総数
  - 受注総数
  - インポート回数
  - API呼び出し回数
  - ストレージ使用量

- **企業別統計**:
  - 店舗数
  - ユーザー数
  - アクティブユーザー数
  - 売上総額

### ダッシュボード（想定）

```
企業ダッシュボード
├─ 店舗一覧と状態
├─ 今月の受注数・売上
├─ アクティブユーザー数
├─ API利用状況
└─ ストレージ使用量

店舗ダッシュボード
├─ 顧客数
├─ 今月の受注
├─ 人気キャスト
└─ レビュー評価
```

---

## 🧪 テスト項目

### ユニットテスト

- [ ] テナント情報抽出ミドルウェア
- [ ] 権限チェックミドルウェア
- [ ] 企業CRUD操作
- [ ] 店舗CRUD操作
- [ ] スタッフ管理

### 統合テスト

- [ ] 企業登録 → 店舗作成 → ユーザー登録の一連の流れ
- [ ] テナント分離（企業Aが企業Bのデータにアクセスできないこと）
- [ ] 権限チェック（スタッフが管理者操作を実行できないこと）
- [ ] 複数店舗アクセス

### セキュリティテスト

- [ ] SQLインジェクション対策
- [ ] XSS対策
- [ ] CSRF対策
- [ ] テナント分離の確実性

---

## 📝 実装ファイル一覧

### 新規作成

| ファイル | 説明 | 行数 |
|---------|------|------|
| `server/migrations/saas_multitenant_schema.sql` | DBスキーマ | 約650行 |
| `server/src/middleware/tenantAuth.ts` | テナント分離ミドルウェア | 約380行 |
| `server/src/controllers/companyController.ts` | 企業管理 | 約330行 |
| `server/src/controllers/storeManagementController.ts` | 店舗管理 | 約320行 |
| `server/src/routes/company.ts` | 企業ルート | 約45行 |
| `server/src/routes/storeManagement.ts` | 店舗ルート | 約50行 |

**合計**: 約1,775行

### 修正

| ファイル | 変更内容 |
|---------|---------|
| `server/src/index.ts` | 新規ルート追加 |
| 既存コントローラー（将来）| マルチテナント対応 |

---

## 🚀 デプロイ手順

### 1. データベースマイグレーション

```bash
cd /home/user/webapp/server
mysql -u root -p < migrations/saas_multitenant_schema.sql
```

### 2. npm パッケージインストール

```bash
cd /home/user/webapp/server
npm install
```

### 3. TypeScriptコンパイル

```bash
npm run build
```

### 4. サーバー再起動

```bash
pm2 restart webapp-server
```

### 5. 動作確認

```bash
# 企業一覧取得
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/companies

# 店舗一覧取得
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/stores
```

---

## 🔮 今後の展望

### Phase 2（2週間以内）

- [ ] すべての既存APIのマルチテナント対応
- [ ] フロントエンドUI実装（企業・店舗管理）
- [ ] 権限管理UI
- [ ] サブスクリプション管理機能

### Phase 3（1ヶ月以内）

- [ ] 支払い連携（Stripe等）
- [ ] 請求書自動発行
- [ ] 利用統計ダッシュボード
- [ ] API利用制限機能

### Phase 4（2ヶ月以内）

- [ ] 他社への販売開始
- [ ] ランディングページ作成
- [ ] オンボーディング機能
- [ ] ヘルプ・ドキュメント

---

## 💰 ビジネスモデル

### 想定顧客

- 中小風俗店舗（1-10店舗）
- 風俗グループ企業
- 新規出店予定の事業者

### 収益予測

| 項目 | 想定 |
|------|------|
| 顧客単価 | ¥49,800/月 |
| 初年度目標顧客数 | 20社 |
| 初年度予想収益 | ¥11,952,000 |
| 2年目目標顧客数 | 50社 |
| 2年目予想収益 | ¥29,880,000 |

### 競合優位性

1. **業界特化**: 風俗業界の業務フローに完全対応
2. **既存実績**: 人妻の蜜での実運用実績
3. **高機能**: Excel/CSVインポート、CTI連携など
4. **低価格**: 他社CRMより約30%安価
5. **拡張性**: カスタマイズ対応可能

---

## ✅ チェックリスト

### 完了

- [x] マルチテナントDB設計
- [x] テナント分離ミドルウェア実装
- [x] 企業管理API実装
- [x] 店舗管理API実装
- [x] ルート追加

### 進行中

- [ ] 既存APIのマルチテナント対応
- [ ] フロントエンドUI実装
- [ ] テスト実装

### 未着手

- [ ] サブスクリプション管理UI
- [ ] 支払い連携
- [ ] ランディングページ
- [ ] ドキュメント整備

---

**開発者**: Genspark AI Developer  
**作成日**: 2025-12-16  
**最終更新**: 2025-12-16  
**進捗**: Phase 1 完了（約60%）
