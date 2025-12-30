import { Request, Response } from 'express';
import { db } from '../config/database';

// 全カテゴリのランキング取得（公開用）
export const getAllRankings = async (req: Request, res: Response) => {
  try {
    const { store_id } = req.query;
    const categories = ['overall', 'newcomer', 'popularity', 'review'];
    const result: any = {};

    for (const category of categories) {
      const params: any[] = [category];
      let whereClause = 'WHERE r.category = ? AND r.is_active = 1';
      
      if (store_id) {
        whereClause += ' AND c.store_id = ?';
        params.push(store_id);
      }

      const rankings = await new Promise((resolve, reject) => {
        db.all(
          `SELECT 
            r.id,
            r.cast_id,
            r.category,
            r.rank_position,
            r.points,
            r.period_start,
            r.period_end,
            c.name as cast_name,
            c.age as cast_age,
            (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image,
            c.height as cast_height,
            c.bust as cast_bust,
            c.waist as cast_waist,
            c.hip as cast_hip
          FROM rankings r
          LEFT JOIN casts c ON r.cast_id = c.id
          ${whereClause}
          ORDER BY r.rank_position ASC
          LIMIT 10`,
          params,
          (err: any, rows: any) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
      result[category] = rankings;
    }

    res.json({
      success: true,
      rankings: result,
    });
  } catch (error) {
    console.error('ランキング取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'ランキングの取得に失敗しました',
    });
  }
};

// 特定カテゴリのランキング取得（公開用）
export const getRankingByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    const rankings = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          r.id,
          r.cast_id,
          r.category,
          r.rank_position,
          r.points,
          r.period_start,
          r.period_end,
          c.name as cast_name,
          c.age as cast_age,
          (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image,
          c.height as cast_height,
          c.bust as cast_bust,
          c.waist as cast_waist,
          c.hip as cast_hip
        FROM rankings r
        LEFT JOIN casts c ON r.cast_id = c.id
        WHERE r.category = ? AND r.is_active = 1
        ORDER BY r.rank_position ASC`,
        [category],
        (err: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      success: true,
      category,
      rankings,
    });
  } catch (error) {
    console.error('カテゴリ別ランキング取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'ランキングの取得に失敗しました',
    });
  }
};

// ランキングカテゴリ一覧取得
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM ranking_categories WHERE is_active = 1 ORDER BY display_order ASC`,
        [],
        (err: any, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('カテゴリ取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'カテゴリの取得に失敗しました',
    });
  }
};

// 管理用：全ランキング取得
export const getAdminRankings = async (req: Request, res: Response) => {
  try {
    const { category, period } = req.query;
    
    let query = `
      SELECT 
        r.id,
        r.cast_id,
        r.category,
        r.rank_position,
        r.points,
        r.period_start,
        r.period_end,
        r.is_active,
        r.created_at,
        r.updated_at,
        c.name as cast_name,
        c.age as cast_age,
        (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
      FROM rankings r
      LEFT JOIN casts c ON r.cast_id = c.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (category) {
      query += ` AND r.category = ?`;
      params.push(category);
    }
    
    if (period) {
      query += ` AND r.period_start = ?`;
      params.push(period);
    }
    
    query += ` ORDER BY r.category, r.rank_position ASC`;

    const rankings = await new Promise((resolve, reject) => {
      db.all(query, params, (err: any, rows: any) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      rankings,
    });
  } catch (error) {
    console.error('管理用ランキング取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'ランキングの取得に失敗しました',
    });
  }
};

// 管理用：ランキング作成
export const createRanking = async (req: Request, res: Response) => {
  try {
    const { cast_id, category, rank_position, points, period_start, period_end } = req.body;

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO rankings (cast_id, category, rank_position, points, period_start, period_end, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [cast_id, category, rank_position, points || 0, period_start, period_end],
        function (this: any, err: any) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.json({
      success: true,
      message: 'ランキングを作成しました',
    });
  } catch (error) {
    console.error('ランキング作成エラー:', error);
    res.status(500).json({
      success: false,
      message: 'ランキングの作成に失敗しました',
    });
  }
};

// 管理用：ランキング更新
export const updateRanking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rank_position, points, is_active } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (rank_position !== undefined) {
      updates.push('rank_position = ?');
      params.push(rank_position);
    }
    if (points !== undefined) {
      updates.push('points = ?');
      params.push(points);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE rankings SET ${updates.join(', ')} WHERE id = ?`,
        params,
        (err: any) => {
          if (err) reject(err);
          else resolve(null);
        }
      );
    });

    res.json({
      success: true,
      message: 'ランキングを更新しました',
    });
  } catch (error) {
    console.error('ランキング更新エラー:', error);
    res.status(500).json({
      success: false,
      message: 'ランキングの更新に失敗しました',
    });
  }
};

// 管理用：ランキング削除
export const deleteRanking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM rankings WHERE id = ?', [id], (err: any) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    res.json({
      success: true,
      message: 'ランキングを削除しました',
    });
  } catch (error) {
    console.error('ランキング削除エラー:', error);
    res.status(500).json({
      success: false,
      message: 'ランキングの削除に失敗しました',
    });
  }
};
