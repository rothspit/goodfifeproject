/**
 * おとなの掲示板 自動更新サービス
 * https://otona-keijiban.com/admin/
 * 優先度: low
 */
import { BaseAdPlatformService, PlatformCredentials, DiaryPostData } from './BaseAdPlatformService';
export declare class OtonaKeijibanService extends BaseAdPlatformService {
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
//# sourceMappingURL=OtonaKeijibanService.d.ts.map