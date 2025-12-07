import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/database.sqlite');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('データベース接続エラー:', err);
  } else {
    console.log('データベースに接続しました');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // ユーザー（会員）テーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `);

    // キャストテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS casts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        height INTEGER,
        bust TEXT,
        waist INTEGER,
        hip INTEGER,
        cup_size TEXT,
        blood_type TEXT,
        has_children BOOLEAN DEFAULT 0,
        smoking_ok BOOLEAN DEFAULT 0,
        tattoo BOOLEAN DEFAULT 0,
        threesome_ok BOOLEAN DEFAULT 0,
        hairless BOOLEAN DEFAULT 0,
        home_visit_ok BOOLEAN DEFAULT 0,
        clothing_request_ok BOOLEAN DEFAULT 0,
        overnight_ok BOOLEAN DEFAULT 0,
        sweet_sadist_ok BOOLEAN DEFAULT 0,
        profile_text TEXT,
        is_new BOOLEAN DEFAULT 1,
        new_until DATETIME,
        status TEXT DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // キャスト画像テーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS cast_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cast_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT 0,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE
      )
    `);

    // 出勤スケジュールテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS cast_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cast_id INTEGER NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE
      )
    `);

    // 予約テーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        cast_id INTEGER NOT NULL,
        reservation_date DATE NOT NULL,
        start_time TIME NOT NULL,
        duration INTEGER NOT NULL,
        course TEXT NOT NULL,
        total_price INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        special_requests TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE
      )
    `);

    // ブログテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cast_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE
      )
    `);

    // 口コミテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        cast_id INTEGER NOT NULL,
        reservation_id INTEGER,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE,
        FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL
      )
    `);

    // ランキング集計用ビュー
    db.run(`
      CREATE VIEW IF NOT EXISTS cast_rankings AS
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT r.id) as reservation_count,
        COALESCE(AVG(rev.rating), 0) as avg_rating,
        COUNT(DISTINCT rev.id) as review_count
      FROM casts c
      LEFT JOIN reservations r ON c.id = r.cast_id AND r.status = 'completed'
      LEFT JOIN reviews rev ON c.id = rev.cast_id
      GROUP BY c.id, c.name
    `);

    // チャットメッセージテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        sender_type TEXT NOT NULL CHECK(sender_type IN ('user', 'cast')),
        receiver_id INTEGER NOT NULL,
        receiver_type TEXT NOT NULL CHECK(receiver_type IN ('user', 'cast')),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // お知らせテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'general',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('データベーステーブルを初期化しました');
  });
}

export default db;
