import { pool } from '../config/database';
import { getWebAutomationService } from './WebAutomationService';
import { getDecryptedPlatformCredentials } from '../controllers/adPlatformController';

export interface DistributionResult {
  platform_id: number;
  platform_name: string;
  cast_id?: number;
  cast_name?: string;
  success: boolean;
  error_message?: string;
  execution_time: number;
}

/**
 * 配信エンジン
 * 複数の広告媒体へキャスト情報を一括配信
 */
export class DistributionEngine {
  private webAutomation = getWebAutomationService();
  
  /**
   * キャスト情報を複数媒体に配信
   */
  async distributeCastInfo(
    castIds: number[],
    platformIds: number[]
  ): Promise<DistributionResult[]> {
    const results: DistributionResult[] = [];
    
    try {
      await this.webAutomation.initialize();
      
      for (const platformId of platformIds) {
        try {
          // 媒体情報を取得（パスワード復号化済み）
          const platform = await getDecryptedPlatformCredentials(platformId);
          
          console.log(`\n📡 ${platform.name} への配信開始`);
          
          // ログイン
          const page = await this.webAutomation.loginToPlatform(
            platform.name,
            platform.login_id,
            platform.login_password
          );
          
          for (const castId of castIds) {
            const startTime = Date.now();
            
            try {
              // キャスト情報を取得
              const cast = await this.getCast(castId);
              
              if (!cast) {
                console.warn(`⚠️ キャストID ${castId} が見つかりません`);
                continue;
              }
              
              console.log(`\n👤 ${cast.name} の情報を ${platform.name} に配信中...`);
              
              // 媒体別の更新処理
              let success = false;
              
              if (platform.name === 'シティヘブンネット') {
                success = await this.webAutomation.updateCastInfoCityHeaven(page, cast);
              } else if (platform.name === 'デリヘルタウン') {
                success = await this.webAutomation.updateCastInfoDeliheruTown(page, cast);
              }
              
              const executionTime = Date.now() - startTime;
              
              // ログ保存
              await this.webAutomation.saveLog({
                platform_id: platformId,
                cast_id: castId,
                distribution_type: 'キャスト情報',
                status: success ? '成功' : '失敗',
                request_data: { cast: cast.name },
                execution_time: executionTime
              });
              
              results.push({
                platform_id: platformId,
                platform_name: platform.name,
                cast_id: castId,
                cast_name: cast.name,
                success,
                execution_time: executionTime
              });
              
              // 次の配信まで少し待つ（サーバー負荷軽減）
              await page.waitForTimeout(2000);
              
            } catch (castError: any) {
              const executionTime = Date.now() - startTime;
              console.error(`❌ キャスト配信エラー:`, castError);
              
              await this.webAutomation.saveLog({
                platform_id: platformId,
                cast_id: castId,
                distribution_type: 'キャスト情報',
                status: '失敗',
                error_message: castError.message,
                execution_time: executionTime
              });
              
              results.push({
                platform_id: platformId,
                platform_name: platform.name,
                cast_id: castId,
                success: false,
                error_message: castError.message,
                execution_time: executionTime
              });
            }
          }
          
          await page.close();
          
        } catch (platformError: any) {
          console.error(`❌ 媒体エラー (${platformId}):`, platformError);
          
          results.push({
            platform_id: platformId,
            platform_name: '不明',
            success: false,
            error_message: platformError.message,
            execution_time: 0
          });
        }
      }
      
    } finally {
      // ブラウザを閉じる
      await this.webAutomation.close();
    }
    
    return results;
  }
  
  /**
   * スケジュール情報を配信
   */
  async distributeSchedule(
    castIds: number[],
    platformIds: number[],
    scheduleData: any
  ): Promise<DistributionResult[]> {
    // TODO: スケジュール配信の実装
    console.log('スケジュール配信は今後実装予定');
    return [];
  }
  
  /**
   * 画像を配信
   */
  async distributeImages(
    castId: number,
    platformIds: number[],
    imagePaths: string[]
  ): Promise<DistributionResult[]> {
    // TODO: 画像配信の実装
    console.log('画像配信は今後実装予定');
    return [];
  }
  
  /**
   * 写メ日記を配信
   */
  async distributePhotoDiary(
    diaryId: number,
    platformIds: number[]
  ): Promise<DistributionResult[]> {
    // TODO: 写メ日記配信の実装
    console.log('写メ日記配信は今後実装予定');
    return [];
  }
  
  /**
   * 即時配信実行
   */
  async distributeImmediate(params: {
    cast_ids: number[];
    platform_ids: number[];
    distribution_types: string[];
  }): Promise<DistributionResult[]> {
    const results: DistributionResult[] = [];
    
    for (const type of params.distribution_types) {
      if (type === 'キャスト情報') {
        const castResults = await this.distributeCastInfo(
          params.cast_ids,
          params.platform_ids
        );
        results.push(...castResults);
      }
      // 他の配信タイプも今後追加
    }
    
    return results;
  }
  
  /**
   * キャスト情報を取得
   */
  private async getCast(castId: number): Promise<any> {
    try {
      const [casts]: any = await pool.execute(
        'SELECT * FROM casts WHERE id = ?',
        [castId]
      );
      
      return casts.length > 0 ? casts[0] : null;
    } catch (error) {
      console.error('キャスト取得エラー:', error);
      return null;
    }
  }
  
  /**
   * 配信統計を取得
   */
  async getDistributionStats() {
    try {
      const [stats]: any = await pool.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = '成功' THEN 1 ELSE 0 END) as success_count,
          SUM(CASE WHEN status = '失敗' THEN 1 ELSE 0 END) as failure_count,
          AVG(execution_time) as avg_time
        FROM distribution_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `);
      
      return stats[0];
    } catch (error) {
      console.error('統計取得エラー:', error);
      return null;
    }
  }
}

// シングルトンインスタンス
let distributionEngine: DistributionEngine | null = null;

export function getDistributionEngine(): DistributionEngine {
  if (!distributionEngine) {
    distributionEngine = new DistributionEngine();
  }
  return distributionEngine;
}
