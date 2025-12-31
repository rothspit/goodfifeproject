-- ヘブンネット・ソープランドヘブン追加
-- 作成日: 2025-12-16

-- 5. 初期データ投入: ヘブンネット
INSERT INTO ad_platforms (
  name, category, url, login_id, login_password, connection_type, is_active, settings
) VALUES (
  'ヘブンネット',
  'お客様向け',
  'https://www.heavennet.cc/admin/login.php',
  'PLACEHOLDER_USERNAME',
  'PLACEHOLDER_PASSWORD',
  'WEB',
  0,
  JSON_OBJECT(
    'note', '実際の認証情報を設定後に有効化してください',
    'base_url', 'https://www.heavennet.cc/admin/',
    'diary_url', 'https://www.heavennet.cc/admin/diary/list.php',
    'service_class', 'HeavenNetCCService'
  )
) ON DUPLICATE KEY UPDATE
  url = VALUES(url),
  connection_type = VALUES(connection_type),
  settings = VALUES(settings);

-- 6. 初期データ投入: ソープランドヘブン
INSERT INTO ad_platforms (
  name, category, url, login_id, login_password, connection_type, is_active, settings
) VALUES (
  'ソープランドヘブン',
  'お客様向け',
  'https://www.soapheaven.jp/admin/login.php',
  'PLACEHOLDER_USERNAME',
  'PLACEHOLDER_PASSWORD',
  'WEB',
  0,
  JSON_OBJECT(
    'note', '実際の認証情報を設定後に有効化してください',
    'base_url', 'https://www.soapheaven.jp/admin/',
    'diary_url', 'https://www.soapheaven.jp/admin/diary/list.php',
    'service_class', 'SoaplandHeavenService',
    'cast_term', '姫'
  )
) ON DUPLICATE KEY UPDATE
  url = VALUES(url),
  connection_type = VALUES(connection_type),
  settings = VALUES(settings);

-- 確認
SELECT '✅ ヘブンネット追加完了' as status;
SELECT '✅ ソープランドヘブン追加完了' as status;
SELECT id, name, category, connection_type, is_active FROM ad_platforms;
