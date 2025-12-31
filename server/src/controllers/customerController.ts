import { Request, Response } from 'express';
import db from '../config/database';

// ユーザーのポイント情報取得
export const getUserPoints = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  db.get(
    'SELECT * FROM user_points WHERE user_id = ?',
    [userId],
    (err, row) => {
      if (err) {
        console.error('ポイント取得エラー:', err);
        return res.status(500).json({ error: 'ポイント情報の取得に失敗しました' });
      }

      if (!row) {
        // ポイントアカウントが存在しない場合は作成
        db.run(
          'INSERT INTO user_points (user_id, points, total_earned, total_used) VALUES (?, 0, 0, 0)',
          [userId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'ポイントアカウントの作成に失敗しました' });
            }
            return res.json({
              points: { user_id: userId, points: 0, total_earned: 0, total_used: 0 }
            });
          }
        );
      } else {
        res.json({ points: row });
      }
    }
  );
};

// ポイント履歴取得
export const getPointHistory = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { limit = 20, offset = 0 } = req.query;

  if (!userId) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  db.all(
    `SELECT * FROM point_history 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [userId, limit, offset],
    (err, rows) => {
      if (err) {
        console.error('ポイント履歴取得エラー:', err);
        return res.status(500).json({ error: 'ポイント履歴の取得に失敗しました' });
      }
      res.json({ history: rows || [] });
    }
  );
};

// 利用履歴取得
export const getReservationHistory = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { limit = 20, offset = 0 } = req.query;

  if (!userId) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  db.all(
    `SELECT 
      r.*,
      c.name as cast_name,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
     FROM reservations r
     LEFT JOIN casts c ON r.cast_id = c.id
     WHERE r.user_id = ?
     ORDER BY r.reservation_date DESC, r.start_time DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset],
    (err, rows) => {
      if (err) {
        console.error('利用履歴取得エラー:', err);
        return res.status(500).json({ error: '利用履歴の取得に失敗しました' });
      }
      res.json({ reservations: rows || [] });
    }
  );
};

// お気に入り一覧取得
export const getFavorites = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  db.all(
    `SELECT 
      f.*,
      c.name as cast_name,
      c.age as cast_age,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image,
      c.height,
      c.bust,
      c.waist,
      c.hip,
      COALESCE(AVG(rev.rating), 0) as avg_rating,
      COUNT(DISTINCT rev.id) as review_count
     FROM favorites f
     LEFT JOIN casts c ON f.cast_id = c.id
     LEFT JOIN reviews rev ON c.id = rev.cast_id
     WHERE f.user_id = ?
     GROUP BY f.id
     ORDER BY f.created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('お気に入り取得エラー:', err);
        return res.status(500).json({ error: 'お気に入りの取得に失敗しました' });
      }
      res.json({ favorites: rows || [] });
    }
  );
};

// お気に入り追加
export const addFavorite = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { cast_id } = req.body;

  if (!userId) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  if (!cast_id) {
    return res.status(400).json({ error: 'キャストIDが必要です' });
  }

  db.run(
    'INSERT OR IGNORE INTO favorites (user_id, cast_id) VALUES (?, ?)',
    [userId, cast_id],
    function(err) {
      if (err) {
        console.error('お気に入り追加エラー:', err);
        return res.status(500).json({ error: 'お気に入りの追加に失敗しました' });
      }
      res.json({ message: 'お気に入りに追加しました', id: this.lastID });
    }
  );
};

// お気に入り削除
export const removeFavorite = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { cast_id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  db.run(
    'DELETE FROM favorites WHERE user_id = ? AND cast_id = ?',
    [userId, cast_id],
    function(err) {
      if (err) {
        console.error('お気に入り削除エラー:', err);
        return res.status(500).json({ error: 'お気に入りの削除に失敗しました' });
      }
      res.json({ message: 'お気に入りから削除しました' });
    }
  );
};

// キャストアピール一覧取得
export const getCastAppeals = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  db.all(
    `SELECT 
      ca.*,
      c.name as cast_name,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
     FROM cast_appeals ca
     LEFT JOIN casts c ON ca.cast_id = c.id
     WHERE ca.user_id = ?
     ORDER BY ca.created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('アピール取得エラー:', err);
        return res.status(500).json({ error: 'アピールの取得に失敗しました' });
      }
      res.json({ appeals: rows || [] });
    }
  );
};

