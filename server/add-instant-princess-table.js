const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('\n即姫テーブルを作成します...\n');

db.serialize(() => {
  // 即姫テーブル作成
  db.run(`
    CREATE TABLE IF NOT EXISTS instant_princess (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cast_id INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ テーブル作成エラー:', err);
    } else {
      console.log('✅ instant_princess テーブルを作成しました');
    }
  });

  // テーブル構造を確認
  db.all("PRAGMA table_info(instant_princess)", [], (err, columns) => {
    if (err) {
      console.error('エラー:', err);
    } else {
      console.log('\n📋 instant_princess テーブル構造:');
      console.table(columns);
    }
    db.close();
  });
});
