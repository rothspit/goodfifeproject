import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 環境変数を確実に読み込む
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'goodfife_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 接続テスト
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('データベースに接続しました');
    connection.release();
    await initializeDatabase();
  } catch (err) {
    console.error('データベース接続エラー:', err);
  }
})();

// SQLite互換インターフェイス (ラッパー)
class DatabaseWrapper {
  private pool: mysql.Pool;

  constructor(pool: mysql.Pool) {
    this.pool = pool;
  }

  // SQLite style: db.get(sql, callback) or db.get(sql, params, callback)
  async get(sql: string, paramsOrCallback?: any[] | ((err: any, row?: any) => void), callback?: (err: any, row?: any) => void): Promise<any> {
    let params: any[] = [];
    let cb: ((err: any, row?: any) => void) | undefined;

    if (typeof paramsOrCallback === 'function') {
      cb = paramsOrCallback;
    } else if (Array.isArray(paramsOrCallback)) {
      params = paramsOrCallback;
      cb = callback;
    }

    try {
      const [rows] = await this.pool.execute(sql, params);
      const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : undefined;
      if (cb) {
        cb(null, result);
        return;
      }
      return result;
    } catch (error) {
      if (cb) {
        cb(error);
        return;
      }
      throw error;
    }
  }

  // SQLite style: db.all(sql, callback) or db.all(sql, params, callback)
  async all(sql: string, paramsOrCallback?: any[] | ((err: any, rows: any[]) => void), callback?: (err: any, rows: any[]) => void): Promise<any[]> {
    let params: any[] = [];
    let cb: ((err: any, rows: any[]) => void) | undefined;

    if (typeof paramsOrCallback === 'function') {
      cb = paramsOrCallback;
    } else if (Array.isArray(paramsOrCallback)) {
      params = paramsOrCallback;
      cb = callback;
    }

    try {
      const [rows] = await this.pool.execute(sql, params);
      if (cb) {
        cb(null, rows as any[]);
        return rows as any[];
      }
      return rows as any[];
    } catch (error) {
      if (cb) {
        cb(error, []);
        return [];
      }
      throw error;
    }
  }

  // SQLite style: db.run(sql, callback) or db.run(sql, params, callback)
  async run(sql: string, paramsOrCallback?: any[] | ((this: any, err: any) => void), callback?: (this: any, err: any) => void): Promise<any> {
    let params: any[] = [];
    let cb: ((this: any, err: any) => void) | undefined;

    if (typeof paramsOrCallback === 'function') {
      cb = paramsOrCallback;
    } else if (Array.isArray(paramsOrCallback)) {
      params = paramsOrCallback;
      cb = callback;
    }

    try {
      const [result]: any = await this.pool.execute(sql, params);
      
      // thisコンテキストを持つオブジェクトを作成
      const context = {
        lastID: result.insertId,
        changes: result.affectedRows
      };

      if (cb) {
        cb.call(context, null);
        return context;
      }
      return context;
    } catch (error) {
      if (cb) {
        cb.call({}, error);
        return null;
      }
      throw error;
    }
  }

  // Promiseスタイルでの直接アクセス
  async execute(sql: string, params?: any[]) {
    return this.pool.execute(sql, params);
  }

  // prepare() メソッドのサポート
  prepare(sql: string) {
    return {
      get: async (...params: any[]) => {
        const [rows] = await this.pool.execute(sql, params);
        return Array.isArray(rows) && rows.length > 0 ? rows[0] : undefined;
      },
      all: async (...params: any[]) => {
        const [rows] = await this.pool.execute(sql, params);
        return rows;
      },
      run: async (...params: any[]) => {
        const [result]: any = await this.pool.execute(sql, params);
        return {
          lastInsertRowid: result.insertId,
          changes: result.affectedRows
        };
      },
      finalize: () => {
        // MySQLではprepared statementの解放は自動的に行われるため、何もしない
      }
    };
  }

  // serialize() - MySQLでは不要だが互換性のため
  serialize(callback: () => void) {
    callback();
  }
}

