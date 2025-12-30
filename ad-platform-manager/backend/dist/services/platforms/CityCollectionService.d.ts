/**
 * シティコレクション 自動更新サービス
 * https://city-collection.net/admin/
 * 優先度: high
 */
import { BaseAdPlatformService, PlatformCredentials, DiaryPostData } from './BaseAdPlatformService';
export declare class CityCollectionService extends BaseAdPlatformService {
    protected BASE_URL: string;
    protected LOGIN_URL: string;
    protected PLATFORM_NAME: string;
    /**
     * ログイン処理
     */
    login(credentials: PlatformCredentials): Promise<boolean>;
    /**
     * 写メ日記投稿
     */
    postDiary(diaryData: DiaryPostData): Promise<boolean>;
}
//# sourceMappingURL=CityCollectionService.d.ts.map