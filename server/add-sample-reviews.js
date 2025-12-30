const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('サンプルレビューを追加します...');

const sampleReviews = [
  {
    user_id: 1,
    cast_id: 1, // さくら
    rating: 5,
    comment: 'とても優しくて、楽しい時間を過ごせました。また指名したいです！',
    status: 'approved',
  },
  {
    user_id: 1,
    cast_id: 3, // みさき
    rating: 5,
    comment: '新人さんとは思えないくらい丁寧な対応でした。笑顔が素敵です♡',
    status: 'pending',
  },
  {
    user_id: 1,
    cast_id: 4, // 天音
    rating: 4,
    comment: '落ち着いた雰囲気で癒されました。会話も楽しかったです。',
    status: 'approved',
  },
  {
    user_id: 1,
    cast_id: 2, // あやか
    rating: 5,
    comment: 'スタイル抜群で、サービスも最高でした！次回も絶対予約します。',
    status: 'pending',
  },
  {
    user_id: 1,
    cast_id: 1, // さくら
    rating: 5,
    comment: '2回目の利用です。前回よりもリラックスできて良かったです。',
    status: 'approved',
  },
  {
    user_id: 1,
    cast_id: 3, // みさき
    rating: 3,
    comment: 'まぁまぁでした。',
    status: 'pending',
  },
];

let inserted = 0;

sampleReviews.forEach((review, index) => {
  db.run(
    `INSERT INTO reviews (user_id, cast_id, rating, comment, status, created_at) 
     VALUES (?, ?, ?, ?, ?, datetime('now', '-${index} days'))`,
    [review.user_id, review.cast_id, review.rating, review.comment, review.status],
    function (err) {
      if (err) {
        console.error(`レビュー追加エラー (cast_id=${review.cast_id}):`, err);
      } else {
        console.log(
          `✅ レビュー追加: cast_id=${review.cast_id}, rating=${review.rating}, status=${review.status}`
        );
      }

      inserted++;
      if (inserted === sampleReviews.length) {
        console.log(`\n✅ ${inserted}件のサンプルレビューを追加しました`);

        // 統計を表示
        db.all(
          `SELECT status, COUNT(*) as count FROM reviews GROUP BY status`,
          [],
          (err, stats) => {
            if (err) {
              console.error('統計取得エラー:', err);
            } else {
              console.log('\n📊 レビューステータス統計:');
              stats.forEach((stat) => {
                const label =
                  stat.status === 'pending'
                    ? '承認待ち'
                    : stat.status === 'approved'
                    ? '承認済み'
                    : '却下';
                console.log(`   ${label}: ${stat.count}件`);
              });
            }
            db.close();
          }
        );
      }
    }
  );
});
