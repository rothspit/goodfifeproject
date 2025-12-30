const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('サンプルチャットメッセージを追加します...');

const sampleChats = [
  // ユーザー1 と さくら(cast_id=1) のチャット
  {
    sender_id: 1,
    sender_type: 'user',
    receiver_id: 1,
    receiver_type: 'cast',
    message: 'こんにちは！明日の予約は何時からでしょうか？',
    is_read: 1,
    hours_ago: 5,
  },
  {
    sender_id: 1,
    sender_type: 'cast',
    receiver_id: 1,
    receiver_type: 'user',
    message: 'こんにちは！明日は14時からご案内できますよ♡',
    is_read: 1,
    hours_ago: 4,
  },
  {
    sender_id: 1,
    sender_type: 'user',
    receiver_id: 1,
    receiver_type: 'cast',
    message: 'ありがとうございます！では14時でお願いします。',
    is_read: 1,
    hours_ago: 3,
  },
  {
    sender_id: 1,
    sender_type: 'cast',
    receiver_id: 1,
    receiver_type: 'user',
    message: '承知しました！楽しみにお待ちしております(^^)',
    is_read: 0,
    hours_ago: 2,
  },

  // ユーザー1 と みさき(cast_id=3) のチャット
  {
    sender_id: 1,
    sender_type: 'user',
    receiver_id: 3,
    receiver_type: 'cast',
    message: 'はじめまして！新人さんということで興味があります。',
    is_read: 1,
    hours_ago: 10,
  },
  {
    sender_id: 3,
    sender_type: 'cast',
    receiver_id: 1,
    receiver_type: 'user',
    message: 'はじめまして！ご興味を持っていただきありがとうございます💕\n不慣れな点もあるかもしれませんが、一生懸命頑張ります！',
    is_read: 1,
    hours_ago: 9,
  },
  {
    sender_id: 1,
    sender_type: 'user',
    receiver_id: 3,
    receiver_type: 'cast',
    message: '今週末は出勤されていますか？',
    is_read: 0,
    hours_ago: 1,
  },

  // ユーザー1 と 天音(cast_id=4) のチャット
  {
    sender_id: 1,
    sender_type: 'user',
    receiver_id: 4,
    receiver_type: 'cast',
    message: '前回はありがとうございました！',
    is_read: 1,
    hours_ago: 24,
  },
  {
    sender_id: 4,
    sender_type: 'cast',
    receiver_id: 1,
    receiver_type: 'user',
    message: 'こちらこそありがとうございました！またお会いできるのを楽しみにしています♪',
    is_read: 1,
    hours_ago: 23,
  },
];

let inserted = 0;

sampleChats.forEach((chat) => {
  db.run(
    `INSERT INTO chat_messages (sender_id, sender_type, receiver_id, receiver_type, message, is_read, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-${chat.hours_ago} hours'))`,
    [
      chat.sender_id,
      chat.sender_type,
      chat.receiver_id,
      chat.receiver_type,
      chat.message,
      chat.is_read,
    ],
    function (err) {
      if (err) {
        console.error(
          `チャット追加エラー (${chat.sender_type} -> ${chat.receiver_type}):`,
          err
        );
      } else {
        console.log(
          `✅ チャット追加: ${chat.sender_type}(${chat.sender_id}) -> ${chat.receiver_type}(${chat.receiver_id})`
        );
      }

      inserted++;
      if (inserted === sampleChats.length) {
        console.log(`\n✅ ${inserted}件のサンプルチャットを追加しました`);

        // 統計を表示
        db.all(
          `SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
            SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read
          FROM chat_messages`,
          [],
          (err, stats) => {
            if (err) {
              console.error('統計取得エラー:', err);
            } else {
              console.log('\n📊 チャット統計:');
              console.log(`   総メッセージ: ${stats[0].total}件`);
              console.log(`   未読: ${stats[0].unread}件`);
              console.log(`   既読: ${stats[0].read}件`);
            }

            // チャットルーム数を表示
            db.all(
              `SELECT COUNT(DISTINCT sender_id || '-' || receiver_id) as rooms 
               FROM chat_messages 
               WHERE (sender_type = 'user' AND receiver_type = 'cast')
                  OR (sender_type = 'cast' AND receiver_type = 'user')`,
              [],
              (err, roomStats) => {
                if (err) {
                  console.error('ルーム統計取得エラー:', err);
                } else {
                  console.log(`   チャットルーム: ${roomStats[0].rooms}組`);
                }
                db.close();
              }
            );
          }
        );
      }
    }
  );
});
