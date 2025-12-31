const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data/database.sqlite');
const db = new sqlite3.Database(dbPath);

// 現在の期間を設定（今月）
const today = new Date();
const periodStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

db.serialize(() => {
  // 既存のランキングを削除
  db.run('DELETE FROM rankings', (err) => {
    if (err) {
      console.error('ランキング削除エラー:', err.message);
    } else {
      console.log('✅ 既存のランキングを削除しました');
    }
  });

  // サンプルランキングデータ
  const rankings = [
    // 総合ランキング
    { cast_id: 1, category: 'overall', rank: 1, points: 950 },
    { cast_id: 4, category: 'overall', rank: 2, points: 920 },
    { cast_id: 2, category: 'overall', rank: 3, points: 880 },

    // 新人ランキング
    { cast_id: 4, category: 'newcomer', rank: 1, points: 850 },
    { cast_id: 2, category: 'newcomer', rank: 2, points: 780 },

    // 人気投票ランキング
    { cast_id: 1, category: 'popularity', rank: 1, points: 1200 },
    { cast_id: 4, category: 'popularity', rank: 2, points: 1050 },
    { cast_id: 2, category: 'popularity', rank: 3, points: 950 },

    // レビューランキング
    { cast_id: 1, category: 'review', rank: 1, points: 480 },
    { cast_id: 4, category: 'review', rank: 2, points: 460 },
    { cast_id: 2, category: 'review', rank: 3, points: 420 },
  ];

  const insertStmt = db.prepare(`
    INSERT INTO rankings (cast_id, category, rank_position, points, period_start, period_end, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);

  let inserted = 0;
  rankings.forEach(rank => {
    insertStmt.run(
      rank.cast_id,
      rank.category,
      rank.rank,
      rank.points,
      periodStart,
      periodEnd,
      (err) => {
        if (err) {
          console.error(`ランキング挿入エラー (Cast ${rank.cast_id}, ${rank.category}):`, err.message);
        } else {
          inserted++;
        }
      }
    );
  });

  insertStmt.finalize(() => {
    console.log(`✅ ${inserted}件のサンプルランキングを追加しました`);
    console.log(`期間: ${periodStart} 〜 ${periodEnd}`);
    
    db.close((err) => {
      if (err) {
        console.error('データベース接続終了エラー:', err.message);
      } else {
        console.log('✅ データベース接続を終了しました');
      }
    });
  });
});
