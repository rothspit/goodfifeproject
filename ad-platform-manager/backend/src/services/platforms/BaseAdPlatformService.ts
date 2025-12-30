/**
 * 広告媒体サービス ベースクラス
 * すべての広告媒体サービスの共通機能を提供
 */
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

export interface PlatformCredentials {
  username?: string;
  email?: string;
  loginId?: string;
  password: string;
}

export interface DiaryPostData {
  castId?: number;
  castName?: string;
  title: string;
  content: string;
  images?: string[];
  publishDate?: string;
}

export interface CastData {
  id?: number;
  name: string;
  age?: number;
  height?: number;
  measurements?: {
    bust: number;
    waist: number;
    hip: number;
    cup: string;
  };
  comment?: string;
  images?: string[];
}

export interface ScheduleData {
  castId: number;
  castName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'off' | 'reserved';
}

export abstract class BaseAdPlatformService {
  protected browser: Browser | null = null;
  protected context: BrowserContext | null = null;
  protected page: Page | null = null;
  protected isLoggedIn: boolean = false;
  
  protected abstract BASE_URL: string;
  protected abstract LOGIN_URL: string;
  protected abstract PLATFORM_NAME: string;
  
  /**
   * ブラウザを初期化
   */
  protected async initBrowser(): Promise<void> {
    if (this.browser) {
      return;
    }
    
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo',
    });

    this.page = await this.context.newPage();
    
    // ボット検出対策
    await this.page.addInitScript(() => {
      // @ts-ignore - navigator is available in browser context
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
  }

  /**
   * スクリーンショットを保存
   */
  protected async saveScreenshot(name: string): Promise<void> {
    if (!this.page) return;
    
    const screenshotsDir = './screenshots';
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const filename = `${this.PLATFORM_NAME.toLowerCase()}-${name}-${Date.now()}.png`;
    const filepath = path.join(screenshotsDir, filename);
    
    await this.page.screenshot({ 
      path: filepath,
      fullPage: true 
    });
    
    console.log(`  📸 スクリーンショット保存: ${filepath}`);
  }

  /**
   * ログイン（サブクラスで実装）
   */
  abstract login(credentials: PlatformCredentials): Promise<boolean>;

  /**
   * 写メ日記投稿（サブクラスで実装）
   */
  abstract postDiary(diaryData: DiaryPostData): Promise<boolean>;

  /**
   * キャスト情報更新（オプショナル）
   */
  async updateCast(castData: CastData): Promise<boolean> {
    console.log(`⚠️  ${this.PLATFORM_NAME}: キャスト情報更新は未実装です`);
    return false;
  }

  /**
   * スケジュール更新（オプショナル）
   */
  async updateSchedule(scheduleData: ScheduleData): Promise<boolean> {
    console.log(`⚠️  ${this.PLATFORM_NAME}: スケジュール更新は未実装です`);
    return false;
  }

  /**
   * ブラウザを閉じる
   */
  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    this.isLoggedIn = false;
  }

  /**
   * 共通ログイン処理ヘルパー
   */
  protected async performLogin(
    credentials: PlatformCredentials,
    usernameSelectors: string[],
    passwordSelectors: string[],
    submitSelectors: string[]
  ): Promise<boolean> {
    try {
      await this.initBrowser();
      
      if (!this.page) {
        throw new Error('ページが初期化されていません');
      }

      console.log(`${this.PLATFORM_NAME}にログイン中: ${this.LOGIN_URL}`);
      await this.page.goto(this.LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      await this.saveScreenshot('login-page');

      // ユーザー名/Email/ログインID入力
      const username = credentials.username || credentials.email || credentials.loginId;
      if (!username) {
        throw new Error('ユーザー名が指定されていません');
      }

      let usernameInput = null;
      for (const selector of usernameSelectors) {
        usernameInput = await this.page.$(selector);
        if (usernameInput) {
          console.log(`  ✅ ユーザー名入力フィールド検出: ${selector}`);
          break;
        }
      }

      if (!usernameInput) {
        console.error('  ❌ ユーザー名入力フィールドが見つかりません');
        await this.saveScreenshot('login-error-no-username-field');
        return false;
      }

      await usernameInput.fill(username);

      // パスワード入力
      let passwordInput = null;
      for (const selector of passwordSelectors) {
        passwordInput = await this.page.$(selector);
        if (passwordInput) {
          console.log(`  ✅ パスワード入力フィールド検出: ${selector}`);
          break;
        }
      }

      if (!passwordInput) {
        console.error('  ❌ パスワード入力フィールドが見つかりません');
        await this.saveScreenshot('login-error-no-password-field');
        return false;
      }

      await passwordInput.fill(credentials.password);
      
      await this.page.waitForTimeout(1000);

      // ログインボタンクリック
      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          submitButton = await this.page.$(selector);
          if (submitButton) {
            console.log(`  ✅ ログインボタン検出: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!submitButton) {
        console.error('  ❌ ログインボタンが見つかりません');
        await this.saveScreenshot('login-error-no-submit-button');
        return false;
      }

      await submitButton.click();
      await this.page.waitForTimeout(3000);

      const currentUrl = this.page.url();
      console.log(`  ログイン後のURL: ${currentUrl}`);

      await this.saveScreenshot('after-login');

      // URLチェック（login.phpから移動していればログイン成功と判断）
      if (!currentUrl.includes('login') && !currentUrl.includes('error')) {
        console.log(`✅ ${this.PLATFORM_NAME} ログイン成功`);
        this.isLoggedIn = true;
        return true;
      }

      console.warn(`⚠️  ${this.PLATFORM_NAME} ログイン失敗の可能性あり`);
      return false;

    } catch (error) {
      console.error(`❌ ${this.PLATFORM_NAME} ログインエラー:`, error);
      return false;
    }
  }
}
