/**
 * アイドル学園 - カウンター消費スケジューラー
 * 
 * ヘブン更新スケジューラーで使い切れなかった残り回数を
 * 店舗情報更新で消費する
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const STORE_ID = '2510055906';
const PASSWORD = 'OgI70vnH';
const LOGIN_URL = 'https://spmanager.cityheaven.net/';

// 1日1回、深夜2時に実行（ヘブン更新の後）
const SCHEDULE_TIME = '02:00';

interface ExecutionLog {
  scheduledTime: string;
  actualExecutionTime: string;
  remainingCountBefore: string;
  remainingCountAfter: string;
  success: boolean;
  error?: string;
}

class CounterConsumeScheduler {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;
  private executionLog: ExecutionLog[] = [];
  private logsDir: string;
  private screenshotsDir: string;

  constructor() {
    this.logsDir = path.join(__dirname, 'logs');
    this.screenshotsDir = path.join(__dirname, 'screenshots');
    
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
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
        this.isLoggedIn = true;
        return true;
      }

      console.error('❌ ログイン失敗');
      return false;
    } catch (error) {
      console.error('❌ ログインエラー:', error);
      return false;
    }
  }

  private async getRemainingCount(): Promise<string> {
    try {
      const countText = await this.page!.evaluate(() => {
        const elements = document.querySelectorAll('a, div, span');
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          const text = el.textContent || '';
          if (text.includes('残り') && text.includes('回')) {
            return text.trim();
          }
        }
        return '';
      });

      const match = countText.match(/残り(\d+\/\d+)回/);
      return match ? match[1] : countText || '不明';
    } catch (error) {
      console.error('❌ 残り回数取得エラー:', error);
      return '不明';
    }
  }

  private async updateShopInfo(): Promise<boolean> {
    try {
      if (!this.page) {
        console.error('❌ ページが初期化されていません');
        return false;
      }

      console.log('🔄 店舗情報更新を実行中...');

      // ダッシュボードに移動
      const currentUrl = this.page.url();
      if (!currentUrl.includes('H1Main.php')) {
        await this.page.goto('https://spmanager.cityheaven.net/H1Main.php', { 
          waitUntil: 'networkidle', 
          timeout: 30000 
        });
        await this.page.waitForTimeout(2000);
      }

      // MENUを開く
      console.log('📂 MENUを開く...');
      await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          const text = link.textContent || '';
          if (text.includes('MENU一覧') || link.id === 'open-menu') {
            (link as any).click();
            return true;
          }
        }
        return false;
      });
      await this.page.waitForTimeout(2000);

      // 「お店情報」ページに移動
      console.log('📂 「お店情報」ページに移動中...');
      await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          const text = link.textContent?.trim() || '';
          const className = link.className || '';
          if (text.includes('お店情報') && className.includes('menu-shopshokai')) {
            (link as any).click();
            return true;
          }
        }
        return false;
      });
      await this.page.waitForTimeout(3000);
      console.log('✅ 「お店情報」ページに移動しました');

      // 「カウンターの更新」ボタンをクリック
      console.log('🔍 「カウンターの更新」ボタンをクリック中...');

      // ダイアログハンドラーを設定
      let dialogAppeared = false;
      this.page.once('dialog', async (dialog) => {
        dialogAppeared = true;
        console.log(`✅ ダイアログ検出: ${dialog.message()}`);
        await dialog.accept();
        console.log('✅ ダイアログを承認しました');
      });

      const clicked = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          const text = link.textContent?.trim() || '';
          const className = link.className || '';
          if (text.includes('カウンターの更新') && className.includes('menu-counter')) {
            (link as any).click();
            return true;
          }
        }
        return false;
      });

      if (!clicked) {
        console.error('❌ 「カウンターの更新」ボタンが見つかりません');
        return false;
      }

      console.log('✅ ボタンクリック成功');
      await this.page.waitForTimeout(5000);

      if (dialogAppeared) {
        console.log('✅ ダイアログ処理完了');
      } else {
        console.log('⚠️ ダイアログが検出されませんでした');
      }

      // ページをリロードして最新の状態を取得
      await this.page.reload({ waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);

      return true;
    } catch (error) {
      console.error('❌ 更新エラー:', error);
      return false;
    }
  }

  private async executeUpdate(scheduledTime: string): Promise<ExecutionLog> {
    const actualExecutionTime = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  🎓 アイドル学園 - カウンター消費実行`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📅 スケジュール時刻: ${scheduledTime}`);
    console.log(`⏰ 実際の実行時刻: ${actualExecutionTime}`);
    console.log('');

    const log: ExecutionLog = {
      scheduledTime,
      actualExecutionTime,
      remainingCountBefore: '不明',
      remainingCountAfter: '不明',
      success: false,
    };

    try {
      if (!this.isLoggedIn) {
        await this.launchBrowser();
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('ログインに失敗しました');
        }
      }

      log.remainingCountBefore = await this.getRemainingCount();
      console.log(`📊 実行前の残り回数: ${log.remainingCountBefore}回`);

      const updateSuccess = await this.updateShopInfo();
      if (!updateSuccess) {
        throw new Error('更新に失敗しました');
      }

      log.remainingCountAfter = await this.getRemainingCount();
      console.log(`📊 実行後の残り回数: ${log.remainingCountAfter}回`);

      // スクリーンショット保存
      const screenshotPath = path.join(
        this.screenshotsDir,
        `counter-consume-${scheduledTime.replace(':', '')}-${Date.now()}.png`
      );
      await this.page!.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 スクリーンショット保存: ${screenshotPath}`);

      log.success = true;
      console.log('\n✅ カウンター消費成功');

    } catch (error) {
      log.success = false;
      log.error = error instanceof Error ? error.message : String(error);
      console.error('\n❌ カウンター消費失敗:', log.error);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    this.executionLog.push(log);
    this.saveLog();

    return log;
  }

  private saveLog(): void {
    const logFilePath = path.join(
      this.logsDir,
      `counter-consume-${new Date().toISOString().split('T')[0]}.json`
    );

    fs.writeFileSync(logFilePath, JSON.stringify(this.executionLog, null, 2), 'utf-8');
  }

  private getNextExecutionTime(): { time: string; delayMs: number } | null {
    const now = new Date();
    const [targetHour, targetMinute] = SCHEDULE_TIME.split(':').map(Number);

    const today = new Date(now);
    today.setHours(targetHour, targetMinute, 0, 0);

    let nextExecution: Date;
    if (now.getTime() < today.getTime()) {
      nextExecution = today;
    } else {
      nextExecution = new Date(today);
      nextExecution.setDate(nextExecution.getDate() + 1);
    }

    const delayMs = nextExecution.getTime() - now.getTime();
    return { time: SCHEDULE_TIME, delayMs };
  }

  public async start(): Promise<void> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🎓 アイドル学園 - カウンター消費スケジューラー起動');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📅 スケジュール: 毎日 ${SCHEDULE_TIME} に実行`);
    console.log('\n⏰ スケジューラー開始...\n');

    const executeNextSchedule = async () => {
      const next = this.getNextExecutionTime();
      
      if (!next) {
        console.log('❌ 次の実行時刻が見つかりません');
        return;
      }

      const nextDate = new Date(Date.now() + next.delayMs);
      console.log(`⏰ 次回実行時刻: ${next.time} (${nextDate.toLocaleString('ja-JP')})`);
      console.log(`⏳ 待機時間: ${Math.floor(next.delayMs / 60000)}分\n`);

      await new Promise(resolve => setTimeout(resolve, next.delayMs));
      await this.executeUpdate(next.time);
      executeNextSchedule();
    };

    await executeNextSchedule();
  }

  public async runOnce(): Promise<void> {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    await this.executeUpdate(currentTime);
    
    if (this.browser) {
      await this.browser.close();
    }
  }

  public async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const scheduler = new CounterConsumeScheduler();

  if (args.includes('--once')) {
    console.log('📝 カウンター消費1回実行モード\n');
    await scheduler.runOnce();
  } else {
    await scheduler.start();
  }
}

main().catch(console.error);

process.on('SIGINT', async () => {
  console.log('\n🛑 シャットダウン中...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 シャットダウン中...');
  process.exit(0);
});
