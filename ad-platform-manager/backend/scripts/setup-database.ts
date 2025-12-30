import { setupAdPlatformDatabase } from '../src/config/adPlatformDatabase';
import { testConnection } from '../src/config/database';

async function main() {
  console.log('=== 広告媒体管理システム データベースセットアップ ===\n');
  
  // 1. 接続テスト
  console.log('📡 データベース接続をテスト中...');
  const connected = await testConnection();
  
  if (!connected) {
    console.error('❌ データベースに接続できません。.envファイルを確認してください。');
    process.exit(1);
  }
  
  console.log();
  
  // 2. テーブル作成と初期データ投入
  console.log('📦 テーブルを作成中...');
  await setupAdPlatformDatabase();
  
  console.log('\n🎉 データベースセットアップ完了！');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
