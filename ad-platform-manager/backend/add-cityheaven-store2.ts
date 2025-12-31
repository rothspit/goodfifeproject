#!/usr/bin/env ts-node
/**
 * シティヘブンネット 店舗2 をデータベースに追加
 */

import sqlite3 from 'sqlite3';
import * as path from 'path';

const DB_PATH = path.join(__dirname, 'local-dev.db');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  🏪 シティヘブンネット 店舗2 追加');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  // 既存の店舗2があるか確認
  db.get(
    'SELECT * FROM ad_platforms WHERE login_id = ?',
    ['2510055906'],
    (err, row) => {
      if (err) {
        console.error('❌ エラー:', err);
        db.close();
        return;
      }

      if (row) {
        console.log('⚠️  店舗2は既に登録されています');
        console.log(`   ID: ${(row as any).id}`);
        console.log(`   名前: ${(row as any).name}\n`);
        db.close();
        return;
      }

      // 新規追加
      db.run(
        `INSERT INTO ad_platforms (
          name, category, priority, url, login_id, login_password, 
          connection_type, is_active, settings, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          'シティヘブンネット（店舗2）',
          'お客様向け',
          null,
          'https://spmanager.cityheaven.net/',
          '2510055906',
          'OgI70vnH',
          'WEB',
          1,
          JSON.stringify({
            store_id: '2510055906',
            store_name: '店舗2',
            service_class: 'HeavenNetService'
          })
        ],
        function(err) {
          if (err) {
            console.error('❌ 追加失敗:', err);
            db.close();
            return;
          }

          console.log('✅ 店舗2の追加に成功しました！\n');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📋 登録情報:');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          console.log(`   ID: ${this.lastID}`);
          console.log('   名前: シティヘブンネット（店舗2）');
          console.log('   ログインID: 2510055906');
          console.log('   状態: ✅ 有効');
          console.log('   URL: https://spmanager.cityheaven.net/\n');

          // 確認
          db.all(
            `SELECT id, name, login_id, is_active 
             FROM ad_platforms 
             WHERE name LIKE '%シティヘブン%' 
             ORDER BY id`,
            [],
            (err, rows: any[]) => {
              if (err) {
                console.error('❌ 確認エラー:', err);
              } else {
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🏪 シティヘブンネット 全店舗一覧:');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                rows.forEach(row => {
                  const status = row.is_active ? '✅ 有効' : '⏸️  無効';
                  console.log(`   ID: ${row.id} | ${row.name}`);
                  console.log(`   ログインID: ${row.login_id}`);
                  console.log(`   状態: ${status}\n`);
                });
              }
              db.close();
            }
          );
        }
      );
    }
  );
});
