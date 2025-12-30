#!/usr/bin/env node
/**
 * Add display_order column to casts table
 * This allows manual ordering of casts in the admin panel
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new Database(dbPath);

console.log('=== display_order カラム追加マイグレーション ===\n');
console.log(`Database: ${dbPath}\n`);

try {
  // Check if display_order column already exists
  const tableInfo = db.prepare("PRAGMA table_info(casts)").all();
  const hasDisplayOrder = tableInfo.some(col => col.name === 'display_order');
  
  if (hasDisplayOrder) {
    console.log('✅ display_order カラムは既に存在します');
    
    // Check if values are set
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(display_order) as with_order,
        MAX(display_order) as max_order
      FROM casts
    `).get();
    
    console.log(`\nカラム統計:`);
    console.log(`  総キャスト数: ${stats.total}`);
    console.log(`  display_order設定済み: ${stats.with_order}`);
    console.log(`  最大display_order: ${stats.max_order || 'N/A'}`);
  } else {
    console.log('📝 display_order カラムを追加中...\n');
    
    // Add display_order column
    db.prepare('ALTER TABLE casts ADD COLUMN display_order INTEGER DEFAULT 0').run();
    
    console.log('✅ カラム追加完了\n');
  }
  
  // Initialize display_order values based on current ID order
  console.log('🔄 display_order の初期値を設定中...\n');
  
  const casts = db.prepare('SELECT id, name FROM casts ORDER BY id').all();
  
  db.prepare('BEGIN').run();
  
  const updateStmt = db.prepare('UPDATE casts SET display_order = ? WHERE id = ?');
  
  casts.forEach((cast, index) => {
    const order = index + 1; // Start from 1
    updateStmt.run(order, cast.id);
    console.log(`  ${order}. ${cast.name} (ID:${cast.id})`);
  });
  
  db.prepare('COMMIT').run();
  
  console.log(`\n✅ ${casts.length}件のキャストにdisplay_orderを設定しました`);
  
  // Verify
  const verification = db.prepare(`
    SELECT 
      COUNT(*) as total,
      COUNT(display_order) as with_order,
      MIN(display_order) as min_order,
      MAX(display_order) as max_order
    FROM casts
  `).get();
  
  console.log(`\n確認:`);
  console.log(`  総キャスト数: ${verification.total}`);
  console.log(`  display_order設定済み: ${verification.with_order}`);
  console.log(`  display_order範囲: ${verification.min_order} - ${verification.max_order}`);
  
  console.log('\n=== 完了 ===');

} catch (error) {
  console.error('エラー:', error.message);
  try {
    db.prepare('ROLLBACK').run();
  } catch (e) {
    // Ignore rollback errors
  }
  process.exit(1);
} finally {
  db.close();
}
