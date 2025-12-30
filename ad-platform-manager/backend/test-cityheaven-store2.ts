#!/usr/bin/env ts-node
/**
 * シティヘブンネット - 店舗2 ログインテスト
 */

import { HeavenNetService } from './src/services/platforms/HeavenNetService';

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🧪 シティヘブンネット - 店舗2 ログインテスト');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const service = new HeavenNetService();
  const credentials = {
    username: '2510055906',
    password: 'OgI70vnH'
  };

  try {
    console.log('🔄 ログイン開始...');
    console.log(`   URL: https://spmanager.cityheaven.net/`);
    console.log(`   店舗ID: ${credentials.username}\n`);

    const result = await service.login(credentials);

    if (result) {
      console.log('✅ ログイン成功！\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 次のステップ:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('1️⃣  スクリーンショット確認');
      console.log('   ls -lh screenshots/ | grep cityheaven');
      console.log('');
      console.log('2️⃣  キャスト一覧取得テスト');
      console.log('   const casts = await service.getCastList();');
      console.log('');
      console.log('3️⃣  写メ日記投稿テスト');
      console.log('   const result = await service.postDiary(castData, diaryData);');
      console.log('');
      console.log('4️⃣  データベースに店舗2を登録');
      console.log('   現在は店舗1のみ登録済み、店舗2も追加可能\n');
    } else {
      console.log('❌ ログイン失敗\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 対処方法:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('1. スクリーンショットでエラー確認');
      console.log('   ls -lt screenshots/ | head -5');
      console.log('');
      console.log('2. 認証情報を再確認');
      console.log(`   ユーザー名: ${credentials.username}`);
      console.log('   パスワード: ********');
      console.log('');
      console.log('3. URLが正しいか確認');
      console.log('   https://spmanager.cityheaven.net/\n');
    }
  } catch (error: any) {
    console.log(`❌ エラー発生: ${error.message}\n`);
    console.log('スタックトレース:');
    console.log(error.stack);
  } finally {
    await service.close();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('テスト完了');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

main().catch(error => {
  console.error('❌ 致命的エラー:', error);
  process.exit(1);
});
