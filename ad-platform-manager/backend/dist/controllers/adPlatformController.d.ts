import { Request, Response } from 'express';
/**
 * 広告媒体一覧取得
 */
export declare const getAllPlatforms: (req: Request, res: Response) => Promise<void>;
/**
 * 広告媒体詳細取得
 */
export declare const getPlatformById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * 広告媒体追加
 */
export declare const createPlatform: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * 広告媒体更新
 */
export declare const updatePlatform: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * 広告媒体削除
 */
export declare const deletePlatform: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * 配信ログ一覧取得
 */
export declare const getDistributionLogs: (req: Request, res: Response) => Promise<void>;
/**
 * 配信ログ統計取得
 */
export declare const getDistributionStatistics: (req: Request, res: Response) => Promise<void>;
/**
 * パスワード復号化（内部使用）
 */
export declare function getDecryptedPlatformCredentials(platformId: number): Promise<any>;
//# sourceMappingURL=adPlatformController.d.ts.map