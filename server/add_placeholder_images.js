#!/usr/bin/env node
/**
 * Add placeholder images to all casts
 * This creates cast_images entries with placeholder image URLs
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new Database(dbPath);

console.log('=== プレースホルダー画像追加スクリプト ===\n');
console.log(`Database: ${dbPath}\n`);

try {
  // Get all casts
  const casts = db.prepare('SELECT id, name FROM casts ORDER BY id').all();
  console.log(`対象キャスト数: ${casts.length}\n`);

  // Start transaction
  db.prepare('BEGIN').run();

  let totalImagesAdded = 0;

  for (const cast of casts) {
    // Check if cast already has images
    const existingImages = db.prepare('SELECT COUNT(*) as count FROM cast_images WHERE cast_id = ?').get(cast.id);
    
    if (existingImages.count > 0) {
      console.log(`スキップ: ${cast.name} (ID:${cast.id}) - 既に画像あり (${existingImages.count}枚)`);
      continue;
    }

    // Generate placeholder image URL (using via.placeholder.com)
    // Using different colors and sizes for variety
    const colors = ['FFB6C1', 'FF69B4', 'FF1493', 'DB7093', 'C71585'];
    const colorIndex = cast.id % colors.length;
    const color = colors[colorIndex];
    
    // Add 3 placeholder images for each cast
    const imageCount = 3;
    
    for (let i = 0; i < imageCount; i++) {
      const imageUrl = `https://placehold.co/390x520/${color}/FFFFFF?text=${encodeURIComponent(cast.name)}+(${i + 1})`;
      const isPrimary = i === 0 ? 1 : 0;
      
      db.prepare(`
        INSERT INTO cast_images (cast_id, image_url, is_primary, display_order)
        VALUES (?, ?, ?, ?)
      `).run(cast.id, imageUrl, isPrimary, i);
      
      totalImagesAdded++;
    }

    // Update cast's primary_image
    const primaryImageUrl = `https://placehold.co/390x520/${color}/FFFFFF?text=${encodeURIComponent(cast.name)}`;
    db.prepare('UPDATE casts SET primary_image = ? WHERE id = ?').run(primaryImageUrl, cast.id);

    console.log(`✅ ${cast.name} (ID:${cast.id}) - ${imageCount}枚の画像を追加`);
  }

  // Commit transaction
  db.prepare('COMMIT').run();

  console.log(`\n=== 完了 ===`);
  console.log(`追加した画像総数: ${totalImagesAdded}`);
  console.log(`更新したキャスト数: ${casts.length}`);

  // Verify
  const stats = db.prepare(`
    SELECT 
      COUNT(DISTINCT c.id) as casts_with_images,
      COUNT(ci.id) as total_images
    FROM casts c
    INNER JOIN cast_images ci ON c.id = ci.cast_id
  `).get();

  console.log(`\n画像付きキャスト: ${stats.casts_with_images}/${casts.length}`);
  console.log(`総画像数: ${stats.total_images}`);

} catch (error) {
  console.error('エラー:', error.message);
  db.prepare('ROLLBACK').run();
  process.exit(1);
} finally {
  db.close();
}
