const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../database.sqlite'));

console.log('チャット機能のテーブルを作成します...');

// チャットルームテーブル
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    user_name TEXT,
    user_phone TEXT,
    last_message TEXT,
    last_message_at DATETIME,
    unread_count INTEGER DEFAULT 0,
    is_admin_unread BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

console.log('✓ chat_rooms テーブルを作成しました');

// チャットメッセージテーブル
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    sender_type TEXT NOT NULL,
    sender_id INTEGER,
    sender_name TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE
  );
`);

console.log('✓ chat_messages テーブルを作成しました');

// インデックスを作成
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_id ON chat_rooms(user_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);`);
  console.log('✓ インデックスを作成しました');
} catch (error) {
  console.log('インデックス作成でエラー（既に存在する可能性）:', error.message);
}

console.log('\n✅ チャット機能のテーブル作成が完了しました！');

db.close();
