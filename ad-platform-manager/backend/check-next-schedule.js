#!/usr/bin/env node

/**
 * ヘブン更新スケジューラー - 次の実行時刻を表示
 */

const SCHEDULE_TIMES = [
  '07:02',
  '11:54',
  '14:55',
  '17:12',
  '18:05',
  '19:15',
  '20:35',
  '21:57',
  '22:26',
  '23:05',
  '23:35',
  '18:36',
  '20:05',
  '21:04',
  '22:44',
];

function getNextExecutionTime() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  // スケジュールを分単位に変換
  const scheduledMinutes = SCHEDULE_TIMES.map(time => {
    const [hour, minute] = time.split(':').map(Number);
    return { time, minutes: hour * 60 + minute };
  });

  // 現在時刻より後の最も近い時刻を探す
  const nextSchedule = scheduledMinutes.find(s => s.minutes > currentTimeMinutes);

  let targetMinutes;
  let targetTime;
  let isNextDay = false;

  if (nextSchedule) {
    // 今日の残りスケジュール
    targetMinutes = nextSchedule.minutes;
    targetTime = nextSchedule.time;
  } else {
    // 今日のスケジュールが全て終了している場合は、明日の最初のスケジュール
    targetMinutes = scheduledMinutes[0].minutes + (24 * 60); // 翌日
    targetTime = scheduledMinutes[0].time;
    isNextDay = true;
  }

  const delayMinutes = targetMinutes - currentTimeMinutes;
  const delayMs = delayMinutes * 60 * 1000;

  const nextDate = new Date(Date.now() + delayMs);

  return { time: targetTime, delayMinutes, nextDate, isNextDay };
}

// 表示
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  🎓 アイドル学園 - ヘブン更新スケジューラー');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📅 スケジュール（15枠）:');
SCHEDULE_TIMES.forEach((time, index) => {
  console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${time}`);
});

const now = new Date();
console.log(`\n⏰ 現在時刻: ${now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);

const next = getNextExecutionTime();
console.log(`\n🎯 次回実行時刻: ${next.time}${next.isNextDay ? ' (翌日)' : ''}`);
console.log(`   実行予定: ${next.nextDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);
console.log(`   待機時間: ${next.delayMinutes}分`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
