const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// 今日から7日分のスケジュールを作成
const today = new Date();
const schedules = [];

// キャスト一覧を取得してからスケジュールを作成
db.all('SELECT id, name FROM casts ORDER BY id', [], (err, casts) => {
  if (err) {
    console.error('キャスト取得エラー:', err);
    db.close();
    return;
  }

  if (casts.length === 0) {
    console.log('キャストが登録されていません');
    db.close();
    return;
  }

  console.log(`\n${casts.length}人のキャストに対して7日分のスケジュールを作成します...\n`);

  // 各キャストに対して7日分のスケジュールを作成
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // ランダムにキャストを選択（1日に2〜3人出勤）
    const workingCastsCount = 2 + Math.floor(Math.random() * 2);
    const shuffledCasts = [...casts].sort(() => Math.random() - 0.5);
    const workingCasts = shuffledCasts.slice(0, workingCastsCount);

    workingCasts.forEach((cast) => {
      schedules.push({
        cast_id: cast.id,
        cast_name: cast.name,
        date: dateStr,
        start_time: '10:00',
        end_time: '18:00',
        is_available: 1,
      });
    });
  }

  // 一括挿入
  let completed = 0;
  schedules.forEach((schedule) => {
    db.run(
      `INSERT INTO cast_schedules (cast_id, date, start_time, end_time, is_available)
       VALUES (?, ?, ?, ?, ?)`,
      [schedule.cast_id, schedule.date, schedule.start_time, schedule.end_time, schedule.is_available],
      function (err) {
        if (err) {
          console.error(`❌ ${schedule.date} ${schedule.cast_name} の登録エラー:`, err.message);
        } else {
          console.log(`✅ ${schedule.date} ${schedule.cast_name} (${schedule.start_time}〜${schedule.end_time})`);
        }

        completed++;
        if (completed === schedules.length) {
          console.log(`\n🎉 ${schedules.length}件のスケジュールを登録しました！`);
          db.close();
        }
      }
    );
  });
});
