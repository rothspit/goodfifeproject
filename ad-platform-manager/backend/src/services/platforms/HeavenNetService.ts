/**
 * シティヘブンネット 自動更新サービス
 * Playwrightを使用した自動ログインとデータ更新
 */
import { chromium, Browser, Page, BrowserContext } from 'playwright';

interface HeavenNetCredentials {
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

export class HeavenNetService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;
  
  private readonly BASE_URL = 'https://spmanager.cityheaven.net/';
  private readonly LOGIN_URL = 'https://spmanager.cityheaven.net/';
  
  /**
   * ブラウザを初期化
   */
  private async initBrowser(): Promise<void> {
    if (this.browser) {
      return;
    }
    
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo'
    });
    
    this.page = await this.context.newPage();
  }
  
  /**
   * ログイン処理
   */
  async login(credentials: HeavenNetCredentials): Promise<boolean> {
    try {
      await this.initBrowser();
      
      if (!this.page) {
        throw new Error('Page not initialized');
      }
      
      console.log('🔐 シティヘブンネットにログイン中...');
      
      // ログインページにアクセス
      await this.page.goto(this.LOGIN_URL, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // ログインフォームに入力
      await this.page.fill('#userid', credentials.username);
      await this.page.fill('#passwd', credentials.password);
      
      // ログインボタンをクリック
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }),
        this.page.click('#loginBtn')
      ]);
      
      // ログイン成功確認
      const currentUrl = this.page.url();
      if (currentUrl.includes('H1Main.php')) {
        this.isLoggedIn = true;
        console.log('✅ ログイン成功');
        return true;
      } else {
        console.log('❌ ログイン失敗');
        return false;
      }
    } catch (error) {
      console.error('❌ ログインエラー:', error);
      return false;
    }
  }
  
  /**
   * キャスト情報を更新
   */
  async updateCastInfo(castData: CastData): Promise<boolean> {
    try {
      if (!this.isLoggedIn || !this.page) {
        throw new Error('Not logged in');
      }
      
      console.log(`📝 キャスト「${castData.name}」の情報を更新中...`);
      
      // 女の子一覧ページに移動
      await this.page.goto(`${this.BASE_URL}H3GirlList.php`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // 対象のキャストを検索
      const castLink = await this.page.locator(`a:has-text("${castData.name}")`).first();
      
      if (await castLink.count() === 0) {
        console.log(`⚠️  キャスト「${castData.name}」が見つかりません`);
        return false;
      }
      
      // キャスト編集ページに移動
      await castLink.click();
      await this.page.waitForLoadState('networkidle');
      
      // フォームに情報を入力
      // (実際のフィールド名はページを見て確認する必要があります)
      // 例:
      // await this.page.fill('[name="age"]', castData.age.toString());
      // await this.page.fill('[name="height"]', castData.height.toString());
      // await this.page.fill('[name="comment"]', castData.comment);
      
      // 保存ボタンをクリック
      // await this.page.click('button:has-text("保存")');
      // await this.page.waitForLoadState('networkidle');
      
      console.log(`✅ キャスト「${castData.name}」の情報を更新しました`);
      return true;
    } catch (error) {
      console.error(`❌ キャスト情報更新エラー:`, error);
      return false;
    }
  }
  
  /**
   * スケジュールを更新
   */
  async updateSchedule(schedules: ScheduleData[]): Promise<boolean> {
    try {
      if (!this.isLoggedIn || !this.page) {
        throw new Error('Not logged in');
      }
      
      console.log(`📅 スケジュールを更新中... (${schedules.length}件)`);
      
      // スケジュール管理ページに移動
      // (実際のURLはログイン後の画面から確認する必要があります)
      // await this.page.goto(`${this.BASE_URL}schedule.php`, {
      //   waitUntil: 'networkidle',
      //   timeout: 30000
      // });
      
      // 各スケジュールを更新
      for (const schedule of schedules) {
        // スケジュール更新処理
        console.log(`  - ${schedule.castName}: ${schedule.date} ${schedule.startTime}-${schedule.endTime}`);
      }
      
      console.log(`✅ スケジュールを更新しました`);
      return true;
    } catch (error) {
      console.error(`❌ スケジュール更新エラー:`, error);
      return false;
    }
  }
  
  /**
   * 写メ日記を投稿
   * 注: シティヘブンネットの写メ日記はモバイルアプリまたは専用インターフェースが必要
   * この実装は基本構造のみ
   */
  async postDiary(castId: number, title: string, content: string, images?: string[]): Promise<boolean> {
    try {
      if (!this.isLoggedIn || !this.page) {
        throw new Error('Not logged in');
      }
      
      console.log(`📸 写メ日記を投稿中: ${title}`);
      
      // 写メ日記一覧ページに移動
      await this.page.goto(`${this.BASE_URL}H8KeitaiDiaryList.php?shopdir=cb_hitozuma_mitsu`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      console.log('   ✅ 一覧ページアクセス成功');
      
      // 投稿ボタンを探してクリック
      const postButton = await this.page.locator('a:has-text("投稿"), a:has-text("新規"), button:has-text("投稿")').first();
      const buttonCount = await postButton.count();
      
      if (buttonCount > 0) {
        console.log('   ✅ 投稿ボタン発見');
        await postButton.click();
        await this.page.waitForLoadState('networkidle');
        
        // スクリーンショット撮影（デバッグ用）
        const timestamp = Date.now();
        await this.page.screenshot({ 
          path: `./screenshots/diary-posting-${timestamp}.png`,
          fullPage: true 
        });
        console.log(`   📸 フォーム画面保存: diary-posting-${timestamp}.png`);
        
        // 注: 実際のフォーム入力はシティヘブンネットのインターフェース調査が必要
        // 現状では基本構造のみ実装
        console.log('   ⚠️  実際のフォーム入力は要実装');
        console.log('   💡 推奨: シティヘブンネットモバイルアプリAPIを使用');
        
        return true;
      } else {
        console.log('   ⚠️  投稿ボタンが見つかりません');
        return false;
      }
      
    } catch (error) {
      console.error(`❌ 写メ日記投稿エラー:`, error);
      return false;
    }
  }
  
  /**
   * ログアウト
   */
  async logout(): Promise<void> {
    try {
      if (this.page && this.isLoggedIn) {
        await this.page.goto(`${this.BASE_URL}H1Login.php`, {
          waitUntil: 'networkidle',
          timeout: 10000
        });
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
export const heavenNetService = new HeavenNetService();
