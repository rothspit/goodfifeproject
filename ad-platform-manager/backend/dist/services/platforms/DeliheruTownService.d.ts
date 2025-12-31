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
export declare class DeliheruTownService {
    private browser;
    private context;
    private page;
    private isLoggedIn;
    private readonly BASE_URL;
    private readonly LOGIN_URL;
    private readonly COOKIES_PATH;
    /**
     * ブラウザを初期化（CloudFront回避設定 + プロキシ対応）
     */
    private initBrowser;
    /**
     * 保存されたCookieを読み込み
     */
    private loadCookies;
    /**
     * Cookieを保存
     */
    private saveCookies;
    /**
     * ログイン処理
     */
    login(credentials: DeliheruTownCredentials, useCachedSession?: boolean, useProxy?: boolean): Promise<boolean>;
    /**
     * キャスト情報を更新
     */
    updateCast(castData: CastData): Promise<boolean>;
    /**
     * ログアウト
     */
    logout(): Promise<void>;
    /**
     * ブラウザを閉じる
     */
    close(): Promise<void>;
    /**
     * スクリーンショットを撮る（デバッグ用）
     */
    screenshot(path: string): Promise<void>;
}
export declare const deliheruTownService: DeliheruTownService;
export {};
//# sourceMappingURL=DeliheruTownService.d.ts.map