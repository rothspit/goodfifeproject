import express, { Request, Response } from 'express';
const Database = require('better-sqlite3');
import path from 'path';
import { authMiddleware } from '../middleware/auth';

const db = new Database(path.join(__dirname, '../../data/database.sqlite'));

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// チャットルーム一覧取得（管理者用）
router.get('/rooms', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    // 管理者のみアクセス可能
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: '権限がありません' });
    }

    const rooms = db.prepare(`
      SELECT 
        cr.*,
        u.name as user_name,
        u.phone_number as user_phone,
        u.email as user_email,
        (SELECT COUNT(*) FROM chat_messages WHERE room_id = cr.id AND sender_type = 'user' AND is_read = 0) as unread_count
      FROM chat_rooms cr
      LEFT JOIN users u ON cr.user_id = u.id
      ORDER BY cr.updated_at DESC
    `).all();

    res.json({ rooms });
  } catch (error: any) {
    console.error('チャットルーム一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラー', error: error.message });
  }
});

// チャットルーム取得または作成（ユーザー用）
router.get('/room', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    // 既存のルームを取得
    let room = db.prepare(`
      SELECT cr.*, u.name as user_name, u.phone_number as user_phone
      FROM chat_rooms cr
      LEFT JOIN users u ON cr.user_id = u.id
      WHERE cr.user_id = ?
    `).get(user.id);

    // ルームが存在しない場合は作成
    if (!room) {
      const result = db.prepare(`
        INSERT INTO chat_rooms (user_id, status)
        VALUES (?, 'active')
      `).run(user.id);

      room = db.prepare(`
        SELECT cr.*, u.name as user_name, u.phone_number as user_phone
        FROM chat_rooms cr
        LEFT JOIN users u ON cr.user_id = u.id
        WHERE cr.id = ?
      `).get(result.lastInsertRowid);
    }

    res.json({ room });
  } catch (error: any) {
    console.error('チャットルーム取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラー', error: error.message });
  }
});

// メッセージ一覧取得
router.get('/rooms/:roomId/messages', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { roomId } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    // ルームの存在確認と権限チェック
    const room: any = db.prepare(`
      SELECT * FROM chat_rooms WHERE id = ?
    `).get(roomId);

    if (!room) {
      return res.status(404).json({ message: 'チャットルームが見つかりません' });
    }

    // 管理者でない場合は自分のルームのみアクセス可能
    if (user.role !== 'admin' && room.user_id !== user.id) {
      return res.status(403).json({ message: '権限がありません' });
    }

    // メッセージを取得
    const messages = db.prepare(`
      SELECT * FROM chat_messages
      WHERE room_id = ?
      ORDER BY created_at ASC
    `).all(roomId);

    // ユーザーがメッセージを読んだ場合は既読にする
    if (user.role !== 'admin') {
      db.prepare(`
        UPDATE chat_messages
        SET is_read = 1
        WHERE room_id = ? AND sender_type = 'admin' AND is_read = 0
      `).run(roomId);
    } else {
      // 管理者がメッセージを読んだ場合
      db.prepare(`
        UPDATE chat_messages
        SET is_read = 1
        WHERE room_id = ? AND sender_type = 'user' AND is_read = 0
      `).run(roomId);
    }

    res.json({ messages });
  } catch (error: any) {
    console.error('メッセージ一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラー', error: error.message });
  }
});

// メッセージ送信
router.post('/rooms/:roomId/messages', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { roomId } = req.params;
    const { message } = req.body;
    
    if (!user) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'メッセージを入力してください' });
    }

    // ルームの存在確認と権限チェック
    const room: any = db.prepare(`
      SELECT * FROM chat_rooms WHERE id = ?
    `).get(roomId);

    if (!room) {
      return res.status(404).json({ message: 'チャットルームが見つかりません' });
    }

    // 管理者でない場合は自分のルームのみアクセス可能
    if (user.role !== 'admin' && room.user_id !== user.id) {
      return res.status(403).json({ message: '権限がありません' });
    }

    const senderType = user.role === 'admin' ? 'admin' : 'user';
    
    // メッセージを保存
    const result = db.prepare(`
      INSERT INTO chat_messages (room_id, sender_type, sender_id, sender_name, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(roomId, senderType, user.id, user.name, message.trim());

    // ルームの最終メッセージ時刻を更新
    db.prepare(`
      UPDATE chat_rooms
      SET last_message_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(roomId);

    const newMessage = db.prepare(`
      SELECT * FROM chat_messages WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ message: newMessage });
  } catch (error: any) {
    console.error('メッセージ送信エラー:', error);
    res.status(500).json({ message: 'サーバーエラー', error: error.message });
  }
});

// 未読数取得（ユーザー用）
router.get('/unread-count', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    // ユーザーのルームを取得
    const room: any = db.prepare(`
      SELECT id FROM chat_rooms WHERE user_id = ?
    `).get(user.id);

    if (!room) {
      return res.json({ unreadCount: 0 });
    }

    // 未読メッセージ数を取得
    const result: any = db.prepare(`
      SELECT COUNT(*) as count
      FROM chat_messages
      WHERE room_id = ? AND sender_type = 'admin' AND is_read = 0
    `).get(room.id);

    res.json({ unreadCount: result.count || 0 });
  } catch (error: any) {
    console.error('未読数取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラー', error: error.message });
  }
});

export default router;
