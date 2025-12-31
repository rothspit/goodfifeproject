"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuzokuJapanService = void 0;
/**
 * 風俗じゃぱん 自動更新サービス
 * https://fuzoku-japan.com/
 */
const BaseAdPlatformService_1 = require("./BaseAdPlatformService");
class FuzokuJapanService extends BaseAdPlatformService_1.BaseAdPlatformService {
    constructor() {
        super(...arguments);
        this.BASE_URL = 'https://fuzoku-japan.com/admin/';
        this.LOGIN_URL = 'https://fuzoku-japan.com/admin/login';
        this.PLATFORM_NAME = 'FuzokuJapan';
    }
    /**
     * ログイン処理
     */
    async login(credentials) {
        const usernameSelectors = [
            'input[name="email"]',
            'input[name="username"]',
            'input[name="login_id"]',
            'input[type="text"]',
            '#email',
            '#username'
        ];
        const passwordSelectors = [
            'input[name="password"]',
            'input[type="password"]',
            '#password'
        ];
        const submitSelectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("ログイン")',
            '.login-button',
            '#login-button'
        ];
        return await this.performLogin(credentials, usernameSelectors, passwordSelectors, submitSelectors);
    }
    /**
     * 写メ日記投稿
     */
    async postDiary(diaryData) {
        try {
            if (!this.isLoggedIn || !this.page) {
                throw new Error('ログインが必要です');
            }
            console.log(`${this.PLATFORM_NAME} 写メ日記投稿: ${diaryData.title}`);
            // 写メ日記ページへ移動（URLは調査後に更新）
            await this.page.goto(`${this.BASE_URL}diary/`, {
                waitUntil: 'networkidle',
                timeout: 30000
            });
            await this.saveScreenshot('diary-list');
            // 新規投稿ボタンを探す
            const newPostButton = await this.page.$('a:has-text("新規投稿"), button:has-text("新規投稿")');
            if (newPostButton) {
                await newPostButton.click();
                await this.page.waitForTimeout(2000);
                await this.saveScreenshot('diary-form');
                // タイトル入力
                const titleInput = await this.page.$('input[name*="title"], #title');
                if (titleInput) {
                    await titleInput.fill(diaryData.title);
                }
                // 本文入力
                const contentInput = await this.page.$('textarea[name*="content"], textarea[name*="body"]');
                if (contentInput) {
                    await contentInput.fill(diaryData.content);
                }
                // 投稿ボタン
                const submitButton = await this.page.$('button[type="submit"], input[type="submit"]');
                if (submitButton) {
                    await submitButton.click();
                    await this.page.waitForTimeout(2000);
                    console.log(`✅ ${this.PLATFORM_NAME} 写メ日記投稿完了`);
                    return true;
                }
            }
            console.warn(`⚠️  ${this.PLATFORM_NAME} 投稿フォームが見つかりません`);
            return false;
        }
        catch (error) {
            console.error(`❌ ${this.PLATFORM_NAME} 写メ日記投稿エラー:`, error);
            return false;
        }
    }
}
exports.FuzokuJapanService = FuzokuJapanService;
//# sourceMappingURL=FuzokuJapanService.js.map