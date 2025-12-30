const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.db');
const db = new sqlite3.Database(dbPath);

db.all(`SELECT id, name, is_new, new_until, created_at FROM casts ORDER BY id`, [], (err, rows) => {
  if (err) {
    console.error('エラー:', err);
    db.close();
    return;
  }
  
  console.log('\n📊 キャストの新人表記状況:\n');
  console.table(rows);
  
  const now = new Date();
  console.log(`\n⏰ 現在時刻: ${now.toISOString()}\n`);
  
  rows.forEach(cast => {
    const newUntil = cast.new_until ? new Date(cast.new_until) : null;
    const isExpired = newUntil && newUntil < now;
    console.log(`${cast.name}:`);
    console.log(`  - is_new: ${cast.is_new ? '✅ true' : '❌ false'}`);
    console.log(`  - new_until: ${cast.new_until || 'なし'}`);
    console.log(`  - 新人表示: ${cast.is_new && !isExpired ? '🆕 表示中' : '非表示'}`);
    console.log();
  });
  
  db.close();
});
