import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { pool } from '../config/database';

/**
 * Web自動化サービス（Playwright使用）
 * シティヘブンネット、デリヘルタウンなどのサイトへの自動ログイン・更新
 */
export class WebAutomationService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  
  /**
   * ブラウザ初期化
   */
  async initialize() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
      
      this.context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        viewport: { width: 1920, height: 1080 }
      });
      
      console.log('✅ ブラウザを起動しました');
    }
  }
  
  /**
   * ページ作成
   */
  async newPage(): Promise<Page> {
    if (!this.context) {
      await this.initialize();
    }
    return await this.context!.newPage();
  }
  
  /**
   * シティヘブンネットにログイン
   */
  async loginToCityHeaven(loginId: string, password: string): Promise<Page> {
    try {
      const page = await this.newPage();
      
      console.log('シティヘブンネットにログイン中...');
      
      // ログインページにアクセス
      await page.goto('https://www.cityheaven.net/login/', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      // ログインフォームに入力
      await page.fill('input[name="login_id"]', loginId);
      await page.fill('input[name="password"]', password);
      
      // ログインボタンをクリック
      await page.click('button[type="submit"], input[type="submit"]');
      
      // ログイン完了を待つ
      await page.waitForNavigation({ timeout: 30000 });
      
      console.log('✅ シティヘブンネットへのログイン成功');
      
      return page;
    } catch (error) {
      console.error('❌ シティヘブンネットログインエラー:', error);
      throw error;
    }
  }
  
  /**
   * デリヘルタウンにログイン
   */
  async loginToDeliheruTown(email: string, password: string): Promise<Page> {
    try {
      const page = await this.newPage();
      
      console.log('デリヘルタウンにログイン中...');
      
      // ログインページにアクセス
      await page.goto('https://www.deli-town.com/login/', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      // ログインフォームに入力
      await page.fill('input[name="email"], input[type="email"]', email);
      await page.fill('input[name="password"], input[type="password"]', password);
      
      // ログインボタンをクリック
      await page.click('button[type="submit"], input[type="submit"]');
      
      // ログイン完了を待つ
      await page.waitForNavigation({ timeout: 30000 });
      
      console.log('✅ デリヘルタウンへのログイン成功');
      
      return page;
    } catch (error) {
      console.error('❌ デリヘルタウンログインエラー:', error);
      throw error;
    }
  }
  
  /**
   * 汎用ログイン処理
   */
  async loginToPlatform(platformName: string, loginId: string, password: string): Promise<Page> {
    switch (platformName) {
      case 'シティヘブンネット':
        return await this.loginToCityHeaven(loginId, password);
      case 'デリヘルタウン':
        return await this.loginToDeliheruTown(loginId, password);
      default:
        throw new Error(`未対応の媒体: ${platformName}`);
    }
  }
  
  /**
   * キャスト情報更新（シティヘブンネット）
   */
  async updateCastInfoCityHeaven(page: Page, cast: any): Promise<boolean> {
    try {
      console.log(`キャスト情報更新中: ${cast.name}`);
      
      // プロフィール編集ページに移動（URLは実際のものに要調整）
      await page.goto('https://www.cityheaven.net/manage/cast/edit/', {
        waitUntil: 'domcontentloaded'
      });
      
      // フォーム入力
      await page.fill('input[name="name"]', cast.name || '');
      await page.fill('input[name="age"]', String(cast.age || ''));
      await page.fill('input[name="height"]', String(cast.height || ''));
      await page.fill('textarea[name="profile"]', cast.shop_comment || '');
      
      // 3サイズ
      if (cast.bust) await page.fill('input[name="bust"]', cast.bust);
      if (cast.waist) await page.fill('input[name="waist"]', String(cast.waist));
      if (cast.hip) await page.fill('input[name="hip"]', String(cast.hip));
      
      // 保存ボタンをクリック
      await page.click('button[type="submit"], input[value="保存"]');
      
      // 保存完了を待つ
      await page.waitForTimeout(2000);
      
      console.log(`✅ ${cast.name}の情報更新完了`);
      
      return true;
    } catch (error) {
      console.error(`❌ ${cast.name}の情報更新エラー:`, error);
      return false;
    }
  }
  
  /**
   * キャスト情報更新（デリヘルタウン）
   */
  async updateCastInfoDeliheruTown(page: Page, cast: any): Promise<boolean> {
    try {
      console.log(`キャスト情報更新中: ${cast.name}`);
      
      // プロフィール編集ページに移動
      await page.goto('https://www.deli-town.com/manage/cast/edit/', {
        waitUntil: 'domcontentloaded'
      });
      
      // フォーム入力
      await page.fill('input[name="name"]', cast.name || '');
      await page.fill('input[name="age"]', String(cast.age || ''));
      await page.fill('textarea[name="profile"]', cast.shop_comment || '');
      
      // 保存
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      console.log(`✅ ${cast.name}の情報更新完了`);
      
      return true;
    } catch (error) {
      console.error(`❌ ${cast.name}の情報更新エラー:`, error);
      return false;
    }
  }
  
  /**
   * 画像アップロード
   */
  async uploadImages(page: Page, imagePaths: string[]): Promise<boolean> {
    try {
      console.log('画像アップロード中...');
      
      // ファイル入力要素を探す
      const fileInput = await page.$('input[type="file"]');
      
      if (!fileInput) {
        console.warn('ファイルアップロード要素が見つかりません');
        return false;
      }
      
      // 複数ファイルをアップロード
      await fileInput.setInputFiles(imagePaths);
      
      // アップロード完了を待つ
      await page.waitForTimeout(3000);
      
      console.log('✅ 画像アップロード完了');
      
      return true;
    } catch (error) {
      console.error('❌ 画像アップロードエラー:', error);
      return false;
    }
  }
  
  /**
   * スクリーンショット撮影（デバッグ用）
   */
  async takeScreenshot(page: Page, filename: string): Promise<void> {
    try {
      await page.screenshot({ path: `screenshots/${filename}.png`, fullPage: true });
      console.log(`📸 スクリーンショット保存: ${filename}.png`);
    } catch (error) {
      console.error('スクリーンショットエラー:', error);
    }
  }
  
  /**
   * ブラウザを閉じる
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      console.log('✅ ブラウザを終了しました');
    }
  }
  
  /**
   * 配信ログを保存
   */
  async saveLog(logData: {
    platform_id: number;
    cast_id?: number;
    distribution_type: string;
    status: string;
    request_data?: any;
    response_data?: any;
    error_message?: string;
    execution_time: number;
  }) {
    try {
      await pool.execute(`
        INSERT INTO distribution_logs (
          platform_id, cast_id, distribution_type, status,
          request_data, response_data, error_message, execution_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        logData.platform_id,
        logData.cast_id || null,
        logData.distribution_type,
        logData.status,
        logData.request_data ? JSON.stringify(logData.request_data) : null,
        logData.response_data ? JSON.stringify(logData.response_data) : null,
        logData.error_message || null,
        logData.execution_time
      ]);
    } catch (error) {
      console.error('ログ保存エラー:', error);
    }
  }
}

// シングルトンインスタンス
let webAutomationService: WebAutomationService | null = null;

export function getWebAutomationService(): WebAutomationService {
  if (!webAutomationService) {
    webAutomationService = new WebAutomationService();
  }
  return webAutomationService;
}
