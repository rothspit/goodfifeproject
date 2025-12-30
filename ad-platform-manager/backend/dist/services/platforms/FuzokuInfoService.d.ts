/**
 * 風俗総合情報 自動更新サービス
 * https://www.fuzoku.jp/admin/
 * 優先度: medium
 */
import { BaseAdPlatformService, PlatformCredentials, DiaryPostData } from './BaseAdPlatformService';
export declare class FuzokuInfoService extends BaseAdPlatformService {
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
//# sourceMappingURL=FuzokuInfoService.d.ts.map