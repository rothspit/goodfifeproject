import { Request, Response } from 'express';
import db from '../config/database';

// 全チャットメッセージを取得（管理画面用）
export const getAllChatMessages = (req: Request, res: Response) => {
  const { user_id, cast_id, is_read, limit = 100, offset = 0 } = req.query;

  let query = `
    SELECT 
      cm.*,
      CASE 
        WHEN cm.sender_type = 'user' THEN u.name 
        WHEN cm.sender_type = 'cast' THEN c.name 
      END as sender_name,
      CASE 
        WHEN cm.receiver_type = 'user' THEN ru.name 
        WHEN cm.receiver_type = 'cast' THEN rc.name 
      END as receiver_name,
      CASE 
        WHEN cm.sender_type = 'user' THEN u.phone_number 
        ELSE NULL 
      END as sender_phone,
      CASE 
        WHEN cm.receiver_type = 'user' THEN ru.phone_number 
        ELSE NULL 
      END as receiver_phone
    FROM chat_messages cm
    LEFT JOIN users u ON cm.sender_type = 'user' AND cm.sender_id = u.id
    LEFT JOIN casts c ON cm.sender_type = 'cast' AND cm.sender_id = c.id
    LEFT JOIN users ru ON cm.receiver_type = 'user' AND cm.receiver_id = ru.id
    LEFT JOIN casts rc ON cm.receiver_type = 'cast' AND cm.receiver_id = rc.id
  `;

  const params: any[] = [];
  const conditions: string[] = [];

  if (user_id) {
    conditions.push('((cm.sender_type = ? AND cm.sender_id = ?) OR (cm.receiver_type = ? AND cm.receiver_id = ?))');
    params.push('user', user_id, 'user', user_id);
  }

  if (cast_id) {
    conditions.push('((cm.sender_type = ? AND cm.sender_id = ?) OR (cm.receiver_type = ? AND cm.receiver_id = ?))');
    params.push('cast', cast_id, 'cast', cast_id);
  }

  if (is_read !== undefined) {
    conditions.push('cm.is_read = ?');
    params.push(is_read === 'true' ? 1 : 0);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY cm.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(query, params, (err, messages) => {
    if (err) {
      console.error('チャット取得エラー:', err);
      return res.status(500).json({ message: 'チャットメッセージの取得に失敗しました' });
    }

    // 総件数を取得
    let countQuery = 'SELECT COUNT(*) as total FROM chat_messages cm';
    const countParams: any[] = [];

    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      if (user_id) countParams.push('user', user_id, 'user', user_id);
      if (cast_id) countParams.push('cast', cast_id, 'cast', cast_id);
      if (is_read !== undefined) countParams.push(is_read === 'true' ? 1 : 0);
    }

    db.get(countQuery, countParams, (err, result: any) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      // 統計を取得
      db.all(
        `SELECT 
          COUNT(*) as total_messages,
          SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_messages,
          COUNT(DISTINCT sender_id || '-' || sender_type) as unique_senders,
          COUNT(DISTINCT receiver_id || '-' || receiver_type) as unique_receivers
        FROM chat_messages`,
        [],
        (err, stats) => {
          if (err) {
            console.error('統計取得エラー:', err);
          }

          res.json({
            messages,
            total: result.total,
            stats: stats ? stats[0] : {},
            limit: Number(limit),
            offset: Number(offset),
          });
        }
      );
    });
  });
};

