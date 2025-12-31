#!/usr/bin/env ts-node
/**
 * アイドル学園 - ヘブン更新自動実行システム
 * 
 * 機能:
 * 1. ログイン
 * 2. 残り回数を確認
 * 3. ヘブン更新ボタンをクリック
 * 4. 定期実行（タイマー設定可能）
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';

interface HeavenUpdateResult {
  success: boolean;
  remainingCount: number | null;
  totalCount: number | null;
  timestamp: string;
  message: string;
}

class IdolGakuenHeavenUpdater {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;

  private readonly credentials = {
    username: '2510055906',
    password: 'OgI70vnH'
  };

  private readonly LOGIN_URL = 'https://spmanager.cityheaven.net/';

  /**
   * ブラウザ初期化
   */
  private async initBrowser(): Promise<void> {
    if (this.browser) return;

    console.log('🚀 ブラウザ起動中...');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo'
    });

    this.page = await this.context.newPage();
    console.log('✅ ブラウザ起動完了\n');
  }

  /**
   * ログイン
   */
  async login(): Promise<boolean> {
    try {
      await this.initBrowser();
      
      if (!this.page) {
        throw new Error('Page not initialized');
      }

      console.log('🔐 ログイン中...');
      await this.page.goto(this.LOGIN_URL, { waitUntil: 'networkidle' });

      await this.page.fill('#userid', this.credentials.username);
      await this.page.fill('#passwd', this.credentials.password);
      
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle' }),
        this.page.click('#loginBtn')
      ]);

      const currentUrl = this.page.url();
      if (currentUrl.includes('H1Main.php')) {
        this.isLoggedIn = true;
        console.log('✅ ログイン成功\n');
        return true;
      }

      console.log('❌ ログイン失敗\n');
      return false;
    } catch (error: any) {
      console.error('❌ ログインエラー:', error.message);
      return false;
    }
  }

  /**
   * 残り回数を取得
   */
  async getRemainingCount(): Promise<{ remaining: number | null; total: number | null }> {
    try {
      if (!this.page) {
        throw new Error('Page not initialized');
      }

      // 「残り○/○回」というテキストを探す
      const updateButton = await this.page.locator('a.manager-list:has-text("更新ボタン")').first();
      const buttonText = await updateButton.textContent();

      if (buttonText) {
        // 「残り16/16回」のようなパターンをマッチ
        const match = buttonText.match(/残り(\d+)\/(\d+)回/);
        
        if (match) {
          const remaining = parseInt(match[1]);
          const total = parseInt(match[2]);
          
          return { remaining, total };
        }
      }

      return { remaining: null, total: null };
    } catch (error: any) {
      console.error('⚠️  残り回数取得エラー:', error.message);
      return { remaining: null, total: null };
    }
  }

  /**
   * ヘブン更新ボタンをクリック
   */
  async clickHeavenUpdate(): Promise<HeavenUpdateResult> {
    const timestamp = new Date().toISOString();
    
    try {
      if (!this.isLoggedIn || !this.page) {
        return {
          success: false,
          remainingCount: null,
          totalCount: null,
          timestamp,
          message: 'ログインしていません'
        };
      }

      // 実行前の残り回数を取得
      const beforeCount = await this.getRemainingCount();
      console.log(`📊 実行前の残り回数: ${beforeCount.remaining}/${beforeCount.total}回`);

      // 更新ボタンをクリック
      console.log('🔄 ヘブン更新ボタンをクリック中...');
      
      const updateButton = this.page.locator('a.manager-list:has-text("更新ボタン")').first();
      const buttonCount = await updateButton.count();

      if (buttonCount === 0) {
        return {
          success: false,
          remainingCount: beforeCount.remaining,
          totalCount: beforeCount.total,
          timestamp,
          message: '更新ボタンが見つかりません'
        };
      }

      // クリック実行（JavaScriptで直接実行 - 不可視要素にも対応）
      await updateButton.evaluate((el: any) => el.click());
      await this.page.waitForTimeout(3000); // クリック後の処理を待つ
      
      // 確認ダイアログが表示される場合の処理
      try {
        await this.page.getByRole('button', { name: 'OK' }).click({ timeout: 2000 });
      } catch {
        // ダイアログがない場合はスキップ
      }

      // 実行後の残り回数を取得
      const afterCount = await this.getRemainingCount();
      console.log(`📊 実行後の残り回数: ${afterCount.remaining}/${afterCount.total}回\n`);

      // スクリーンショット保存
      const screenshotPath = `screenshots/heaven-update-${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 スクリーンショット保存: ${screenshotPath}\n`);

      return {
        success: true,
        remainingCount: afterCount.remaining,
        totalCount: afterCount.total,
        timestamp,
        message: `更新成功（残り${afterCount.remaining}/${afterCount.total}回）`
      };

    } catch (error: any) {
      console.error('❌ 更新エラー:', error.message);
      
      return {
        success: false,
        remainingCount: null,
        totalCount: null,
        timestamp,
        message: `エラー: ${error.message}`
      };
    }
  }

  /**
   * ログを保存
   */
  private saveLog(result: HeavenUpdateResult): void {
    const logPath = 'logs/heaven-update-log.json';
    
    // logsディレクトリがなければ作成
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
    }

    // 既存のログを読み込み
    let logs: HeavenUpdateResult[] = [];
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf8');
      logs = JSON.parse(content);
    }

    // 新しいログを追加
    logs.push(result);

    // 最新100件のみ保持
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }

    // 保存
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  }

  /**
   * ブラウザを閉じる
   */
  async close(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    
    this.page = null;
    this.context = null;
    this.browser = null;
    this.isLoggedIn = false;
  }

  /**
   * 1回だけ実行
   */
  async runOnce(): Promise<HeavenUpdateResult> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🎓 アイドル学園 - ヘブン更新実行');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`⏰ 実行時刻: ${new Date().toLocaleString('ja-JP')}\n`);

    const loginSuccess = await this.login();
    
    if (!loginSuccess) {
      const result: HeavenUpdateResult = {
        success: false,
        remainingCount: null,
        totalCount: null,
        timestamp: new Date().toISOString(),
        message: 'ログイン失敗'
      };
      this.saveLog(result);
      return result;
    }

    const result = await this.clickHeavenUpdate();
    this.saveLog(result);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (result.success) {
      console.log('✅ 更新成功');
    } else {
      console.log('❌ 更新失敗');
    }
    console.log(`📊 ${result.message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return result;
  }

  /**
   * 定期実行（タイマー）
   */
  async runWithTimer(intervalMinutes: number, maxRuns: number = 0): Promise<void> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ⏰ ヘブン更新タイマー起動');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`⏱️  実行間隔: ${intervalMinutes}分`);
    if (maxRuns > 0) {
      console.log(`🔢 最大実行回数: ${maxRuns}回`);
    } else {
      console.log('🔢 実行回数: 無制限（Ctrl+Cで停止）');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let runCount = 0;

    // 最初の実行
    await this.runOnce();
    await this.close();
    runCount++;

    // タイマー設定
    const intervalMs = intervalMinutes * 60 * 1000;

    const timer = setInterval(async () => {
      if (maxRuns > 0 && runCount >= maxRuns) {
        console.log(`\n🏁 最大実行回数（${maxRuns}回）に達しました\n`);
        clearInterval(timer);
        return;
      }

      await this.runOnce();
      await this.close();
      runCount++;

    }, intervalMs);

    // プロセス終了時の処理
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 タイマーを停止します...\n');
      clearInterval(timer);
      await this.close();
      process.exit(0);
    });
  }
}

// メイン実行
async function main() {
  const updater = new IdolGakuenHeavenUpdater();

  // コマンドライン引数で動作モードを切り替え
  const args = process.argv.slice(2);
  
  if (args.includes('--timer')) {
    // タイマーモード
    const intervalIndex = args.indexOf('--interval');
    const intervalMinutes = intervalIndex >= 0 ? parseInt(args[intervalIndex + 1]) : 30;
    
    const maxRunsIndex = args.indexOf('--max-runs');
    const maxRuns = maxRunsIndex >= 0 ? parseInt(args[maxRunsIndex + 1]) : 0;
    
    await updater.runWithTimer(intervalMinutes, maxRuns);
  } else {
    // 1回だけ実行
    await updater.runOnce();
    await updater.close();
    console.log('💡 タイマーモードで実行する場合:');
    console.log('   npx ts-node heaven-update-auto.ts --timer --interval 30\n');
    console.log('オプション:');
    console.log('   --timer: タイマーモード有効化');
    console.log('   --interval <分>: 実行間隔（デフォルト: 30分）');
    console.log('   --max-runs <回数>: 最大実行回数（デフォルト: 無制限）\n');
  }
}

main().catch(error => {
  console.error('❌ 致命的エラー:', error);
  process.exit(1);
});
