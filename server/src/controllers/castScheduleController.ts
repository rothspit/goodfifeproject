import { Request, Response } from 'express';
import { db } from '../config/database';

// キャストのスケジュール取得
export const getCastSchedules = async (req: Request, res: Response) => {
  try {
    const castId = (req as any).userId; // 認証ミドルウェアから取得
    const { startDate, endDate } = req.query;

    let query = `
      SELECT * FROM cast_schedules 
      WHERE cast_id = ?
    `;
    const params: any[] = [castId];

    if (startDate && endDate) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY date ASC, start_time ASC';

    const schedules = await db.all(query, params);
    
    res.json({
      success: true,
      schedules,
    });
  } catch (error) {
    console.error('スケジュール取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'スケジュールの取得に失敗しました',
    });
  }
};

// スケジュール追加
export const addCastSchedule = async (req: Request, res: Response) => {
  try {
    const castId = (req as any).userId;
    const { date, startTime, endTime } = req.body;

    // バリデーション
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: '日付、開始時間、終了時間は必須です',
      });
    }

    // 重複チェック
    const existingSchedule = await db.get(
      `SELECT * FROM cast_schedules 
       WHERE cast_id = ? AND date = ? 
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
      [castId, date, startTime, startTime, endTime, endTime]
    );

    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: '指定された時間帯は既に登録されています',
      });
    }

    // スケジュール登録
    const result: any = await db.run(
      `INSERT INTO cast_schedules (cast_id, date, start_time, end_time, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [castId, date, startTime, endTime]
    );

    res.json({
      success: true,
      message: '出勤申請を送信しました',
      schedule: {
        id: result.lastID,
        cast_id: castId,
        date,
        startTime,
        endTime,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('スケジュール追加エラー:', error);
    res.status(500).json({
      success: false,
      message: 'スケジュールの追加に失敗しました',
    });
  }
};

// スケジュール削除
export const deleteCastSchedule = async (req: Request, res: Response) => {
  try {
    const castId = (req as any).userId;
    const { id } = req.params;

    // スケジュールの所有者チェック
    const schedule: any = await db.get(
      'SELECT * FROM cast_schedules WHERE id = ? AND cast_id = ?',
      [id, castId]
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'スケジュールが見つかりません',
      });
    }

    // 承認済みのスケジュールは削除不可
    if (schedule.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: '承認済みのスケジュールは削除できません',
      });
    }

    await db.run('DELETE FROM cast_schedules WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'スケジュールを削除しました',
    });
  } catch (error) {
    console.error('スケジュール削除エラー:', error);
    res.status(500).json({
      success: false,
      message: 'スケジュールの削除に失敗しました',
    });
  }
};

// スケジュール更新
export const updateCastSchedule = async (req: Request, res: Response) => {
  try {
    const castId = (req as any).userId;
    const { id } = req.params;
    const { startTime, endTime } = req.body;

    // スケジュールの所有者チェック
    const schedule: any = await db.get(
      'SELECT * FROM cast_schedules WHERE id = ? AND cast_id = ?',
      [id, castId]
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'スケジュールが見つかりません',
      });
    }

    // 承認済みのスケジュールは更新不可
    if (schedule.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: '承認済みのスケジュールは変更できません',
      });
    }

    await db.run(
      `UPDATE cast_schedules 
       SET start_time = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [startTime, endTime, id]
    );

    res.json({
      success: true,
      message: 'スケジュールを更新しました',
    });
  } catch (error) {
    console.error('スケジュール更新エラー:', error);
    res.status(500).json({
      success: false,
      message: 'スケジュールの更新に失敗しました',
    });
  }
};

// キャストの統計情報取得
export const getCastStats = async (req: Request, res: Response) => {
  try {
    const castId = (req as any).userId;

    // お気に入り数
    const favoritesCount: any = await db.get(
      'SELECT COUNT(*) as count FROM favorites WHERE cast_id = ?',
      [castId]
    );

    // レビュー数と平均評価
    const reviewStats: any = await db.get(
      `SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as avg_rating 
       FROM reviews WHERE cast_id = ?`,
      [castId]
    );

    // ランキング（仮実装）
    const rankingPosition = 3; // 実際はランキングテーブルから取得

    res.json({
      success: true,
      stats: {
        favoritesCount: favoritesCount?.count || 0,
        reviewCount: reviewStats?.count || 0,
        averageRating: reviewStats?.avg_rating ? parseFloat(reviewStats.avg_rating.toFixed(1)) : 0,
        rankingPosition,
      },
    });
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '統計情報の取得に失敗しました',
    });
  }
};
