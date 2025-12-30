-- 顧客管理システムテーブル作成

-- 1. 顧客テーブル (既存のusersテーブルを拡張する形)
-- 既存のusersテーブルに店舗情報やメモを追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS store_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_notes TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_orders INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_order_date DATETIME;
ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_status ENUM('active', 'inactive', 'vip', 'blocked') DEFAULT 'active';

-- 2. 受注テーブル (注文・予約管理)
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  store_id VARCHAR(50) NOT NULL,
  customer_id INT NOT NULL,
  cast_id INT NOT NULL,
  
  -- 予約情報
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  duration INT NOT NULL COMMENT '時間(分)',
  
  -- サービス内容
  course_name VARCHAR(100),
  course_price DECIMAL(10,2),
  
  -- オプション
  options TEXT COMMENT 'JSON形式でオプション保存',
  
  -- 料金
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- ステータス
  status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  
  -- メモ
  admin_notes TEXT COMMENT '管理者メモ',
  customer_request TEXT COMMENT 'お客様要望',
  
  -- 受注方法
  order_source ENUM('phone', 'web', 'chat', 'email', 'walk_in') NOT NULL,
  
  -- CTI情報
  call_id VARCHAR(100) COMMENT 'Dialpad通話ID',
  call_duration INT COMMENT '通話時間(秒)',
  
  -- タイムスタンプ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT COMMENT '作成者(管理者ID)',
  
  -- 外部キー
  FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE,
  
  -- インデックス
  INDEX idx_customer_id (customer_id),
  INDEX idx_cast_id (cast_id),
  INDEX idx_store_id (store_id),
  INDEX idx_reservation_date (reservation_date),
  INDEX idx_status (status),
  INDEX idx_order_source (order_source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 顧客-キャスト利用履歴テーブル
CREATE TABLE IF NOT EXISTS customer_cast_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  cast_id INT NOT NULL,
  order_id INT NOT NULL,
  visit_count INT DEFAULT 1 COMMENT 'このキャストへの利用回数',
  first_visit_date DATETIME NOT NULL,
  last_visit_date DATETIME NOT NULL,
  total_spent DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_customer_cast (customer_id, cast_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_cast_id (cast_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CTI通話ログテーブル
CREATE TABLE IF NOT EXISTS cti_call_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  call_id VARCHAR(100) UNIQUE NOT NULL COMMENT 'Dialpad通話ID',
  
  -- 通話情報
  phone_number VARCHAR(20) NOT NULL,
  direction ENUM('inbound', 'outbound') NOT NULL,
  call_status ENUM('ringing', 'answered', 'missed', 'voicemail', 'completed') NOT NULL,
  
  -- 顧客情報
  customer_id INT COMMENT '紐付いた顧客ID',
  store_id VARCHAR(50),
  
  -- 時間情報
  call_started_at DATETIME,
  call_answered_at DATETIME,
  call_ended_at DATETIME,
  call_duration INT COMMENT '通話時間(秒)',
  
  -- 録音・メモ
  recording_url VARCHAR(500),
  call_notes TEXT,
  
  -- 受注情報
  order_id INT COMMENT '作成された受注ID',
  
  -- その他
  dialpad_data JSON COMMENT 'Dialpad APIからの生データ',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  
  INDEX idx_phone_number (phone_number),
  INDEX idx_customer_id (customer_id),
  INDEX idx_call_started_at (call_started_at),
  INDEX idx_direction (direction),
  INDEX idx_call_status (call_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 顧客メモテーブル (タイムライン形式)
CREATE TABLE IF NOT EXISTS customer_notes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  note_type ENUM('general', 'complaint', 'preference', 'warning', 'important') DEFAULT 'general',
  content TEXT NOT NULL,
  
  created_by INT COMMENT '作成者(管理者ID)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_customer_id (customer_id),
  INDEX idx_note_type (note_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Dialpad Webhook設定テーブル
CREATE TABLE IF NOT EXISTS dialpad_webhook_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  store_id VARCHAR(50) UNIQUE NOT NULL,
  
  -- Dialpad API設定
  api_key VARCHAR(500),
  webhook_secret VARCHAR(500),
  office_id VARCHAR(100),
  
  -- 機能設定
  auto_popup BOOLEAN DEFAULT TRUE COMMENT '着信時自動ポップアップ',
  auto_create_customer BOOLEAN DEFAULT TRUE COMMENT '新規顧客自動作成',
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
