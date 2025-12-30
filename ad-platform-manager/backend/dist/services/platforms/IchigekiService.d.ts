/**
 * 一撃 自動更新サービス
 * https://www.ichigeki.jp/admin/
 * 優先度: medium
 */
import { BaseAdPlatformService, PlatformCredentials, DiaryPostData } from './BaseAdPlatformService';
export declare class IchigekiService extends BaseAdPlatformService {
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
//# sourceMappingURL=IchigekiService.d.ts.map