interface CityHeavenCredentials {
    username: string;
    password: string;
}
interface SessionInfo {
    token?: string;
    sessionId?: string;
    cookies: string[];
    shopId: string;
}
interface DiaryPostData {
    castId?: number;
    castName?: string;
    title: string;
    content: string;
    images?: string[];
    publishDate?: string;
}
interface DiaryPostResponse {
    success: boolean;
    diaryId?: number;
    publishedAt?: string;
    error?: string;
}
interface CastInfo {
    id: number;
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
export declare class CityHeavenAPIClient {
    private client;
    private session;
    private readonly BASE_URL;
    private readonly WEB_BASE_URL;
    constructor();
    /**
     * ログイン処理
     * 実際のエンドポイントはmitmproxyで確認必要
     */
    login(credentials: CityHeavenCredentials): Promise<boolean>;
    /**
     * 写メ日記投稿
     * 実際のエンドポイントとパラメータはmitmproxyで確認必要
     */
    postDiary(diaryData: DiaryPostData): Promise<DiaryPostResponse>;
    /**
     * キャスト一覧取得
     */
    getCastList(): Promise<CastInfo[]>;
    /**
     * キャスト情報更新
     */
    updateCast(castInfo: CastInfo): Promise<boolean>;
    /**
     * セッション情報を保存
     */
    getSession(): SessionInfo | null;
    /**
     * セッション情報を復元
     */
    setSession(session: SessionInfo): void;
    /**
     * ログアウト
     */
    logout(): Promise<void>;
    /**
     * shop_idを抽出（HTMLから）
     */
    private extractShopId;
}
export {};
//# sourceMappingURL=CityHeavenAPIClient.d.ts.map