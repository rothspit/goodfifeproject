/**
 * デリヘルタウン 改良版ログインテスト
 */
import { DeliheruTownService } from './src/services/platforms/DeliheruTownService';

async function main() {
  const service = new DeliheruTownService();
  
  try {
    console.log('===== デリヘルタウン改良版ログインテスト =====\n');
    
    const credentials = {
      email: 'info@h-mitsu.com',
      password: 'hitodumamitu'
    };
    
    // キャッシュされたセッションを使用してログイン試行
    const loginSuccess = await service.login(credentials, true);
    
    if (loginSuccess) {
      console.log('\n✅ ログインテスト成功！');
      
      // ダッシュボードのスクリーンショット
      await service.screenshot('./screenshots/deliherutown-dashboard-improved.png');
      
      // ログアウト
      await service.logout();
    } else {
      console.log('\n❌ ログインテスト失敗');
      console.log('💡 対策案:');
      console.log('   1. プロキシサーバーを使用');
      console.log('   2. 手動ログイン後のCookie抽出');
      console.log('   3. デリヘルタウンAPIの直接利用（要調査）');
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await service.close();
  }
}

main();
