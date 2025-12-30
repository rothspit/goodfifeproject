const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('reviewsテーブルにstatusカラムを追加します...');

// statusカラムを追加（pending: 承認待ち, approved: 承認済み, rejected: 却下）
db.run(
  `ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected'))`,
  (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✅ statusカラムは既に存在します');
      } else {
        console.error('❌ エラー:', err);
      }
    } else {
      console.log('✅ statusカラムを追加しました');
    }

    // 既存のレビューをすべて承認済みにする
    db.run(
      `UPDATE reviews SET status = 'approved' WHERE status IS NULL OR status = 'pending'`,
      function (err) {
        if (err) {
          console.error('❌ 既存レビュー更新エラー:', err);
        } else {
          console.log(`✅ ${this.changes}件の既存レビューを承認済みに設定しました`);
        }

        db.close();
      }
    );
  }
);
