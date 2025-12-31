-- 顧客管理システム用テーブル作成

-- 店舗テーブル
CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  business_hours VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- デフォルト店舗データ
INSERT INTO stores (id, name, display_name, address, phone) VALUES
  ('nishifuna', 'nishifuna', '人妻の蜜 西船橋', '千葉県船橋市西船', '050-1748-7999'),
  ('kinshicho', 'kinshicho', '人妻の蜜 錦糸町', '東京都墨田区錦糸', '050-XXXX-XXXX'),
  ('kasai', 'kasai', '人妻の蜜 葛西', '東京都江戸川区葛西', '050-XXXX-XXXX'),
  ('matsudo', 'matsudo', '人妻の蜜 松戸', '千葉県松戸市', '050-XXXX-XXXX')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 受注テーブル
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- 日付管理（9時区切り）
  business_date DATE NOT NULL COMMENT '営業日（9時区切り）',
  order_datetime DATETIME NOT NULL COMMENT '実際の受注日時',
  
  -- 基本情報
  store_id VARCHAR(50) NOT NULL,
  customer_id INT NOT NULL,
  cast_id INT NOT NULL,
  
  -- 予約情報
  start_time DATETIME NOT NULL COMMENT '開始時間',
  duration INT NOT NULL COMMENT '分数',
  location_type ENUM('hotel', 'home', 'other') NOT NULL DEFAULT 'hotel',
  location_name VARCHAR(255),
  address TEXT,
  
  -- 料金情報
  base_price INT NOT NULL DEFAULT 0 COMMENT 'コース料金',
  nomination_fee INT NOT NULL DEFAULT 0 COMMENT '指名料',
  transportation_fee INT NOT NULL DEFAULT 0 COMMENT '交通費',
  option_fee INT NOT NULL DEFAULT 0 COMMENT 'オプション料金',
  discount INT NOT NULL DEFAULT 0 COMMENT '割引',
  total_price INT NOT NULL DEFAULT 0 COMMENT '合計金額',
  
  -- 詳細情報
  options JSON COMMENT 'オプション詳細',
  memo TEXT COMMENT '備考',
  
  -- 指名情報
  is_nomination BOOLEAN DEFAULT FALSE COMMENT '本指名かどうか',
  nomination_count INT DEFAULT 0 COMMENT '指名回数',
  
  -- ステータス
  status ENUM('draft', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
  
  -- タイムスタンプ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (cast_id) REFERENCES casts(id),
  
  INDEX idx_business_date (business_date),
  INDEX idx_store_date (store_id, business_date),
  INDEX idx_customer (customer_id),
  INDEX idx_cast (cast_id)
);

-- 顧客メモテーブル
CREATE TABLE IF NOT EXISTS customer_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  note_type ENUM('memo', 'warning', 'important') DEFAULT 'memo',
  content TEXT NOT NULL,
  created_by INT COMMENT 'スタッフID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES users(id),
  INDEX idx_customer (customer_id)
);

-- ホテルリスト
CREATE TABLE IF NOT EXISTS hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  transportation_fee INT NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (store_id) REFERENCES stores(id),
  INDEX idx_store (store_id)
);

-- 料金プランテーブル
CREATE TABLE IF NOT EXISTS price_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id VARCHAR(50) NOT NULL,
  cast_id INT COMMENT 'NULLの場合は標準料金',
  duration INT NOT NULL COMMENT '分数',
  price INT NOT NULL,
  plan_name VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (cast_id) REFERENCES casts(id),
  INDEX idx_store (store_id),
  INDEX idx_duration (duration)
);

-- デフォルト料金プラン（西船橋店の例）
INSERT INTO price_plans (store_id, duration, price, plan_name) VALUES
  ('nishifuna', 60, 12000, '60分コース'),
  ('nishifuna', 90, 17000, '90分コース'),
  ('nishifuna', 120, 22000, '120分コース')
ON DUPLICATE KEY UPDATE price = VALUES(price);

-- usersテーブルに顧客情報カラムを追加
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS customer_type ENUM('new', 'regular', 'vip') DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS home_address TEXT,
  ADD COLUMN IF NOT EXISTS home_transportation_fee INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_orders INT DEFAULT 0 COMMENT '総予約回数',
  ADD COLUMN IF NOT EXISTS last_visit_date DATE COMMENT '最終来店日',
  ADD COLUMN IF NOT EXISTS notes TEXT COMMENT '顧客メモ';

-- castsテーブルに指名情報を追加
ALTER TABLE casts
  ADD COLUMN IF NOT EXISTS nomination_fee INT DEFAULT 2000 COMMENT '指名料';
