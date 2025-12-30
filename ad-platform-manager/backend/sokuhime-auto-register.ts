/**
 * アイドル学園 - 即姫（即ヒメ）自動登録システム
 * 
 * 出勤中で待機中の子全員を自動で即姫に登録する
 * 1時間ごとに自動実行
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// 店舗2（アイドル学園）の認証情報
const STORE_ID = '2510055906';
const PASSWORD = 'OgI70vnH';
const LOGIN_URL = 'https://spmanager.cityheaven.net/';
const SOKUHIME_URL = 'https://spmanager.cityheaven.net/H9StandbyGirlRegist.php?shopdir=cb_idolgakuen_f';

interface SokuHimeGirl {
  name: string;
  status: 'waiting' | 'serving' | 'registered'; // 待機中、接客中、登録済
  registered: boolean; // 即姫に登録済みかどうか
}

interface SokuHimeExecutionLog {
  executionTime: string;
  girlsFound: number;
  girlsWaiting: number;
  girlsRegistered: number;
  success: boolean;
  details: SokuHimeGirl[];
  error?: string;
}

class SokuHimeAutoRegister {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;
  private executionLog: SokuHimeExecutionLog[] = [];
  private logsDir: string;
  private screenshotsDir: string;

  constructor() {
    this.logsDir = path.join(__dirname, 'logs');
    this.screenshotsDir = path.join(__dirname, 'screenshots');
    
    // ディレクトリ作成
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  /**
   * ブラウザ起動
   */
  private async launchBrowser(): Promise<void> {
    console.log('🚀 ブラウザ起動中...');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.context = await this.browser.newContext({
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo',
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    this.page = await this.context.newPage();
    console.log('✅ ブラウザ起動完了');
  }

  /**
   * ログイン
   */
  private async login(): Promise<boolean> {
    try {
      if (!this.page) {
        await this.launchBrowser();
      }

      console.log('🔐 ログイン中...');
      await this.page!.goto(LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });

      // ログインフォーム入力
      await this.page!.fill('#userid', STORE_ID);
      await this.page!.fill('#passwd', PASSWORD);

      // ログインボタンクリック
      await this.page!.click('#loginBtn');
      await this.page!.waitForLoadState('networkidle');

      // ログイン成功確認
      const url = this.page!.url();
      if (url.includes('H1Main.php')) {
        console.log('✅ ログイン成功');
        this.isLoggedIn = true;
        return true;
      } else {
        console.error('❌ ログイン失敗');
        return false;
      }
    } catch (error) {
      console.error('❌ ログインエラー:', error);
      return false;
    }
  }

  /**
   * 出勤中の女の子のリストを取得
   */
  private async getGirlsList(): Promise<SokuHimeGirl[]> {
    try {
      if (!this.page) {
        return [];
      }

      // 即姫ページに移動
      console.log('\n🔍 即姫ページに移動中...');
      await this.page.goto(SOKUHIME_URL, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);

      // スクリーンショット保存
      const screenshotPath = path.join(this.screenshotsDir, `sokuhime-before-${Date.now()}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 スクリーンショット保存: ${screenshotPath}`);

      // 出勤中の子のリストを取得
      const girls = await this.page.evaluate(() => {
        const girlsList: any[] = [];
        
        // 各女の子の情報を取得
        const workBoxes = document.querySelectorAll('.sokuhime-work-box');
        
        workBoxes.forEach((box) => {
          // 名前を取得（hidden inputから）
          const nameInput = box.querySelector('input[name="working_girls_name_hidden"]');
          const name = nameInput ? (nameInput as HTMLInputElement).value : '';
          
          // ステータスボタンを取得
          const statusButtons = box.querySelectorAll('.sokuhimebutton');
          let status = 'unknown';
          let registered = false;
          
          statusButtons.forEach((btn) => {
            const text = btn.textContent?.trim() || '';
            if (text.includes('待機中')) {
              status = 'waiting';
            } else if (text.includes('接客中')) {
              status = 'serving';
            } else if (text.includes('即ヒメ')) {
              status = 'waiting'; // 即ヒメボタンがあるということは待機中
            }
          });
          
          // コメント登録済かどうか確認
          const commentRegist = box.querySelector('.commentRegist');
          if (commentRegist) {
            registered = true;
          }
          
          if (name) {
            girlsList.push({ name, status, registered });
          }
        });
        
        return girlsList;
      });

      console.log(`📊 出勤中の女の子: ${girls.length}人`);
      girls.forEach((girl, i) => {
        console.log(`  ${i + 1}. ${girl.name} - ${girl.status} ${girl.registered ? '(登録済)' : ''}`);
      });

      return girls;
    } catch (error) {
      console.error('❌ リスト取得エラー:', error);
      return [];
    }
  }

  /**
   * 待機中の子を即姫に登録
   */
  private async registerSokuHime(girls: SokuHimeGirl[]): Promise<number> {
    let registeredCount = 0;

    try {
      if (!this.page) {
        return 0;
      }

      // 待機中の子のみをフィルター
      const waitingGirls = girls.filter(g => g.status === 'waiting' && !g.registered);
      
      console.log(`\n🎯 登録対象: ${waitingGirls.length}人`);
      
      if (waitingGirls.length === 0) {
        console.log('ℹ️ 登録対象の女の子がいません');
        return 0;
      }

      for (const girl of waitingGirls) {
        try {
          console.log(`\n🔄 ${girl.name}を即姫に登録中...`);
          
          // 「待機中」または「即ヒメ」ボタンを探してクリック
          const clicked = await this.page.evaluate((girlName) => {
            const workBoxes = document.querySelectorAll('.sokuhime-work-box');
            
            for (let i = 0; i < workBoxes.length; i++) {
              const box = workBoxes[i];
              const nameInput = box.querySelector('input[name="working_girls_name_hidden"]');
              const name = nameInput ? (nameInput as HTMLInputElement).value : '';
              
              if (name === girlName) {
                // この子の「待機中」または「即ヒメ」ボタンを探す
                const buttons = box.querySelectorAll('.sokuhimebutton');
                for (let j = 0; j < buttons.length; j++) {
                  const btn = buttons[j];
                  const text = btn.textContent?.trim() || '';
                  if (text.includes('待機中') || text.includes('即ヒメ')) {
                    (btn as any).click();
                    return true;
                  }
                }
              }
            }
            return false;
          }, girl.name);

          if (!clicked) {
            console.log(`⚠️ ${girl.name}の待機中/即ヒメボタンが見つかりません`);
            continue;
          }

          console.log(`✅ ${girl.name}を即姫に登録しました`);
          registeredCount++;
          await this.page.waitForTimeout(2000);
        } catch (error) {
          console.error(`❌ ${girl.name}の登録エラー:`, error);
        }
      }

      // 登録後のスクリーンショット
      const screenshotPath = path.join(this.screenshotsDir, `sokuhime-after-${Date.now()}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`\n📸 登録後スクリーンショット: ${screenshotPath}`);

    } catch (error) {
      console.error('❌ 登録処理エラー:', error);
    }

    return registeredCount;
  }

  /**
   * 1回実行
   */
  async executeOnce(): Promise<void> {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🎓 アイドル学園 - 即姫自動登録実行');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏰ 実行時刻: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}\n`);

    try {
      // ログイン
      if (!this.isLoggedIn) {
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('ログインに失敗しました');
        }
      }

      // 出勤中の子のリストを取得
      const girls = await this.getGirlsList();

      // 待機中の子を即姫に登録
      const registeredCount = await this.registerSokuHime(girls);

      // ログ記録
      const log: SokuHimeExecutionLog = {
        executionTime: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
        girlsFound: girls.length,
        girlsWaiting: girls.filter(g => g.status === 'waiting').length,
        girlsRegistered: registeredCount,
        success: true,
        details: girls
      };
      this.executionLog.push(log);

      // ログをJSONファイルに保存
      const today = new Date().toISOString().split('T')[0];
      const logPath = path.join(this.logsDir, `sokuhime-auto-${today}.json`);
      const existingLogs = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf-8')) : [];
      existingLogs.push(log);
      fs.writeFileSync(logPath, JSON.stringify(existingLogs, null, 2));

      console.log('\n✅ 即姫自動登録完了');
      console.log(`📊 出勤中: ${girls.length}人`);
      console.log(`📊 待機中: ${girls.filter(g => g.status === 'waiting').length}人`);
      console.log(`📊 登録済: ${registeredCount}人`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error: any) {
      console.error('❌ 実行エラー:', error);
      const log: SokuHimeExecutionLog = {
        executionTime: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
        girlsFound: 0,
        girlsWaiting: 0,
        girlsRegistered: 0,
        success: false,
        details: [],
        error: error.message
      };
      this.executionLog.push(log);
    } finally {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.context = null;
        this.page = null;
        this.isLoggedIn = false;
      }
    }
  }

  /**
   * スケジューラー実行（1時間ごと）
   */
  async runScheduler(): Promise<void> {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🎓 アイドル学園 - 即姫自動登録スケジューラー起動');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⏰ 実行間隔: 1時間ごと\n');

    while (true) {
      await this.executeOnce();
      
      // 1時間待機
      console.log('⏳ 次回実行まで1時間待機中...\n');
      await this.delay(60 * 60 * 1000); // 1時間 = 60分 × 60秒 × 1000ミリ秒
    }
  }

  /**
   * 待機
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// メイン処理
async function main() {
  const args = process.argv.slice(2);
  const scheduler = new SokuHimeAutoRegister();

  if (args.includes('--once')) {
    // 1回だけ実行
    await scheduler.executeOnce();
  } else {
    // スケジューラー実行（1時間ごと）
    await scheduler.runScheduler();
  }
}

main().catch(console.error);
