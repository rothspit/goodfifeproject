const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check total casts
  const totalResult = db.prepare('SELECT COUNT(*) as total FROM casts').get();
  console.log('\n📊 Total casts in database:', totalResult.total);
  
  // Check is_public distribution
  const publicDistribution = db.prepare('SELECT is_public, COUNT(*) as count FROM casts GROUP BY is_public').all();
  console.log('\n📊 is_public distribution:');
  publicDistribution.forEach(row => {
    console.log(`  • is_public=${row.is_public}: ${row.count} casts`);
  });
  
  // Check sample casts
  const sampleCasts = db.prepare('SELECT id, name, age, is_public, is_new FROM casts LIMIT 5').all();
  console.log('\n📋 Sample casts:');
  sampleCasts.forEach(cast => {
    console.log(`  • ID:${cast.id} ${cast.name} (${cast.age}歳) is_public:${cast.is_public} is_new:${cast.is_new}`);
  });
  
  db.close();
  console.log('\n✅ Database check completed');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
