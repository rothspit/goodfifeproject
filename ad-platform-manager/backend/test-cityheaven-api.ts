/**
 * シティヘブンネット モバイルAPI テスト
 */
import { CityHeavenAPIClient } from './src/services/platforms/CityHeavenAPIClient';

async function testCityHeavenAPI() {
  const client = new CityHeavenAPIClient();
  
  try {
    console.log('=== シティヘブンネット モバイルAPI テスト ===\n');
    
    // 認証情報（環境変数から取得）
    const credentials = {
      username: process.env.CITYHEAVEN_USERNAME || '2500000713',
      password: process.env.CITYHEAVEN_PASSWORD || 'ZKs60jlq',
    };
    
    console.log('1. ログインテスト');
    console.log(`   ユーザー名: ${credentials.username}`);
    
    const loginSuccess = await client.login(credentials);
    
    if (loginSuccess) {
      console.log('✅ ログイン成功\n');
      
      // セッション情報確認
      const session = client.getSession();
      console.log('セッション情報:');
      console.log(`  - Shop ID: ${session?.shopId}`);
      console.log(`  - Token: ${session?.token ? 'あり' : 'なし'}`);
      console.log(`  - Cookies: ${session?.cookies?.length || 0}個\n`);
      
      // キャスト一覧取得テスト
      console.log('2. キャスト一覧取得テスト');
      const casts = await client.getCastList();
      console.log(`   取得件数: ${casts.length}件`);
      if (casts.length > 0) {
        console.log(`   最初のキャスト: ${casts[0].name} (ID: ${casts[0].id})`);
      }
      console.log('');
      
      // 写メ日記投稿テスト
      console.log('3. 写メ日記投稿テスト');
      const diaryData = {
        title: 'API経由テスト投稿 - ' + new Date().toISOString(),
        content: 'これはモバイルAPI経由の自動投稿テストです。\n\nPlaywrightを使わずに直接APIを呼び出しています。',
        castName: 'テストキャスト',
      };
      
      const postResult = await client.postDiary(diaryData);
      
      if (postResult.success) {
        console.log('✅ 写メ日記投稿成功');
        if (postResult.diaryId) {
          console.log(`   日記ID: ${postResult.diaryId}`);
        }
        if (postResult.publishedAt) {
          console.log(`   投稿日時: ${postResult.publishedAt}`);
        }
      } else {
        console.log('⚠️  写メ日記投稿失敗');
        if (postResult.error) {
          console.log(`   エラー: ${postResult.error}`);
        }
        console.log('\n   【重要】実際のAPIエンドポイントを確認してください:');
        console.log('   1. mitmproxy をセットアップ');
        console.log('   2. モバイルアプリから実際に投稿');
        console.log('   3. キャプチャしたトラフィックを分析');
        console.log('   4. CityHeavenAPIClient.ts のエンドポイントとパラメータを更新');
      }
      
      // ログアウト
      await client.logout();
      console.log('\n✅ ログアウト完了');
      
    } else {
      console.log('❌ ログイン失敗\n');
      console.log('【対処法】');
      console.log('1. 認証情報を環境変数で設定:');
      console.log('   export CITYHEAVEN_USERNAME="your_username"');
      console.log('   export CITYHEAVEN_PASSWORD="your_password"');
      console.log('');
      console.log('2. 実際のAPIエンドポイントを確認:');
      console.log('   - mitmproxy でモバイルアプリのトラフィックをキャプチャ');
      console.log('   - 実際のログインエンドポイントとパラメータを特定');
      console.log('   - CityHeavenAPIClient.ts を更新');
      console.log('');
      console.log('3. フォールバック: Playwrightを使用');
      console.log('   - npx ts-node test-heaven-net-login.ts');
    }
    
  } catch (error) {
    console.error('テスト中にエラーが発生:', error);
  }
  
  console.log('\n=== テスト完了 ===');
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
  process.exit(1);
});

testCityHeavenAPI();
