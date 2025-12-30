/**
 * アイドル学園 - ヘブン更新スケジューラー
 * 
 * 指定された15枠の時間に自動でヘブン更新ボタンを押す
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// 店舗2（アイドル学園）の認証情報
const STORE_ID = '2510055906';
const PASSWORD = 'OgI70vnH';
const LOGIN_URL = 'https://spmanager.cityheaven.net/';

// 15枠の時間スケジュール（24時間形式）
const SCHEDULE_TIMES = [
  '07:02',
  '11:54',
  '14:55',
  '17:12',
  '18:05',
  '19:15',
  '20:35',
  '21:57',
  '22:26',
  '23:05',
  '23:35',
  '18:36',
  '20:05',
  '21:04',
  '22:44',
];

interface ScheduleExecutionLog {
  scheduledTime: string;
  actualExecutionTime: string;
  remainingCountBefore: string;
  remainingCountAfter: string;
  success: boolean;
  error?: string;
}

class HeavenUpdateScheduler {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;
  private executionLog: ScheduleExecutionLog[] = [];
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
   * 残り回数を取得
   */
  private async getRemainingCount(): Promise<string> {
    try {
      if (!this.page) {
        return '不明';
      }

      // ページ全体のテキストから残り回数を抽出
      const bodyText = await this.page.locator('body').textContent() || '';
      
      // "残り12/16回" のような形式を検索
      const match = bodyText.match(/残り(\d+)\/(\d+)回/);
      
      if (match) {
        return `${match[1]}/${match[2]}`;
      }
      
      return '不明';
    } catch (error) {
      console.error('❌ 残り回数取得エラー:', error);
      return '不明';
    }
  }

  /**
   * ヘブン更新ボタンをクリック
   */
  private async clickUpdateButton(): Promise<boolean> {
    try {
      if (!this.page) {
        console.error('❌ ページが初期化されていません');
        return false;
      }

      console.log('🔄 ヘブン更新ボタンをクリック中...');

      // ダッシュボードに移動
      await this.page.goto('https://spmanager.cityheaven.net/H1Main.php?shopdir=cb_idolgakuen_f', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      await this.page.waitForTimeout(1500);

      // ダイアログハンドラーを設定（一度だけ）
      this.page.once('dialog', async (dialog) => {
        console.log(`⚠️ ダイアログ: ${dialog.message()}`);
        await dialog.accept();
      });

      // 「更新ボタン」をクリック
      console.log('🔍 「更新ボタン」を探索中...');
      
      let clicked = false;
      
      // 方法1: テキストで探す
      const updateLink = await this.page.locator('a:has-text("更新ボタン")').first();
      if (await updateLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await updateLink.click();
        clicked = true;
        console.log('✅ 更新ボタンをクリックしました（方法1）');
      }

      if (!clicked) {
        // 方法2: class指定で探す
        const updateButton = await this.page.locator('.menu-update-btn, .update-btn, a[href*="update"]').first();
        if (await updateButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await updateButton.click();
          clicked = true;
          console.log('✅ 更新ボタンをクリックしました（方法2）');
        }
      }

      if (!clicked) {
        console.error('❌ 「更新ボタン」が見つかりません');
        return false;
      }

      // クリック後の待機
      await this.page.waitForTimeout(3000);
      
      // ページをリロードして最新の状態を取得
      await this.page.reload({ waitUntil: 'networkidle' });
      await this.page.waitForTimeout(1500);

      console.log('✅ クリック成功');
      return true;
    } catch (error) {
      console.error('❌ クリックエラー:', error);
      return false;
    }
  }

  /**
   * 1回の更新実行
   */
  private async executeUpdate(scheduledTime: string): Promise<ScheduleExecutionLog> {
    const actualExecutionTime = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  🎓 アイドル学園 - ヘブン更新実行`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📅 スケジュール時刻: ${scheduledTime}`);
    console.log(`⏰ 実際の実行時刻: ${actualExecutionTime}`);
    console.log('');

    const log: ScheduleExecutionLog = {
      scheduledTime,
      actualExecutionTime,
      remainingCountBefore: '不明',
      remainingCountAfter: '不明',
      success: false,
    };

    try {
      // ブラウザ起動とログイン
      if (!this.isLoggedIn) {
        await this.launchBrowser();
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('ログインに失敗しました');
        }
      }

      // 実行前の残り回数を取得
      log.remainingCountBefore = await this.getRemainingCount();
      console.log(`📊 実行前の残り回数: ${log.remainingCountBefore}回`);

      // ヘブン更新ボタンをクリック（内部でページリロードも実行）
      const clickSuccess = await this.clickUpdateButton();
      if (!clickSuccess) {
        throw new Error('更新ボタンのクリックに失敗しました');
      }

      // 実行後の残り回数を取得（clickUpdateButton内でリロード済み）
      log.remainingCountAfter = await this.getRemainingCount();
      console.log(`📊 実行後の残り回数: ${log.remainingCountAfter}回`);

      // スクリーンショット保存
      const screenshotPath = path.join(
        this.screenshotsDir,
        `heaven-update-${scheduledTime.replace(':', '')}-${Date.now()}.png`
      );
      await this.page!.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 スクリーンショット保存: ${screenshotPath}`);

      log.success = true;
      console.log('\n✅ 更新成功');
      console.log(`📊 更新成功（残り${log.remainingCountAfter}回）`);

    } catch (error) {
      log.success = false;
      log.error = error instanceof Error ? error.message : String(error);
      console.error('\n❌ 更新失敗:', log.error);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    this.executionLog.push(log);
    this.saveLog();

    return log;
  }

  /**
   * ログをファイルに保存
   */
  private saveLog(): void {
    const logFilePath = path.join(
      this.logsDir,
      `heaven-update-scheduler-${new Date().toISOString().split('T')[0]}.json`
    );

    fs.writeFileSync(logFilePath, JSON.stringify(this.executionLog, null, 2), 'utf-8');
  }

  /**
   * 次の実行時刻を計算
   */
  private getNextExecutionTime(): { time: string; delayMs: number } | null {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    // スケジュールを分単位に変換
    const scheduledMinutes = SCHEDULE_TIMES.map(time => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    });

    // 現在時刻より後の最も近い時刻を探す
    const nextSchedule = scheduledMinutes.find(minutes => minutes > currentTimeMinutes);

    let targetMinutes: number;
    let targetTime: string;

    if (nextSchedule !== undefined) {
      // 今日の残りスケジュール
      targetMinutes = nextSchedule;
      const index = scheduledMinutes.indexOf(nextSchedule);
      targetTime = SCHEDULE_TIMES[index];
    } else {
      // 今日のスケジュールが全て終了している場合は、明日の最初のスケジュール
      targetMinutes = scheduledMinutes[0] + (24 * 60); // 翌日
      targetTime = SCHEDULE_TIMES[0];
    }

    const delayMinutes = targetMinutes - currentTimeMinutes;
    const delayMs = delayMinutes * 60 * 1000;

    return { time: targetTime, delayMs };
  }

  /**
   * スケジューラー開始
   */
  public async start(): Promise<void> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🎓 アイドル学園 - ヘブン更新スケジューラー起動');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📅 スケジュール（15枠）:');
    SCHEDULE_TIMES.forEach((time, index) => {
      console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${time}`);
    });
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

      // 指定時刻まで待機
      await new Promise(resolve => setTimeout(resolve, next.delayMs));

      // 更新実行
      await this.executeUpdate(next.time);

      // 次のスケジュールを実行
      executeNextSchedule();
    };

    // 最初のスケジュール実行
    await executeNextSchedule();
  }

  /**
   * 即座に1回実行（テスト用）
   */
  public async runOnce(): Promise<void> {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    await this.executeUpdate(currentTime);
    
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * クリーンアップ
   */
  public async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// メイン実行
async function main() {
  const args = process.argv.slice(2);
  const scheduler = new HeavenUpdateScheduler();

  if (args.includes('--once')) {
    // 1回だけ実行
    console.log('📝 1回実行モード\n');
    await scheduler.runOnce();
  } else {
    // スケジューラー開始
    await scheduler.start();
  }
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('\n\n⚠️ スケジューラーを停止しています...');
  process.exit(0);
});

// 実行
main().catch(error => {
  console.error('❌ Fatal Error:', error);
  process.exit(1);
});
