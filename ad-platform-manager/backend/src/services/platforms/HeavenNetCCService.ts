/**
 * ヘブンネット (heavennet.cc) 自動更新サービス
 * シティヘブンネットと同様の構造を持つため、HeavenNetServiceを基盤として実装
 */
import { chromium, Browser, Page, BrowserContext } from 'playwright';

interface HeavenNetCCCredentials {
  username: string;
  password: string;
}

interface CastData {
  id: number;
  name: string;
  age: number;
  height: number;
  bust: number;
  waist: number;
  hip: number;
  cup: string;
  comment: string;
  images?: string[];
}

interface ScheduleData {
  castId: number;
  castName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'off' | 'reserved';
}

interface DiaryPostData {
  castId?: number;
  castName?: string;
  title: string;
  content: string;
  images?: string[];
  publishDate?: string;
}

export class HeavenNetCCService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;
  
  private readonly BASE_URL = 'https://www.heavennet.cc/admin/';
  private readonly LOGIN_URL = 'https://www.heavennet.cc/admin/login.php';
  
  /**
   * ブラウザを初期化
   */
  private async initBrowser(): Promise<void> {
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
    
    // JavaScriptのnavigatorプロパティを上書き（ボット検出対策）
    await this.page.addInitScript(() => {
      // @ts-ignore - navigator is available in browser context
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
  }

  /**
   * ログイン処理
   */
  async login(credentials: HeavenNetCCCredentials): Promise<boolean> {
    try {
      await this.initBrowser();
      
      if (!this.page) {
        throw new Error('ページが初期化されていません');
      }

      console.log(`ヘブンネットにログイン中: ${this.LOGIN_URL}`);
      await this.page.goto(this.LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      // スクリーンショット保存（デバッグ用）
      await this.page.screenshot({ 
        path: './screenshots/heavennet-login-page.png',
        fullPage: true 
      });

      // ログインフォームの入力フィールドを探す
      const usernameSelectors = [
        'input[name="username"]',
        'input[name="login_id"]',
        'input[name="user_id"]',
        'input[type="text"]',
        '#username',
        '#login_id'
      ];

      const passwordSelectors = [
        'input[name="password"]',
        'input[name="passwd"]',
        'input[type="password"]',
        '#password'
      ];

      let usernameInput = null;
      for (const selector of usernameSelectors) {
        usernameInput = await this.page.$(selector);
        if (usernameInput) {
          console.log(`ユーザー名入力フィールド検出: ${selector}`);
          break;
        }
      }

      let passwordInput = null;
      for (const selector of passwordSelectors) {
        passwordInput = await this.page.$(selector);
        if (passwordInput) {
          console.log(`パスワード入力フィールド検出: ${selector}`);
          break;
        }
      }

      if (!usernameInput || !passwordInput) {
        console.error('ログインフォームが見つかりません');
        return false;
      }

      // 認証情報を入力
      await usernameInput.fill(credentials.username);
      await passwordInput.fill(credentials.password);
      
      await this.page.waitForTimeout(1000);

      // ログインボタンを探してクリック
      const loginButtonSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("ログイン")',
        'input[value="ログイン"]',
        '.login-button',
        '#login-button'
      ];

      let loginButton = null;
      for (const selector of loginButtonSelectors) {
        try {
          loginButton = await this.page.$(selector);
          if (loginButton) {
            console.log(`ログインボタン検出: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!loginButton) {
        console.error('ログインボタンが見つかりません');
        return false;
      }

      await loginButton.click();
      
      // ページ遷移を待つ
      await this.page.waitForTimeout(3000);

      // ログイン成功の確認（URLが変わったか、ダッシュボードの要素があるか）
      const currentUrl = this.page.url();
      console.log(`ログイン後のURL: ${currentUrl}`);

      await this.page.screenshot({ 
        path: './screenshots/heavennet-after-login.png',
        fullPage: true 
      });

      // ダッシュボードの特徴的な要素を確認
      const dashboardSelectors = [
        '.dashboard',
        '#main-content',
        'a:has-text("写メ日記")',
        'a:has-text("女の子")',
        'a:has-text("スケジュール")'
      ];

      for (const selector of dashboardSelectors) {
        const element = await this.page.$(selector);
        if (element) {
          console.log(`ダッシュボード要素検出: ${selector}`);
          this.isLoggedIn = true;
          return true;
        }
      }

      // URLチェック（login.phpから移動していればログイン成功と判断）
      if (!currentUrl.includes('login.php') && !currentUrl.includes('error')) {
        console.log('ログイン成功（URL遷移確認）');
        this.isLoggedIn = true;
        return true;
      }

      console.warn('ログイン失敗の可能性あり');
      return false;

    } catch (error) {
      console.error('ログインエラー:', error);
      return false;
    }
  }

  /**
   * キャスト情報更新
   */
  async updateCastInfo(castData: CastData): Promise<boolean> {
    try {
      if (!this.isLoggedIn || !this.page) {
        throw new Error('ログインが必要です');
      }

      // キャスト一覧ページへ移動
      await this.page.goto(`${this.BASE_URL}cast/list.php`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      console.log(`キャスト情報更新: ${castData.name}`);

      // TODO: 実際のフォーム構造に合わせて実装
      // 現状はプレースホルダー

      return true;
    } catch (error) {
      console.error('キャスト情報更新エラー:', error);
      return false;
    }
  }

  /**
   * スケジュール更新
   */
  async updateSchedule(scheduleData: ScheduleData): Promise<boolean> {
    try {
      if (!this.isLoggedIn || !this.page) {
        throw new Error('ログインが必要です');
      }

      console.log(`スケジュール更新: ${scheduleData.castName} - ${scheduleData.date}`);

      // TODO: 実際のフォーム構造に合わせて実装

      return true;
    } catch (error) {
      console.error('スケジュール更新エラー:', error);
      return false;
    }
  }

  /**
   * 写メ日記投稿
   */
  async postDiary(diaryData: DiaryPostData): Promise<boolean> {
    try {
      if (!this.isLoggedIn || !this.page) {
        throw new Error('ログインが必要です');
      }

      console.log(`写メ日記投稿: ${diaryData.title}`);

      // 写メ日記一覧ページへ移動
      await this.page.goto(`${this.BASE_URL}diary/list.php`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      await this.page.screenshot({ 
        path: './screenshots/heavennet-diary-list.png',
        fullPage: true 
      });

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
          if (newPostButton) {
            console.log(`新規投稿ボタン検出: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (newPostButton) {
        await newPostButton.click();
        await this.page.waitForTimeout(2000);

        await this.page.screenshot({ 
          path: './screenshots/heavennet-diary-form.png',
          fullPage: true 
        });

        // タイトル入力
        const titleInput = await this.page.$('input[name*="title"], #title, .title-input');
        if (titleInput) {
          await titleInput.fill(diaryData.title);
        }

        // 本文入力
        const contentInput = await this.page.$('textarea[name*="content"], textarea[name*="body"], #content, .content-textarea');
        if (contentInput) {
          await contentInput.fill(diaryData.content);
        }

        // 画像アップロード処理
        if (diaryData.images && diaryData.images.length > 0) {
          const fileInput = await this.page.$('input[type="file"]');
          if (fileInput) {
            await fileInput.setInputFiles(diaryData.images);
          }
        }

        await this.page.waitForTimeout(1000);

        // 投稿ボタンをクリック
        const submitButton = await this.page.$('button[type="submit"], input[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          await this.page.waitForTimeout(2000);

          console.log('写メ日記投稿完了');
          return true;
        }
      }

      console.warn('写メ日記投稿フォームが見つかりません');
      return false;

    } catch (error) {
      console.error('写メ日記投稿エラー:', error);
      return false;
    }
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
}
