/**
 * 広告媒体サービス ベースクラス
 * すべての広告媒体サービスの共通機能を提供
 */
import { Browser, Page, BrowserContext } from 'playwright';
export interface PlatformCredentials {
    username?: string;
    email?: string;
    loginId?: string;
    password: string;
}
export interface DiaryPostData {
    castId?: number;
    castName?: string;
    title: string;
    content: string;
    images?: string[];
    publishDate?: string;
}
export interface CastData {
    id?: number;
    name: string;
    age?: number;
    height?: number;
    measurements?: {
        bust: number;
        waist: number;
        hip: number;
        cup: string;
    };
    comment?: string;
    images?: string[];
}
export interface ScheduleData {
    castId: number;
    castName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'available' | 'off' | 'reserved';
}
export declare abstract class BaseAdPlatformService {
    protected browser: Browser | null;
    protected context: BrowserContext | null;
    protected page: Page | null;
    protected isLoggedIn: boolean;
    protected abstract BASE_URL: string;
    protected abstract LOGIN_URL: string;
    protected abstract PLATFORM_NAME: string;
    /**
     * ブラウザを初期化
     */
    protected initBrowser(): Promise<void>;
    /**
     * スクリーンショットを保存
     */
    protected saveScreenshot(name: string): Promise<void>;
    /**
     * ログイン（サブクラスで実装）
     */
    abstract login(credentials: PlatformCredentials): Promise<boolean>;
    /**
     * 写メ日記投稿（サブクラスで実装）
     */
    abstract postDiary(diaryData: DiaryPostData): Promise<boolean>;
    /**
     * キャスト情報更新（オプショナル）
     */
    updateCast(castData: CastData): Promise<boolean>;
    /**
     * スケジュール更新（オプショナル）
     */
    updateSchedule(scheduleData: ScheduleData): Promise<boolean>;
    /**
     * ブラウザを閉じる
     */
    close(): Promise<void>;
    /**
     * 共通ログイン処理ヘルパー
     */
    protected performLogin(credentials: PlatformCredentials, usernameSelectors: string[], passwordSelectors: string[], submitSelectors: string[]): Promise<boolean>;
}
//# sourceMappingURL=BaseAdPlatformService.d.ts.map