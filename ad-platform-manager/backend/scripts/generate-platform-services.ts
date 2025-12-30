/**
 * 広告媒体サービスクラス一括生成スクリプト
 * 24サイト分のサービスクラスを自動生成
 */
import * as fs from 'fs';
import * as path from 'path';

interface PlatformInfo {
  name: string;
  className: string;
  baseUrl: string;
  loginUrl: string;
  priority: 'high' | 'medium' | 'low';
}

const platforms: PlatformInfo[] = [
  // 高優先度（既存を除く）
  { name: 'ぴゅあらば', className: 'PureLoversService', baseUrl: 'https://www.purelovers.com/admin/', loginUrl: 'https://www.purelovers.com/admin/login', priority: 'high' },
  { name: 'シティコレクション', className: 'CityCollectionService', baseUrl: 'https://city-collection.net/admin/', loginUrl: 'https://city-collection.net/admin/login', priority: 'high' },
  { name: '駅ちか', className: 'EkichikaService', baseUrl: 'https://ekichika.jp/admin/', loginUrl: 'https://ekichika.jp/admin/login', priority: 'high' },
  
  // 中優先度
  { name: 'ピンクコンパニオン', className: 'PinkCompanionService', baseUrl: 'https://www.pinkcompanion.com/admin/', loginUrl: 'https://www.pinkcompanion.com/admin/login', priority: 'medium' },
  { name: '風俗総合情報', className: 'FuzokuInfoService', baseUrl: 'https://www.fuzoku.jp/admin/', loginUrl: 'https://www.fuzoku.jp/admin/login', priority: 'medium' },
  { name: 'Qプリ', className: 'QpriService', baseUrl: 'https://www.qpri.jp/admin/', loginUrl: 'https://www.qpri.jp/admin/login', priority: 'medium' },
  { name: 'デリゲット', className: 'DeliGetService', baseUrl: 'https://www.deli-get.com/admin/', loginUrl: 'https://www.deli-get.com/admin/login', priority: 'medium' },
  { name: '風俗情報局', className: 'FuzokuJohoService', baseUrl: 'https://www.fuzoku-joho.net/admin/', loginUrl: 'https://www.fuzoku-joho.net/admin/login', priority: 'medium' },
  { name: 'エッチな4610', className: 'H4610Service', baseUrl: 'https://www.h4610.com/admin/', loginUrl: 'https://www.h4610.com/admin/login', priority: 'medium' },
  { name: '一撃', className: 'IchigekiService', baseUrl: 'https://www.ichigeki.jp/admin/', loginUrl: 'https://www.ichigeki.jp/admin/login', priority: 'medium' },
  { name: 'ぽっちゃりChannel', className: 'PocchariChService', baseUrl: 'https://www.pocchari-ch.com/admin/', loginUrl: 'https://www.pocchari-ch.com/admin/login', priority: 'medium' },
  
  // 低優先度
  { name: 'Navi Fuzoku', className: 'NaviFuzokuService', baseUrl: 'https://navi-fuzoku.com/admin/', loginUrl: 'https://navi-fuzoku.com/admin/login', priority: 'low' },
  { name: '熟女Style', className: 'JukujoStyleService', baseUrl: 'https://jukujo-style.jp/admin/', loginUrl: 'https://jukujo-style.jp/admin/login', priority: 'low' },
  { name: 'ガールズヘブンネット', className: 'GirlsHeavenService', baseUrl: 'https://girls-heaven.jp/admin/', loginUrl: 'https://girls-heaven.jp/admin/login', priority: 'low' },
  { name: 'ボーイズヘブンネット', className: 'BoysHeavenService', baseUrl: 'https://boys-heaven.jp/admin/', loginUrl: 'https://boys-heaven.jp/admin/login', priority: 'low' },
  { name: '風俗テレクラ情報', className: 'TeleClubService', baseUrl: 'https://tele-club.net/admin/', loginUrl: 'https://tele-club.net/admin/login', priority: 'low' },
  { name: 'おとなの掲示板', className: 'OtonaKeijiban Service', baseUrl: 'https://otona-keijiban.com/admin/', loginUrl: 'https://otona-keijiban.com/admin/login', priority: 'low' },
  { name: 'ピンサロドットコム', className: 'PinsaroService', baseUrl: 'https://pinsaro.com/admin/', loginUrl: 'https://pinsaro.com/admin/login', priority: 'low' },
  { name: 'キャバクラヘブン', className: 'CabaretHeavenService', baseUrl: 'https://cabaret-heaven.net/admin/', loginUrl: 'https://cabaret-heaven.net/admin/login', priority: 'low' },
];

