-- ===================================================
-- ShopMaster CRM: マルチテナント対応データベーススキーマ
-- ===================================================
-- 作成日: 2025-12-16
-- 説明: 複数店舗対応のSaaS型顧客管理システム
-- ===================================================

-- ===================================================
-- 1. 企業（Companies）テーブル
-- ===================================================
CREATE TABLE IF NOT EXISTS companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL COMMENT '企業名',
  slug VARCHAR(100) UNIQUE NOT NULL COMMENT 'URL識別子（例: hitozuma-group）',
  email VARCHAR(255) COMMENT '企業代表メール',
  phone VARCHAR(20) COMMENT '企業代表電話',
  postal_code VARCHAR(10) COMMENT '郵便番号',
  address TEXT COMMENT '企業住所',
  
  -- 契約情報
  plan_type ENUM('free', 'basic', 'standard', 'premium', 'enterprise') DEFAULT 'free' COMMENT 'プラン種別',
  max_stores INT DEFAULT 1 COMMENT '最大店舗数',
  max_users INT DEFAULT 5 COMMENT '最大ユーザー数',
  max_customers INT DEFAULT 1000 COMMENT '最大顧客数',
  contract_start_date DATE COMMENT '契約開始日',
  contract_end_date DATE COMMENT '契約終了日',
  
  -- ステータス
  status ENUM('active', 'suspended', 'trial', 'cancelled') DEFAULT 'trial' COMMENT '契約状態',
  trial_ends_at DATETIME COMMENT 'トライアル終了日',
  
  -- 設定
  settings JSON COMMENT '企業設定（カスタマイズ、ブランディング等）',
  
  -- タイムスタンプ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_slug (slug),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企業マスター';

-- ===================================================
-- 2. 店舗（Stores）テーブル ※既存のstoresテーブルを拡張
-- ===================================================
-- 既存テーブルがある場合は ALTER で拡張
-- ない場合は CREATE

