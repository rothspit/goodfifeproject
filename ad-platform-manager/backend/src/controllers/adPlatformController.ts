import { Request, Response } from 'express';
import { pool } from '../config/database';
import crypto from 'crypto';

// パスワード暗号化設定
const algorithm = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-32-characters!!';
const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

/**
 * パスワードを暗号化
 */
function encryptPassword(password: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * パスワードを復号化
 */
function decryptPassword(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * 広告媒体一覧取得
 */
export const getAllPlatforms = async (req: Request, res: Response) => {
  try {
    const { category, is_active } = req.query;
    
    let query = 'SELECT * FROM ad_platforms WHERE 1=1';
    const params: any[] = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY category, name';
    
    const [platforms]: any = await pool.query(query, params);
    
    // パスワードを復号化（フロントエンドには送らない）
    const safePlatforms = platforms.map((p: any) => ({
      ...p,
      login_password: '********', // セキュリティのためマスク
    }));
    
    res.json({
      success: true,
      platforms: safePlatforms,
      count: platforms.length
    });
  } catch (error: any) {
    console.error('媒体一覧取得エラー:', error);
    res.status(500).json({ error: '媒体一覧の取得に失敗しました', details: error.message });
  }
};

/**
 * 広告媒体詳細取得
 */
export const getPlatformById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [platforms]: any = await pool.query(
      'SELECT * FROM ad_platforms WHERE id = ?',
      [id]
    );
    
    if (platforms.length === 0) {
      return res.status(404).json({ error: '媒体が見つかりません' });
    }
    
    const platform = platforms[0];
    
    // パスワードをマスク
    platform.login_password = '********';
    
    res.json({
      success: true,
      platform
    });
  } catch (error: any) {
    console.error('媒体詳細取得エラー:', error);
    res.status(500).json({ error: '媒体詳細の取得に失敗しました', details: error.message });
  }
};

/**
 * 広告媒体追加
 */
export const createPlatform = async (req: Request, res: Response) => {
  try {
    const {
      name, category, url, login_id, login_password,
      connection_type, api_endpoint, api_key, api_secret,
      ftp_host, ftp_port, ftp_username, ftp_password,
      is_active, settings
    } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({ error: '媒体名とカテゴリは必須です' });
    }
    
    // パスワードを暗号化
    const encryptedPassword = login_password ? encryptPassword(login_password) : null;
    const encryptedFtpPassword = ftp_password ? encryptPassword(ftp_password) : null;
    
    const [result]: any = await pool.query(`
      INSERT INTO ad_platforms (
        name, category, url, login_id, login_password,
        connection_type, api_endpoint, api_key, api_secret,
        ftp_host, ftp_port, ftp_username, ftp_password,
        is_active, settings
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, category, url, login_id, encryptedPassword,
      connection_type || 'WEB', api_endpoint, api_key, api_secret,
      ftp_host, ftp_port, ftp_username, encryptedFtpPassword,
      is_active !== undefined ? is_active : 1,
      settings ? JSON.stringify(settings) : null
    ]);
    
    res.json({
      success: true,
      message: '媒体を追加しました',
      platform_id: result.insertId
    });
  } catch (error: any) {
    console.error('媒体追加エラー:', error);
    res.status(500).json({ error: '媒体の追加に失敗しました', details: error.message });
  }
};

/**
 * 広告媒体更新
 */
export const updatePlatform = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name, category, url, login_id, login_password,
      connection_type, api_endpoint, api_key, api_secret,
      ftp_host, ftp_port, ftp_username, ftp_password,
      is_active, settings
    } = req.body;
    
    // 既存データを確認
    const [existing]: any = await pool.query(
      'SELECT id FROM ad_platforms WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: '媒体が見つかりません' });
    }
    
    // パスワードが変更されている場合のみ暗号化
    let encryptedPassword = null;
    if (login_password && login_password !== '********') {
      encryptedPassword = encryptPassword(login_password);
    }
    
    let encryptedFtpPassword = null;
    if (ftp_password && ftp_password !== '********') {
      encryptedFtpPassword = encryptPassword(ftp_password);
    }
    
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(category);
    }
    if (url !== undefined) {
      updateFields.push('url = ?');
      updateValues.push(url);
    }
    if (login_id !== undefined) {
      updateFields.push('login_id = ?');
      updateValues.push(login_id);
    }
    if (encryptedPassword) {
      updateFields.push('login_password = ?');
      updateValues.push(encryptedPassword);
    }
    if (connection_type !== undefined) {
      updateFields.push('connection_type = ?');
      updateValues.push(connection_type);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active ? 1 : 0);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: '更新するフィールドがありません' });
    }
    
    updateValues.push(id);
    
    await pool.query(
      `UPDATE ad_platforms SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    res.json({
      success: true,
      message: '媒体情報を更新しました'
    });
  } catch (error: any) {
    console.error('媒体更新エラー:', error);
    res.status(500).json({ error: '媒体の更新に失敗しました', details: error.message });
  }
};

