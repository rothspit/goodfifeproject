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
