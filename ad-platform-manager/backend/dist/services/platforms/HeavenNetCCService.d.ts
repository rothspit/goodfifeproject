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
export declare class HeavenNetCCService {
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
    login(credentials: HeavenNetCCCredentials): Promise<boolean>;
    /**
     * キャスト情報更新
     */
    updateCastInfo(castData: CastData): Promise<boolean>;
    /**
     * スケジュール更新
     */
    updateSchedule(scheduleData: ScheduleData): Promise<boolean>;
    /**
     * 写メ日記投稿
     */
    postDiary(diaryData: DiaryPostData): Promise<boolean>;
    /**
     * ブラウザを閉じる
     */
    close(): Promise<void>;
}
export {};
//# sourceMappingURL=HeavenNetCCService.d.ts.map