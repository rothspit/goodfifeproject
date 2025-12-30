/**
 * デリヘルタウン 自動更新サービス
 * CloudFront回避のための高度な手法を実装
 * プロキシローテーション対応
 */
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { proxyRotator } from '../../utils/proxyRotator';

interface DeliheruTownCredentials {
  email: string;
  password: string;
}

interface CastData {
  id: number;
  name: string;
  age: number;
  profile: string;
  images?: string[];
}

export class DeliheruTownService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;
  
  private readonly BASE_URL = 'https://admin.dto.jp/';
  private readonly LOGIN_URL = 'https://admin.dto.jp/a/auth/input';
  private readonly COOKIES_PATH = './cache/deliherutown-cookies.json';
  
  /**
   * ブラウザを初期化（CloudFront回避設定 + プロキシ対応）
   */
  private async initBrowser(useProxy: boolean = false): Promise<void> {
    if (this.browser) {
      return;
    }
    
    const launchOptions: any = {
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    };
    
    this.browser = await chromium.launch(launchOptions);
    
    // コンテキスト設定
    const contextOptions: any = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo',
      extraHTTPHeaders: {
        'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      }
    };
    
    // プロキシローテーション
    if (useProxy && proxyRotator.getCount() > 0) {
      const proxy = proxyRotator.getNext();
      if (proxy) {
        contextOptions.proxy = proxyRotator.formatForPlaywright(proxy);
        console.log(`🌐 プロキシ使用: ${proxy.server}`);
      }
    }
    
    this.context = await this.browser.newContext(contextOptions);
    
    this.page = await this.context.newPage();
    
    // WebDriver検出回避
    await this.page.addInitScript(`
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      });
      
      window.navigator.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };
      
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });
      
      Object.defineProperty(navigator, 'languages', {
        get: () => ['ja-JP', 'ja', 'en-US', 'en']
      });
      
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: 'granted' }) :
          originalQuery(parameters)
      );
    `);
  }
  
  /**
   * 保存されたCookieを読み込み
   */
  private async loadCookies(): Promise<boolean> {
    try {
      if (!fs.existsSync(this.COOKIES_PATH)) {
        return false;
      }
      
      const cookiesString = fs.readFileSync(this.COOKIES_PATH, 'utf8');
      const cookies = JSON.parse(cookiesString);
      
      if (this.context) {
        await this.context.addCookies(cookies);
        console.log('✅ Cookie読み込み成功');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('⚠️  Cookie読み込みエラー:', error);
      return false;
    }
  }
  
  /**
   * Cookieを保存
   */
  private async saveCookies(): Promise<void> {
    try {
      if (!this.context) {
        return;
      }
      
      const cookies = await this.context.cookies();
      const cacheDir = path.dirname(this.COOKIES_PATH);
      
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      
      fs.writeFileSync(this.COOKIES_PATH, JSON.stringify(cookies, null, 2));
      console.log('✅ Cookie保存成功');
    } catch (error) {
      console.error('⚠️  Cookie保存エラー:', error);
    }
  }
  
  /**
   * ログイン処理
   */
  async login(credentials: DeliheruTownCredentials, useCachedSession: boolean = true, useProxy: boolean = false): Promise<boolean> {
    try {
      await this.initBrowser(useProxy);
      
      if (!this.page) {
        throw new Error('Page not initialized');
      }
      
      // キャッシュされたセッションを試す
      if (useCachedSession) {
        console.log('🔄 保存されたセッションを確認中...');
        const cookiesLoaded = await this.loadCookies();
        
        if (cookiesLoaded) {
          // セッションが有効か確認
          await this.page.goto(this.BASE_URL, {
            waitUntil: 'networkidle',
            timeout: 30000
          });
          
          const currentUrl = this.page.url();
          if (!currentUrl.includes('/auth/input')) {
            console.log('✅ セッション有効 - ログイン不要');
            this.isLoggedIn = true;
            return true;
          }
        }
      }
      
      console.log('🔐 デリヘルタウンにログイン中...');
      console.log('   ⚠️  注意: CloudFrontによるブロックの可能性あり');
      
      // ログインページにゆっくりアクセス
      await this.page.goto(this.LOGIN_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      
      // 少し待機（人間らしい動作）
      await this.page.waitForTimeout(2000);
      
      // CloudFlareチェックを確認
      const pageContent = await this.page.content();
      if (pageContent.includes('Attention Required') || pageContent.includes('CloudFront')) {
        console.log('❌ CloudFrontによるブロック検出');
        await this.page.screenshot({ path: './screenshots/deliherutown-blocked.png' });
        return false;
      }
      
      // フォームを確認
      const emailField = await this.page.locator('input[type="email"], input[name*="mail"], input[id*="mail"]').first();
      const passwordField = await this.page.locator('input[type="password"]').first();
      
      const hasEmail = await emailField.count();
      const hasPassword = await passwordField.count();
      
      if (hasEmail === 0 || hasPassword === 0) {
        console.log('⚠️  ログインフォームが見つかりません');
        await this.page.screenshot({ path: './screenshots/deliherutown-no-form.png' });
        return false;
      }
      
      // ゆっくり入力（人間らしい動作）
      await emailField.fill(credentials.email, { timeout: 5000 });
      await this.page.waitForTimeout(500);
      
      await passwordField.fill(credentials.password, { timeout: 5000 });
      await this.page.waitForTimeout(500);
      
      await this.page.screenshot({ path: './screenshots/deliherutown-filled.png' });
      
      // ログインボタンをクリック
      const loginButton = await this.page.locator('button:has-text("ログイン"), input[type="submit"]').first();
      if (await loginButton.count() > 0) {
        await Promise.all([
          this.page.waitForNavigation({ timeout: 30000 }).catch(() => {}),
          loginButton.click()
        ]);
        
        await this.page.waitForTimeout(2000);
        
        const currentUrl = this.page.url();
        if (!currentUrl.includes('/auth/input')) {
          console.log('✅ ログイン成功');
          this.isLoggedIn = true;
          
          // Cookieを保存
          await this.saveCookies();
          
          await this.page.screenshot({ path: './screenshots/deliherutown-loggedin.png' });
          return true;
        }
      }
      
      console.log('❌ ログイン失敗');
      return false;
      
    } catch (error) {
      console.error('❌ ログインエラー:', error);
      return false;
    }
  }
  
  /**
   * キャスト情報を更新
   */
  async updateCast(castData: CastData): Promise<boolean> {
    try {
      if (!this.isLoggedIn || !this.page) {
        throw new Error('Not logged in');
      }
      
      console.log(`📝 キャスト「${castData.name}」を更新中...`);
      
      // 実装予定: キャスト管理ページへの遷移と更新処理
      console.log('   ⏳ キャスト更新機能は実装中...');
      
      return true;
    } catch (error) {
      console.error('❌ キャスト更新エラー:', error);
      return false;
    }
  }
  
  /**
   * ログアウト
   */
  async logout(): Promise<void> {
    try {
      if (this.page && this.isLoggedIn) {
        await this.page.goto(`${this.BASE_URL}a/auth/logout`, {
          waitUntil: 'networkidle',
          timeout: 10000
        }).catch(() => {});
        this.isLoggedIn = false;
        console.log('✅ ログアウトしました');
      }
    } catch (error) {
      console.error('❌ ログアウトエラー:', error);
    }
  }
  
  /**
   * ブラウザを閉じる
   */
  async close(): Promise<void> {
    try {
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
      console.log('✅ ブラウザを閉じました');
    } catch (error) {
      console.error('❌ ブラウザクローズエラー:', error);
    }
  }
  
  /**
   * スクリーンショットを撮る（デバッグ用）
   */
  async screenshot(path: string): Promise<void> {
    if (this.page) {
      await this.page.screenshot({ path, fullPage: true });
      console.log(`📸 スクリーンショット保存: ${path}`);
    }
  }
}

// シングルトンインスタンスをエクスポート
export const deliheruTownService = new DeliheruTownService();
