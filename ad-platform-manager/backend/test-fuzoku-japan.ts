import { FuzokuJapanService } from './src/services/platforms/FuzokuJapanService';

async function test() {
  console.log('風俗じゃぱんサービステスト開始');
  const service = new FuzokuJapanService();
  console.log('✅ サービスクラスインスタンス化成功');
  await service.close();
  console.log('✅ テスト完了');
}

test().catch(console.error);
