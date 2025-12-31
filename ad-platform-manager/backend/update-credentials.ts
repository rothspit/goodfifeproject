#!/usr/bin/env ts-node
/**
 * 認証情報一括更新スクリプト
 * 使い方: npx ts-node update-credentials.ts credentials.json
 */

import sqlite3 from 'sqlite3';
import * as path from 'path';
import * as fs from 'fs';

const DB_PATH = path.join(__dirname, 'local-dev.db');

interface CredentialData {
  id: number;
  name: string;
  login_id: string;
  login_password: string;
  is_active?: number;
}

interface CredentialsFile {
  platforms: CredentialData[];
}

// コマンドライン引数からファイルパスを取得
const credentialsFile = process.argv[2];

if (!credentialsFile) {
  console.error('❌ エラー: 認証情報ファイルを指定してください');
  console.log('使い方: npx ts-node update-credentials.ts credentials.json');
  process.exit(1);
}

if (!fs.existsSync(credentialsFile)) {
  console.error(`❌ エラー: ファイルが見つかりません: ${credentialsFile}`);
  process.exit(1);
}

// JSONファイル読み込み
let credentials: CredentialsFile;
try {
  const fileContent = fs.readFileSync(credentialsFile, 'utf8');
  credentials = JSON.parse(fileContent);
} catch (error: any) {
  console.error('❌ JSONファイルの読み込みに失敗しました:', error.message);
  process.exit(1);
}

if (!credentials.platforms || credentials.platforms.length === 0) {
  console.error('❌ エラー: platformsデータが空です');
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  🔐 認証情報一括更新');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📁 ファイル: ${credentialsFile}`);
console.log(`📊 更新対象: ${credentials.platforms.length}サイト\n`);

const db = new sqlite3.Database(DB_PATH);

let successCount = 0;
let failCount = 0;
const errors: string[] = [];

// トランザクション開始
db.serialize(() => {
  db.run('BEGIN TRANSACTION');

  credentials.platforms.forEach((platform, index) => {
    const isActive = platform.is_active !== undefined ? platform.is_active : 0;
    
    db.run(
      `UPDATE ad_platforms SET
        login_id = ?,
        login_password = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [platform.login_id, platform.login_password, isActive, platform.id],
      function(err) {
        if (err) {
          failCount++;
          errors.push(`ID:${platform.id} ${platform.name} - ${err.message}`);
          console.log(`❌ ID:${platform.id} | ${platform.name} - 更新失敗`);
        } else if (this.changes === 0) {
          failCount++;
          errors.push(`ID:${platform.id} ${platform.name} - サイトが見つかりません`);
          console.log(`⚠️  ID:${platform.id} | ${platform.name} - サイトが見つかりません`);
        } else {
          successCount++;
          console.log(`✅ ID:${platform.id} | ${platform.name.padEnd(20)} - 更新成功`);
        }

        // 最後の処理
        if (index === credentials.platforms.length - 1) {
          if (failCount === 0) {
            db.run('COMMIT', (err) => {
              if (err) {
                console.error('\n❌ コミット失敗:', err);
                process.exit(1);
              }
              
              console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('📊 更新結果:');
              console.log(`   ✅ 成功: ${successCount}サイト`);
              console.log(`   ❌ 失敗: ${failCount}サイト`);
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
              
              console.log('🎉 認証情報の更新が完了しました！\n');
              console.log('次のステップ:');
              console.log('1. ログイン情報確認: npx ts-node get-login-info.ts');
              console.log('2. ログインテスト実施: npx ts-node test-[サイト名].ts');
              console.log('3. APIで確認: curl http://localhost:5001/api/ad-platforms\n');
              
              db.close();
            });
          } else {
            db.run('ROLLBACK', () => {
              console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('❌ エラーが発生したため、すべての変更をロールバックしました');
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
              console.log('エラー詳細:');
              errors.forEach(err => console.log(`  - ${err}`));
              console.log('');
              
              db.close();
              process.exit(1);
            });
          }
        }
      }
    );
  });
});
