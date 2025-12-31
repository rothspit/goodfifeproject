#!/usr/bin/env ts-node
/**
 * アイドル学園（店舗2）- HeavenNetServiceを使用した詳細調査
 */

import { HeavenNetService } from './src/services/platforms/HeavenNetService';
import * as fs from 'fs';

async function exploreIdolGakuen() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎓 アイドル学園 - 管理画面完全調査');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const service = new HeavenNetService();
  const credentials = {
    username: '2510055906',
    password: 'OgI70vnH'
  };

  try {
    // ログイン
    console.log('🔐 ログイン中...');
    const loginResult = await service.login(credentials);
    
    if (!loginResult) {
      console.log('❌ ログイン失敗');
      return;
    }
    
    console.log('✅ ログイン成功\n');

    // ページ情報を取得（privateメンバーにアクセスできないので、代わりにgetメソッドを使用）
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ダッシュボード情報:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // ここでキャスト一覧を試す
    console.log('👥 キャスト一覧取得を試みます...\n');
    
    try {
      // getCastList()メソッドが実装されているか確認
      const casts = await (service as any).getCastList?.();
      
      if (casts && Array.isArray(casts)) {
        console.log(`✅ キャスト一覧取得成功: ${casts.length}人\n`);
        
        if (casts.length > 0) {
          console.log('📋 キャスト情報（最初の5人）:\n');
          casts.slice(0, 5).forEach((cast: any, index: number) => {
            console.log(`${index + 1}. ${cast.name || 'N/A'}`);
            console.log(`   ID: ${cast.id || 'N/A'}`);
            if (cast.age) console.log(`   年齢: ${cast.age}歳`);
            if (cast.height) console.log(`   身長: ${cast.height}cm`);
            console.log('');
          });

          // JSONファイルに保存
          fs.writeFileSync(
            'screenshots/idol-gakuen-casts.json',
            JSON.stringify(casts, null, 2)
          );
          console.log('💾 キャスト情報をJSONファイルに保存');
          console.log('   ファイル: screenshots/idol-gakuen-casts.json\n');
        }
      } else {
        console.log('⚠️  getCastList()メソッドが未実装、またはデータ取得失敗\n');
      }
    } catch (error: any) {
      console.log(`⚠️  キャスト一覧取得でエラー: ${error.message}\n`);
    }

    // 写メ日記関連の情報を探す
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📸 写メ日記機能の調査:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // ダミーデータで投稿テスト（実際には投稿しない - DRY RUNモード）
    const testDiaryData = {
      castId: 'test001',
      castName: 'テストキャスト',
      title: 'テスト投稿',
      content: 'これはテスト投稿です。',
      images: []
    };

    console.log('📝 テスト投稿データ:');
    console.log(`   キャスト: ${testDiaryData.castName}`);
    console.log(`   タイトル: ${testDiaryData.title}`);
    console.log(`   本文: ${testDiaryData.content}`);
    console.log(`   画像: ${testDiaryData.images.length}枚\n`);

    console.log('⚠️  実際の投稿はスキップ（DRY RUNモード）\n');

    // postDiary()の実装状況を確認
    if (typeof (service as any).postDiary === 'function') {
      console.log('✅ postDiary()メソッドは実装されています');
      console.log('   実際の投稿テストは別途実行可能\n');
    } else {
      console.log('⚠️  postDiary()メソッドは未実装');
      console.log('   実装が必要です\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 調査完了');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 次のステップ:');
    console.log('1. スクリーンショットを確認');
    console.log('2. キャスト一覧のJSON確認（もしあれば）');
    console.log('3. 写メ日記投稿フォームのセレクタを確認');
    console.log('4. 実際の投稿テストを実行\n');

    console.log('💡 実際の投稿テストを実行する場合:');
    console.log('   npx ts-node test-idol-gakuen-post.ts\n');

  } catch (error: any) {
    console.error('❌ エラー:', error.message);
    if (error.stack) {
      console.error('\nスタックトレース:');
      console.error(error.stack);
    }
  } finally {
    await service.close();
    console.log('✅ ブラウザを閉じました\n');
  }
}

exploreIdolGakuen().catch(error => {
  console.error('❌ 致命的エラー:', error);
  process.exit(1);
});