const serviceTemplate = (platform: PlatformInfo) => `/**
 * ${platform.name} 自動更新サービス
 * ${platform.baseUrl}
 * 優先度: ${platform.priority}
 */
import { BaseAdPlatformService, PlatformCredentials, DiaryPostData } from './BaseAdPlatformService';

export class ${platform.className} extends BaseAdPlatformService {
  protected BASE_URL = '${platform.baseUrl}';
  protected LOGIN_URL = '${platform.loginUrl}';
  protected PLATFORM_NAME = '${platform.name}';

  /**
   * ログイン処理
   */
  async login(credentials: PlatformCredentials): Promise<boolean> {
    const usernameSelectors = [
      'input[name="email"]',
      'input[name="username"]',
      'input[name="login_id"]',
      'input[type="text"]',
      '#email',
      '#username',
      '#login_id'
    ];

    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      '#password'
    ];

    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("ログイン")',
      'input[value="ログイン"]',
      '.login-button',
      '#login-button'
    ];

    return await this.performLogin(credentials, usernameSelectors, passwordSelectors, submitSelectors);
  }

  /**
   * 写メ日記投稿
   */
  async postDiary(diaryData: DiaryPostData): Promise<boolean> {
    try {
      if (!this.isLoggedIn || !this.page) {
        throw new Error('ログインが必要です');
      }

      console.log(\`\${this.PLATFORM_NAME} 写メ日記投稿: \${diaryData.title}\`);

      // 写メ日記ページへ移動
      await this.page.goto(\`\${this.BASE_URL}diary/\`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      await this.saveScreenshot('diary-list');

      // 新規投稿ボタンを探す
      const newPostButtonSelectors = [
        'a:has-text("新規投稿")',
        'a:has-text("新規作成")',
        'button:has-text("新規投稿")',
        '.new-post-button',
        '#new-post'
      ];

      let newPostButton = null;
      for (const selector of newPostButtonSelectors) {
        try {
          newPostButton = await this.page.$(selector);
          if (newPostButton) break;
        } catch (e) {
          continue;
        }
      }
      
      if (newPostButton) {
        await newPostButton.click();
        await this.page.waitForTimeout(2000);
        await this.saveScreenshot('diary-form');

        // タイトル入力
        const titleInput = await this.page.$('input[name*="title"], #title, .title-input');
        if (titleInput) {
          await titleInput.fill(diaryData.title);
        }

        // 本文入力
        const contentInput = await this.page.$('textarea[name*="content"], textarea[name*="body"], #content');
        if (contentInput) {
          await contentInput.fill(diaryData.content);
        }

        // 画像アップロード
        if (diaryData.images && diaryData.images.length > 0) {
          const fileInput = await this.page.$('input[type="file"]');
          if (fileInput) {
            await fileInput.setInputFiles(diaryData.images);
          }
        }

        await this.page.waitForTimeout(1000);

        // 投稿ボタン
        const submitButton = await this.page.$('button[type="submit"], input[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          await this.page.waitForTimeout(2000);
          console.log(\`✅ \${this.PLATFORM_NAME} 写メ日記投稿完了\`);
          return true;
        }
      }

      console.warn(\`⚠️  \${this.PLATFORM_NAME} 投稿フォームが見つかりません\`);
      return false;

    } catch (error) {
      console.error(\`❌ \${this.PLATFORM_NAME} 写メ日記投稿エラー:\`, error);
      return false;
    }
  }
}
`;

// サービスファイルを生成
const outputDir = path.join(__dirname, '../src/services/platforms');

platforms.forEach(platform => {
  const filename = `${platform.className}.ts`;
  const filepath = path.join(outputDir, filename);
  const content = serviceTemplate(platform);
  
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`✅ 生成完了: ${filename}`);
});

console.log(`\n✅ 合計 ${platforms.length} サイトのサービスクラスを生成しました`);
console.log('\n次のステップ:');
console.log('1. 各サービスのログインテスト');
console.log('2. 実際のURL構造に合わせて調整');
console.log('3. 写メ日記投稿機能のテスト');
