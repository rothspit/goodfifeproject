/**
 * 広告媒体配信コントローラー
 * キャスト情報、スケジュール、写メ日記などを複数の広告媒体に一括配信
 */
import { Request, Response } from 'express';
/**
 * キャスト情報を指定媒体に配信
 */
export declare const distributeCastInfo: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * スケジュールを指定媒体に配信
 */
export declare const distributeSchedule: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * 写メ日記を指定媒体に配信
 */
export declare const distributeDiary: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * 一括配信（すべてのキャストを複数媒体に配信）
 */
export declare const bulkDistribute: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=distributionController.d.ts.map