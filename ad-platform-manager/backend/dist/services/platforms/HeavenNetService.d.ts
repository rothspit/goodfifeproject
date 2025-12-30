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
export declare class HeavenNetService {
    private browser;
    private context;
    private page;
    private isLoggedIn;
    private readonly BASE_URL;
    private readonly LOGIN_URL;
    /**
     * ブラウザを初期化
     */
    private initBrowser;
    /**
     * ログイン処理
     */
    login(credentials: HeavenNetCredentials): Promise<boolean>;
    /**
     * キャスト情報を更新
     */
    updateCastInfo(castData: CastData): Promise<boolean>;
    /**
     * スケジュールを更新
     */
    updateSchedule(schedules: ScheduleData[]): Promise<boolean>;
    /**
     * 写メ日記を投稿
     * 注: シティヘブンネットの写メ日記はモバイルアプリまたは専用インターフェースが必要
     * この実装は基本構造のみ
     */
    postDiary(castId: number, title: string, content: string, images?: string[]): Promise<boolean>;
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
export declare const heavenNetService: HeavenNetService;
export {};
//# sourceMappingURL=HeavenNetService.d.ts.map