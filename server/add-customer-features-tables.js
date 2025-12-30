const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('顧客機能用テーブルを作成中...\n');

db.serialize(() => {
  // 1. ポイントテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS user_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      points INTEGER DEFAULT 0,
      total_earned INTEGER DEFAULT 0,
      total_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('user_pointsテーブル作成エラー:', err);
    else console.log('✓ user_pointsテーブル作成完了');
  });

  // 2. ポイント履歴テーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS point_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      points INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('earn', 'use')),
      description TEXT,
      reservation_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL
    )
  `, (err) => {
    if (err) console.error('point_historyテーブル作成エラー:', err);
    else console.log('✓ point_historyテーブル作成完了');
  });

  // 3. お気に入りテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      cast_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE,
      UNIQUE(user_id, cast_id)
    )
  `, (err) => {
    if (err) console.error('favoritesテーブル作成エラー:', err);
    else console.log('✓ favoritesテーブル作成完了');
  });

  // 4. メルマガ購読テーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      is_subscribed BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id)
    )
  `, (err) => {
    if (err) console.error('newsletter_subscriptionsテーブル作成エラー:', err);
    else console.log('✓ newsletter_subscriptionsテーブル作成完了');
  });

  // 5. キャストからのアピールテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS cast_appeals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cast_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('cast_appealsテーブル作成エラー:', err);
    else console.log('✓ cast_appealsテーブル作成完了');
  });

  // 6. チャット承認テーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cast_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(cast_id, user_id)
    )
  `, (err) => {
    if (err) console.error('chat_approvalsテーブル作成エラー:', err);
    else console.log('✓ chat_approvalsテーブル作成完了');
  });

  // 既存のreservationsテーブルにポイント関連カラムを追加
  db.run(`
    ALTER TABLE reservations ADD COLUMN total_amount INTEGER DEFAULT 0
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('reservations.total_amount追加エラー:', err);
    } else if (!err) {
      console.log('✓ reservations.total_amount追加完了');
    }
  });

  db.run(`
    ALTER TABLE reservations ADD COLUMN points_earned INTEGER DEFAULT 0
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('reservations.points_earned追加エラー:', err);
    } else if (!err) {
      console.log('✓ reservations.points_earned追加完了');
    }
  });

  // サンプルデータを挿入
  console.log('\nサンプルデータを挿入中...');

  // ユーザーにポイントアカウントを作成
  db.run(`
    INSERT OR IGNORE INTO user_points (user_id, points, total_earned, total_used)
    SELECT id, 500, 500, 0 FROM users WHERE id <= 3
  `, (err) => {
    if (err) console.error('ポイントサンプルデータエラー:', err);
    else console.log('✓ 3ユーザーにポイントアカウント作成（初期500ポイント）');
  });

  // お気に入りサンプル
  db.run(`
    INSERT OR IGNORE INTO favorites (user_id, cast_id)
    VALUES (2, 1), (2, 4), (3, 2)
  `, (err) => {
    if (err) console.error('お気に入りサンプルデータエラー:', err);
    else console.log('✓ お気に入りサンプルデータ追加（3件）');
  });

  // メルマガ購読サンプル
  db.run(`
    INSERT OR IGNORE INTO newsletter_subscriptions (user_id, is_subscribed)
    SELECT id, 1 FROM users WHERE id <= 3
  `, (err) => {
    if (err) console.error('メルマガサンプルデータエラー:', err);
    else console.log('✓ メルマガ購読サンプルデータ追加');
  });

  // キャストアピールサンプル
  db.run(`
    INSERT INTO cast_appeals (cast_id, user_id, message, is_read)
    VALUES 
      (1, 2, 'いつもありがとうございます！次回のご予約お待ちしております♪', 0),
      (4, 2, 'こんにちは！新しいサービスを始めました。ぜひお試しください！', 0),
      (2, 3, 'お久しぶりです！お会いできるのを楽しみにしています。', 1)
  `, (err) => {
    if (err) console.error('アピールサンプルデータエラー:', err);
    else console.log('✓ キャストアピールサンプルデータ追加（3件）');
  });

  // チャット承認サンプル
  db.run(`
    INSERT OR IGNORE INTO chat_approvals (cast_id, user_id, status)
    VALUES 
      (1, 2, 'approved'),
      (4, 2, 'pending'),
      (2, 3, 'approved')
  `, (err) => {
    if (err) console.error('チャット承認サンプルデータエラー:', err);
    else console.log('✓ チャット承認サンプルデータ追加（3件）');
  });
});

db.close((err) => {
  if (err) {
    console.error('\nデータベースクローズエラー:', err);
  } else {
    console.log('\n✅ すべてのテーブル作成とサンプルデータ挿入が完了しました！');
  }
});
