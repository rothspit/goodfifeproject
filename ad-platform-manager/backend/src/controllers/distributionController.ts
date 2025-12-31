/**
 * 広告媒体配信コントローラー
 * キャスト情報、スケジュール、写メ日記などを複数の広告媒体に一括配信
 */
import { Request, Response } from 'express';
import { pool } from '../config/database';
import { getDecryptedPlatformCredentials } from './adPlatformController';
import { heavenNetService } from '../services/platforms/HeavenNetService';

/**
 * キャスト情報を指定媒体に配信
 */
export const distributeCastInfo = async (req: Request, res: Response) => {
  try {
    const { castId, platformIds, data } = req.body;
    
    if (!castId || !platformIds || platformIds.length === 0) {
      return res.status(400).json({ 
        error: 'キャストIDと配信先媒体IDは必須です' 
      });
    }
    
    console.log(`📤 キャスト情報配信開始: Cast ID ${castId} -> ${platformIds.length}媒体`);
    
    // キャスト情報を取得
    const [casts]: any = await pool.query(
      'SELECT * FROM casts WHERE id = ?',
      [castId]
    );
    
    if (casts.length === 0) {
      return res.status(404).json({ error: 'キャストが見つかりません' });
    }
    
    const cast = casts[0];
    
    // 配信結果を格納
    const results: any[] = [];
    
    // 各媒体に配信
    for (const platformId of platformIds) {
      const startTime = Date.now();
      
      try {
        // 媒体の認証情報を取得
        const platform = await getDecryptedPlatformCredentials(platformId);
        
        console.log(`  → ${platform.name} に配信中...`);
        
        let success = false;
        let errorMessage = null;
        
        // 媒体ごとの配信処理
        switch (platform.name) {
          case 'シティヘブンネット':
            // Heaven Net配信
            const loginSuccess = await heavenNetService.login({
              username: platform.login_id,
              password: platform.login_password
            });
            
            if (loginSuccess) {
              success = await heavenNetService.updateCastInfo({
                id: cast.id,
                name: cast.name,
                age: cast.age,
                height: cast.height,
                bust: cast.bust,
                waist: cast.waist,
                hip: cast.hip,
                cup: cast.cup,
                comment: cast.shop_comment || ''
              });
              
              await heavenNetService.logout();
              await heavenNetService.close();
            }
            break;
          
          case 'デリヘルタウン':
            // Deliheru Town配信
            // (別途実装)
            errorMessage = '未実装: デリヘルタウン配信機能';
            break;
          
          default:
            errorMessage = `未対応の媒体: ${platform.name}`;
            break;
        }
        
        const executionTime = Date.now() - startTime;
        
        // 配信ログを記録
        await pool.query(`
          INSERT INTO distribution_logs (
            platform_id, cast_id, distribution_type, status,
            error_message, execution_time, metadata
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          platformId,
          castId,
          'cast_info',
          success ? '成功' : '失敗',
          errorMessage,
          executionTime,
          JSON.stringify({ data })
        ]);
        
        results.push({
          platformId,
          platformName: platform.name,
          success,
          errorMessage,
          executionTime
        });
        
        console.log(`    ${success ? '✅' : '❌'} ${platform.name}: ${executionTime}ms`);
        
      } catch (error: any) {
        const executionTime = Date.now() - startTime;
        
        console.error(`    ❌ エラー: ${error.message}`);
        
        // エラーログを記録
        await pool.query(`
          INSERT INTO distribution_logs (
            platform_id, cast_id, distribution_type, status,
            error_message, execution_time
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          platformId,
          castId,
          'cast_info',
          '失敗',
          error.message,
          executionTime
        ]);
        
        results.push({
          platformId,
          success: false,
          errorMessage: error.message,
          executionTime
        });
      }
    }
    
    // 結果サマリー
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    console.log(`✅ 配信完了: ${successCount}成功 / ${failureCount}失敗`);
    
    res.json({
      success: true,
      message: `${successCount}/${results.length}媒体に配信しました`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failure: failureCount
      }
    });
    
  } catch (error: any) {
    console.error('配信エラー:', error);
    res.status(500).json({ 
      error: 'キャスト情報の配信に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * スケジュールを指定媒体に配信
 */
export const distributeSchedule = async (req: Request, res: Response) => {
  try {
    const { schedules, platformIds } = req.body;
    
    if (!schedules || schedules.length === 0 || !platformIds || platformIds.length === 0) {
      return res.status(400).json({ 
        error: 'スケジュールと配信先媒体IDは必須です' 
      });
    }
    
    console.log(`📅 スケジュール配信開始: ${schedules.length}件 -> ${platformIds.length}媒体`);
    
    const results: any[] = [];
    
    for (const platformId of platformIds) {
      const startTime = Date.now();
      
      try {
        const platform = await getDecryptedPlatformCredentials(platformId);
        
        console.log(`  → ${platform.name} に配信中...`);
        
        let success = false;
        let errorMessage = null;
        
        switch (platform.name) {
          case 'シティヘブンネット':
            const loginSuccess = await heavenNetService.login({
              username: platform.login_id,
              password: platform.login_password
            });
            
            if (loginSuccess) {
              success = await heavenNetService.updateSchedule(schedules);
              await heavenNetService.logout();
              await heavenNetService.close();
            }
            break;
          
          default:
            errorMessage = `未対応の媒体: ${platform.name}`;
            break;
        }
        
        const executionTime = Date.now() - startTime;
        
        await pool.query(`
          INSERT INTO distribution_logs (
            platform_id, distribution_type, status,
            error_message, execution_time, metadata
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          platformId,
          'schedule',
          success ? '成功' : '失敗',
          errorMessage,
          executionTime,
          JSON.stringify({ schedules })
        ]);
        
        results.push({
          platformId,
          platformName: platform.name,
          success,
          errorMessage,
          executionTime
        });
        
      } catch (error: any) {
        const executionTime = Date.now() - startTime;
        
        await pool.query(`
          INSERT INTO distribution_logs (
            platform_id, distribution_type, status,
            error_message, execution_time
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          platformId,
          'schedule',
          '失敗',
          error.message,
          executionTime
        ]);
        
        results.push({
          platformId,
          success: false,
          errorMessage: error.message,
          executionTime
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    res.json({
      success: true,
      message: `${successCount}/${results.length}媒体に配信しました`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failure: results.length - successCount
      }
    });
    
  } catch (error: any) {
    console.error('スケジュール配信エラー:', error);
    res.status(500).json({ 
      error: 'スケジュールの配信に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * 写メ日記を指定媒体に配信
 */
export const distributeDiary = async (req: Request, res: Response) => {
  try {
    const { castId, title, content, images, platformIds } = req.body;
    
    if (!castId || !title || !content || !platformIds || platformIds.length === 0) {
      return res.status(400).json({ 
        error: 'キャストID、タイトル、本文、配信先媒体IDは必須です' 
      });
    }
    
    console.log(`📸 写メ日記配信開始: "${title}" -> ${platformIds.length}媒体`);
    
    const results: any[] = [];
    
    for (const platformId of platformIds) {
      const startTime = Date.now();
      
      try {
        const platform = await getDecryptedPlatformCredentials(platformId);
        
        console.log(`  → ${platform.name} に配信中...`);
        
        let success = false;
        let errorMessage = null;
        
        switch (platform.name) {
          case 'シティヘブンネット':
            const loginSuccess = await heavenNetService.login({
              username: platform.login_id,
              password: platform.login_password
            });
            
            if (loginSuccess) {
              success = await heavenNetService.postDiary(castId, title, content, images);
              await heavenNetService.logout();
              await heavenNetService.close();
            }
            break;
          
          default:
            errorMessage = `未対応の媒体: ${platform.name}`;
            break;
        }
        
        const executionTime = Date.now() - startTime;
        
        await pool.query(`
          INSERT INTO distribution_logs (
            platform_id, cast_id, distribution_type, status,
            error_message, execution_time, metadata
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          platformId,
          castId,
          'diary',
          success ? '成功' : '失敗',
          errorMessage,
          executionTime,
          JSON.stringify({ title, content, images })
        ]);
        
        results.push({
          platformId,
          platformName: platform.name,
          success,
          errorMessage,
          executionTime
        });
        
      } catch (error: any) {
        const executionTime = Date.now() - startTime;
        
        await pool.query(`
          INSERT INTO distribution_logs (
            platform_id, cast_id, distribution_type, status,
            error_message, execution_time
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          platformId,
          castId,
          'diary',
          '失敗',
          error.message,
          executionTime
        ]);
        
        results.push({
          platformId,
          success: false,
          errorMessage: error.message,
          executionTime
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    res.json({
      success: true,
      message: `${successCount}/${results.length}媒体に配信しました`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failure: results.length - successCount
      }
    });
    
  } catch (error: any) {
    console.error('写メ日記配信エラー:', error);
    res.status(500).json({ 
      error: '写メ日記の配信に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * 一括配信（すべてのキャストを複数媒体に配信）
 */
export const bulkDistribute = async (req: Request, res: Response) => {
  try {
    const { platformIds, options = {} } = req.body;
    
    if (!platformIds || platformIds.length === 0) {
      return res.status(400).json({ error: '配信先媒体IDは必須です' });
    }
    
    console.log(`🚀 一括配信開始 -> ${platformIds.length}媒体`);
    
    // すべてのアクティブなキャストを取得
    const [casts]: any = await pool.query(
      'SELECT * FROM casts WHERE is_active = 1'
    );
    
    console.log(`  📊 対象キャスト: ${casts.length}人`);
    
    const results = {
      total_casts: casts.length,
      total_platforms: platformIds.length,
      success: 0,
      failure: 0,
      details: []
    };
    
    // 各キャストを各媒体に配信
    for (const cast of casts) {
      console.log(`  処理中: ${cast.name}`);
      
      for (const platformId of platformIds) {
        try {
          const platform = await getDecryptedPlatformCredentials(platformId);
          
          let success = false;
          
          switch (platform.name) {
            case 'シティヘブンネット':
              const loginSuccess = await heavenNetService.login({
                username: platform.login_id,
                password: platform.login_password
              });
              
              if (loginSuccess) {
                success = await heavenNetService.updateCastInfo({
                  id: cast.id,
                  name: cast.name,
                  age: cast.age,
                  height: cast.height,
                  bust: cast.bust,
                  waist: cast.waist,
                  hip: cast.hip,
                  cup: cast.cup,
                  comment: cast.shop_comment || ''
                });
                
                await heavenNetService.logout();
                await heavenNetService.close();
              }
              break;
          }
          
          if (success) {
            results.success++;
          } else {
            results.failure++;
          }
          
          await pool.query(`
            INSERT INTO distribution_logs (
              platform_id, cast_id, distribution_type, status
            ) VALUES (?, ?, ?, ?)
          `, [platformId, cast.id, 'bulk_cast_info', success ? '成功' : '失敗']);
          
        } catch (error: any) {
          console.error(`    ❌ エラー: ${error.message}`);
          results.failure++;
        }
      }
    }
    
    console.log(`✅ 一括配信完了: ${results.success}成功 / ${results.failure}失敗`);
    
    res.json({
      success: true,
      message: '一括配信が完了しました',
      results
    });
    
  } catch (error: any) {
    console.error('一括配信エラー:', error);
    res.status(500).json({ 
      error: '一括配信に失敗しました', 
      details: error.message 
    });
  }
};
