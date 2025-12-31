const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'data/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('📝 テストキャストデータを追加します...');

const sampleCasts = [
  {
    name: 'さくら',
    age: 28,
    height: 158,
    bust: 88,
    waist: 58,
    hip: 85,
    cup_size: 'D',
    blood_type: 'A',
    cast_comment: 'はじめまして、さくらです♡\n優しくて甘えん坊な性格です。\nお客様との素敵な時間を大切にしたいと思っています。\n一緒に楽しい時間を過ごしましょう！',
    manager_comment: 'さくらは当店一番の人気嬢です。\n柔らかい雰囲気と抜群のプロポーションで、\nリピーター様が絶えません。\n初めてのお客様でもリラックスしてお過ごしいただけます。',
    has_children: 1,
    smoking_ok: 0,
    tattoo: 0,
    threesome_ok: 1,
    hairless: 0,
    home_visit_ok: 1,
    clothing_request_ok: 1,
    overnight_ok: 1,
    sweet_sadist_ok: 1,
    deep_kiss: 1,
    body_lip: 1,
    sixtynine: 1,
    fellatio: 1,
    sumata: 1,
    is_new: 0,
    status: 'available',
  },
  {
    name: 'あやか',
    age: 32,
    height: 165,
    bust: 92,
    waist: 60,
    hip: 88,
    cup_size: 'F',
    blood_type: 'B',
    cast_comment: 'あやかと申します💕\n大人の魅力たっぷりで癒やし系です。\nお客様に癒しと至福の時間をお届けします。\nぜひ私に会いに来てくださいね♡',
    manager_comment: '抜群のスタイルと大人の色気が魅力のあやか。\n包容力があり、お客様を優しく癒してくれます。\nテクニックも一流で、満足度No.1の実力派キャストです。',
    has_children: 1,
    smoking_ok: 0,
    tattoo: 0,
    threesome_ok: 1,
    hairless: 1,
    home_visit_ok: 1,
    clothing_request_ok: 1,
    overnight_ok: 1,
    sweet_sadist_ok: 1,
    deep_kiss: 1,
    body_lip: 1,
    sixtynine: 1,
    fellatio: 1,
    sumata: 1,
    rotor: 1,
    vibrator: 1,
    is_new: 0,
    status: 'available',
  },
  {
    name: 'みさき',
    age: 25,
    height: 160,
    bust: 86,
    waist: 57,
    hip: 84,
    cup_size: 'C',
    blood_type: 'O',
    cast_comment: 'みさきです！新人ですが頑張ります✨\n明るく元気な性格で、\nお客様を笑顔にすることが大好きです。\n一生懸命尽くしますので、よろしくお願いします♪',
    manager_comment: 'フレッシュな魅力溢れる新人みさき。\n若さと明るさで店内を華やかにしてくれます。\n初々しさと一生懸命な姿勢が大変好評です。',
    has_children: 0,
    smoking_ok: 0,
    tattoo: 0,
    threesome_ok: 0,
    hairless: 0,
    home_visit_ok: 1,
    clothing_request_ok: 1,
    overnight_ok: 0,
    sweet_sadist_ok: 1,
    deep_kiss: 1,
    body_lip: 0,
    sixtynine: 1,
    fellatio: 1,
    sumata: 1,
    is_new: 1,
    new_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
    status: 'available',
  },
];

db.serialize(() => {
  sampleCasts.forEach((cast, index) => {
    db.run(
      `INSERT INTO casts (
        name, age, height, bust, waist, hip, cup_size, blood_type,
        cast_comment, manager_comment,
        has_children, smoking_ok, tattoo, threesome_ok, hairless,
        home_visit_ok, clothing_request_ok, overnight_ok, sweet_sadist_ok,
        deep_kiss, body_lip, sixtynine, fellatio, sumata,
        rotor, vibrator, is_new, new_until, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cast.name, cast.age, cast.height, cast.bust, cast.waist, cast.hip,
        cast.cup_size, cast.blood_type, cast.cast_comment, cast.manager_comment,
        cast.has_children, cast.smoking_ok, cast.tattoo, cast.threesome_ok,
        cast.hairless, cast.home_visit_ok, cast.clothing_request_ok,
        cast.overnight_ok, cast.sweet_sadist_ok, cast.deep_kiss, cast.body_lip,
        cast.sixtynine, cast.fellatio, cast.sumata, cast.rotor || 0,
        cast.vibrator || 0, cast.is_new, cast.new_until || null, cast.status,
      ],
      function (err) {
        if (err) {
          console.error(`❌ ${cast.name} の登録エラー:`, err.message);
        } else {
          console.log(`✅ ${cast.name} を登録しました (ID: ${this.lastID})`);

          // ダミー画像を追加
          const castId = this.lastID;
          const imageUrl = `https://placehold.co/400x600/ff69b4/white?text=${encodeURIComponent(cast.name)}`;

          db.run(
            'INSERT INTO cast_images (cast_id, image_url, is_primary, display_order) VALUES (?, ?, 1, 0)',
            [castId, imageUrl],
            (err) => {
              if (err) {
                console.error(`  ❌ ${cast.name} の画像登録エラー:`, err.message);
              } else {
                console.log(`  ✅ ${cast.name} の画像を登録しました`);
              }
            }
          );

          // 複数枚の画像を追加
          for (let i = 1; i <= 3; i++) {
            const additionalImage = `https://placehold.co/400x600/ff${50+i*10}b4/white?text=${encodeURIComponent(cast.name)}+${i+1}`;
            db.run(
              'INSERT INTO cast_images (cast_id, image_url, is_primary, display_order) VALUES (?, ?, 0, ?)',
              [castId, additionalImage, i],
              (err) => {
                if (err) {
                  console.error(`  ❌ ${cast.name} の追加画像${i+1}の登録エラー:`, err.message);
                }
              }
            );
          }
        }

        // 最後のキャストの処理が終わったらデータベースを閉じる
        if (index === sampleCasts.length - 1) {
          setTimeout(() => {
            db.close(() => {
              console.log('\n✅ テストデータの追加が完了しました');
            });
          }, 1000);
        }
      }
    );
  });
});
