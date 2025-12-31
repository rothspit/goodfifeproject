const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/database.sqlite'));

console.log('Fixing chat tables...');

try {
  // 既存のテーブルを削除
  console.log('Dropping existing tables if they exist...');
  db.exec(`DROP TABLE IF EXISTS chat_messages`);
  db.exec(`DROP TABLE IF EXISTS chat_rooms`);
  db.exec(`DROP TABLE IF EXISTS chat_approvals`);

  // チャットルームテーブル
  console.log('Creating chat_rooms table...');
  db.exec(`
    CREATE TABLE chat_rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      admin_id INTEGER,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'closed')),
      last_message_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // メッセージテーブル
  console.log('Creating chat_messages table...');
  db.exec(`
    CREATE TABLE chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      sender_type TEXT NOT NULL CHECK(sender_type IN ('user', 'admin')),
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // chat_approvalsテーブル
  console.log('Creating chat_approvals table...');
  db.exec(`
    CREATE TABLE chat_approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      approved_by INTEGER,
      approved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // インデックス作成
  console.log('Creating indexes...');
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_id ON chat_rooms(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_rooms_status ON chat_rooms(status);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read);
    CREATE INDEX IF NOT EXISTS idx_chat_approvals_user_id ON chat_approvals(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_approvals_status ON chat_approvals(status);
  `);

  console.log('✅ Chat tables fixed successfully!');
  
  // テーブル確認
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name LIKE 'chat_%'
    ORDER BY name
  `).all();
  
  console.log('\n📋 Created tables:');
  tables.forEach(table => {
    console.log(`  - ${table.name}`);
  });

} catch (error) {
  console.error('❌ Error fixing chat tables:', error.message);
  process.exit(1);
} finally {
  db.close();
}
