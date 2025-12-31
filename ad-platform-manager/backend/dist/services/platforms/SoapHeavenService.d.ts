interface SoapHeavenCredentials {
    username: string;
    password: string;
}
interface CastData {
    id: number;
    name: string;
    age: number;
    profile: string;
    images?: string[];
}
export declare class SoapHeavenService {
    private browser;
    private context;
    private page;
    private isLoggedIn;
    private readonly BASE_URL;
    private readonly MANAGER_URL;
    /**
     * ブラウザを初期化
     */
    private initBrowser;
    /**
     * ログイン処理
     * 注: シティヘブンネットと同じ管理画面を使用する可能性が高い
     */
    login(credentials: SoapHeavenCredentials): Promise<boolean>;
    /**
     * キャスト情報を更新
     */
    updateCast(castData: CastData): Promise<boolean>;
    /**
     * ブラウザを閉じる
     */
    close(): Promise<void>;
    /**
     * スクリーンショットを撮る
     */
    screenshot(path: string): Promise<void>;
}
export declare const soapHeavenService: SoapHeavenService;
export {};
//# sourceMappingURL=SoapHeavenService.d.ts.map