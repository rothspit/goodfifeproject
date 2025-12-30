"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.soapHeavenService = exports.SoapHeavenService = void 0;
/**
 * ソープランドヘブン 自動更新サービス
 * シティヘブンネットの系列サイト
 */
const playwright_1 = require("playwright");
class SoapHeavenService {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.isLoggedIn = false;
        // ソープランドヘブンの管理画面URL
        this.BASE_URL = 'https://soap.cityheaven.net/';
        this.MANAGER_URL = 'https://spmanager.cityheaven.net/'; // シティヘブンと共通の可能性
    }
    /**
     * ブラウザを初期化
     */
    async initBrowser() {
        if (this.browser) {
            return;
        }
        this.browser = await playwright_1.chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.context = await this.browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            viewport: { width: 1920, height: 1080 },
            locale: 'ja-JP',
            timezoneId: 'Asia/Tokyo'
        });
        this.page = await this.context.newPage();
    }
    /**
     * ログイン処理
     * 注: シティヘブンネットと同じ管理画面を使用する可能性が高い
     */
    async login(credentials) {
        try {
            await this.initBrowser();
            if (!this.page) {
                throw new Error('Page not initialized');
            }
            console.log('🔐 ソープランドヘブンにログイン中...');
            console.log('   💡 シティヘブンネットと同じ管理画面を使用');
            // シティヘブンネットのログインページにアクセス
            await this.page.goto(this.MANAGER_URL, {
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
                // ソープランド専用のページに移動
                // （実装時に具体的なURLを確認）
                return true;
            }
            else {
                console.log('❌ ログイン失敗');
                return false;
            }
        }
        catch (error) {
            console.error('❌ ログインエラー:', error);
            return false;
        }
    }
    /**
     * キャスト情報を更新
     */
    async updateCast(castData) {
        try {
            if (!this.isLoggedIn || !this.page) {
                throw new Error('Not logged in');
            }
            console.log(`📝 キャスト「${castData.name}」を更新中...`);
            // 実装予定: ソープランド専用のキャスト管理ページへの遷移と更新処理
            // シティヘブンネットの女の子管理と類似の構造を想定
            console.log('   ⏳ ソープランド専用機能は実装中...');
            return true;
        }
        catch (error) {
            console.error('❌ キャスト更新エラー:', error);
            return false;
        }
    }
    /**
     * ブラウザを閉じる
     */
    async close() {
        try {
            if (this.page)
                await this.page.close();
            if (this.context)
                await this.context.close();
            if (this.browser)
                await this.browser.close();
            this.browser = null;
            this.context = null;
            this.page = null;
            this.isLoggedIn = false;
            console.log('✅ ブラウザを閉じました');
        }
        catch (error) {
            console.error('❌ ブラウザクローズエラー:', error);
        }
    }
    /**
     * スクリーンショットを撮る
     */
    async screenshot(path) {
        if (this.page) {
            await this.page.screenshot({ path, fullPage: true });
            console.log(`📸 スクリーンショット保存: ${path}`);
        }
    }
}
exports.SoapHeavenService = SoapHeavenService;
exports.soapHeavenService = new SoapHeavenService();
//# sourceMappingURL=SoapHeavenService.js.map