const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // ランキングテーブルを作成
  db.run(`
    CREATE TABLE IF NOT EXISTS rankings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cast_id INTEGER NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('overall', 'newcomer', 'popularity', 'review')),
      rank_position INTEGER NOT NULL,
      points INTEGER DEFAULT 0,
      period_start DATE,
      period_end DATE,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE,
      UNIQUE(cast_id, category, period_start)
    )
  `, (err) => {
    if (err) {
      console.error('ランキングテーブル作成エラー:', err.message);
    } else {
      console.log('✅ ランキングテーブルが作成されました');
    }
  });

  // ランキングカテゴリの説明テーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS ranking_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_key TEXT UNIQUE NOT NULL,
      category_name TEXT NOT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('ランキングカテゴリテーブル作成エラー:', err.message);
    } else {
      console.log('✅ ランキングカテゴリテーブルが作成されました');
    }
  });

  // デフォルトカテゴリを挿入
  const categories = [
    { key: 'overall', name: '総合ランキング', description: '全てのキャストの総合評価', order: 1 },
    { key: 'newcomer', name: '新人ランキング', description: '新人キャストのランキング', order: 2 },
    { key: 'popularity', name: '人気投票ランキング', description: 'お客様投票による人気ランキング', order: 3 },
    { key: 'review', name: 'レビューランキング', description: '口コミ評価が高いキャスト', order: 4 },
  ];

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO ranking_categories (category_key, category_name, description, display_order)
    VALUES (?, ?, ?, ?)
  `);

  categories.forEach(cat => {
    insertStmt.run(cat.key, cat.name, cat.description, cat.order);
  });

  insertStmt.finalize(() => {
    console.log('✅ デフォルトカテゴリが挿入されました');
  });

  // インデックスを作成
  db.run(`CREATE INDEX IF NOT EXISTS idx_rankings_category ON rankings(category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_rankings_active ON rankings(is_active)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_rankings_period ON rankings(period_start, period_end)`);
  
  console.log('✅ インデックスが作成されました');
});

db.close((err) => {
  if (err) {
    console.error('データベース接続終了エラー:', err.message);
  } else {
    console.log('✅ データベース接続を終了しました');
  }
});
