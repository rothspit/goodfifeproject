const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// 天音のcreated_atを取得して、それに1ヶ月を追加
db.get(`SELECT id, name, created_at FROM casts WHERE id = 4`, [], (err, cast) => {
  if (err) {
    console.error('エラー:', err);
    db.close();
    return;
  }
  
  if (!cast) {
    console.log('天音が見つかりませんでした');
    db.close();
    return;
  }
  
  const createdDate = new Date(cast.created_at);
  const newUntilDate = new Date(createdDate);
  newUntilDate.setMonth(newUntilDate.getMonth() + 1);
  
  console.log(`\n天音（ID: ${cast.id}）の new_until を設定します:`);
  console.log(`  登録日: ${cast.created_at}`);
  console.log(`  新人期限: ${newUntilDate.toISOString()}`);
  
  db.run(
    `UPDATE casts SET new_until = ? WHERE id = ?`,
    [newUntilDate.toISOString(), cast.id],
    function(err) {
      if (err) {
        console.error('更新エラー:', err);
      } else {
        console.log(`✅ 更新完了（${this.changes}件）`);
      }
      db.close();
    }
  );
});
