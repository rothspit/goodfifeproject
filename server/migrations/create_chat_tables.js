const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/database.sqlite'));

console.log('Creating chat tables...');

try {
  // チャットルームテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_rooms (
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
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_room_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      sender_type TEXT NOT NULL CHECK(sender_type IN ('user', 'admin')),
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // インデックス作成
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_id ON chat_rooms(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_rooms_status ON chat_rooms(status);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_room_id ON chat_messages(chat_room_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read);
  `);

  console.log('✅ Chat tables created successfully!');
  
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
  console.error('❌ Error creating chat tables:', error.message);
  process.exit(1);
} finally {
  db.close();
}
