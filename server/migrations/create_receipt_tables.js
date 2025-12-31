const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new Database(dbPath);

console.log('Creating receipt tables...');

try {
  // 領収書申請テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS receipt_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      reservation_id INTEGER,
      request_date DATE NOT NULL,
      amount INTEGER NOT NULL,
      name_on_receipt TEXT NOT NULL,
      address TEXT,
      email TEXT,
      phone_number TEXT,
      notes TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'issued')),
      admin_notes TEXT,
      approved_by INTEGER,
      approved_at DATETIME,
      issued_at DATETIME,
      receipt_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
      FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // 領収書発行履歴テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT UNIQUE NOT NULL,
      request_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      reservation_id INTEGER,
      amount INTEGER NOT NULL,
      name_on_receipt TEXT NOT NULL,
      address TEXT,
      issue_date DATE NOT NULL,
      issued_by INTEGER NOT NULL,
      receipt_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES receipt_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
      FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // インデックス作成
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_receipt_requests_user_id ON receipt_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_receipt_requests_status ON receipt_requests(status);
    CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
    CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);
  `);

  console.log('✅ Receipt tables created successfully!');
  console.log('\n📋 Created tables:');
  console.log('  - receipt_requests (領収書申請)');
  console.log('  - receipts (領収書発行履歴)');

} catch (error) {
  console.error('❌ Error creating receipt tables:', error);
  process.exit(1);
} finally {
  db.close();
}
