-- ============================================
-- 店舗グループ機能 マイグレーション適用スクリプト
-- ============================================
-- 既存データに影響を与えずに安全にテーブルを追加
-- ============================================

USE goodfife_db;

-- --------------------------------------------
-- 1. 店舗グループテーブル作成
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
-- 2. 店舗グループ変更履歴テーブル作成
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

-- --------------------------------------------
-- 3. stores テーブルに group_id カラムを追加 (既存データは NULL)
-- --------------------------------------------
-- カラムが既に存在する場合はエラーを無視
SET @check_column = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'stores' 
    AND COLUMN_NAME = 'group_id'
);

SET @alter_sql = IF(
  @check_column = 0,
  'ALTER TABLE stores ADD COLUMN group_id INT DEFAULT NULL COMMENT ''所属グループID（NULL=独立店舗）'' AFTER company_id',
  'SELECT ''Column group_id already exists'' AS message'
);

PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- インデックス追加 (既に存在する場合はエラーを無視)
SET @check_index = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'stores' 
    AND INDEX_NAME = 'idx_group_id'
);

SET @index_sql = IF(
  @check_index = 0,
  'ALTER TABLE stores ADD INDEX idx_group_id (group_id)',
  'SELECT ''Index idx_group_id already exists'' AS message'
);

PREPARE stmt FROM @index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --------------------------------------------
-- 4. users テーブルに company_id, store_id カラムを追加
-- --------------------------------------------
-- company_id カラム追加
SET @check_company_id = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'company_id'
);

SET @alter_users_company = IF(
  @check_company_id = 0,
  'ALTER TABLE users ADD COLUMN company_id INT DEFAULT NULL COMMENT ''企業ID'' AFTER id',
  'SELECT ''Column company_id already exists in users'' AS message'
);

PREPARE stmt FROM @alter_users_company;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- store_id カラム追加
SET @check_store_id = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'store_id'
);

SET @alter_users_store = IF(
  @check_store_id = 0,
  'ALTER TABLE users ADD COLUMN store_id INT DEFAULT NULL COMMENT ''店舗ID'' AFTER company_id',
  'SELECT ''Column store_id already exists in users'' AS message'
);

PREPARE stmt FROM @alter_users_store;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- インデックス追加
SET @check_users_company_idx = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND INDEX_NAME = 'idx_company_store'
);

SET @users_idx_sql = IF(
  @check_users_company_idx = 0,
  'ALTER TABLE users ADD INDEX idx_company_store (company_id, store_id)',
  'SELECT ''Index idx_company_store already exists'' AS message'
);

PREPARE stmt FROM @users_idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --------------------------------------------
-- 5. casts テーブルに company_id, store_id カラムを追加
-- --------------------------------------------
-- company_id カラム追加
SET @check_casts_company = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'casts' 
    AND COLUMN_NAME = 'company_id'
);

SET @alter_casts_company = IF(
  @check_casts_company = 0,
  'ALTER TABLE casts ADD COLUMN company_id INT DEFAULT NULL COMMENT ''企業ID'' AFTER id',
  'SELECT ''Column company_id already exists in casts'' AS message'
);

PREPARE stmt FROM @alter_casts_company;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- store_id カラム追加
SET @check_casts_store = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'casts' 
    AND COLUMN_NAME = 'store_id'
);

SET @alter_casts_store = IF(
  @check_casts_store = 0,
  'ALTER TABLE casts ADD COLUMN store_id INT DEFAULT NULL COMMENT ''店舗ID'' AFTER company_id',
  'SELECT ''Column store_id already exists in casts'' AS message'
);

PREPARE stmt FROM @alter_casts_store;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- インデックス追加
SET @check_casts_idx = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'casts' 
    AND INDEX_NAME = 'idx_company_store'
);

SET @casts_idx_sql = IF(
  @check_casts_idx = 0,
  'ALTER TABLE casts ADD INDEX idx_company_store (company_id, store_id)',
  'SELECT ''Index idx_company_store already exists in casts'' AS message'
);

PREPARE stmt FROM @casts_idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --------------------------------------------
-- 6. orders テーブルに company_id, store_id カラムを追加
-- --------------------------------------------
-- company_id カラム追加
SET @check_orders_company = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'orders' 
    AND COLUMN_NAME = 'company_id'
);

SET @alter_orders_company = IF(
  @check_orders_company = 0,
  'ALTER TABLE orders ADD COLUMN company_id INT DEFAULT NULL COMMENT ''企業ID'' AFTER id',
  'SELECT ''Column company_id already exists in orders'' AS message'
);

PREPARE stmt FROM @alter_orders_company;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- store_id カラム追加
SET @check_orders_store = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'orders' 
    AND COLUMN_NAME = 'store_id'
);

SET @alter_orders_store = IF(
  @check_orders_store = 0,
  'ALTER TABLE orders ADD COLUMN store_id INT DEFAULT NULL COMMENT ''店舗ID'' AFTER company_id',
  'SELECT ''Column store_id already exists in orders'' AS message'
);

PREPARE stmt FROM @alter_orders_store;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- インデックス追加
SET @check_orders_idx = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'orders' 
    AND INDEX_NAME = 'idx_company_store'
);

SET @orders_idx_sql = IF(
  @check_orders_idx = 0,
  'ALTER TABLE orders ADD INDEX idx_company_store (company_id, store_id)',
  'SELECT ''Index idx_company_store already exists in orders'' AS message'
);

PREPARE stmt FROM @orders_idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --------------------------------------------
-- 7. 確認用クエリ
-- --------------------------------------------
SELECT '✅ マイグレーション完了！' AS status;

-- 作成されたテーブルを確認
SELECT 
  TABLE_NAME, 
  TABLE_ROWS,
  CREATE_TIME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('store_groups', 'store_group_history')
ORDER BY TABLE_NAME;

-- 追加されたカラムを確認
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('users', 'casts', 'orders', 'stores')
  AND COLUMN_NAME IN ('company_id', 'store_id', 'group_id')
ORDER BY TABLE_NAME, ORDINAL_POSITION;
