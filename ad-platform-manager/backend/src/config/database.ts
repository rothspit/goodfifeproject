import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

// データベースタイプ
const USE_SQLITE = process.env.USE_SQLITE === 'true' || process.env.NODE_ENV === 'development';
const SQLITE_PATH = path.join(__dirname, '../../local-dev.db');

// MySQL接続プール
let mysqlPool: mysql.Pool | null = null;
let sqliteDb: Database | null = null;

// MySQL接続プール作成
if (!USE_SQLITE) {
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ad_platform_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
  });
}

// SQLite接続初期化
async function initSQLite() {
  if (!sqliteDb) {
    sqliteDb = await open({
      filename: SQLITE_PATH,
      driver: sqlite3.Database
    });
    console.log('✅ SQLite データベース接続成功');
    console.log(`   パス: ${SQLITE_PATH}`);
  }
  return sqliteDb;
}

// 汎用クエリ実行関数
export async function query(sql: string, params: any[] = []): Promise<any> {
  if (USE_SQLITE) {
    const db = await initSQLite();
    
    // SELECT系
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return await db.all(sql, params);
    }
    
    // INSERT/UPDATE/DELETE系
    const result = await db.run(sql, params);
    return {
      affectedRows: result.changes || 0,
      insertId: result.lastID || 0
    };
  } else {
    if (!mysqlPool) {
      throw new Error('MySQL pool not initialized');
    }
    const [rows] = await mysqlPool.execute(sql, params);
    return rows;
  }
}

// 接続テスト
export async function testConnection() {
  try {
    if (USE_SQLITE) {
      await initSQLite();
      await query('SELECT 1');
      return true;
    } else {
      if (!mysqlPool) {
        throw new Error('MySQL pool not initialized');
      }
      const connection = await mysqlPool.getConnection();
      console.log('✅ MySQL データベース接続成功');
      console.log(`   ホスト: ${process.env.DB_HOST}`);
      console.log(`   データベース: ${process.env.DB_NAME}`);
      connection.release();
      return true;
    }
  } catch (error) {
    console.error('❌ データベース接続エラー:', error);
    return false;
  }
}

// 接続クローズ
export async function closeConnection() {
  if (USE_SQLITE && sqliteDb) {
    await sqliteDb.close();
    sqliteDb = null;
  } else if (mysqlPool) {
    await mysqlPool.end();
    mysqlPool = null;
  }
}

// デフォルトエクスポート（後方互換性）
export const pool = {
  query: async (sql: string, params?: any[]) => {
    const result = await query(sql, params || []);
    return [result];
  }
};

export default pool;
