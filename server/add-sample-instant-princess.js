const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('\n即姫サンプルデータを追加します...\n');

// 既存のスケジュールがあるキャストを取得
const currentDate = new Date().toISOString().split('T')[0];
const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

const checkQuery = `
  SELECT DISTINCT c.id, c.name
  FROM casts c
  INNER JOIN cast_schedules cs ON c.id = cs.cast_id 
    AND cs.date = ? 
    AND cs.start_time <= ? 
    AND cs.end_time > ?
    AND cs.is_available = 1
  WHERE c.status = 'available'
  LIMIT 2
`;

db.all(checkQuery, [currentDate, currentTime, currentTime], (err, casts) => {
  if (err) {
    console.error('出勤中キャスト取得エラー:', err);
    db.close();
    return;
  }

  console.log('本日出勤中のキャスト:', casts);

  if (casts.length === 0) {
    console.log('\n⚠️ 本日出勤中のキャストがいません。即姫データは追加されません。');
    console.log('先にスケジュールを追加してください。\n');
    db.close();
    return;
  }

  // 即姫データを追加
  const insertPromises = casts.map((cast, index) => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT OR IGNORE INTO instant_princess (cast_id, is_active, note) VALUES (?, 1, ?)`,
        [cast.id, index === 0 ? '即対応可能です！' : '新人即姫デビュー！'],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ cast_id: cast.id, cast_name: cast.name, id: this.lastID });
          }
        }
      );
    });
  });

  Promise.all(insertPromises)
    .then((results) => {
      console.log('\n✅ 即姫データを追加しました:');
      results.forEach((result) => {
        if (result.id > 0) {
          console.log(`  - ${result.cast_name} (ID: ${result.cast_id})`);
        }
      });

      // 追加されたデータを確認
      db.all(
        `SELECT 
          ip.id,
          ip.cast_id,
          c.name as cast_name,
          ip.is_active,
          ip.note,
          ip.created_at
        FROM instant_princess ip
        INNER JOIN casts c ON ip.cast_id = c.id`,
        [],
        (err, rows) => {
          if (err) {
            console.error('データ確認エラー:', err);
          } else {
            console.log('\n📋 現在の即姫設定:');
            console.table(rows);
          }
          db.close();
        }
      );
    })
    .catch((err) => {
      console.error('即姫データ追加エラー:', err);
      db.close();
    });
});
