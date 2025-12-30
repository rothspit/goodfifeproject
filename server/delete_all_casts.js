const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('データベースに接続しました:', dbPath);

db.serialize(() => {
  // まず現在の件数を確認
  db.get('SELECT COUNT(*) as count FROM casts', (err, row) => {
    if (err) {
      console.error('キャスト数取得エラー:', err);
    } else {
      console.log(`\n現在のキャスト数: ${row.count}名`);
    }
  });

  db.get('SELECT COUNT(*) as count FROM cast_images', (err, row) => {
    if (err) {
      console.error('画像数取得エラー:', err);
    } else {
      console.log(`現在の画像数: ${row.count}枚`);
    }
  });

  db.get('SELECT COUNT(*) as count FROM cast_schedules', (err, row) => {
    if (err) {
      console.error('スケジュール数取得エラー:', err);
    } else {
      console.log(`現在のスケジュール数: ${row.count}件\n`);
    }
  });

  // トランザクション開始
  db.run('BEGIN TRANSACTION');

  // キャスト画像を削除
  db.run('DELETE FROM cast_images', (err) => {
    if (err) {
      console.error('画像削除エラー:', err);
      db.run('ROLLBACK');
      return;
    }
    console.log('✓ キャスト画像を削除しました');
  });

  // キャストスケジュールを削除
  db.run('DELETE FROM cast_schedules', (err) => {
    if (err) {
      console.error('スケジュール削除エラー:', err);
      db.run('ROLLBACK');
      return;
    }
    console.log('✓ キャストスケジュールを削除しました');
  });

  // レビューを削除（キャストに紐づく）
  db.run('DELETE FROM reviews WHERE cast_id IS NOT NULL', (err) => {
    if (err) {
      console.error('レビュー削除エラー:', err);
      db.run('ROLLBACK');
      return;
    }
    console.log('✓ キャスト関連レビューを削除しました');
  });

  // 予約を削除（キャストに紐づく）
  db.run('DELETE FROM reservations WHERE cast_id IS NOT NULL', (err) => {
    if (err) {
      console.error('予約削除エラー:', err);
      db.run('ROLLBACK');
      return;
    }
    console.log('✓ キャスト関連予約を削除しました');
  });

  // キャストを削除
  db.run('DELETE FROM casts', (err) => {
    if (err) {
      console.error('キャスト削除エラー:', err);
      db.run('ROLLBACK');
      return;
    }
    console.log('✓ 全キャストを削除しました');
  });

  // AUTO INCREMENTをリセット
  db.run("DELETE FROM sqlite_sequence WHERE name='casts'", (err) => {
    if (err) console.error('シーケンスリセットエラー:', err);
  });

  db.run("DELETE FROM sqlite_sequence WHERE name='cast_images'", (err) => {
    if (err) console.error('シーケンスリセットエラー:', err);
  });

  db.run("DELETE FROM sqlite_sequence WHERE name='cast_schedules'", (err) => {
    if (err) console.error('シーケンスリセットエラー:', err);
  });

  // コミット
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('コミットエラー:', err);
      db.run('ROLLBACK');
      return;
    }
    console.log('✓ トランザクションをコミットしました\n');

    // 削除後の件数を確認
    db.get('SELECT COUNT(*) as count FROM casts', (err, row) => {
      if (err) {
        console.error('確認エラー:', err);
      } else {
        console.log(`削除後のキャスト数: ${row.count}名`);
        if (row.count === 0) {
          console.log('\n✅ 全てのテストデータが正常に削除されました！');
        }
      }
      
      db.close(() => {
        console.log('データベース接続を閉じました');
      });
    });
  });
});
