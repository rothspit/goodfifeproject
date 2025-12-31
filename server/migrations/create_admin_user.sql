-- 管理者アカウント作成

-- デフォルト管理者アカウント
-- ID: admin@hitozumanomitsu.com
-- パスワード: admin123 (ハッシュ化後: $2b$10$rXH3sFZDVKjDLqxqVxYYgeqJqHRJ8ZP5Vr.JiYLQl3p3zKBOGGZZi)

INSERT INTO users (
  phone_number,
  password,
  name,
  email,
  role,
  created_at,
  updated_at
) VALUES (
  '09000000000',
  '$2b$10$rXH3sFZDVKjDLqxqVxYYgeqJqHRJ8ZP5Vr.JiYLQl3p3zKBOGGZZi',
  '管理者',
  'admin@hitozumanomitsu.com',
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON DUPLICATE KEY UPDATE email = email;

-- role カラムが存在しない場合は追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('customer', 'admin', 'cast', 'staff') DEFAULT 'customer';

-- 既存ユーザーを管理者に昇格させる場合（必要に応じて）
-- UPDATE users SET role = 'admin' WHERE email = 'admin@hitozumanomitsu.com';
