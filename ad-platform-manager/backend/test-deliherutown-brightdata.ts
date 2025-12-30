/**
 * デリヘルタウン BrightData プロキシ統合テスト
 */
import { DeliheruTownService } from './src/services/platforms/DeliheruTownService';

async function testDeliheruTownWithBrightData() {
  const service = new DeliheruTownService();
  
  try {
    console.log('=== デリヘルタウン BrightData プロキシテスト ===\n');
    
    // 環境変数確認
    if (!process.env.BRIGHTDATA_USERNAME || !process.env.BRIGHTDATA_PASSWORD) {
      console.log('⚠️  BrightData認証情報が設定されていません\n');
      console.log('【設定方法】');
      console.log('1. BrightDataアカウント作成: https://brightdata.com/');
      console.log('2. 環境変数を設定:');
      console.log('   export PROXY_SERVICE=brightdata');
      console.log('   export BRIGHTDATA_USERNAME=your_username');
      console.log('   export BRIGHTDATA_PASSWORD=your_password');
      console.log('');
      console.log('【推奨プラン】');
      console.log('- Residential Proxies: $500/月〜');
      console.log('- 日本IPプール: 大規模');
      console.log('- 自動IPローテーション');
      console.log('- 成功率: 95%+');
      console.log('');
      console.log('【代替サービス】');
      console.log('- Oxylabs: https://oxylabs.io/');
      console.log('- Smartproxy: https://smartproxy.com/');
      return;
    }
    
    console.log('✅ BrightData認証情報確認完了');
    console.log(`   ユーザー名: ${process.env.BRIGHTDATA_USERNAME}`);
    console.log(`   プロキシホスト: ${process.env.BRIGHTDATA_HOST || 'brd.superproxy.io'}`);
    console.log(`   国: ${process.env.BRIGHTDATA_COUNTRY || 'jp'}`);
    console.log('');
    
    // 認証情報
    const credentials = {
      email: process.env.DELIHERUTOWN_USERNAME || 'info@h-mitsu.com',
      password: process.env.DELIHERUTOWN_PASSWORD || 'hitodumamitu',
    };
    
    console.log('1. プロキシ経由ログインテスト');
    console.log(`   Email: ${credentials.email}`);
    
    const loginSuccess = await service.login(credentials, true); // useProxy = true
    
    if (loginSuccess) {
      console.log('✅ ログイン成功！');
      console.log('');
      console.log('【結果】');
      console.log('- CloudFront 403ブロックを回避');
      console.log('- BrightData レジデンシャルプロキシ経由');
      console.log('- デリヘルタウン管理画面にアクセス成功');
      console.log('');
      console.log('【次のステップ】');
      console.log('1. キャスト情報更新テスト');
      console.log('2. 写メ日記投稿テスト');
      console.log('3. 本番環境での運用開始');
      
      // セッションCookieを保存
      const sessionSaved = await service.saveSession();
      if (sessionSaved) {
        console.log('');
        console.log('✅ セッションCookieを保存しました');
        console.log('   次回からはプロキシなしでも一定期間アクセス可能');
      }
      
    } else {
      console.log('❌ ログイン失敗');
      console.log('');
      console.log('【原因調査】');
      console.log('1. screenshots/deliherutown-*.png を確認');
      console.log('2. BrightData認証情報を確認');
      console.log('3. プロキシ設定を確認');
      console.log('');
      console.log('【トラブルシューティング】');
      console.log('- BrightDataダッシュボードでプロキシ使用状況確認');
      console.log('- 日本IPプールが有効か確認');
      console.log('- 認証情報（ユーザー名・パスワード）を再確認');
    }
    
  } catch (error) {
    console.error('テスト中にエラーが発生:', error);
  } finally {
    await service.close();
    console.log('\n=== テスト完了 ===');
  }
}

testDeliheruTownWithBrightData();
