const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('📸 サンプル画像を追加します...');

// 既存の画像を削除
db.run('DELETE FROM cast_images', (err) => {
  if (err) {
    console.error('削除エラー:', err);
    return;
  }
  
  console.log('✅ 既存の画像を削除しました');

  // 各キャストに画像を追加
  const casts = [1, 2, 3, 4]; // キャストID
  const colors = ['FFB6C1', 'FFC0CB', 'FFD1DC', 'FFE4E1', 'FFF0F5', 'FFE4F0'];
  
  casts.forEach((castId, index) => {
    // 各キャストに4枚の画像を追加
    for (let i = 0; i < 4; i++) {
      const color = colors[(index + i) % colors.length];
      const imageUrl = `https://via.placeholder.com/600x800/${color}/000000?text=Cast+${castId}+Photo+${i+1}`;
      const isPrimary = i === 0 ? 1 : 0;
      
      db.run(
        'INSERT INTO cast_images (cast_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
        [castId, imageUrl, isPrimary, i],
        (err) => {
          if (err) {
            console.error(`画像追加エラー (キャスト${castId}, 画像${i+1}):`, err.message);
          } else {
            console.log(`✅ キャスト${castId}の画像${i+1}を追加しました`);
          }
        }
      );
    }
  });

  // 完了確認
  setTimeout(() => {
    db.all('SELECT cast_id, COUNT(*) as count FROM cast_images GROUP BY cast_id', (err, rows) => {
      if (err) {
        console.error('確認エラー:', err);
      } else {
        console.log('\n📊 画像追加結果:');
        console.table(rows);
      }
      db.close();
    });
  }, 2000);
});
