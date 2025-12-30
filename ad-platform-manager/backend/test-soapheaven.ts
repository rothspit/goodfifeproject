/**
 * ソープランドヘブン (soapheaven.jp) ログイン・写メ日記投稿テスト
 */
import { SoaplandHeavenService } from './src/services/platforms/SoaplandHeavenService';

async function testSoaplandHeaven() {
  const service = new SoaplandHeavenService();

  try {
    console.log('=== ソープランドヘブン (soapheaven.jp) テスト開始 ===\n');

    // テスト用認証情報（環境変数から取得、なければダミー）
    const credentials = {
      username: process.env.SOAPHEAVEN_USERNAME || 'test_user',
      password: process.env.SOAPHEAVEN_PASSWORD || 'test_password'
    };

    console.log('1. ログインテスト');
    console.log(`   ユーザー名: ${credentials.username}`);
    
    const loginSuccess = await service.login(credentials);
    
    if (loginSuccess) {
      console.log('✅ ログイン成功\n');
      
      // 写メ日記投稿テスト
      console.log('2. 写メ日記投稿テスト');
      const diaryData = {
        title: 'テスト投稿 - ' + new Date().toISOString(),
        content: 'これはPlaywrightによる自動投稿テストです。',
        castName: 'テスト姫',
      };
      
      const postSuccess = await service.postDiary(diaryData);
      
      if (postSuccess) {
        console.log('✅ 写メ日記投稿成功');
      } else {
        console.log('⚠️  写メ日記投稿失敗（フォーム構造の調査が必要）');
      }
      
    } else {
      console.log('❌ ログイン失敗');
      console.log('   原因:');
      console.log('   - URLが変更された可能性');
      console.log('   - 認証情報が正しくない');
      console.log('   - ログインフォームの構造が異なる');
      console.log('\n   対処法:');
      console.log('   1. screenshots/soapheaven-login-page.png を確認');
      console.log('   2. 環境変数 SOAPHEAVEN_USERNAME, SOAPHEAVEN_PASSWORD を設定');
      console.log('   3. URLとフォーム構造を実際のサイトで確認');
    }

  } catch (error) {
    console.error('テスト中にエラーが発生:', error);
  } finally {
    await service.close();
    console.log('\n=== テスト完了 ===');
  }
}

testSoaplandHeaven();
