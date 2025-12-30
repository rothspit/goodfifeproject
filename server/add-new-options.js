const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data/database.sqlite');
const db = new sqlite3.Database(dbPath);

// 新しいオプションカラムを追加
const newColumns = [
  'deep_kiss',              // Dキス
  'body_lip',               // 全身リップ
  'sixtynine',              // 69
  'fellatio',               // フェラ
  'sumata',                 // 素股
  'rotor',                  // ローター
  'vibrator',               // バイブ
  'no_panties_visit',       // ノーパン訪問
  'no_bra_visit',           // ノーブラ訪問
  'pantyhose',              // パンスト
  'pantyhose_rip',          // パンスト破き
  'instant_cunnilingus',    // 即クンニ
  'instant_fellatio',       // 即尺
  'night_crawling_set',     // 夜這いセット
  'lotion_bath',            // ローション風呂
  'mini_electric_massager', // ミニ電マ
  'remote_vibrator_meetup', // とびっこ待ち合わせ
  'holy_water',             // 聖水
  'anal_fuck',              // アナルファックAF
];

db.serialize(() => {
  console.log('🔄 新しいオプションカラムを追加中...');

  newColumns.forEach((column) => {
    db.run(
      `ALTER TABLE casts ADD COLUMN ${column} BOOLEAN DEFAULT 0`,
      (err) => {
        if (err) {
          // カラムが既に存在する場合はエラーが出るが無視
          if (err.message.includes('duplicate column name')) {
            console.log(`✅ ${column} は既に存在します`);
          } else {
            console.error(`❌ ${column} の追加でエラー:`, err.message);
          }
        } else {
          console.log(`✅ ${column} を追加しました`);
        }
      }
    );
  });

  // 少し待ってから完了メッセージ
  setTimeout(() => {
    console.log('\n✅ 新しいオプションカラムの追加が完了しました！');
    db.close();
  }, 2000);
});
