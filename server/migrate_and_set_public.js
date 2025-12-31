const Database = require('better-sqlite3');

const dbPath = '/home/user/webapp/server/data/database.sqlite';
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check if column exists
  const columns = db.prepare("PRAGMA table_info(casts)").all();
  const hasIsPublic = columns.some(col => col.name === 'is_public');
  
  if (!hasIsPublic) {
    console.log('\n📝 Adding is_public column...');
    db.prepare('ALTER TABLE casts ADD COLUMN is_public INTEGER DEFAULT 1').run();
    console.log('✅ is_public column added');
  } else {
    console.log('\n✅ is_public column already exists');
  }
  
  // Check current status
  const before = db.prepare('SELECT is_public, COUNT(*) as count FROM casts GROUP BY is_public').all();
  console.log('\n📊 Current status:');
  before.forEach(row => {
    const status = row.is_public === null ? 'NULL' : row.is_public;
    console.log(`  • is_public=${status}: ${row.count} casts`);
  });
  
  // Update all casts to be public
  const result = db.prepare('UPDATE casts SET is_public = 1 WHERE is_public IS NULL OR is_public != 1').run();
  console.log(`\n✅ Updated ${result.changes} casts to is_public=1`);
  
  // Final status
  const after = db.prepare('SELECT is_public, COUNT(*) as count FROM casts GROUP BY is_public').all();
  console.log('\n📊 Final status:');
  after.forEach(row => {
    console.log(`  • is_public=${row.is_public}: ${row.count} casts`);
  });
  
  // Show total
  const total = db.prepare('SELECT COUNT(*) as total FROM casts').get();
  console.log(`\n📊 Total casts in database: ${total.total}`);
  console.log(`📊 Public casts: ${after.find(r => r.is_public === 1)?.count || 0}`);
  
  db.close();
  console.log('\n✅ Migration completed successfully!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error);
  process.exit(1);
}
