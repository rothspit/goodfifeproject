-- 24サイト全登録マイグレーション
-- 作成日: 2025-12-17

USE hitoduma_crm;

-- 高優先度サイト（既存3サイト + 新規3サイト）
INSERT INTO ad_platforms (name, category, url, login_id, login_password, connection_type, is_active, settings) VALUES
-- 4. 風俗じゃぱん
('風俗じゃぱん', 'お客様向け', 'https://fuzoku-japan.com/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0, 
 JSON_OBJECT('priority', 'high', 'service_class', 'FuzokuJapanService', 'base_url', 'https://fuzoku-japan.com/admin/')),

-- 5. ぴゅあらば
('ぴゅあらば', 'お客様向け', 'https://www.purelovers.com/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'high', 'service_class', 'PureLoversService', 'base_url', 'https://www.purelovers.com/admin/')),

-- 6. シティコレクション
('シティコレクション', 'お客様向け', 'https://city-collection.net/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'high', 'service_class', 'CityCollectionService', 'base_url', 'https://city-collection.net/admin/')),

-- 7. 駅ちか
('駅ちか', 'お客様向け', 'https://ekichika.jp/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'high', 'service_class', 'EkichikaService', 'base_url', 'https://ekichika.jp/admin/'))

ON DUPLICATE KEY UPDATE url = VALUES(url), settings = VALUES(settings);

-- 中優先度サイト（8サイト）
INSERT INTO ad_platforms (name, category, url, login_id, login_password, connection_type, is_active, settings) VALUES
-- 8. ピンクコンパニオン
('ピンクコンパニオン', 'お客様向け', 'https://www.pinkcompanion.com/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'medium', 'service_class', 'PinkCompanionService', 'base_url', 'https://www.pinkcompanion.com/admin/')),

-- 9. 風俗総合情報
('風俗総合情報', 'お客様向け', 'https://www.fuzoku.jp/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'medium', 'service_class', 'FuzokuInfoService', 'base_url', 'https://www.fuzoku.jp/admin/')),

-- 10. Qプリ
('Qプリ', 'お客様向け', 'https://www.qpri.jp/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'medium', 'service_class', 'QpriService', 'base_url', 'https://www.qpri.jp/admin/')),

-- 11. デリゲット
('デリゲット', 'お客様向け', 'https://www.deli-get.com/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'medium', 'service_class', 'DeliGetService', 'base_url', 'https://www.deli-get.com/admin/')),

-- 12. 風俗情報局
('風俗情報局', 'お客様向け', 'https://www.fuzoku-joho.net/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'medium', 'service_class', 'FuzokuJohoService', 'base_url', 'https://www.fuzoku-joho.net/admin/')),

-- 13. エッチな4610
('エッチな4610', 'お客様向け', 'https://www.h4610.com/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'medium', 'service_class', 'H4610Service', 'base_url', 'https://www.h4610.com/admin/')),

-- 14. 一撃
('一撃', 'お客様向け', 'https://www.ichigeki.jp/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'medium', 'service_class', 'IchigekiService', 'base_url', 'https://www.ichigeki.jp/admin/')),

-- 15. ぽっちゃりChannel
('ぽっちゃりChannel', 'お客様向け', 'https://www.pocchari-ch.com/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'medium', 'service_class', 'PocchariChService', 'base_url', 'https://www.pocchari-ch.com/admin/'))

ON DUPLICATE KEY UPDATE url = VALUES(url), settings = VALUES(settings);

-- 低優先度サイト（8サイト）
INSERT INTO ad_platforms (name, category, url, login_id, login_password, connection_type, is_active, settings) VALUES
-- 16. Navi Fuzoku
('Navi Fuzoku', 'お客様向け', 'https://navi-fuzoku.com/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'low', 'service_class', 'NaviFuzokuService', 'base_url', 'https://navi-fuzoku.com/admin/')),

-- 17. 熟女Style
('熟女Style', 'お客様向け', 'https://jukujo-style.jp/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'low', 'service_class', 'JukujoStyleService', 'base_url', 'https://jukujo-style.jp/admin/')),

-- 18. ガールズヘブンネット
('ガールズヘブンネット', '女子求人', 'https://girls-heaven.jp/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'low', 'service_class', 'GirlsHeavenService', 'base_url', 'https://girls-heaven.jp/admin/')),

-- 19. ボーイズヘブンネット
('ボーイズヘブンネット', '男子求人', 'https://boys-heaven.jp/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'low', 'service_class', 'BoysHeavenService', 'base_url', 'https://boys-heaven.jp/admin/')),

-- 20. 風俗テレクラ情報
('風俗テレクラ情報', 'お客様向け', 'https://tele-club.net/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'low', 'service_class', 'TeleClubService', 'base_url', 'https://tele-club.net/admin/')),

-- 21. おとなの掲示板
('おとなの掲示板', 'お客様向け', 'https://otona-keijiban.com/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'low', 'service_class', 'OtonaKeijibanService', 'base_url', 'https://otona-keijiban.com/admin/')),

-- 22. ピンサロドットコム
('ピンサロドットコム', 'お客様向け', 'https://pinsaro.com/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'low', 'service_class', 'PinsaroService', 'base_url', 'https://pinsaro.com/admin/')),

-- 23. キャバクラヘブン
('キャバクラヘブン', 'お客様向け', 'https://cabaret-heaven.net/admin/login', 'PLACEHOLDER', 'PLACEHOLDER', 'WEB', 0,
 JSON_OBJECT('priority', 'low', 'service_class', 'CabaretHeavenService', 'base_url', 'https://cabaret-heaven.net/admin/'))

ON DUPLICATE KEY UPDATE url = VALUES(url), settings = VALUES(settings);

-- 確認
SELECT '✅ 24サイト全登録完了' as status;
SELECT COUNT(*) as total_platforms FROM ad_platforms;
SELECT name, category, JSON_EXTRACT(settings, '$.priority') as priority, is_active FROM ad_platforms ORDER BY id;
