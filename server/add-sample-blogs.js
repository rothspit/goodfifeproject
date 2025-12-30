const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('サンプルブログ（写メ日記）を追加します...');

const sampleBlogs = [
  {
    cast_id: 1, // さくら
    title: '今日のお礼♡',
    content: '今日も楽しい時間をありがとうございました♡\n初めてのお客様も、いつものお客様も、本当にありがとうございます(^^)\n寒い日が続きますが、体調には気をつけてくださいね！\nまたお会いできるのを楽しみにしています☆',
    image_url: 'https://via.placeholder.com/800x600/FFB6C1/000000?text=Sakura+Blog+1',
  },
  {
    cast_id: 3, // みさき
    title: 'デビューしました！',
    content: 'こんにちは、みさきです！\n本日デビューさせていただきました💕\nとっても緊張しましたが、優しいお客様ばかりで安心しました。\n新人ですがよろしくお願いします！\nたくさんお話ししましょうね♡',
    image_url: 'https://via.placeholder.com/800x600/FFE4E1/000000?text=Misaki+Blog+1',
  },
  {
    cast_id: 4, // 天音
    title: '冬の楽しみ方♪',
    content: '最近めっきり寒くなりましたね～\n私は温かいお鍋が大好きです🍲\nみなさんはどんな冬の過ごし方がお好きですか？\n今度お会いした時に教えてくださいね！\nお待ちしています(^^)',
    image_url: 'https://via.placeholder.com/800x600/E6E6FA/000000?text=Amane+Blog+1',
  },
  {
    cast_id: 2, // あやか
    title: '今日も出勤してます！',
    content: 'おはようございます！\n今日も元気に出勤しております♡\n本日は18時までおりますので、お時間がある方はぜひお電話くださいね📞\nたくさんのご予約お待ちしています！',
    image_url: 'https://via.placeholder.com/800x600/FFC0CB/000000?text=Ayaka+Blog+1',
  },
  {
    cast_id: 1, // さくら
    title: 'クリスマスが楽しみ🎄',
    content: 'もうすぐクリスマスですね！\n今年はどんなクリスマスを過ごそうかな～と考えています✨\nみなさんは予定ありますか？\n素敵なクリスマスが過ごせますように♡',
    image_url: 'https://via.placeholder.com/800x600/FFB6C1/000000?text=Sakura+Blog+2',
  },
  {
    cast_id: 3, // みさき
    title: 'お気に入りのカフェ☕',
    content: '最近見つけたカフェがとっても素敵なんです！\nラテアートが可愛くて、思わず写真を撮っちゃいました📸\n甘いものが大好きなので、ケーキも注文しちゃいました笑\nおすすめのカフェがあったら教えてください♪',
    image_url: 'https://via.placeholder.com/800x600/FFE4E1/000000?text=Misaki+Blog+2',
  },
];

let inserted = 0;

sampleBlogs.forEach((blog, index) => {
  db.run(
    `INSERT INTO blogs (cast_id, title, content, image_url, created_at) 
     VALUES (?, ?, ?, ?, datetime('now', '-${index} days'))`,
    [blog.cast_id, blog.title, blog.content, blog.image_url],
    function (err) {
      if (err) {
        console.error(`ブログ追加エラー (${blog.title}):`, err);
      } else {
        console.log(`✅ ブログ追加: ${blog.title} (cast_id=${blog.cast_id})`);
      }

      inserted++;
      if (inserted === sampleBlogs.length) {
        console.log(`\n✅ ${inserted}件のサンプルブログを追加しました`);
        db.close();
      }
    }
  );
});
