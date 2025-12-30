#!/usr/bin/env ts-node
/**
 * シティヘブンネット - 写メ日記投稿テスト
 */

import { HeavenNetService } from './src/services/platforms/HeavenNetService';

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📸 シティヘブンネット - 写メ日記投稿テスト');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 店舗選択
  const stores = [
    { id: 1, username: '2500000713', password: 'ZKs60jlq', name: '店舗1' },
    { id: 2, username: '2510055906', password: 'OgI70vnH', name: '店舗2' }
  ];

  const selectedStore = stores[1]; // 店舗2を使用

  console.log(`🏪 使用店舗: ${selectedStore.name}`);
  console.log(`   店舗ID: ${selectedStore.username}\n`);

  const service = new HeavenNetService();

  try {
    // ログイン
    console.log('🔐 ログイン中...');
    const loginResult = await service.login({
      username: selectedStore.username,
      password: selectedStore.password
    });

    if (!loginResult) {
      console.log('❌ ログイン失敗');
      return;
    }

    console.log('✅ ログイン成功\n');

    // キャスト一覧取得（もし実装されていれば）
    console.log('👥 キャスト一覧取得を試みています...');
    console.log('   （注: getCastList()が実装されていない場合はスキップ）\n');

    // 写メ日記投稿データ準備
    const testDiary = {
      title: 'テスト投稿 - 自動投稿システム',
      content: `
こんにちは！

これは自動投稿システムのテスト投稿です。
システムが正常に動作していることを確認しています。

今日も元気に営業中です💕

#テスト投稿 #自動化
      `.trim(),
      castId: 'test001',
      castName: 'テストキャスト',
      images: [] // 画像なしでテスト
    };

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 投稿データ:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`   タイトル: ${testDiary.title}`);
    console.log(`   キャスト: ${testDiary.castName}`);
    console.log(`   本文: ${testDiary.content.substring(0, 50)}...`);
    console.log(`   画像: ${testDiary.images.length}枚\n`);

    console.log('⚠️  注意: 実際の投稿は実行しません');
    console.log('   実際に投稿する場合は、以下のコードのコメントを外してください:\n');
    console.log('   // const result = await service.postDiary(testDiary);');
    console.log('   // console.log("投稿結果:", result);\n');

    // 実際の投稿（コメントアウト）
    // const result = await service.postDiary(testDiary);
    // if (result) {
    //   console.log('✅ 写メ日記投稿成功！');
    // } else {
    //   console.log('❌ 写メ日記投稿失敗');
    // }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ テスト完了');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 次のステップ:');
    console.log('1. postDiary()メソッドの実装を確認');
    console.log('2. 実際の投稿フォームのセレクタを調整');
    console.log('3. 画像アップロード機能の実装');
    console.log('4. 本番投稿テスト実施\n');

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
