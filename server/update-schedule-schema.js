const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('スケジュールテーブルのスキーマを更新中...');

db.serialize(() => {
  // statusカラムがない場合に追加
  db.run(`
    ALTER TABLE cast_schedules 
    ADD COLUMN status TEXT DEFAULT 'pending'
  `, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('✓ statusカラムは既に存在します');
      } else {
        console.error('エラー:', err.message);
      }
    } else {
      console.log('✓ statusカラムを追加しました');
    }
  });

  // created_atカラムがない場合に追加
  db.run(`
    ALTER TABLE cast_schedules 
    ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  `, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('✓ created_atカラムは既に存在します');
      } else {
        console.error('エラー:', err.message);
      }
    } else {
      console.log('✓ created_atカラムを追加しました');
    }
  });

  // updated_atカラムがない場合に追加
  db.run(`
    ALTER TABLE cast_schedules 
    ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  `, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('✓ updated_atカラムは既に存在します');
      } else {
        console.error('エラー:', err.message);
      }
    } else {
      console.log('✓ updated_atカラムを追加しました');
    }

    // 最後に現在のスキーマを表示
    db.all("PRAGMA table_info(cast_schedules)", (err, rows) => {
      if (err) {
        console.error('スキーマ取得エラー:', err.message);
      } else {
        console.log('\n現在のcast_schedulesテーブルスキーマ:');
        rows.forEach(row => {
          console.log(`  ${row.name}: ${row.type}${row.dflt_value ? ` (default: ${row.dflt_value})` : ''}`);
        });
      }
      
      db.close(() => {
        console.log('\nスキーマ更新が完了しました');
      });
    });
  });
});