/**
 * 広告媒体削除
 */
export const deletePlatform = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [result]: any = await pool.query(
      'DELETE FROM ad_platforms WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '媒体が見つかりません' });
    }
    
    res.json({
      success: true,
      message: '媒体を削除しました'
    });
  } catch (error: any) {
    console.error('媒体削除エラー:', error);
    res.status(500).json({ error: '媒体の削除に失敗しました', details: error.message });
  }
};

/**
 * 配信ログ一覧取得
 */
export const getDistributionLogs = async (req: Request, res: Response) => {
  try {
    const { platform_id, cast_id, status, limit = 100 } = req.query;
    
    let query = `
      SELECT 
        dl.*,
        ap.name as platform_name,
        c.name as cast_name
      FROM distribution_logs dl
      LEFT JOIN ad_platforms ap ON dl.platform_id = ap.id
      LEFT JOIN casts c ON dl.cast_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (platform_id) {
      query += ' AND dl.platform_id = ?';
      params.push(platform_id);
    }
    
    if (cast_id) {
      query += ' AND dl.cast_id = ?';
      params.push(cast_id);
    }
    
    if (status) {
      query += ' AND dl.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY dl.created_at DESC LIMIT ?';
    params.push(parseInt(limit as string));
    
    const [logs]: any = await pool.query(query, params);
    
    res.json({
      success: true,
      logs,
      count: logs.length
    });
  } catch (error: any) {
    console.error('配信ログ取得エラー:', error);
    res.status(500).json({ error: '配信ログの取得に失敗しました', details: error.message });
  }
};

/**
 * 配信ログ統計取得
 */
export const getDistributionStatistics = async (req: Request, res: Response) => {
  try {
    const [stats]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN status = '成功' THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN status = '失敗' THEN 1 ELSE 0 END) as failure_count,
        SUM(CASE WHEN status = '処理中' THEN 1 ELSE 0 END) as processing_count,
        AVG(execution_time) as avg_execution_time
      FROM distribution_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    
    const [platformStats]: any = await pool.query(`
      SELECT 
        ap.name as platform_name,
        COUNT(*) as count,
        SUM(CASE WHEN dl.status = '成功' THEN 1 ELSE 0 END) as success_count
      FROM distribution_logs dl
      JOIN ad_platforms ap ON dl.platform_id = ap.id
      WHERE dl.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY ap.id, ap.name
      ORDER BY count DESC
    `);
    
    res.json({
      success: true,
      overall: stats[0],
      by_platform: platformStats
    });
  } catch (error: any) {
    console.error('統計取得エラー:', error);
    res.status(500).json({ error: '統計情報の取得に失敗しました', details: error.message });
  }
};

/**
 * パスワード復号化（内部使用）
 */
export async function getDecryptedPlatformCredentials(platformId: number) {
  try {
    const [platforms]: any = await pool.query(
      'SELECT * FROM ad_platforms WHERE id = ?',
      [platformId]
    );
    
    if (platforms.length === 0) {
      throw new Error('媒体が見つかりません');
    }
    
    const platform = platforms[0];
    
    // パスワードを復号化
    if (platform.login_password) {
      platform.login_password = decryptPassword(platform.login_password);
    }
    if (platform.ftp_password) {
      platform.ftp_password = decryptPassword(platform.ftp_password);
    }
    
    return platform;
  } catch (error) {
    console.error('認証情報取得エラー:', error);
    throw error;
  }
}
