-- ============================================
-- 店舗グループ機能 データベーススキーマ
-- ============================================
-- 作成日: 2025-12-16
-- 目的: 企業内で店舗をグループ化し、データ共有を柔軟に制御
-- ============================================

-- --------------------------------------------
-- 1. 店舗グループテーブル
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS store_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  group_name VARCHAR(100) NOT NULL COMMENT 'グループ名（例: 首都圏エリア、千葉エリア）',
  group_code VARCHAR(50) COMMENT 'グループコード（例: TOKYO-AREA-01）',
  description TEXT COMMENT 'グループの説明',
  
  -- データ共有設定
  share_customers BOOLEAN DEFAULT TRUE COMMENT '顧客データをグループ内で共有',
  share_casts BOOLEAN DEFAULT FALSE COMMENT 'キャストデータをグループ内で共有',
  share_orders BOOLEAN DEFAULT TRUE COMMENT '受注履歴をグループ内で共有',
  share_reviews BOOLEAN DEFAULT FALSE COMMENT 'レビューをグループ内で共有',
  
  -- 管理情報
  is_active BOOLEAN DEFAULT TRUE COMMENT 'グループの有効/無効',
  display_order INT DEFAULT 0 COMMENT '表示順',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- インデックス
  INDEX idx_company_id (company_id),
  INDEX idx_group_code (group_code),
  INDEX idx_is_active (is_active),
  
  -- 外部キー制約
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  
  -- ユニーク制約
  UNIQUE KEY unique_group_code (company_id, group_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='店舗グループマスター';

-- --------------------------------------------
-- 2. stores テーブルに group_id 追加
-- --------------------------------------------
ALTER TABLE stores 
ADD COLUMN group_id INT DEFAULT NULL COMMENT '所属グループID（NULL=独立店舗）' AFTER company_id,
ADD INDEX idx_group_id (group_id),
ADD FOREIGN KEY (group_id) REFERENCES store_groups(id) ON DELETE SET NULL;

-- --------------------------------------------
-- 3. グループメンバーシップ履歴テーブル（オプション）
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
  INDEX idx_changed_at (changed_at),
  
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES store_groups(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='店舗グループ変更履歴';

-- --------------------------------------------
-- 4. デフォルトグループの作成例
-- --------------------------------------------
-- 注意: 以下は例です。実際のデータは管理画面から登録してください

-- 例1: 全店舗共有グループ（company_id = 1 の場合）
INSERT INTO store_groups (company_id, group_name, group_code, description, share_customers, share_casts, share_orders)
VALUES 
(1, '全店舗共有グループ', 'ALL-STORES', '全店舗で顧客・受注データを共有', TRUE, FALSE, TRUE);

-- 例2: エリア別グループ
INSERT INTO store_groups (company_id, group_name, group_code, description, share_customers, share_casts, share_orders)
VALUES 
(1, '首都圏エリア', 'TOKYO-AREA', '東京・千葉西部の店舗グループ', TRUE, FALSE, TRUE),
(1, '千葉エリア', 'CHIBA-AREA', '千葉東部の店舗グループ', TRUE, FALSE, TRUE);

-- --------------------------------------------
-- 5. 既存店舗へのグループ割り当て例
-- --------------------------------------------
-- 注意: 実際の店舗IDに合わせて変更してください

-- 全店舗を「全店舗共有グループ」に割り当て
-- UPDATE stores SET group_id = 1 WHERE company_id = 1;

-- またはエリア別に割り当て
-- UPDATE stores SET group_id = 2 WHERE id IN (1, 2, 3);  -- 西船橋、錦糸町、葛西
-- UPDATE stores SET group_id = 3 WHERE id IN (4, 5);     -- 松戸、船橋

-- --------------------------------------------
-- 6. 便利なVIEW: グループ所属店舗一覧
-- --------------------------------------------
CREATE OR REPLACE VIEW view_store_group_members AS
SELECT 
  sg.id AS group_id,
  sg.company_id,
  sg.group_name,
  sg.share_customers,
  sg.share_casts,
  sg.share_orders,
  s.id AS store_id,
  s.store_name,
  s.is_active AS store_is_active,
  COUNT(s.id) OVER (PARTITION BY sg.id) AS member_count
FROM store_groups sg
LEFT JOIN stores s ON sg.id = s.group_id
WHERE sg.is_active = TRUE
ORDER BY sg.display_order, sg.id, s.store_name;

-- --------------------------------------------
-- 7. 便利なVIEW: 独立店舗一覧
-- --------------------------------------------
CREATE OR REPLACE VIEW view_independent_stores AS
SELECT 
  s.id AS store_id,
  s.company_id,
  s.store_name,
  s.is_active,
  'INDEPENDENT' AS store_type
FROM stores s
WHERE s.group_id IS NULL
  AND s.is_active = TRUE
ORDER BY s.store_name;

-- --------------------------------------------
-- 8. 統計用VIEW: グループ別データ集計
-- --------------------------------------------
CREATE OR REPLACE VIEW view_group_statistics AS
SELECT 
  sg.id AS group_id,
  sg.company_id,
  sg.group_name,
  COUNT(DISTINCT s.id) AS total_stores,
  COUNT(DISTINCT u.id) AS total_customers,
  COUNT(DISTINCT c.id) AS total_casts,
  COUNT(DISTINCT o.id) AS total_orders,
  COALESCE(SUM(o.amount), 0) AS total_revenue
FROM store_groups sg
LEFT JOIN stores s ON sg.id = s.group_id
LEFT JOIN users u ON s.id = u.store_id
LEFT JOIN casts c ON s.id = c.store_id
LEFT JOIN orders o ON s.id = o.store_id
WHERE sg.is_active = TRUE
GROUP BY sg.id, sg.company_id, sg.group_name;

-- ============================================
-- データ整合性チェック用クエリ
-- ============================================

-- グループに所属している店舗数を確認
-- SELECT 
--   sg.group_name, 
--   COUNT(s.id) as store_count 
-- FROM store_groups sg 
-- LEFT JOIN stores s ON sg.id = s.group_id 
-- GROUP BY sg.id;

-- 独立店舗（グループなし）を確認
-- SELECT * FROM stores WHERE group_id IS NULL;

-- グループごとの顧客数を確認
-- SELECT 
--   sg.group_name,
--   COUNT(DISTINCT u.id) as customer_count
-- FROM store_groups sg
-- JOIN stores s ON sg.id = s.group_id
-- JOIN users u ON s.id = u.store_id
-- GROUP BY sg.id;

-- ============================================
-- ロールバック用SQL（必要な場合）
-- ============================================

-- DROP VIEW IF EXISTS view_group_statistics;
-- DROP VIEW IF EXISTS view_independent_stores;
-- DROP VIEW IF EXISTS view_store_group_members;
-- DROP TABLE IF EXISTS store_group_history;
-- ALTER TABLE stores DROP FOREIGN KEY stores_ibfk_group;
-- ALTER TABLE stores DROP COLUMN group_id;
-- DROP TABLE IF EXISTS store_groups;
