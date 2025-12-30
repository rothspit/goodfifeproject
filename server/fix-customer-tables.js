const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 正しいデータベースパス
const dbPath = path.join(__dirname, 'data', 'database.sqlite');
console.log('データベースパス:', dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // user_pointsテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS user_points (
      user_id INTEGER PRIMARY KEY,
      points INTEGER DEFAULT 0,
      total_earned INTEGER DEFAULT 0,
      total_used INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('user_points作成エラー:', err);
    else console.log('✓ user_pointsテーブル作成');
  });

  // favoritesテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      cast_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (cast_id) REFERENCES casts(id),
      UNIQUE(user_id, cast_id)
    )
  `, (err) => {
    if (err) console.error('favorites作成エラー:', err);
    else console.log('✓ favoritesテーブル作成');
  });

  // cast_appealsテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS cast_appeals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cast_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cast_id) REFERENCES casts(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('cast_appeals作成エラー:', err);
    else console.log('✓ cast_appealsテーブル作成');
  });

  // newsletter_subscriptionsテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
      user_id INTEGER PRIMARY KEY,
      is_subscribed BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('newsletter_subscriptions作成エラー:', err);
    else console.log('✓ newsletter_subscriptionsテーブル作成');
  });

  // chat_approvalsテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      cast_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      approved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (cast_id) REFERENCES casts(id),
      UNIQUE(user_id, cast_id)
    )
  `, (err) => {
    if (err) console.error('chat_approvals作成エラー:', err);
    else console.log('✓ chat_approvalsテーブル作成');
  });

  // point_historyテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS point_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      points INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('point_history作成エラー:', err);
    else console.log('✓ point_historyテーブル作成');
  });

  // サンプルデータ挿入（user_id=2用）
  db.run(`
    INSERT OR IGNORE INTO user_points (user_id, points, total_earned, total_used)
    VALUES (2, 500, 500, 0)
  `, (err) => {
    if (err) console.error('ポイントサンプルデータエラー:', err);
    else console.log('✓ ユーザー2のポイント初期化');
  });

  db.run(`
    INSERT OR IGNORE INTO newsletter_subscriptions (user_id, is_subscribed)
    VALUES (2, 1)
  `, (err) => {
    if (err) console.error('メルマガサンプルデータエラー:', err);
    else console.log('✓ ユーザー2のメルマガ購読設定');
    db.close(() => {
      console.log('\n✅ テーブル作成完了');
    });
  });
});
