import { pool } from './database';

/**
 * 広告媒体統合管理システム用データベーステーブル初期化
 */
export async function initializeAdPlatformTables() {
  console.log('広告媒体管理テーブルを初期化中...');

  try {
    // 1. 広告媒体管理テーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ad_platforms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category ENUM('女子求人', 'お客様向け', '男子求人') NOT NULL,
        url VARCHAR(500),
        login_id VARCHAR(255),
        login_password VARCHAR(255),
        connection_type ENUM('API', 'WEB', 'FTP') DEFAULT 'WEB',
        api_endpoint VARCHAR(500),
        api_key VARCHAR(255),
        api_secret VARCHAR(255),
        ftp_host VARCHAR(255),
        ftp_port INT,
        ftp_username VARCHAR(255),
        ftp_password VARCHAR(255),
        is_active TINYINT(1) DEFAULT 1,
        settings JSON,
        last_sync_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_is_active (is_active)
      )
    `);

    // 2. 配信履歴テーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS distribution_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        platform_id INT NOT NULL,
        cast_id INT,
        distribution_type ENUM(
          'キャスト情報', 
          'スケジュール', 
          '料金表', 
          '画像',
          'コンテンツ更新',
          '写メ日記',
          '女性登録',
          '並び順変更',
          '女性全削除',
          '上位表示'
        ) NOT NULL,
        status ENUM('成功', '失敗', '処理中') DEFAULT '処理中',
        request_data JSON,
        response_data JSON,
        error_message TEXT,
        execution_time INT COMMENT '実行時間（ミリ秒）',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (platform_id) REFERENCES ad_platforms(id) ON DELETE CASCADE,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE SET NULL,
        INDEX idx_platform_id (platform_id),
        INDEX idx_cast_id (cast_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);

    // 3. 配信スケジュールテーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS distribution_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        platform_ids JSON COMMENT '配信先媒体IDリスト',
        cast_ids JSON COMMENT '対象キャストIDリスト',
        distribution_types JSON COMMENT '配信データ種別リスト',
        schedule_type ENUM('即時', 'タイマー', '定期') NOT NULL,
        schedule_datetime DATETIME COMMENT '配信予定日時',
        repeat_pattern VARCHAR(100) COMMENT '繰り返しパターン（cron形式）',
        is_active TINYINT(1) DEFAULT 1,
        last_executed_at DATETIME,
        next_execute_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_schedule_type (schedule_type),
        INDEX idx_is_active (is_active),
        INDEX idx_next_execute_at (next_execute_at)
      )
    `);

    // 4. 料金表テーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS pricing_tables (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        course_name VARCHAR(255) NOT NULL,
        duration INT NOT NULL COMMENT '時間（分）',
        price INT NOT NULL,
        description TEXT,
        display_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_is_active (is_active),
        INDEX idx_display_order (display_order)
      )
    `);

    // 5. 写メ日記テーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS photo_diaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cast_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        images JSON COMMENT '画像URLリスト',
        publish_datetime DATETIME,
        platforms JSON COMMENT '配信先媒体IDリスト',
        status ENUM('下書き', '配信待ち', '配信済み') DEFAULT '下書き',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE,
        INDEX idx_cast_id (cast_id),
        INDEX idx_status (status),
        INDEX idx_publish_datetime (publish_datetime)
      )
    `);

    // 6. 上位表示タイマーテーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS top_display_timers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        platform_id INT NOT NULL,
        cast_id INT COMMENT 'NULL=店舗全体',
        interval_minutes INT NOT NULL COMMENT '実行間隔（分）',
        start_time TIME NOT NULL COMMENT '開始時刻',
        end_time TIME NOT NULL COMMENT '終了時刻',
        is_active TINYINT(1) DEFAULT 1,
        last_executed_at DATETIME,
        next_execute_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (platform_id) REFERENCES ad_platforms(id) ON DELETE CASCADE,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE,
        INDEX idx_platform_id (platform_id),
        INDEX idx_is_active (is_active),
        INDEX idx_next_execute_at (next_execute_at)
      )
    `);

    // 7. キャスト媒体連携テーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cast_platform_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cast_id INT NOT NULL,
        platform_id INT NOT NULL,
        platform_cast_id VARCHAR(255) COMMENT '媒体側のキャストID',
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE,
        FOREIGN KEY (platform_id) REFERENCES ad_platforms(id) ON DELETE CASCADE,
        UNIQUE KEY unique_cast_platform (cast_id, platform_id),
        INDEX idx_cast_id (cast_id),
        INDEX idx_platform_id (platform_id)
      )
    `);

    // 8. 受注データテーブル（既存のordersテーブルを確認）
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        amount INT,
        location VARCHAR(255),
        cast_name VARCHAR(255),
        options TEXT,
        memo TEXT,
        order_date DATE,
        fiscal_year INT,
        fiscal_month INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_customer_phone (customer_phone),
        INDEX idx_order_date (order_date),
        INDEX idx_fiscal_year_month (fiscal_year, fiscal_month)
      )
    `);

    console.log('✅ 広告媒体管理テーブルの初期化完了');

    // 初期データ: シティヘブンネットとデリヘルタウンを登録
    await insertInitialPlatforms();

  } catch (error) {
    console.error('❌ 広告媒体管理テーブルの初期化エラー:', error);
    throw error;
  }
}

/**
 * 初期データ: 主要2サイトを登録
 */
async function insertInitialPlatforms() {
  try {
    // シティヘブンネットの存在確認
    const [cityHeaven]: any = await pool.execute(
      'SELECT id FROM ad_platforms WHERE name = ?',
      ['シティヘブンネット']
    );

    if (cityHeaven.length === 0) {
      await pool.execute(`
        INSERT INTO ad_platforms (
          name, category, url, login_id, login_password, connection_type, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        'シティヘブンネット',
        'お客様向け',
        'https://www.cityheaven.net/',
        '2500000713',
        'ZKs60jlq',
        'WEB',
        1
      ]);
      console.log('✅ シティヘブンネットを登録しました');
    }

    // デリヘルタウンの存在確認
    const [deliheruTown]: any = await pool.execute(
      'SELECT id FROM ad_platforms WHERE name = ?',
      ['デリヘルタウン']
    );

    if (deliheruTown.length === 0) {
      await pool.execute(`
        INSERT INTO ad_platforms (
          name, category, url, login_id, login_password, connection_type, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        'デリヘルタウン',
        'お客様向け',
        'https://www.deli-town.com/',
        'info@h-mitsu.com',
        'hitodumamitu',
        'WEB',
        1
      ]);
      console.log('✅ デリヘルタウンを登録しました');
    }

  } catch (error) {
    console.error('初期データ登録エラー:', error);
  }
}

/**
 * データベース接続確認とテーブル初期化を実行
 */
export async function setupAdPlatformDatabase() {
  try {
    await initializeAdPlatformTables();
    console.log('✅ 広告媒体管理システムのデータベースセットアップ完了');
  } catch (error) {
    console.error('❌ データベースセットアップエラー:', error);
    throw error;
  }
}