async function initializeDatabase() {
  try {
    // ユーザー（会員）テーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        email VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `);

    // キャストテーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS casts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        height INT,
        bust VARCHAR(10),
        waist INT,
        hip INT,
        cup_size VARCHAR(5),
        blood_type VARCHAR(5),
        has_children TINYINT(1) DEFAULT 0,
        smoking_ok TINYINT(1) DEFAULT 0,
        tattoo TINYINT(1) DEFAULT 0,
        threesome_ok TINYINT(1) DEFAULT 0,
        hairless TINYINT(1) DEFAULT 0,
        home_visit_ok TINYINT(1) DEFAULT 0,
        clothing_request_ok TINYINT(1) DEFAULT 0,
        overnight_ok TINYINT(1) DEFAULT 0,
        sweet_sadist_ok TINYINT(1) DEFAULT 0,
        deep_kiss TINYINT(1) DEFAULT 0,
        body_lip TINYINT(1) DEFAULT 0,
        sixtynine TINYINT(1) DEFAULT 0,
        fellatio TINYINT(1) DEFAULT 0,
        sumata TINYINT(1) DEFAULT 0,
        rotor TINYINT(1) DEFAULT 0,
        vibrator TINYINT(1) DEFAULT 0,
        no_panties_visit TINYINT(1) DEFAULT 0,
        no_bra_visit TINYINT(1) DEFAULT 0,
        pantyhose TINYINT(1) DEFAULT 0,
        pantyhose_rip TINYINT(1) DEFAULT 0,
        instant_cunnilingus TINYINT(1) DEFAULT 0,
        instant_fellatio TINYINT(1) DEFAULT 0,
        night_crawling_set TINYINT(1) DEFAULT 0,
        lotion_bath TINYINT(1) DEFAULT 0,
        mini_electric_massager TINYINT(1) DEFAULT 0,
        remote_vibrator_meetup TINYINT(1) DEFAULT 0,
        holy_water TINYINT(1) DEFAULT 0,
        anal_fuck TINYINT(1) DEFAULT 0,
        profile_text TEXT,
        is_new TINYINT(1) DEFAULT 1,
        new_until DATETIME,
        status VARCHAR(50) DEFAULT 'available',
        is_public TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // キャスト画像テーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cast_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cast_id INT NOT NULL,
        image_url TEXT NOT NULL,
        is_primary TINYINT(1) DEFAULT 0,
        display_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE
      )
    `);

    // 出勤スケジュールテーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cast_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cast_id INT NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE
      )
    `);

    // 予約テーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        cast_id INT NOT NULL,
        reservation_date DATE NOT NULL,
        start_time TIME NOT NULL,
        duration INT NOT NULL,
        course VARCHAR(100) NOT NULL,
        total_price INT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        special_requests TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE
      )
    `);

    // ブログテーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cast_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE
      )
    `);

    // 口コミテーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        cast_id INT NOT NULL,
        reservation_id INT,
        rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE,
        FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL
      )
    `);

    // ランキング集計用ビュー
    await pool.execute(`
      CREATE OR REPLACE VIEW cast_rankings AS
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT r.id) as reservation_count,
        COALESCE(AVG(rev.rating), 0) as avg_rating,
        COUNT(DISTINCT rev.id) as review_count
      FROM casts c
      LEFT JOIN reservations r ON c.id = r.cast_id AND r.status = 'completed'
      LEFT JOIN reviews rev ON c.id = rev.cast_id
      GROUP BY c.id, c.name
    `);

    // チャットメッセージテーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        sender_type VARCHAR(10) NOT NULL CHECK(sender_type IN ('user', 'cast')),
        receiver_id INT NOT NULL,
        receiver_type VARCHAR(10) NOT NULL CHECK(receiver_type IN ('user', 'cast')),
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // お知らせテーブル
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'general',
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('データベーステーブルを初期化しました');
  } catch (error) {
    console.error('データベース初期化エラー:', error);
  }
}

// ラッパーインスタンスをエクスポート
export const db = new DatabaseWrapper(pool);
export default db;