// チャットルーム一覧を取得（ユーザーとキャストのペア）
export const getChatRooms = (req: Request, res: Response) => {
  // まずユニークな組み合わせを取得
  const query = `
    WITH room_pairs AS (
      SELECT DISTINCT
        CASE 
          WHEN sender_type = 'user' AND receiver_type = 'cast' THEN sender_id
          WHEN sender_type = 'cast' AND receiver_type = 'user' THEN receiver_id
        END as user_id,
        CASE 
          WHEN sender_type = 'user' AND receiver_type = 'cast' THEN receiver_id
          WHEN sender_type = 'cast' AND receiver_type = 'user' THEN sender_id
        END as cast_id
      FROM chat_messages
      WHERE (sender_type = 'user' AND receiver_type = 'cast')
         OR (sender_type = 'cast' AND receiver_type = 'user')
    )
    SELECT 
      rp.user_id,
      rp.cast_id,
      u.name as user_name,
      u.phone_number as user_phone,
      c.name as cast_name,
      (SELECT COUNT(*) FROM chat_messages 
       WHERE ((sender_type = 'user' AND sender_id = rp.user_id AND receiver_type = 'cast' AND receiver_id = rp.cast_id)
          OR (sender_type = 'cast' AND sender_id = rp.cast_id AND receiver_type = 'user' AND receiver_id = rp.user_id))
      ) as message_count,
      (SELECT COUNT(*) FROM chat_messages 
       WHERE receiver_type = 'cast' AND receiver_id = rp.cast_id 
         AND sender_type = 'user' AND sender_id = rp.user_id 
         AND is_read = 0
      ) as unread_count,
      (SELECT message FROM chat_messages 
       WHERE ((sender_type = 'user' AND sender_id = rp.user_id AND receiver_type = 'cast' AND receiver_id = rp.cast_id)
          OR (sender_type = 'cast' AND sender_id = rp.cast_id AND receiver_type = 'user' AND receiver_id = rp.user_id))
       ORDER BY created_at DESC LIMIT 1
      ) as last_message,
      (SELECT created_at FROM chat_messages 
       WHERE ((sender_type = 'user' AND sender_id = rp.user_id AND receiver_type = 'cast' AND receiver_id = rp.cast_id)
          OR (sender_type = 'cast' AND sender_id = rp.cast_id AND receiver_type = 'user' AND receiver_id = rp.user_id))
       ORDER BY created_at DESC LIMIT 1
      ) as last_message_at
    FROM room_pairs rp
    LEFT JOIN users u ON rp.user_id = u.id
    LEFT JOIN casts c ON rp.cast_id = c.id
    ORDER BY last_message_at DESC
  `;

  db.all(query, [], (err, rooms) => {
    if (err) {
      console.error('チャットルーム取得エラー:', err);
      return res.status(500).json({ message: 'チャットルームの取得に失敗しました' });
    }

    res.json({ rooms });
  });
};

// 特定のチャットルームのメッセージを取得
export const getRoomMessages = (req: Request, res: Response) => {
  const { userId, castId } = req.params;

  const query = `
    SELECT 
      cm.*,
      CASE 
        WHEN cm.sender_type = 'user' THEN u.name 
        WHEN cm.sender_type = 'cast' THEN c.name 
      END as sender_name
    FROM chat_messages cm
    LEFT JOIN users u ON cm.sender_type = 'user' AND cm.sender_id = u.id
    LEFT JOIN casts c ON cm.sender_type = 'cast' AND cm.sender_id = c.id
    WHERE ((cm.sender_type = 'user' AND cm.sender_id = ? AND cm.receiver_type = 'cast' AND cm.receiver_id = ?)
       OR (cm.sender_type = 'cast' AND cm.sender_id = ? AND cm.receiver_type = 'user' AND cm.receiver_id = ?))
    ORDER BY cm.created_at ASC
  `;

  db.all(query, [userId, castId, castId, userId], (err, messages) => {
    if (err) {
      console.error('メッセージ取得エラー:', err);
      return res.status(500).json({ message: 'メッセージの取得に失敗しました' });
    }

    res.json({ messages });
  });
};

// メッセージを削除
export const deleteMessage = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM chat_messages WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('メッセージ削除エラー:', err);
      return res.status(500).json({ message: 'メッセージの削除に失敗しました' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'メッセージが見つかりません' });
    }

    res.json({
      success: true,
      message: 'メッセージを削除しました',
    });
  });
};

// メッセージを既読にする
export const markAsRead = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('UPDATE chat_messages SET is_read = 1 WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('既読更新エラー:', err);
      return res.status(500).json({ message: '既読の更新に失敗しました' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'メッセージが見つかりません' });
    }

    res.json({
      success: true,
      message: 'メッセージを既読にしました',
    });
  });
};

// =============== 顧客向けチャット機能 ===============

// 顧客のチャットルーム一覧を取得（承認済みのキャストのみ）
export const getUserChatRooms = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  const query = `
    SELECT DISTINCT
      ca.cast_id,
      c.name as cast_name,
      c.age as cast_age,
      c.images as cast_images,
      ca.status,
      ca.approved_at,
      (SELECT COUNT(*) FROM chat_messages 
       WHERE sender_type = 'user' AND sender_id = ?
         AND receiver_type = 'cast' AND receiver_id = ca.cast_id
      ) + (SELECT COUNT(*) FROM chat_messages 
       WHERE sender_type = 'cast' AND sender_id = ca.cast_id
         AND receiver_type = 'user' AND receiver_id = ?
      ) as message_count,
      (SELECT COUNT(*) FROM chat_messages 
       WHERE sender_type = 'cast' AND sender_id = ca.cast_id
         AND receiver_type = 'user' AND receiver_id = ?
         AND is_read = 0
      ) as unread_count,
      (SELECT message FROM chat_messages 
       WHERE (sender_type = 'user' AND sender_id = ? AND receiver_type = 'cast' AND receiver_id = ca.cast_id)
          OR (sender_type = 'cast' AND sender_id = ca.cast_id AND receiver_type = 'user' AND receiver_id = ?)
       ORDER BY created_at DESC LIMIT 1
      ) as last_message,
      (SELECT created_at FROM chat_messages 
       WHERE (sender_type = 'user' AND sender_id = ? AND receiver_type = 'cast' AND receiver_id = ca.cast_id)
          OR (sender_type = 'cast' AND sender_id = ca.cast_id AND receiver_type = 'user' AND receiver_id = ?)
       ORDER BY created_at DESC LIMIT 1
      ) as last_message_at
    FROM chat_approvals ca
    LEFT JOIN casts c ON ca.cast_id = c.id
    WHERE ca.user_id = ? AND ca.status = 'approved'
    ORDER BY last_message_at DESC
  `;

  db.all(query, [userId, userId, userId, userId, userId, userId, userId, userId], (err, rooms) => {
    if (err) {
      console.error('チャットルーム取得エラー:', err);
      return res.status(500).json({ message: 'チャットルームの取得に失敗しました' });
    }

    // cast_imagesをパース
    const roomsWithImages = (rooms as any[]).map(room => ({
      ...room,
      cast_images: room.cast_images ? JSON.parse(room.cast_images) : []
    }));

    res.json({ rooms: roomsWithImages });
  });
};

