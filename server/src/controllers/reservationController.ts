import { Request, Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createReservation = (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const {
    cast_id,
    reservation_date,
    start_time,
    duration,
    course,
    total_price,
    special_requests,
  } = req.body;

  if (!cast_id || !reservation_date || !start_time || !duration || !course) {
    return res.status(400).json({ message: '必須項目を入力してください' });
  }

  // スケジュールの確認
  db.get(
    `SELECT * FROM cast_schedules 
    WHERE cast_id = ? AND date = ? AND start_time <= ? AND end_time >= ? AND is_available = 1`,
    [cast_id, reservation_date, start_time, start_time],
    (err, schedule) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      if (!schedule) {
        return res.status(400).json({ message: 'この時間帯は予約できません' });
      }

      // 予約の作成
      db.run(
        `INSERT INTO reservations 
        (user_id, cast_id, reservation_date, start_time, duration, course, total_price, special_requests, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, cast_id, reservation_date, start_time, duration, course, total_price, special_requests || null, 'pending'],
        function (err) {
          if (err) {
            console.error('予約作成エラー:', err);
            return res.status(500).json({ message: '予約に失敗しました' });
          }

          res.status(201).json({
            message: '予約が完了しました',
            reservation_id: this.lastID,
          });
        }
      );
    }
  );
};

export const getUserReservations = (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { status } = req.query;

  let query = `
    SELECT r.*, c.name as cast_name,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
    FROM reservations r
    INNER JOIN casts c ON r.cast_id = c.id
    WHERE r.user_id = ?
  `;

  const params: any[] = [userId];

  if (status) {
    query += ' AND r.status = ?';
    params.push(status);
  }

  query += ' ORDER BY r.reservation_date DESC, r.start_time DESC';

  db.all(query, params, (err, reservations) => {
    if (err) {
      return res.status(500).json({ message: 'データベースエラー' });
    }

    res.json({ reservations });
  });
};

export const getReservationById = (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  db.get(
    `SELECT r.*, c.name as cast_name, c.age as cast_age, c.height as cast_height,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
    FROM reservations r
    INNER JOIN casts c ON r.cast_id = c.id
    WHERE r.id = ? AND r.user_id = ?`,
    [id, userId],
    (err, reservation) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      if (!reservation) {
        return res.status(404).json({ message: '予約が見つかりません' });
      }

      res.json({ reservation });
    }
  );
};

export const cancelReservation = (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  db.get(
    'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
    [id, userId],
    (err, reservation: any) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      if (!reservation) {
        return res.status(404).json({ message: '予約が見つかりません' });
      }

      if (reservation.status === 'cancelled') {
        return res.status(400).json({ message: 'この予約は既にキャンセルされています' });
      }

      if (reservation.status === 'completed') {
        return res.status(400).json({ message: '完了した予約はキャンセルできません' });
      }

      db.run(
        'UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['cancelled', id],
        (err) => {
          if (err) {
            return res.status(500).json({ message: 'キャンセルに失敗しました' });
          }

          res.json({ message: '予約をキャンセルしました' });
        }
      );
    }
  );
};
