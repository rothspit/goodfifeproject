const Database = require('better-sqlite3');
const path = require('path');

const dbPath = '/home/user/webapp/server/data/database.sqlite';
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check current status
  const before = db.prepare('SELECT is_public, COUNT(*) as count FROM casts GROUP BY is_public').all();
  console.log('\n📊 Before update:');
  before.forEach(row => {
    console.log(`  • is_public=${row.is_public}: ${row.count} casts`);
  });
  
  // Update all casts to be public
  const result = db.prepare('UPDATE casts SET is_public = 1 WHERE is_public IS NULL OR is_public = 0').run();
  console.log(`\n✅ Updated ${result.changes} casts to is_public=1`);
  
  // Check after status
  const after = db.prepare('SELECT is_public, COUNT(*) as count FROM casts GROUP BY is_public').all();
  console.log('\n📊 After update:');
  after.forEach(row => {
    console.log(`  • is_public=${row.is_public}: ${row.count} casts`);
  });
  
  db.close();
  console.log('\n✅ Database update completed');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