CREATE TABLE IF NOT EXISTS stores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL COMMENT '企業ID',
  
  -- 店舗基本情報
  code VARCHAR(50) UNIQUE NOT NULL COMMENT '店舗コード（例: nishifuna, kinshicho）',
  display_name VARCHAR(255) NOT NULL COMMENT '店舗表示名',
  slug VARCHAR(100) NOT NULL COMMENT 'URL識別子',
  
  -- 連絡先
  phone VARCHAR(20) COMMENT '店舗電話番号',
  email VARCHAR(255) COMMENT '店舗メール',
  postal_code VARCHAR(10) COMMENT '郵便番号',
  address TEXT COMMENT '店舗住所',
  
  -- 営業情報
  business_hours JSON COMMENT '営業時間（曜日別）',
  service_area TEXT COMMENT 'サービスエリア',
  
  -- 設定
  settings JSON COMMENT '店舗設定',
  
  -- ステータス
  status ENUM('active', 'inactive', 'closed') DEFAULT 'active' COMMENT '営業状態',
  
  -- タイムスタンプ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company_id (company_id),
  INDEX idx_code (code),
  INDEX idx_slug (slug),
  UNIQUE KEY unique_company_code (company_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='店舗マスター';

-- ===================================================
-- 3. ユーザー（Users）テーブル拡張
-- ===================================================
-- 既存の users テーブルに以下のカラムを追加

ALTER TABLE users
ADD COLUMN IF NOT EXISTS company_id INT COMMENT '所属企業ID' AFTER id,
ADD COLUMN IF NOT EXISTS store_id INT COMMENT '所属店舗ID' AFTER company_id,
ADD COLUMN IF NOT EXISTS user_type ENUM('company_admin', 'store_admin', 'staff', 'customer') DEFAULT 'customer' COMMENT 'ユーザー種別' AFTER role,
ADD COLUMN IF NOT EXISTS permissions JSON COMMENT '権限設定' AFTER user_type,
ADD INDEX idx_company_id (company_id),
ADD INDEX idx_store_id (store_id),
ADD INDEX idx_user_type (user_type);

-- 外部キー制約追加（既存データがある場合は注意）
-- ALTER TABLE users
-- ADD FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
-- ADD FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL;

-- ===================================================
-- 4. 店舗別ユーザー（Store Users）中間テーブル
-- ===================================================
-- ユーザーが複数店舗にアクセスできる場合のマッピング

CREATE TABLE IF NOT EXISTS store_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  store_id INT NOT NULL COMMENT '店舗ID',
  user_id INT NOT NULL COMMENT 'ユーザーID',
  role ENUM('admin', 'manager', 'staff', 'readonly') DEFAULT 'staff' COMMENT '店舗内での役割',
  permissions JSON COMMENT '店舗ごとの権限',
  
  -- ステータス
  is_active BOOLEAN DEFAULT TRUE COMMENT '有効/無効',
  
  -- タイムスタンプ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_store_user (store_id, user_id),
  INDEX idx_store_id (store_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='店舗別ユーザーマッピング';

-- ===================================================
-- 5. 既存テーブルへの store_id 追加
-- ===================================================

-- 5.1 キャスト（Casts）
ALTER TABLE casts
ADD COLUMN IF NOT EXISTS company_id INT COMMENT '企業ID' AFTER id,
ADD COLUMN IF NOT EXISTS store_id INT NOT NULL COMMENT '店舗ID' AFTER company_id,
ADD INDEX idx_company_id (company_id),
ADD INDEX idx_store_id (store_id);

-- 5.2 受注（Orders）
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS company_id INT COMMENT '企業ID' AFTER id,
ADD COLUMN IF NOT EXISTS store_id INT NOT NULL COMMENT '店舗ID' AFTER company_id,
ADD INDEX idx_company_id (company_id),
ADD INDEX idx_store_id (store_id);

-- 5.3 スケジュール（Schedules）
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS company_id INT COMMENT '企業ID' AFTER id,
ADD COLUMN IF NOT EXISTS store_id INT NOT NULL COMMENT '店舗ID' AFTER company_id,
ADD INDEX idx_company_id (company_id),
ADD INDEX idx_store_id (store_id);

-- 5.4 ブログ/写メ日記（Blogs）
ALTER TABLE blogs
ADD COLUMN IF NOT EXISTS company_id INT COMMENT '企業ID' AFTER id,
ADD COLUMN IF NOT EXISTS store_id INT COMMENT '店舗ID' AFTER company_id,
ADD INDEX idx_company_id (company_id),
ADD INDEX idx_store_id (store_id);

-- 5.5 レビュー（Reviews）
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS company_id INT COMMENT '企業ID' AFTER id,
ADD COLUMN IF NOT EXISTS store_id INT COMMENT '店舗ID' AFTER company_id,
ADD INDEX idx_company_id (company_id),
ADD INDEX idx_store_id (store_id);

-- 5.6 チャット（Chats）
ALTER TABLE chats
ADD COLUMN IF NOT EXISTS company_id INT COMMENT '企業ID' AFTER id,
ADD COLUMN IF NOT EXISTS store_id INT COMMENT '店舗ID' AFTER company_id,
ADD INDEX idx_company_id (company_id),
ADD INDEX idx_store_id (store_id);

-- 5.7 お知らせ（Announcements）
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS company_id INT COMMENT '企業ID' AFTER id,
ADD COLUMN IF NOT EXISTS store_id INT COMMENT '店舗ID' AFTER company_id,
ADD INDEX idx_company_id (company_id),
ADD INDEX idx_store_id (store_id);

-- 5.8 ランキング（Rankings）
ALTER TABLE rankings
ADD COLUMN IF NOT EXISTS company_id INT COMMENT '企業ID' AFTER id,
ADD COLUMN IF NOT EXISTS store_id INT COMMENT '店舗ID' AFTER company_id,
ADD INDEX idx_company_id (company_id),
ADD INDEX idx_store_id (store_id);

-- 5.9 ポイント（Points）
ALTER TABLE points
ADD COLUMN IF NOT EXISTS company_id INT COMMENT '企業ID' AFTER id,
ADD COLUMN IF NOT EXISTS store_id INT COMMENT '店舗ID' AFTER company_id,
ADD INDEX idx_company_id (company_id),
ADD INDEX idx_store_id (store_id);

-- 5.10 領収書（Receipts）
ALTER TABLE receipts
ADD COLUMN IF NOT EXISTS company_id INT COMMENT '企業ID' AFTER id,
ADD COLUMN IF NOT EXISTS store_id INT COMMENT '店舗ID' AFTER company_id,
ADD INDEX idx_company_id (company_id),
ADD INDEX idx_store_id (store_id);

-- ===================================================
-- 6. サブスクリプション管理テーブル
-- ===================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL COMMENT '企業ID',
  
  -- プラン情報
  plan_type ENUM('free', 'basic', 'standard', 'premium', 'enterprise') NOT NULL COMMENT 'プラン種別',
  plan_name VARCHAR(100) COMMENT 'プラン名',
  
  -- 料金
  monthly_price DECIMAL(10, 2) DEFAULT 0.00 COMMENT '月額料金',
  annual_price DECIMAL(10, 2) DEFAULT 0.00 COMMENT '年額料金',
  billing_cycle ENUM('monthly', 'annual') DEFAULT 'monthly' COMMENT '課金サイクル',
  
  -- 期間
  start_date DATE NOT NULL COMMENT '開始日',
  end_date DATE COMMENT '終了日',
  trial_ends_at DATETIME COMMENT 'トライアル終了日',
  
  -- ステータス
  status ENUM('active', 'cancelled', 'expired', 'trial') DEFAULT 'trial' COMMENT '契約状態',
  
  -- 制限
  limits JSON COMMENT 'プラン制限（店舗数、ユーザー数等）',
  
  -- 支払い情報参照
  payment_method VARCHAR(50) COMMENT '支払い方法',
  last_payment_date DATE COMMENT '最終支払日',
  next_billing_date DATE COMMENT '次回請求日',
  
  -- タイムスタンプ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  cancelled_at DATETIME COMMENT 'キャンセル日時',
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company_id (company_id),
  INDEX idx_status (status),
  INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='サブスクリプション管理';

-- ===================================================
-- 7. 利用統計テーブル
-- ===================================================

CREATE TABLE IF NOT EXISTS usage_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL COMMENT '企業ID',
  store_id INT COMMENT '店舗ID（NULL=企業全体）',
  
  -- 統計日付
  stat_date DATE NOT NULL COMMENT '統計日',
  
  -- カウンター
  total_customers INT DEFAULT 0 COMMENT '顧客総数',
  total_orders INT DEFAULT 0 COMMENT '受注総数',
  total_casts INT DEFAULT 0 COMMENT 'キャスト総数',
  active_users INT DEFAULT 0 COMMENT 'アクティブユーザー数',
  
  -- Excel/CSVインポート統計
  total_imports INT DEFAULT 0 COMMENT 'インポート回数',
  total_imported_records INT DEFAULT 0 COMMENT 'インポート総レコード数',
  
  -- API利用統計
  api_calls INT DEFAULT 0 COMMENT 'API呼び出し回数',
  
  -- ストレージ使用量
  storage_used_mb DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'ストレージ使用量（MB）',
  
  -- タイムスタンプ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE KEY unique_company_store_date (company_id, store_id, stat_date),
  INDEX idx_company_id (company_id),
  INDEX idx_store_id (store_id),
  INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='利用統計';

-- ===================================================
-- 8. 監査ログテーブル
-- ===================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id INT COMMENT '企業ID',
  store_id INT COMMENT '店舗ID',
  user_id INT COMMENT 'ユーザーID',
  
  -- アクション情報
  action VARCHAR(100) NOT NULL COMMENT 'アクション種別（create, update, delete等）',
  resource_type VARCHAR(100) COMMENT 'リソース種別（customer, order, cast等）',
  resource_id INT COMMENT 'リソースID',
  
  -- 詳細
  description TEXT COMMENT 'アクション説明',
  changes JSON COMMENT '変更内容（before/after）',
  
  -- リクエスト情報
  ip_address VARCHAR(45) COMMENT 'IPアドレス',
  user_agent TEXT COMMENT 'User Agent',
  
  -- タイムスタンプ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_company_id (company_id),
  INDEX idx_store_id (store_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_resource (resource_type, resource_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='監査ログ';

-- ===================================================
-- 9. 初期データ投入
-- ===================================================

-- 9.1 デモ企業作成
INSERT INTO companies (name, slug, email, plan_type, max_stores, max_users, status) VALUES
('人妻の蜜グループ', 'hitozuma-group', 'info@h-mitsu.com', 'enterprise', 10, 50, 'active'),
('デモ企業A', 'demo-company-a', 'demo@example.com', 'trial', 1, 5, 'trial');

-- 9.2 既存店舗を企業に紐付け（人妻の蜜グループ = company_id: 1）
UPDATE stores SET company_id = 1 WHERE code IN ('nishifuna', 'kinshicho', 'kasai', 'matsudo');

-- 9.3 既存ユーザーに企業・店舗を設定（管理者は全店舗アクセス可能）
UPDATE users SET company_id = 1, user_type = 'company_admin' WHERE role = 'admin';
UPDATE users SET company_id = 1, user_type = 'customer' WHERE role = 'user';

-- ===================================================
-- 10. ビュー作成（便利なクエリ）
-- ===================================================

-- 10.1 企業別店舗一覧ビュー
CREATE OR REPLACE VIEW v_company_stores AS
SELECT 
  c.id AS company_id,
  c.name AS company_name,
  c.slug AS company_slug,
  c.status AS company_status,
  s.id AS store_id,
  s.code AS store_code,
  s.display_name AS store_name,
  s.status AS store_status,
  COUNT(DISTINCT su.user_id) AS user_count
FROM companies c
LEFT JOIN stores s ON c.id = s.company_id
LEFT JOIN store_users su ON s.id = su.store_id AND su.is_active = TRUE
GROUP BY c.id, s.id;

-- 10.2 店舗別統計ビュー
CREATE OR REPLACE VIEW v_store_statistics AS
SELECT 
  s.id AS store_id,
  s.company_id,
  s.display_name AS store_name,
  COUNT(DISTINCT c.id) AS cast_count,
  COUNT(DISTINCT o.id) AS order_count,
  COUNT(DISTINCT u.id) AS customer_count
FROM stores s
LEFT JOIN casts c ON s.id = c.store_id
LEFT JOIN orders o ON s.id = o.store_id
LEFT JOIN users u ON s.id = u.store_id AND u.user_type = 'customer'
GROUP BY s.id;

-- ===================================================
-- 完了
-- ===================================================

-- このスキーマにより、以下が可能になります：
-- 1. 複数企業の管理
-- 2. 企業ごとに複数店舗
-- 3. ユーザーの企業・店舗割り当て
-- 4. データの完全な分離（テナント分離）
-- 5. サブスクリプション管理
-- 6. 利用統計・監査ログ
-- 7. 将来の拡張性（API、連携等）
