#!/usr/bin/env ts-node
/**
 * データベースから登録済みログイン情報を取得
 */

import sqlite3 from 'sqlite3';
import * as path from 'path';

const DB_PATH = path.join(__dirname, 'local-dev.db');
const db = new sqlite3.Database(DB_PATH);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  📋 広告媒体ログイン情報リスト');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

db.all(
  `SELECT id, name, login_id, login_password, url, is_active, priority 
   FROM ad_platforms 
   ORDER BY 
     CASE 
       WHEN is_active = 1 THEN 0 
       WHEN priority = 'high' THEN 1
       WHEN priority = 'medium' THEN 2
       WHEN priority = 'low' THEN 3
       ELSE 4
     END, 
     id`,
  [],
  (err, rows: any[]) => {
    if (err) {
      console.error('❌ エラー:', err);
      process.exit(1);
    }

    let activeCount = 0;
    let configuredCount = 0;
    let needsConfigCount = 0;

    rows.forEach((row, index) => {
      const hasCredentials = row.login_id && row.login_password;
      const isActive = row.is_active === 1;
      const priorityLabel = row.priority ? `[${row.priority.toUpperCase()}]` : '';
      
      if (isActive) activeCount++;
      if (hasCredentials) configuredCount++;
      if (!hasCredentials) needsConfigCount++;

      const statusIcon = isActive ? '✅' : hasCredentials ? '🔒' : '⚠️';
      
      console.log(`${statusIcon} ID: ${row.id.toString().padStart(2)} | ${row.name.padEnd(25)} ${priorityLabel}`);
      console.log(`   URL: ${row.url || 'N/A'}`);
      
      if (hasCredentials) {
        console.log(`   ✅ ログインID: ${row.login_id}`);
        console.log(`   ✅ パスワード: ${row.login_password}`);
        console.log(`   状態: ${isActive ? '✅ 有効' : '⏸️  無効（認証情報設定済み）'}`);
      } else {
        console.log(`   ⚠️  ログインID: 未設定`);
        console.log(`   ⚠️  パスワード: 未設定`);
        console.log(`   状態: ⏸️  無効（認証情報が必要）`);
      }
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 統計情報:');
    console.log(`   総サイト数: ${rows.length}`);
    console.log(`   ✅ 有効サイト: ${activeCount}`);
    console.log(`   🔒 認証情報設定済み: ${configuredCount}`);
    console.log(`   ⚠️  認証情報未設定: ${needsConfigCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (needsConfigCount > 0) {
      console.log('🔴 次のアクション:');
      console.log('   各サイトのログインID/パスワードをデータベースに追加してください。');
      console.log('   SQLで更新する場合:');
      console.log('');
      console.log('   UPDATE ad_platforms SET');
      console.log('     login_id = \'your_username\',');
      console.log('     login_password = \'your_password\',');
      console.log('     is_active = 1');
      console.log('   WHERE name = \'サイト名\';');
      console.log('');
    }

    db.close();
  }
);
