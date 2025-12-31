const Database = require('better-sqlite3');
const db = new Database('./data/database.sqlite');

console.log('\n📋 Reservationsテーブルのスキーマ:');
const schema = db.prepare("PRAGMA table_info(reservations)").all();
schema.forEach(col => {
  console.log(`  - ${col.name}: ${col.type}`);
});

console.log('\n📊 サンプルデータ:');
const sample = db.prepare("SELECT * FROM reservations LIMIT 1").get();
console.log(sample);

db.close();
