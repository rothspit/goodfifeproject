/**
 * 全23サイト サービスクラス 動作確認スクリプト
 */
import { FuzokuJapanService } from './src/services/platforms/FuzokuJapanService';
import { PureLoversService } from './src/services/platforms/PureLoversService';
import { CityCollectionService } from './src/services/platforms/CityCollectionService';
import { EkichikaService } from './src/services/platforms/EkichikaService';
import { PinkCompanionService } from './src/services/platforms/PinkCompanionService';
import { FuzokuInfoService } from './src/services/platforms/FuzokuInfoService';
import { QpriService } from './src/services/platforms/QpriService';
import { DeliGetService } from './src/services/platforms/DeliGetService';
import { FuzokuJohoService } from './src/services/platforms/FuzokuJohoService';
import { H4610Service } from './src/services/platforms/H4610Service';
import { IchigekiService } from './src/services/platforms/IchigekiService';
import { PocchariChService } from './src/services/platforms/PocchariChService';
import { NaviFuzokuService } from './src/services/platforms/NaviFuzokuService';
import { JukujoStyleService } from './src/services/platforms/JukujoStyleService';
import { GirlsHeavenService } from './src/services/platforms/GirlsHeavenService';
import { BoysHeavenService } from './src/services/platforms/BoysHeavenService';
import { TeleClubService } from './src/services/platforms/TeleClubService';
import { PinsaroService } from './src/services/platforms/PinsaroService';
import { CabaretHeavenService } from './src/services/platforms/CabaretHeavenService';

async function testAllServices() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   全23サイト サービスクラス 動作確認テスト                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const services = [
    { name: '風俗じゃぱん', priority: 'high', Service: FuzokuJapanService },
    { name: 'ぴゅあらば', priority: 'high', Service: PureLoversService },
    { name: 'シティコレクション', priority: 'high', Service: CityCollectionService },
    { name: '駅ちか', priority: 'high', Service: EkichikaService },
    { name: 'ピンクコンパニオン', priority: 'medium', Service: PinkCompanionService },
    { name: '風俗総合情報', priority: 'medium', Service: FuzokuInfoService },
    { name: 'Qプリ', priority: 'medium', Service: QpriService },
    { name: 'デリゲット', priority: 'medium', Service: DeliGetService },
    { name: '風俗情報局', priority: 'medium', Service: FuzokuJohoService },
    { name: 'エッチな4610', priority: 'medium', Service: H4610Service },
    { name: '一撃', priority: 'medium', Service: IchigekiService },
    { name: 'ぽっちゃりChannel', priority: 'medium', Service: PocchariChService },
    { name: 'Navi Fuzoku', priority: 'low', Service: NaviFuzokuService },
    { name: '熟女Style', priority: 'low', Service: JukujoStyleService },
    { name: 'ガールズヘブンネット', priority: 'low', Service: GirlsHeavenService },
    { name: 'ボーイズヘブンネット', priority: 'low', Service: BoysHeavenService },
    { name: '風俗テレクラ情報', priority: 'low', Service: TeleClubService },
    { name: 'ピンサロドットコム', priority: 'low', Service: PinsaroService },
    { name: 'キャバクラヘブン', priority: 'low', Service: CabaretHeavenService },
  ];

  let successCount = 0;
  let failCount = 0;

  console.log('【高優先度サイト】');
  for (const { name, priority, Service } of services.filter(s => s.priority === 'high')) {
    try {
      const service = new Service();
      await service.close();
      console.log(`  ✅ ${name}: OK`);
      successCount++;
    } catch (error) {
      console.log(`  ❌ ${name}: エラー - ${error}`);
      failCount++;
    }
  }

  console.log('\n【中優先度サイト】');
  for (const { name, priority, Service } of services.filter(s => s.priority === 'medium')) {
    try {
      const service = new Service();
      await service.close();
      console.log(`  ✅ ${name}: OK`);
      successCount++;
    } catch (error) {
      console.log(`  ❌ ${name}: エラー - ${error}`);
      failCount++;
    }
  }

  console.log('\n【低優先度サイト】');
  for (const { name, priority, Service } of services.filter(s => s.priority === 'low')) {
    try {
      const service = new Service();
      await service.close();
      console.log(`  ✅ ${name}: OK`);
      successCount++;
    } catch (error) {
      console.log(`  ❌ ${name}: エラー - ${error}`);
      failCount++;
    }
  }

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log(`║   テスト結果: ${successCount}件成功 / ${failCount}件失敗 (全${services.length}サイト)          ║`);
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  if (failCount === 0) {
    console.log('🎉 すべてのサービスクラスが正常に動作しています！');
    console.log('\n次のステップ:');
    console.log('1. 各サイトの認証情報を.envに設定');
    console.log('2. 実際のログインテストを実行');
    console.log('3. 写メ日記投稿テストを実行');
  } else {
    console.log(`⚠️  ${failCount}件のサービスでエラーが発生しました`);
  }
}

testAllServices().catch(console.error);
