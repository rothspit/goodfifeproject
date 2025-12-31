const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new Database(dbPath);

try {
  const result = db.prepare('SELECT COUNT(*) as count FROM casts').get();
  console.log('✅ Total casts in DB:', result.count);
  
  const publicResult = db.prepare('SELECT COUNT(*) as count FROM casts WHERE is_public = 1').get();
  console.log('🌐 Public casts:', publicResult.count);
  
  const privateResult = db.prepare('SELECT COUNT(*) as count FROM casts WHERE is_public = 0').get();
  console.log('🔒 Private casts:', privateResult.count);
  
  // Show first 3 casts
  const casts = db.prepare('SELECT id, name, is_public FROM casts LIMIT 3').all();
  console.log('\n📋 First 3 casts:');
  casts.forEach(c => {
    console.log(`  ID:${c.id}, Name:${c.name}, is_public:${c.is_public}`);
  });
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  db.close();
}
