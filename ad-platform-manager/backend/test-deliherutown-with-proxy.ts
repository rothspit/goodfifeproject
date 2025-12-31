/**
 * デリヘルタウン プロキシ対応ログインテスト
 */
import { DeliheruTownService } from './src/services/platforms/DeliheruTownService';

async function main() {
  const service = new DeliheruTownService();
  
  try {
    console.log('===== デリヘルタウン プロキシ対応ログインテスト =====\n');
    
    const credentials = {
      email: 'info@h-mitsu.com',
      password: 'hitodumamitu'
    };
    
    console.log('📋 テストシナリオ:');
    console.log('   1. Cookie再利用を試行');
    console.log('   2. 失敗した場合、プロキシ経由でログイン試行');
    console.log('   3. 成功した場合、Cookieを保存\n');
    
    // テスト1: キャッシュされたセッション（プロキシなし）
    console.log('🔄 テスト1: キャッシュされたセッションでログイン試行...');
    let loginSuccess = await service.login(credentials, true, false);
    
    if (loginSuccess) {
      console.log('✅ Cookie再利用でログイン成功！\n');
    } else {
      console.log('❌ Cookie再利用失敗\n');
      
      // テスト2: プロキシ経由でログイン
      console.log('🔄 テスト2: プロキシ経由でログイン試行...');
      console.log('💡 プロキシ設定方法:');
      console.log('   環境変数設定: export PROXY_LIST="http://proxy1:8080,http://proxy2:8080"');
      console.log('   または: export PROXY_SERVER="http://proxy.example.com:8080"\n');
      
      await service.close();
      const service2 = new DeliheruTownService();
      
      loginSuccess = await service2.login(credentials, false, true);
      
      if (loginSuccess) {
        console.log('\n✅ プロキシ経由でログイン成功！');
        
        // ダッシュボードのスクリーンショット
        await service2.screenshot('./screenshots/deliherutown-proxy-success.png');
        
        console.log('\n📊 結果サマリー:');
        console.log('   - プロキシ使用: ✅ 有効');
        console.log('   - ログイン: ✅ 成功');
        console.log('   - Cookie保存: ✅ 完了');
        console.log('   - 次回以降: Cookie再利用可能');
        
        await service2.logout();
      } else {
        console.log('\n❌ プロキシ経由でもログイン失敗');
        console.log('\n💡 推奨対策:');
        console.log('   1. 有料プロキシサービスを使用:');
        console.log('      - BrightData (https://brightdata.com/)');
        console.log('      - Oxylabs (https://oxylabs.io/)');
        console.log('      - Smartproxy (https://smartproxy.com/)');
        console.log('   2. 住宅用プロキシ（Residential Proxy）を推奨');
        console.log('   3. 日本のIPアドレスを使用');
        console.log('   4. プロキシローテーションを有効化\n');
        
        console.log('💡 代替案:');
        console.log('   1. 手動ログイン後のCookie抽出');
        console.log('   2. デリヘルタウン公式APIの利用（要調査）');
        console.log('   3. VPN経由でのアクセス');
      }
      
      await service2.close();
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await service.close();
  }
}

main();
