import { Request, Response } from 'express';
import db from '../config/database';

// ポイント付与（利用履歴に金額入力時）
export const earnPoints = (req: Request, res: Response) => {
  const { reservation_id, actual_payment } = req.body;
  const adminId = (req as any).user?.id;

  if (!reservation_id || !actual_payment) {
    return res.status(400).json({ message: '予約IDと支払い金額は必須です' });
  }

  // 5%のポイント計算
  const pointsEarned = Math.floor(actual_payment * 0.05);

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // 予約情報を取得
    db.get(
      'SELECT * FROM reservations WHERE id = ?',
      [reservation_id],
      (err, reservation: any) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ message: 'データベースエラー' });
        }

        if (!reservation) {
          db.run('ROLLBACK');
          return res.status(404).json({ message: '予約が見つかりません' });
        }

        // 予約を更新（実際の支払い金額と獲得ポイント）
        db.run(
          `UPDATE reservations 
           SET actual_payment = ?, points_earned = ?, status = 'completed'
           WHERE id = ?`,
          [actual_payment, pointsEarned, reservation_id],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ message: '予約更新に失敗しました' });
            }

            // user_pointsテーブルを更新
            db.run(
              `INSERT INTO user_points (user_id, points, total_earned, total_used)
               VALUES (?, ?, ?, 0)
               ON CONFLICT(user_id) DO UPDATE SET
                 points = points + ?,
                 total_earned = total_earned + ?`,
              [reservation.user_id, pointsEarned, pointsEarned, pointsEarned, pointsEarned],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ message: 'ポイント更新に失敗しました' });
                }

                // point_historyに記録
                db.run(
                  `INSERT INTO point_history (user_id, points, type, description, reservation_id, admin_id)
                   VALUES (?, ?, 'earn', ?, ?, ?)`,
                  [
                    reservation.user_id,
                    pointsEarned,
                    `利用金額 ¥${actual_payment.toLocaleString()} の5%ポイント付与`,
                    reservation_id,
                    adminId || null,
                  ],
                  (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      return res.status(500).json({ message: '履歴記録に失敗しました' });
                    }

                    db.run('COMMIT');
                    res.json({
                      success: true,
                      message: 'ポイントを付与しました',
                      points_earned: pointsEarned,
                      actual_payment,
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

// ポイント使用（管理者による手動使用 or システムによる自動使用）
export const usePoints = (req: Request, res: Response) => {
  const { user_id, points_to_use, reservation_id, use_type = 'manual' } = req.body;
  const adminId = (req as any).user?.id;

  if (!user_id || !points_to_use) {
    return res.status(400).json({ message: 'ユーザーIDと使用ポイントは必須です' });
  }

  // 1000ポイント単位チェック
  if (points_to_use % 1000 !== 0) {
    return res.status(400).json({ message: 'ポイントは1000ポイント単位でのみ使用できます' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // 現在のポイント残高を確認
    db.get(
      'SELECT * FROM user_points WHERE user_id = ?',
      [user_id],
      (err, userPoints: any) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ message: 'データベースエラー' });
        }

        if (!userPoints) {
          db.run('ROLLBACK');
          return res.status(404).json({ message: 'ポイント情報が見つかりません' });
        }

        if (userPoints.points < points_to_use) {
          db.run('ROLLBACK');
          return res.status(400).json({
            message: 'ポイント残高が不足しています',
            current_points: userPoints.points,
            required_points: points_to_use,
          });
        }

        // ポイントを使用
        db.run(
          `UPDATE user_points 
           SET points = points - ?, total_used = total_used + ?
           WHERE user_id = ?`,
          [points_to_use, points_to_use, user_id],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ message: 'ポイント使用に失敗しました' });
            }

            // 予約がある場合は予約を更新
            if (reservation_id) {
              db.run(
                `UPDATE reservations 
                 SET points_used = points_used + ?
                 WHERE id = ?`,
                [points_to_use, reservation_id],
                (err) => {
                  if (err) {
                    console.error('予約更新エラー:', err);
                  }
                }
              );
            }

            // point_historyに記録
            const description =
              use_type === 'manual'
                ? `管理者によるポイント使用 (${points_to_use}pt)`
                : `システムによるポイント使用 (${points_to_use}pt)`;

            db.run(
              `INSERT INTO point_history (user_id, points, type, description, reservation_id, admin_id)
               VALUES (?, ?, 'use', ?, ?, ?)`,
              [user_id, -points_to_use, description, reservation_id || null, adminId || null],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ message: '履歴記録に失敗しました' });
                }

                db.run('COMMIT');

                // 更新後のポイント残高を取得
                db.get(
                  'SELECT points FROM user_points WHERE user_id = ?',
                  [user_id],
                  (err, result: any) => {
                    res.json({
                      success: true,
                      message: 'ポイントを使用しました',
                      points_used: points_to_use,
                      remaining_points: result?.points || 0,
                      use_type,
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

// ポイント残高確認
export const checkPointBalance = (req: Request, res: Response) => {
  const { user_id } = req.params;

  db.get(
    'SELECT * FROM user_points WHERE user_id = ?',
    [user_id],
    (err, userPoints: any) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      if (!userPoints) {
        return res.json({
          user_id: parseInt(user_id),
          points: 0,
          total_earned: 0,
          total_used: 0,
          usable_units: 0, // 使用可能な1000ポイント単位の数
        });
      }

      res.json({
        ...userPoints,
        usable_units: Math.floor(userPoints.points / 1000), // 使用可能な1000ポイント単位
      });
    }
  );
};

// ポイント履歴取得
export const getPointHistory = (req: Request, res: Response) => {
  const { user_id } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  db.all(
    `SELECT ph.*, u.name as admin_name
     FROM point_history ph
     LEFT JOIN users u ON ph.admin_id = u.id
     WHERE ph.user_id = ?
     ORDER BY ph.created_at DESC
     LIMIT ? OFFSET ?`,
    [user_id, limit, offset],
    (err, history) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      res.json({
        history,
        limit: Number(limit),
        offset: Number(offset),
      });
    }
  );
};

// 管理者用：全ユーザーのポイント一覧
export const getAllUserPoints = (req: Request, res: Response) => {
  const { limit = 50, offset = 0 } = req.query;

  db.all(
    `SELECT up.*, u.name, u.phone_number
     FROM user_points up
     LEFT JOIN users u ON up.user_id = u.id
     ORDER BY up.points DESC
     LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, users) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      res.json({
        users,
        limit: Number(limit),
        offset: Number(offset),
      });
    }
  );
};