// アピール既読にする
export const markAppealAsRead = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  db.run(
    'UPDATE cast_appeals SET is_read = 1 WHERE id = ? AND user_id = ?',
    [id, userId],
    function(err) {
      if (err) {
        console.error('アピール既読エラー:', err);
        return res.status(500).json({ error: 'アピールの既読化に失敗しました' });
      }
      res.json({ message: 'アピールを既読にしました' });
    }
  );
};

// メルマガ購読状態取得
export const getNewsletterStatus = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  db.get(
    'SELECT * FROM newsletter_subscriptions WHERE user_id = ?',
    [userId],
    (err, row) => {
      if (err) {
        console.error('メルマガ状態取得エラー:', err);
        return res.status(500).json({ error: 'メルマガ状態の取得に失敗しました' });
      }

      if (!row) {
        // 購読レコードが存在しない場合は作成
        db.run(
          'INSERT INTO newsletter_subscriptions (user_id, is_subscribed) VALUES (?, 1)',
          [userId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'メルマガ購読レコードの作成に失敗しました' });
            }
            return res.json({ newsletter: { user_id: userId, is_subscribed: true } });
          }
        );
      } else {
        res.json({ newsletter: row });
      }
    }
  );
};

// メルマガ購読状態更新
export const updateNewsletterStatus = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { is_subscribed } = req.body;

  if (!userId) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  db.run(
    'INSERT OR REPLACE INTO newsletter_subscriptions (user_id, is_subscribed, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    [userId, is_subscribed ? 1 : 0],
    function(err) {
      if (err) {
        console.error('メルマガ状態更新エラー:', err);
        return res.status(500).json({ error: 'メルマガ購読状態の更新に失敗しました' });
      }
      res.json({ message: 'メルマガ購読状態を更新しました', is_subscribed });
    }
  );
};

// ランキング取得（評価の高いキャスト）
export const getRanking = (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  db.all(
    `SELECT 
      c.*,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT r.id) as review_count,
      COUNT(DISTINCT res.id) as reservation_count
     FROM casts c
     LEFT JOIN reviews r ON c.id = r.cast_id AND r.status = 'approved'
     LEFT JOIN reservations res ON c.id = res.cast_id
     WHERE c.status = 'available'
     GROUP BY c.id
     HAVING review_count > 0
     ORDER BY avg_rating DESC, review_count DESC
     LIMIT ?`,
    [limit],
    (err, rows) => {
      if (err) {
        console.error('ランキング取得エラー:', err);
        return res.status(500).json({ error: 'ランキングの取得に失敗しました' });
      }
      res.json({ ranking: rows || [] });
    }
  );
};

// チャット承認リクエスト送信
export const requestChatApproval = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { cast_id } = req.body;

  if (!userId) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  if (!cast_id) {
    return res.status(400).json({ error: 'キャストIDが必要です' });
  }

  db.run(
    'INSERT OR REPLACE INTO chat_approvals (cast_id, user_id, status) VALUES (?, ?, "pending")',
    [cast_id, userId],
    function(err) {
      if (err) {
        console.error('チャット承認リクエストエラー:', err);
        return res.status(500).json({ error: 'チャット承認リクエストの送信に失敗しました' });
      }
      res.json({ message: 'チャット承認リクエストを送信しました' });
    }
  );
};

// チャット承認状態取得
export const getChatApprovalStatus = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { cast_id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  db.get(
    'SELECT * FROM chat_approvals WHERE user_id = ? AND cast_id = ?',
    [userId, cast_id],
    (err, row) => {
      if (err) {
        console.error('チャット承認状態取得エラー:', err);
        return res.status(500).json({ error: 'チャット承認状態の取得に失敗しました' });
      }
      res.json({ approval: row || { status: 'none' } });
    }
  );
};
