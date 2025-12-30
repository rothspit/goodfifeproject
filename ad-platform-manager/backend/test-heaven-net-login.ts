/**
 * シティヘブンネット ログインテスト
 */
import { HeavenNetService } from './src/services/platforms/HeavenNetService';

async function main() {
  const service = new HeavenNetService();
  
  try {
    console.log('===== シティヘブンネット ログインテスト =====\n');
    
    // データベースから認証情報を取得（実際の実装では暗号化されたパスワードをデコード）
    const credentials = {
      username: '2500000713',
      password: 'ZKs60jlq'
    };
    
    // ログインテスト
    const loginSuccess = await service.login(credentials);
    
    if (loginSuccess) {
      console.log('\n✅ ログインテスト成功！');
      
      // スクリーンショット撮影
      await service.screenshot('./screenshots/cityheaven-dashboard.png');
      console.log('📸 ダッシュボードのスクリーンショットを保存しました');
      
      // ログアウト
      await service.logout();
    } else {
      console.log('\n❌ ログインテスト失敗');
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await service.close();
  }
}

main();
