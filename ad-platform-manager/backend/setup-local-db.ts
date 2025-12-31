#!/usr/bin/env ts-node
/**
 * ローカル開発用SQLiteデータベースセットアップスクリプト
 * リモートDBに接続できない場合のフォールバック
 */

import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = path.join(__dirname, 'local-dev.db');

// 既存のDBを削除
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('🗑️  既存のローカルDBを削除しました');
}

const db = new sqlite3.Database(DB_PATH);

console.log('📁 ローカルSQLiteデータベースを作成中...\n');

db.serialize(() => {
  // ad_platformsテーブル作成
  db.run(`
    CREATE TABLE IF NOT EXISTS ad_platforms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT DEFAULT 'お客様向け',
      priority TEXT CHECK(priority IN ('high', 'medium', 'low')),
      url TEXT,
      login_id TEXT,
      login_password TEXT,
      connection_type TEXT DEFAULT 'WEB',
      api_endpoint TEXT,
      api_key TEXT,
      api_secret TEXT,
      ftp_host TEXT,
      ftp_port INTEGER,
      ftp_username TEXT,
      ftp_password TEXT,
      is_active INTEGER DEFAULT 0,
      settings TEXT,
      last_sync_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ ad_platformsテーブル作成完了');

  // 23サイトのデータ投入
  const platforms = [
    // 既存サイト
    { name: 'シティヘブンネット', priority: null, url: 'https://spmanager.cityheaven.net/', login_id: '2500000713', login_password: 'ZKs60jlq', is_active: 1 },
    { name: 'デリヘルタウン', priority: null, url: 'https://admin.dto.jp/a/auth/input', login_id: 'info@h-mitsu.com', login_password: 'hitodumamitu', is_active: 1 },
    { name: 'ヘブンネット', priority: null, url: 'https://www.heavennet.cc/admin/login.php', is_active: 0 },
    
    // 高優先度サイト
    { name: '風俗じゃぱん', priority: 'high', url: 'https://www.fuzoku-japan.com/admin/', is_active: 0 },
    { name: 'ぴゅあらば', priority: 'high', url: 'https://www.p-a.jp/admin/', is_active: 0 },
    { name: 'シティコレクション', priority: 'high', url: 'https://www.citycollection.net/admin/', is_active: 0 },
    { name: '駅ちか', priority: 'high', url: 'https://www.ekichika.jp/admin/', is_active: 0 },
    
    // 中優先度サイト
    { name: 'ピンクコンパニオン', priority: 'medium', url: 'https://www.pinkcompanion.com/admin/', is_active: 0 },
    { name: '風俗総合情報', priority: 'medium', url: 'https://www.fuzoku-info.com/admin/', is_active: 0 },
    { name: 'Qプリ', priority: 'medium', url: 'https://www.qpri.jp/admin/', is_active: 0 },
    { name: 'デリゲット', priority: 'medium', url: 'https://www.deli-get.com/admin/', is_active: 0 },
    { name: '風俗情報局', priority: 'medium', url: 'https://www.fuzoku-joho.com/admin/', is_active: 0 },
    { name: 'エッチな4610', priority: 'medium', url: 'https://www.h4610.com/admin/', is_active: 0 },
    { name: '一撃', priority: 'medium', url: 'https://www.ichigeki.com/admin/', is_active: 0 },
    { name: 'ぽっちゃりChannel', priority: 'medium', url: 'https://www.pocchari-ch.jp/admin/', is_active: 0 },
    
    // 低優先度サイト
    { name: 'Navi Fuzoku', priority: 'low', url: 'https://www.navi-fuzoku.com/admin/', is_active: 0 },
    { name: '熟女Style', priority: 'low', url: 'https://www.jukujo-style.com/admin/', is_active: 0 },
    { name: 'ガールズヘブンネット', priority: 'low', url: 'https://www.girlsheaven.net/admin/', is_active: 0 },
    { name: 'ボーイズヘブンネット', priority: 'low', url: 'https://www.boysheaven.net/admin/', is_active: 0 },
    { name: '風俗テレクラ情報', priority: 'low', url: 'https://www.teleclub.jp/admin/', is_active: 0 },
    { name: 'ピンサロドットコム', priority: 'low', url: 'https://www.pinsaro.com/admin/', is_active: 0 },
    { name: 'キャバクラヘブン', priority: 'low', url: 'https://www.cabaret-heaven.com/admin/', is_active: 0 },
  ];

  const stmt = db.prepare(`
    INSERT INTO ad_platforms (name, category, priority, url, login_id, login_password, connection_type, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 'WEB', ?)
  `);

  platforms.forEach((platform, index) => {
    stmt.run(
      platform.name,
      'お客様向け',
      platform.priority,
      platform.url,
      platform.login_id || null,
      platform.login_password || null,
      platform.is_active
    );
    console.log(`  ${index + 1}. ${platform.name} ${platform.is_active ? '✅' : '⏸️'}`);
  });

  stmt.finalize();

  // distribution_logsテーブル作成
  db.run(`
    CREATE TABLE IF NOT EXISTS distribution_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id INTEGER NOT NULL,
      cast_id TEXT,
      distribution_type TEXT,
      status TEXT CHECK(status IN ('成功', '失敗', '処理中')) DEFAULT '処理中',
      request_data TEXT,
      response_data TEXT,
      error_message TEXT,
      execution_time INTEGER,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (platform_id) REFERENCES ad_platforms(id) ON DELETE CASCADE
    )
  `);

  console.log('\n✅ distribution_logsテーブル作成完了');
});

db.close((err) => {
  if (err) {
    console.error('❌ エラー:', err);
    process.exit(1);
  }
  
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  🎉 ローカルデータベースセットアップ完了！             ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log(`📍 データベースパス: ${DB_PATH}`);
  console.log('📊 登録サイト数: 23サイト');
  console.log('🚀 有効サイト数: 2サイト (シティヘブンネット、デリヘルタウン)\n');
  console.log('次のステップ:');
  console.log('1. .envファイルを更新: USE_SQLITE=true');
  console.log('2. バックエンドを再起動: npm run dev');
  console.log('3. API確認: curl http://localhost:5001/api/ad-platforms\n');
});
