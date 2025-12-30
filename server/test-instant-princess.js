const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('即姫管理機能テスト');
console.log('='.repeat(60));

// 現在時刻情報
const now = new Date();
const currentDate = now.toISOString().split('T')[0];
const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

console.log(`\n現在時刻: ${now.toLocaleString('ja-JP')}`);
console.log(`日付: ${currentDate}`);
console.log(`時刻: ${currentTime}`);

// 1. 今日のスケジュールを確認
console.log('\n【1. 本日のスケジュール】');
db.all(
  `SELECT cs.*, c.name, c.age 
   FROM cast_schedules cs
   INNER JOIN casts c ON cs.cast_id = c.id
   WHERE cs.date = ?
   ORDER BY cs.start_time`,
  [currentDate],
  (err, schedules) => {
    if (err) {
      console.error('スケジュール取得エラー:', err);
      return;
    }

    if (schedules.length === 0) {
      console.log('❌ 本日のスケジュールがありません');
      
      // テストスケジュールを追加
      console.log('\n📝 テストスケジュールを追加中...');
      
      const testSchedules = [
        { cast_id: 1, start: '10:00', end: '18:00' },  // さくら
        { cast_id: 3, start: '12:00', end: '20:00' },  // みさき
        { cast_id: 4, start: '14:00', end: '22:00' },  // 天音
      ];

      let completed = 0;
      testSchedules.forEach(sched => {
        db.run(
          `INSERT INTO cast_schedules (cast_id, date, start_time, end_time, is_available) 
           VALUES (?, ?, ?, ?, 1)`,
          [sched.cast_id, currentDate, sched.start, sched.end],
          (err) => {
            if (err) {
              console.error(`スケジュール追加エラー (cast_id=${sched.cast_id}):`, err);
            } else {
              console.log(`✅ スケジュール追加: cast_id=${sched.cast_id}, ${sched.start}-${sched.end}`);
            }
            
            completed++;
            if (completed === testSchedules.length) {
              checkWorkingCasts();
            }
          }
        );
      });
    } else {
      console.log(`✅ ${schedules.length}件のスケジュール:`);
      schedules.forEach(s => {
        console.log(`   - ${s.name} (${s.age}歳): ${s.start_time}-${s.end_time}`);
      });
      checkWorkingCasts();
    }
  }
);

// 2. 現在出勤中のキャストを確認
function checkWorkingCasts() {
  console.log('\n【2. 現在出勤中のキャスト】');
  
  db.all(
    `SELECT DISTINCT c.id, c.name, c.age, cs.start_time, cs.end_time
     FROM casts c
     INNER JOIN cast_schedules cs ON c.id = cs.cast_id 
       AND cs.date = ? 
       AND cs.start_time <= ? 
       AND cs.end_time > ?
       AND cs.is_available = 1
     WHERE c.status = 'available'
     ORDER BY c.name`,
    [currentDate, currentTime, currentTime],
    (err, workingCasts) => {
      if (err) {
        console.error('出勤中キャスト取得エラー:', err);
        return;
      }

      if (workingCasts.length === 0) {
        console.log('❌ 現在出勤中のキャストはいません');
        console.log(`   (現在時刻: ${currentTime})`);
      } else {
        console.log(`✅ ${workingCasts.length}名が出勤中:`);
        workingCasts.forEach(c => {
          console.log(`   - ${c.name} (${c.age}歳): ${c.start_time}-${c.end_time}`);
        });
      }

      checkInstantPrincess(workingCasts);
    }
  );
}

// 3. 即姫設定を確認
function checkInstantPrincess(workingCasts) {
  console.log('\n【3. 即姫設定】');
  
  db.all(
    `SELECT ip.*, c.name, c.age 
     FROM instant_princess ip
     INNER JOIN casts c ON ip.cast_id = c.id
     ORDER BY ip.created_at DESC`,
    [],
    (err, instantPrincesses) => {
      if (err) {
        console.error('即姫設定取得エラー:', err);
        return;
      }

      if (instantPrincesses.length === 0) {
        console.log('❌ 即姫設定がありません');
        
        if (workingCasts.length > 0) {
          console.log('\n📝 テスト用に即姫を追加中...');
          
          // 出勤中のキャストから最初の2名を即姫に設定
          const castsToAdd = workingCasts.slice(0, 2);
          let completed = 0;
          
          castsToAdd.forEach(cast => {
            db.run(
              `INSERT INTO instant_princess (cast_id, note, is_active) 
               VALUES (?, ?, 1)`,
              [cast.id, `テスト即姫 (${new Date().toLocaleString('ja-JP')})`],
              (err) => {
                if (err) {
                  console.error(`即姫追加エラー (${cast.name}):`, err);
                } else {
                  console.log(`✅ 即姫追加: ${cast.name} (${cast.age}歳)`);
                }
                
                completed++;
                if (completed === castsToAdd.length) {
                  checkAvailableInstantPrincess();
                }
              }
            );
          });
        } else {
          checkAvailableInstantPrincess();
        }
      } else {
        console.log(`✅ ${instantPrincesses.length}件の即姫設定:`);
        instantPrincesses.forEach(ip => {
          const status = ip.is_active ? '✅ 有効' : '❌ 無効';
          console.log(`   ${status} - ${ip.name} (${ip.age}歳)`);
          if (ip.note) console.log(`      備考: ${ip.note}`);
        });
        checkAvailableInstantPrincess();
      }
    }
  );
}

// 4. 公開用API相当の即姫を取得
function checkAvailableInstantPrincess() {
  console.log('\n【4. 現在表示される即姫（公開用）】');
  
  db.all(
    `SELECT DISTINCT 
      ip.id,
      c.id as cast_id,
      c.name as cast_name,
      c.age as cast_age,
      ip.is_active,
      cs.start_time,
      cs.end_time,
      ip.note,
      ip.created_at as instant_princess_since
    FROM casts c
    INNER JOIN instant_princess ip ON c.id = ip.cast_id AND ip.is_active = 1
    INNER JOIN cast_schedules cs ON c.id = cs.cast_id 
      AND cs.date = ? 
      AND cs.start_time <= ? 
      AND cs.end_time > ?
      AND cs.is_available = 1
    WHERE c.status = 'available'
    ORDER BY ip.created_at DESC`,
    [currentDate, currentTime, currentTime],
    (err, availablePrincesses) => {
      if (err) {
        console.error('公開用即姫取得エラー:', err);
        db.close();
        return;
      }

      if (availablePrincesses.length === 0) {
        console.log('❌ 現在表示される即姫はいません');
        console.log('   理由: 即姫設定されたキャストが出勤していないか、無効化されています');
      } else {
        console.log(`✅ ${availablePrincesses.length}名が即姫として表示されます:`);
        availablePrincesses.forEach(p => {
          console.log(`   - ${p.cast_name} (${p.cast_age}歳): ${p.start_time}-${p.end_time}`);
          if (p.note) console.log(`      備考: ${p.note}`);
        });
      }

      console.log('\n' + '='.repeat(60));
      console.log('✅ テスト完了');
      console.log('\n📱 管理画面URL:');
      console.log('   https://3001-iwlhxuzhfaqbr3cqpityv-b32ec7bb.sandbox.novita.ai/admin/immediate');
      db.close();
    }
  );
}
