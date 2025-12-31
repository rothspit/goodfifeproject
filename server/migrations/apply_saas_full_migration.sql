-- ============================================
-- SaaS マルチテナント完全マイグレーション
-- ============================================
-- Phase 1 + Phase 2.5 の全テーブルを作成
-- 既存データに影響を与えず安全に実行可能
-- ============================================

USE goodfife_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Phase 1: マルチテナント基盤テーブル
-- ============================================

-- --------------------------------------------
-- 1. 企業マスターテーブル
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL COMMENT '企業名',
  company_code VARCHAR(50) UNIQUE COMMENT '企業コード',
  email VARCHAR(255) COMMENT 'メールアドレス',
  phone VARCHAR(20) COMMENT '電話番号',
  address TEXT COMMENT '住所',
  website VARCHAR(255) COMMENT 'ウェブサイト',
  
  -- サブスクリプション設定
  subscription_plan VARCHAR(50) DEFAULT 'free' COMMENT 'プラン (free/starter/business/enterprise)',
  subscription_status VARCHAR(20) DEFAULT 'active' COMMENT 'ステータス (active/suspended/cancelled)',
  max_stores INT DEFAULT 1 COMMENT '最大店舗数',
  max_users INT DEFAULT 10 COMMENT '最大ユーザー数',
  
  -- 管理情報
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_company_code (company_code),
  INDEX idx_subscription_status (subscription_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='企業マスター';

-- --------------------------------------------
-- 2. サブスクリプションテーブル
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  plan_name VARCHAR(50) NOT NULL COMMENT 'プラン名',
  billing_cycle VARCHAR(20) NOT NULL COMMENT '課金サイクル (monthly/yearly)',
  price DECIMAL(10,2) NOT NULL COMMENT '料金',
  currency VARCHAR(3) DEFAULT 'JPY',
  
  -- 期間
  start_date DATE NOT NULL,
  end_date DATE,
  next_billing_date DATE,
  
  -- ステータス
  status VARCHAR(20) DEFAULT 'active' COMMENT 'active/cancelled/expired',
  
  -- メタデータ
  metadata JSON COMMENT '追加情報',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_company_id (company_id),
  INDEX idx_status (status),
  INDEX idx_next_billing (next_billing_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='サブスクリプション管理';

-- --------------------------------------------
-- 3. 店舗マスターテーブル (既存の場合はスキップ)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  store_name VARCHAR(200) NOT NULL COMMENT '店舗名',
  store_code VARCHAR(50) COMMENT '店舗コード',
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  
  -- 営業情報
  business_hours JSON COMMENT '営業時間',
  is_active BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_company_id (company_id),
  INDEX idx_store_code (store_code),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='店舗マスター';

-- --------------------------------------------
-- 4. 店舗ユーザー関連付けテーブル
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS store_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  store_id INT NOT NULL,
  role VARCHAR(50) DEFAULT 'staff' COMMENT 'company_admin/store_admin/staff',
  permissions JSON COMMENT '権限設定',
  is_active BOOLEAN DEFAULT TRUE,
  
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INT COMMENT '割り当てたユーザーID',
  
  INDEX idx_user_id (user_id),
  INDEX idx_store_id (store_id),
  INDEX idx_role (role),
  
  UNIQUE KEY unique_user_store (user_id, store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='店舗ユーザー関連付け';

-- --------------------------------------------
-- 5. 利用統計テーブル
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS usage_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  store_id INT,
  
  -- 統計データ
  api_calls INT DEFAULT 0 COMMENT 'API呼び出し数',
  storage_used BIGINT DEFAULT 0 COMMENT 'ストレージ使用量(bytes)',
  active_users INT DEFAULT 0 COMMENT 'アクティブユーザー数',
  
  -- 期間
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_company_id (company_id),
  INDEX idx_store_id (store_id),
  INDEX idx_period (period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='利用統計';

-- --------------------------------------------
-- 6. 監査ログテーブル
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT,
  store_id INT,
  user_id INT,
  
  -- アクション情報
  action VARCHAR(100) NOT NULL COMMENT 'アクション名',
  resource_type VARCHAR(50) COMMENT 'リソースタイプ',
  resource_id INT COMMENT 'リソースID',
  description TEXT COMMENT '説明',
  
  -- リクエスト情報
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_data JSON COMMENT 'リクエストデータ',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_company_id (company_id),
  INDEX idx_store_id (store_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='監査ログ';

-- ============================================
-- Phase 2.5: 店舗グループ機能
-- ============================================

-- --------------------------------------------
-- 7. 店舗グループマスターテーブル
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS store_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  group_name VARCHAR(100) NOT NULL COMMENT 'グループ名',
  group_code VARCHAR(50) COMMENT 'グループコード',
  description TEXT COMMENT 'グループの説明',
  
  -- データ共有設定
  share_customers BOOLEAN DEFAULT TRUE COMMENT '顧客データ共有',
  share_casts BOOLEAN DEFAULT FALSE COMMENT 'キャスト共有',
  share_orders BOOLEAN DEFAULT TRUE COMMENT '受注履歴共有',
  share_reviews BOOLEAN DEFAULT FALSE COMMENT 'レビュー共有',
  
  -- 管理情報
  is_active BOOLEAN DEFAULT TRUE COMMENT '有効/無効',
  display_order INT DEFAULT 0 COMMENT '表示順',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_company_id (company_id),
  INDEX idx_group_code (group_code),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='店舗グループマスター';

-- --------------------------------------------
-- 8. 店舗グループ変更履歴テーブル
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS store_group_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  group_id INT,
  action ENUM('join', 'leave', 'move') NOT NULL COMMENT 'アクション種別',
  previous_group_id INT COMMENT '移動前のグループID',
  changed_by INT COMMENT '変更者のユーザーID',
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT COMMENT '変更理由・メモ',
  
  INDEX idx_store_id (store_id),
  INDEX idx_group_id (group_id),
  INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='店舗グループ変更履歴';

-- ============================================
-- 既存テーブルへのカラム追加
-- ============================================

-- users テーブル
CALL add_column_if_not_exists('users', 'company_id', 'INT DEFAULT NULL COMMENT ''企業ID'' AFTER id');
CALL add_column_if_not_exists('users', 'store_id', 'INT DEFAULT NULL COMMENT ''店舗ID'' AFTER company_id');
CALL add_column_if_not_exists('users', 'user_type', 'VARCHAR(50) DEFAULT ''customer'' COMMENT ''ユーザータイプ''');

-- casts テーブル
CALL add_column_if_not_exists('casts', 'company_id', 'INT DEFAULT NULL COMMENT ''企業ID'' AFTER id');
CALL add_column_if_not_exists('casts', 'store_id', 'INT DEFAULT NULL COMMENT ''店舗ID'' AFTER company_id');

-- orders テーブル
CALL add_column_if_not_exists('orders', 'company_id', 'INT DEFAULT NULL COMMENT ''企業ID'' AFTER id');
CALL add_column_if_not_exists('orders', 'store_id', 'INT DEFAULT NULL COMMENT ''店舗ID'' AFTER company_id');

-- stores テーブル
CALL add_column_if_not_exists('stores', 'group_id', 'INT DEFAULT NULL COMMENT ''所属グループID'' AFTER company_id');

-- ============================================
-- インデックス追加
-- ============================================

-- users
CALL add_index_if_not_exists('users', 'idx_company_store', 'company_id, store_id');

-- casts
CALL add_index_if_not_exists('casts', 'idx_company_store', 'company_id, store_id');

-- orders
CALL add_index_if_not_exists('orders', 'idx_company_store', 'company_id, store_id');

-- stores
CALL add_index_if_not_exists('stores', 'idx_group_id', 'group_id');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- ストアドプロシージャ (ヘルパー)
-- ============================================

DELIMITER $$

DROP PROCEDURE IF EXISTS add_column_if_not_exists$$
CREATE PROCEDURE add_column_if_not_exists(
  IN table_name VARCHAR(64),
  IN column_name VARCHAR(64),
  IN column_definition TEXT
)
BEGIN
  DECLARE column_exists INT;
  
  SELECT COUNT(*) INTO column_exists
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = table_name
    AND COLUMN_NAME = column_name;
  
  IF column_exists = 0 THEN
    SET @sql = CONCAT('ALTER TABLE ', table_name, ' ADD COLUMN ', column_name, ' ', column_definition);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    SELECT CONCAT('✅ Added column: ', table_name, '.', column_name) AS result;
  ELSE
    SELECT CONCAT('⏭️  Column already exists: ', table_name, '.', column_name) AS result;
  END IF;
END$$

DROP PROCEDURE IF EXISTS add_index_if_not_exists$$
CREATE PROCEDURE add_index_if_not_exists(
  IN table_name VARCHAR(64),
  IN index_name VARCHAR(64),
  IN index_columns TEXT
)
BEGIN
  DECLARE index_exists INT;
  
  SELECT COUNT(*) INTO index_exists
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = table_name
    AND INDEX_NAME = index_name;
  
  IF index_exists = 0 THEN
    SET @sql = CONCAT('ALTER TABLE ', table_name, ' ADD INDEX ', index_name, ' (', index_columns, ')');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    SELECT CONCAT('✅ Added index: ', table_name, '.', index_name) AS result;
  ELSE
    SELECT CONCAT('⏭️  Index already exists: ', table_name, '.', index_name) AS result;
  END IF;
END$$

DELIMITER ;

-- ============================================
-- マイグレーション実行
-- ============================================

-- カラム追加
CALL add_column_if_not_exists('users', 'company_id', 'INT DEFAULT NULL COMMENT ''企業ID'' AFTER id');
CALL add_column_if_not_exists('users', 'store_id', 'INT DEFAULT NULL COMMENT ''店舗ID'' AFTER company_id');
CALL add_column_if_not_exists('users', 'user_type', 'VARCHAR(50) DEFAULT ''customer'' COMMENT ''ユーザータイプ''');

CALL add_column_if_not_exists('casts', 'company_id', 'INT DEFAULT NULL COMMENT ''企業ID'' AFTER id');
CALL add_column_if_not_exists('casts', 'store_id', 'INT DEFAULT NULL COMMENT ''店舗ID'' AFTER company_id');

CALL add_column_if_not_exists('orders', 'company_id', 'INT DEFAULT NULL COMMENT ''企業ID'' AFTER id');
CALL add_column_if_not_exists('orders', 'store_id', 'INT DEFAULT NULL COMMENT ''店舗ID'' AFTER company_id');

CALL add_column_if_not_exists('stores', 'group_id', 'INT DEFAULT NULL COMMENT ''所属グループID'' AFTER company_id');

-- インデックス追加
CALL add_index_if_not_exists('users', 'idx_company_store', 'company_id, store_id');
CALL add_index_if_not_exists('casts', 'idx_company_store', 'company_id, store_id');
CALL add_index_if_not_exists('orders', 'idx_company_store', 'company_id, store_id');
CALL add_index_if_not_exists('stores', 'idx_group_id', 'group_id');

-- ============================================
-- 確認用クエリ
-- ============================================

SELECT '
============================================
✅ SaaS マルチテナント マイグレーション完了！
============================================
' AS status;

-- 作成されたテーブル一覧
SELECT 
  TABLE_NAME AS 'テーブル名',
  TABLE_ROWS AS '行数',
  ROUND(DATA_LENGTH / 1024, 2) AS 'サイズ(KB)',
  TABLE_COMMENT AS 'コメント'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN (
    'companies', 
    'subscriptions', 
    'stores', 
    'store_users', 
    'usage_stats', 
    'audit_logs',
    'store_groups',
    'store_group_history'
  )
ORDER BY TABLE_NAME;

-- 追加されたカラム一覧
SELECT 
  TABLE_NAME AS 'テーブル名',
  COLUMN_NAME AS 'カラム名',
  COLUMN_TYPE AS '型',
  COLUMN_COMMENT AS 'コメント'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND (
    (TABLE_NAME IN ('users', 'casts', 'orders', 'stores') 
     AND COLUMN_NAME IN ('company_id', 'store_id', 'group_id', 'user_type'))
  )
ORDER BY TABLE_NAME, ORDINAL_POSITION;
