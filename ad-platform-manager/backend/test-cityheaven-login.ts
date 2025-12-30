#!/usr/bin/env ts-node
/**
 * シティヘブンネット - 簡易ログインテスト
 */

import { HeavenNetService } from './src/services/platforms/HeavenNetService';

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🧪 シティヘブンネット - ログインテスト');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const service = new HeavenNetService();
  const credentials = {
    username: '2500000713',
    password: 'ZKs60jlq'
  };

  try {
    console.log('🔄 ログイン開始...');
    console.log(`   URL: https://spmanager.cityheaven.net/`);
    console.log(`   ユーザー: ${credentials.username}\n`);

    const result = await service.login(credentials);

    if (result) {
      console.log('✅ ログイン成功！\n');
      console.log('次のステップ:');
      console.log('1. スクリーンショット確認: ls -lh screenshots/');
      console.log('2. キャスト一覧取得テスト');
      console.log('3. 写メ日記投稿テスト\n');
    } else {
      console.log('❌ ログイン失敗\n');
      console.log('対処方法:');
      console.log('1. スクリーンショットでエラー確認');
      console.log('2. 認証情報を再確認');
      console.log('3. URLが正しいか確認\n');
    }
  } catch (error: any) {
    console.log(`❌ エラー: ${error.message}\n`);
    console.log('スタックトレース:');
    console.log(error.stack);
  } finally {
    await service.close();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}

main().catch(error => {
  console.error('❌ 致命的エラー:', error);
  process.exit(1);
});
