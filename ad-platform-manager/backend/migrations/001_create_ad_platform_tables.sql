-- 広告媒体一括更新システム データベーススキーマ
-- 作成日: 2025-12-16

-- 1. 広告媒体管理テーブル
CREATE TABLE IF NOT EXISTS ad_platforms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE COMMENT '媒体名',
  category ENUM('お客様向け', '女子求人', '男子求人') NOT NULL COMMENT 'カテゴリ',
  url VARCHAR(500) COMMENT 'ログインURL',
  login_id VARCHAR(255) COMMENT 'ログインID',
  login_password TEXT COMMENT 'ログインパスワード（暗号化）',
  connection_type ENUM('WEB', 'API', 'FTP') DEFAULT 'WEB' COMMENT '接続タイプ',
  api_endpoint VARCHAR(500) COMMENT 'APIエンドポイント',
  api_key VARCHAR(255) COMMENT 'APIキー',
  api_secret TEXT COMMENT 'APIシークレット（暗号化）',
  ftp_host VARCHAR(255) COMMENT 'FTPホスト',
  ftp_port INT COMMENT 'FTPポート',
  ftp_username VARCHAR(255) COMMENT 'FTPユーザー名',
  ftp_password TEXT COMMENT 'FTPパスワード（暗号化）',
  is_active TINYINT(1) DEFAULT 1 COMMENT '有効フラグ',
  settings JSON COMMENT '追加設定',
  last_sync_at DATETIME COMMENT '最終同期日時',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_is_active (is_active),
  INDEX idx_connection_type (connection_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='広告媒体管理';

-- 2. 配信ログテーブル
CREATE TABLE IF NOT EXISTS distribution_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  platform_id INT NOT NULL COMMENT '媒体ID',
  cast_id INT COMMENT 'キャストID',
  distribution_type VARCHAR(50) NOT NULL COMMENT '配信タイプ',
  status ENUM('成功', '失敗', '処理中') DEFAULT '処理中' COMMENT 'ステータス',
  request_data JSON COMMENT 'リクエストデータ',
  response_data JSON COMMENT 'レスポンスデータ',
  error_message TEXT COMMENT 'エラーメッセージ',
  execution_time INT COMMENT '実行時間（ミリ秒）',
  metadata JSON COMMENT 'メタデータ',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (platform_id) REFERENCES ad_platforms(id) ON DELETE CASCADE,
  INDEX idx_platform_id (platform_id),
  INDEX idx_cast_id (cast_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_distribution_type (distribution_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配信ログ';

-- 3. 初期データ投入: シティヘブンネット
INSERT INTO ad_platforms (
  name, category, url, login_id, login_password, connection_type, is_active
) VALUES (
  'シティヘブンネット',
  'お客様向け',
  'https://spmanager.cityheaven.net/',
  '2500000713',
  'ZKs60jlq',
  'WEB',
  1
) ON DUPLICATE KEY UPDATE
  url = VALUES(url),
  login_id = VALUES(login_id),
  login_password = VALUES(login_password);

-- 4. 初期データ投入: デリヘルタウン
INSERT INTO ad_platforms (
  name, category, url, login_id, login_password, connection_type, is_active
) VALUES (
  'デリヘルタウン',
  'お客様向け',
  'https://admin.dto.jp/a/auth/input',
  'info@h-mitsu.com',
  'hitodumamitu',
  'WEB',
  1
) ON DUPLICATE KEY UPDATE
  url = VALUES(url),
  login_id = VALUES(login_id),
  login_password = VALUES(login_password);

-- 確認
SELECT '✅ ad_platforms テーブル作成完了' as status;
SELECT '✅ distribution_logs テーブル作成完了' as status;
SELECT '✅ 初期データ投入完了' as status;
SELECT * FROM ad_platforms;
