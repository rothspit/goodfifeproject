import { Request, Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createReview = (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { cast_id, reservation_id, rating, comment } = req.body;

  if (!cast_id || !rating) {
    return res.status(400).json({ message: 'キャストと評価は必須です' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: '評価は1〜5の範囲で入力してください' });
  }

  // 予約IDが指定されている場合、その予約が存在し、完了済みか確認
  if (reservation_id) {
    db.get(
      'SELECT * FROM reservations WHERE id = ? AND user_id = ? AND status = ?',
      [reservation_id, userId, 'completed'],
      (err, reservation) => {
        if (err) {
          return res.status(500).json({ message: 'データベースエラー' });
        }

        if (!reservation) {
          return res.status(400).json({ message: '完了した予約のみレビュー可能です' });
        }

        // レビューの作成
        insertReview();
      }
    );
  } else {
    insertReview();
  }

  function insertReview() {
    db.run(
      'INSERT INTO reviews (user_id, cast_id, reservation_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [userId, cast_id, reservation_id || null, rating, comment || null],
      function (err) {
        if (err) {
          console.error('レビュー作成エラー:', err);
          return res.status(500).json({ message: 'レビューの投稿に失敗しました' });
        }

        res.status(201).json({
          message: 'レビューを投稿しました',
          review_id: this.lastID,
        });
      }
    );
  }
};

export const getCastReviews = (req: Request, res: Response) => {
  const { cast_id } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  db.all(
    `SELECT r.*, u.name as user_name 
    FROM reviews r 
    LEFT JOIN users u ON r.user_id = u.id 
    WHERE r.cast_id = ? 
    ORDER BY r.created_at DESC 
    LIMIT ? OFFSET ?`,
    [cast_id, limit, offset],
    (err, reviews) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      // 総数を取得
      db.get(
        'SELECT COUNT(*) as total FROM reviews WHERE cast_id = ?',
        [cast_id],
        (err, result: any) => {
          if (err) {
            return res.status(500).json({ message: 'データベースエラー' });
          }

          res.json({
            reviews,
            total: result.total,
            limit: Number(limit),
            offset: Number(offset),
          });
        }
      );
    }
  );
};

export const getRecentReviews = (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  db.all(
    `SELECT r.*, u.name as user_name, c.name as cast_name,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
    FROM reviews r 
    LEFT JOIN users u ON r.user_id = u.id 
    INNER JOIN casts c ON r.cast_id = c.id
    WHERE r.status = 'approved'
    ORDER BY r.created_at DESC 
    LIMIT ?`,
    [limit],
    (err, reviews) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      res.json({ reviews });
    }
  );
};

// ========================================
// 管理画面用機能
// ========================================

// 全レビューを取得（管理画面用）
export const getAllReviews = (req: Request, res: Response) => {
  const { cast_id, status, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT r.*, u.name as user_name, u.phone_number as user_phone, 
      c.name as cast_name,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
    FROM reviews r 
    LEFT JOIN users u ON r.user_id = u.id 
    INNER JOIN casts c ON r.cast_id = c.id
  `;

  const params: any[] = [];
  const conditions: string[] = [];

  if (cast_id) {
    conditions.push('r.cast_id = ?');
    params.push(cast_id);
  }

  if (status) {
    conditions.push('r.status = ?');
    params.push(status);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(query, params, (err, reviews) => {
    if (err) {
      console.error('レビュー取得エラー:', err);
      return res.status(500).json({ message: 'レビューの取得に失敗しました' });
    }

    // 総件数を取得
    let countQuery = 'SELECT COUNT(*) as total FROM reviews r';
    const countParams: any[] = [];

    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ').replace(/r\./g, '');
      if (cast_id) countParams.push(cast_id);
      if (status) countParams.push(status);
    }

    db.get(countQuery, countParams, (err, result: any) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      // ステータス別の集計
      db.all(
        `SELECT status, COUNT(*) as count FROM reviews GROUP BY status`,
        [],
        (err, stats) => {
          if (err) {
            console.error('ステータス集計エラー:', err);
          }

          res.json({
            reviews,
            total: result.total,
            stats: stats || [],
            limit: Number(limit),
            offset: Number(offset),
          });
        }
      );
    });
  });
};

// レビューのステータスを更新（承認・却下）
export const updateReviewStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: '無効なステータスです' });
  }

  db.run(
    `UPDATE reviews SET status = ? WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) {
        console.error('ステータス更新エラー:', err);
        return res.status(500).json({ message: 'ステータスの更新に失敗しました' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'レビューが見つかりません' });
      }

      res.json({
        success: true,
        message: `レビューを${status === 'approved' ? '承認' : status === 'rejected' ? '却下' : '保留'}しました`,
      });
    }
  );
};

// レビューを削除
export const deleteReview = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM reviews WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('レビュー削除エラー:', err);
      return res.status(500).json({ message: 'レビューの削除に失敗しました' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'レビューが見つかりません' });
    }

    res.json({
      success: true,
      message: 'レビューを削除しました',
    });
  });
};
