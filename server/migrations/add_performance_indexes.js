const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('パフォーマンス向上のためのインデックスを追加します...');

db.serialize(() => {
  // キャスト関連のインデックス
  db.run(`CREATE INDEX IF NOT EXISTS idx_casts_is_public ON casts(is_public)`, (err) => {
    if (err) console.error('idx_casts_is_public作成エラー:', err);
    else console.log('✓ idx_casts_is_public 作成成功');
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_casts_status ON casts(status)`, (err) => {
    if (err) console.error('idx_casts_status作成エラー:', err);
    else console.log('✓ idx_casts_status 作成成功');
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_casts_display_order ON casts(display_order)`, (err) => {
    if (err) console.error('idx_casts_display_order作成エラー:', err);
    else console.log('✓ idx_casts_display_order 作成成功');
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_casts_created_at ON casts(created_at)`, (err) => {
    if (err) console.error('idx_casts_created_at作成エラー:', err);
    else console.log('✓ idx_casts_created_at 作成成功');
  });

  // 画像関連のインデックス
  db.run(`CREATE INDEX IF NOT EXISTS idx_cast_images_cast_id ON cast_images(cast_id)`, (err) => {
    if (err) console.error('idx_cast_images_cast_id作成エラー:', err);
    else console.log('✓ idx_cast_images_cast_id 作成成功');
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_cast_images_is_primary ON cast_images(is_primary)`, (err) => {
    if (err) console.error('idx_cast_images_is_primary作成エラー:', err);
    else console.log('✓ idx_cast_images_is_primary 作成成功');
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_cast_images_cast_id_primary ON cast_images(cast_id, is_primary)`, (err) => {
    if (err) console.error('idx_cast_images_cast_id_primary作成エラー:', err);
    else console.log('✓ idx_cast_images_cast_id_primary 作成成功');
  });

  // スケジュール関連のインデックス
  db.run(`CREATE INDEX IF NOT EXISTS idx_schedules_cast_id ON cast_schedules(cast_id)`, (err) => {
    if (err) console.error('idx_schedules_cast_id作成エラー:', err);
    else console.log('✓ idx_schedules_cast_id 作成成功');
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_schedules_date ON cast_schedules(date)`, (err) => {
    if (err) console.error('idx_schedules_date作成エラー:', err);
    else console.log('✓ idx_schedules_date 作成成功');
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_schedules_cast_date ON cast_schedules(cast_id, date)`, (err) => {
    if (err) console.error('idx_schedules_cast_date作成エラー:', err);
    else console.log('✓ idx_schedules_cast_date 作成成功');
  });

  // レビュー関連のインデックス
  db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_cast_id ON reviews(cast_id)`, (err) => {
    if (err) console.error('idx_reviews_cast_id作成エラー:', err);
    else console.log('✓ idx_reviews_cast_id 作成成功');
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at)`, (err) => {
    if (err) console.error('idx_reviews_created_at作成エラー:', err);
    else console.log('✓ idx_reviews_created_at 作成成功');
  });

  // ブログ関連のインデックス
  db.run(`CREATE INDEX IF NOT EXISTS idx_blogs_cast_id ON blogs(cast_id)`, (err) => {
    if (err) console.error('idx_blogs_cast_id作成エラー:', err);
    else console.log('✓ idx_blogs_cast_id 作成成功');
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at)`, (err) => {
    if (err) console.error('idx_blogs_created_at作成エラー:', err);
    else console.log('✓ idx_blogs_created_at 作成成功');
  });
});

db.close((err) => {
  if (err) {
    console.error('データベースクローズエラー:', err);
  } else {
    console.log('✓ インデックスの追加が完了しました');
  }
});