// 顧客とキャスト間のメッセージを取得
export const getUserCastMessages = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { castId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  // チャット承認チェック
  db.get(
    'SELECT * FROM chat_approvals WHERE user_id = ? AND cast_id = ? AND status = ?',
    [userId, castId, 'approved'],
    (err, approval) => {
      if (err) {
        console.error('承認チェックエラー:', err);
        return res.status(500).json({ message: 'データベースエラー' });
      }

      if (!approval) {
        return res.status(403).json({ message: 'このキャストとのチャットは承認されていません' });
      }

      const query = `
        SELECT 
          cm.*,
          CASE 
            WHEN cm.sender_type = 'user' THEN u.name 
            WHEN cm.sender_type = 'cast' THEN c.name 
          END as sender_name
        FROM chat_messages cm
        LEFT JOIN users u ON cm.sender_type = 'user' AND cm.sender_id = u.id
        LEFT JOIN casts c ON cm.sender_type = 'cast' AND cm.sender_id = c.id
        WHERE ((cm.sender_type = 'user' AND cm.sender_id = ? AND cm.receiver_type = 'cast' AND cm.receiver_id = ?)
           OR (cm.sender_type = 'cast' AND cm.sender_id = ? AND cm.receiver_type = 'user' AND cm.receiver_id = ?))
        ORDER BY cm.created_at ASC
      `;

      db.all(query, [userId, castId, castId, userId], (err, messages) => {
        if (err) {
          console.error('メッセージ取得エラー:', err);
          return res.status(500).json({ message: 'メッセージの取得に失敗しました' });
        }

        res.json({ messages });
      });
    }
  );
};

// 顧客がメッセージを送信
export const sendUserMessage = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { castId, message } = req.body;

  if (!userId) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  if (!castId || !message) {
    return res.status(400).json({ message: 'キャストIDとメッセージは必須です' });
  }

  // チャット承認チェック
  db.get(
    'SELECT * FROM chat_approvals WHERE user_id = ? AND cast_id = ? AND status = ?',
    [userId, castId, 'approved'],
    (err, approval) => {
      if (err) {
        console.error('承認チェックエラー:', err);
        return res.status(500).json({ message: 'データベースエラー' });
      }

      if (!approval) {
        return res.status(403).json({ message: 'このキャストとのチャットは承認されていません' });
      }

      db.run(
        `INSERT INTO chat_messages (sender_type, sender_id, receiver_type, receiver_id, message, is_read)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['user', userId, 'cast', castId, message, 0],
        function (err) {
          if (err) {
            console.error('メッセージ送信エラー:', err);
            return res.status(500).json({ message: 'メッセージの送信に失敗しました' });
          }

          db.get(
            'SELECT * FROM chat_messages WHERE id = ?',
            [this.lastID],
            (err, newMessage) => {
              if (err) {
                console.error('メッセージ取得エラー:', err);
                return res.status(500).json({ message: 'データベースエラー' });
              }

              res.status(201).json({
                success: true,
                message: 'メッセージを送信しました',
                data: newMessage,
              });
            }
          );
        }
      );
    }
  );
};

// 顧客側で受信メッセージを既読にする
export const markUserMessagesAsRead = (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { castId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  db.run(
    `UPDATE chat_messages 
     SET is_read = 1 
     WHERE receiver_type = 'user' 
       AND receiver_id = ? 
       AND sender_type = 'cast' 
       AND sender_id = ? 
       AND is_read = 0`,
    [userId, castId],
    function (err) {
      if (err) {
        console.error('既読更新エラー:', err);
        return res.status(500).json({ message: '既読の更新に失敗しました' });
      }

      res.json({
        success: true,
        message: 'メッセージを既読にしました',
        updated: this.changes,
      });
    }
  );
};
