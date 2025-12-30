const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/database.sqlite');

console.log('=== 画像URLのサイズを390x520に更新 ===\n');

// Update cast primary_image URLs
db.run(`
  UPDATE casts 
  SET primary_image = REPLACE(REPLACE(primary_image, '800x1000', '390x520'), '400x600', '390x520')
  WHERE primary_image LIKE '%placeholder%' OR primary_image LIKE '%placehold%'
`, function(err) {
  if (err) {
    console.error('Error updating casts primary_image:', err);
    process.exit(1);
  }
  console.log(`✅ Updated ${this.changes} cast primary_image URLs`);
  
  // Update cast_images URLs
  db.run(`
    UPDATE cast_images 
    SET image_url = REPLACE(REPLACE(image_url, '800x1000', '390x520'), '400x600', '390x520')
    WHERE image_url LIKE '%placeholder%' OR image_url LIKE '%placehold%'
  `, function(err) {
    if (err) {
      console.error('Error updating cast_images:', err);
      process.exit(1);
    }
    console.log(`✅ Updated ${this.changes} cast_images URLs`);
    
    // Verify update
    db.get(`SELECT primary_image FROM casts WHERE id = 1`, (err, row) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`\n📸 Sample updated URL: ${row.primary_image}`);
      }
      db.close();
    });
  });
});
