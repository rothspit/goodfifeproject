const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('📝 キャストテーブルにコメントカラムを追加します...');

db.serialize(() => {
  // cast_comment カラムを追加
  db.run(`
    ALTER TABLE casts ADD COLUMN cast_comment TEXT
  `, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('✅ cast_comment カラムは既に存在します');
      } else {
        console.error('❌ cast_comment カラムの追加エラー:', err.message);
      }
    } else {
      console.log('✅ cast_comment カラムを追加しました');
    }
  });

  // manager_comment カラムを追加
  db.run(`
    ALTER TABLE casts ADD COLUMN manager_comment TEXT
  `, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('✅ manager_comment カラムは既に存在します');
      } else {
        console.error('❌ manager_comment カラムの追加エラー:', err.message);
      }
    } else {
      console.log('✅ manager_comment カラムを追加しました');
    }
  });

  // 確認のためにテーブル構造を表示
  db.all(`PRAGMA table_info(casts)`, (err, rows) => {
    if (err) {
      console.error('❌ テーブル構造の取得エラー:', err.message);
    } else {
      console.log('\n📋 casts テーブルのカラム一覧:');
      rows.forEach(row => {
        console.log(`  - ${row.name} (${row.type})`);
      });
    }
    
    db.close(() => {
      console.log('\n✅ データベースマイグレーション完了');
    });
  });
});
