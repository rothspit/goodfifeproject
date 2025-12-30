/**
 * すべての残りカウンターを今すぐ使い切るスクリプト
 * 現在の残り回数を確認して、すべて実行する
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const STORE_ID = '2510055906';
const PASSWORD = 'OgI70vnH';
const LOGIN_URL = 'https://spmanager.cityheaven.net/';

interface UpdateResult {
  attemptNumber: number;
  executionTime: string;
  remainingBefore: string;
  remainingAfter: string;
  success: boolean;
  error?: string;
}

class AllUpdatesExecutor {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private results: UpdateResult[] = [];
  private screenshotsDir: string;
  private logsDir: string;

  constructor() {
    this.screenshotsDir = path.join(__dirname, 'screenshots');
    this.logsDir = path.join(__dirname, 'logs');
    
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

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
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    this.page = await this.context.newPage();
    console.log('✅ ブラウザ起動完了');
  }

  private async login(): Promise<boolean> {
    try {
      if (!this.page) {
        await this.launchBrowser();
      }

      console.log('🔐 ログイン中...');
      await this.page!.goto(LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await this.page!.fill('#userid', STORE_ID);
      await this.page!.fill('#passwd', PASSWORD);
      await this.page!.click('#loginBtn');
      await this.page!.waitForLoadState('networkidle');

      const url = this.page!.url();
      if (url.includes('H1Main.php')) {
        console.log('✅ ログイン成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ ログインエラー:', error);
      return false;
    }
  }

  private async getRemainingCount(): Promise<string> {
    try {
      if (!this.page) return '不明';

      // MENUボタンをクリック
      const menuButton = await this.page.locator('a.menu-link').first();
      if (menuButton) {
        await menuButton.click();
        await this.page.waitForTimeout(1000);
      }

      // 残り回数を取得
      const counterText = await this.page.locator('.menu-counter').first().textContent();
      
      if (counterText) {
        const match = counterText.match(/残り(\d+)\/(\d+)回/);
        if (match) {
          return `${match[1]}/${match[2]}`;
        }
      }
      return '不明';
    } catch (error) {
      console.error('残り回数の取得エラー:', error);
      return '不明';
    }
  }

  private async executeUpdate(): Promise<boolean> {
    try {
      if (!this.page) return false;

      console.log('  🔄 更新ボタンをクリック中...');

      // MENUが開いていることを確認
      const menuVisible = await this.page.locator('.menu-list-link').first().isVisible();
      if (!menuVisible) {
        const menuButton = await this.page.locator('a.menu-link').first();
        await menuButton.click();
        await this.page.waitForTimeout(1000);
      }

      // カウンターの更新ボタンをクリック
      const updateButton = await this.page.locator('.menu-counter').first();
      
      // ダイアログハンドラーを設定
      this.page.on('dialog', async dialog => {
        console.log('  ⚠️  ダイアログ検出:', dialog.message());
        await dialog.accept();
      });

      await updateButton.click();
      await this.page.waitForTimeout(2000);

      // ページをリロードして最新の状態を取得
      await this.page.reload({ waitUntil: 'networkidle' });
      await this.page.waitForTimeout(1000);

      console.log('  ✅ 更新完了');
      return true;
    } catch (error) {
      console.error('  ❌ 更新エラー:', error);
      return false;
    }
  }

  private async saveScreenshot(attemptNumber: number): Promise<void> {
    if (!this.page) return;
    
    const timestamp = Date.now();
    const screenshotPath = path.join(
      this.screenshotsDir,
      `all-updates-${attemptNumber}-${timestamp}.png`
    );
    
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`  📸 スクリーンショット: ${screenshotPath}`);
  }

  async executeAllUpdates(): Promise<void> {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🎓 すべての残りカウンターを今すぐ使い切ります');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      // ログイン
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        console.error('❌ ログインに失敗しました');
        return;
      }

      // 初期の残り回数を確認
      const initialCount = await this.getRemainingCount();
      console.log(`\n📊 初期残り回数: ${initialCount}\n`);

      let attemptNumber = 1;
      let maxAttempts = 20; // 安全のため最大20回まで

      while (attemptNumber <= maxAttempts) {
        console.log(`\n━━━ 更新 ${attemptNumber}回目 ━━━`);
        
        const executionTime = new Date().toLocaleString('ja-JP', {
          timeZone: 'Asia/Tokyo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        // 実行前の残り回数
        const remainingBefore = await this.getRemainingCount();
        console.log(`  📊 実行前: ${remainingBefore}`);

        // 残りが0なら終了
        if (remainingBefore.startsWith('0/')) {
          console.log('\n✅ すべてのカウンターを使い切りました！');
          break;
        }

        // 更新実行
        const success = await this.executeUpdate();
        
        // 実行後の残り回数
        const remainingAfter = await this.getRemainingCount();
        console.log(`  📊 実行後: ${remainingAfter}`);

        // スクリーンショット保存
        await this.saveScreenshot(attemptNumber);

        // 結果を記録
        this.results.push({
          attemptNumber,
          executionTime,
          remainingBefore,
          remainingAfter,
          success
        });

        // 残りが0になったら終了
        if (remainingAfter.startsWith('0/')) {
          console.log('\n🎉 すべてのカウンターを使い切りました！');
          break;
        }

        attemptNumber++;
        
        // 次の更新まで少し待機
        await this.page!.waitForTimeout(3000);
      }

      // 結果を保存
      await this.saveResults();

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  ✅ すべての更新が完了しました');
      console.log(`  📊 実行回数: ${this.results.length}回`);
      console.log(`  📊 成功: ${this.results.filter(r => r.success).length}回`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
      console.error('❌ エラー:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private async saveResults(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const logPath = path.join(this.logsDir, `all-updates-${today}.json`);
    fs.writeFileSync(logPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📝 ログ保存: ${logPath}`);
  }
}

// 実行
const executor = new AllUpdatesExecutor();
executor.executeAllUpdates().catch(console.error);
