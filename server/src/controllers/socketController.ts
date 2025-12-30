import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import db from '../config/database';

interface UserSocket extends Socket {
  userId?: number;
  userType?: 'user' | 'cast';
}

export const setupSocketHandlers = (io: Server) => {
  // 認証ミドルウェア
  io.use((socket: UserSocket, next) => {
    const token = socket.handshake.auth.token;

    console.log('🔐 Socket.IO auth check:', { 
      hasToken: !!token, 
      namespace: socket.nsp.name 
    });

    if (!token) {
      console.error('❌ Socket.IO: No token provided');
      return next(new Error('認証トークンがありません'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: number;
        userType: 'user' | 'cast';
      };

      socket.userId = decoded.userId;
      socket.userType = decoded.userType;
      console.log('✅ Socket.IO auth success:', { userId: decoded.userId, userType: decoded.userType });
      next();
    } catch (error) {
      console.error('❌ Socket.IO auth failed:', error);
      return next(new Error('無効な認証トークンです'));
    }
  });

  io.on('connection', (socket: UserSocket) => {
    console.log(`✅ ユーザー接続: ${socket.userId} (${socket.userType}) - Namespace: ${socket.nsp.name}`);

    // ユーザーをルームに参加させる
    const roomId = `${socket.userType}_${socket.userId}`;
    socket.join(roomId);
    console.log(`📍 User joined room: ${roomId}`);

    // 管理者の場合は admin-room にも参加（CTI着信通知用）
    if (socket.userType === 'user' && socket.userId) {
      // ユーザーのロールを確認（非同期処理）
      (async () => {
        try {
          const user: any = await new Promise((resolve, reject) => {
            db.get(
              'SELECT role FROM users WHERE id = ?',
              [socket.userId],
              (err: any, row: any) => {
                if (err) reject(err);
                else resolve(row);
              }
            );
          });

          if (user && user.role === 'admin') {
            socket.join('admin-room');
            console.log(`🎫 管理者がadmin-roomに参加: ${socket.userId}`);
            socket.emit('joined_admin_room', { success: true });
          } else {
            console.log(`👤 User ${socket.userId} role: ${user?.role || 'unknown'} (not admin)`);
          }
        } catch (error) {
          console.error('❌ Error checking user role:', error);
        }
      })();
    }

    // チャット履歴を取得
    socket.on('get_chat_history', (data: { partnerId: number; partnerType: 'user' | 'cast' }) => {
      const { partnerId, partnerType } = data;

      db.all(
        `SELECT * FROM chat_messages 
        WHERE (sender_id = ? AND sender_type = ? AND receiver_id = ? AND receiver_type = ?)
        OR (sender_id = ? AND sender_type = ? AND receiver_id = ? AND receiver_type = ?)
        ORDER BY created_at ASC`,
        [
          socket.userId,
          socket.userType,
          partnerId,
          partnerType,
          partnerId,
          partnerType,
          socket.userId,
          socket.userType,
        ],
        (err, messages) => {
          if (err) {
            socket.emit('error', { message: 'メッセージ履歴の取得に失敗しました' });
            return;
          }

          socket.emit('chat_history', { messages });
        }
      );
    });

    // メッセージ送信
    socket.on(
      'send_message',
      (data: { receiverId: number; receiverType: 'user' | 'cast'; message: string }) => {
        const { receiverId, receiverType, message } = data;

        if (!message || !receiverId || !receiverType) {
          socket.emit('error', { message: '無効なメッセージです' });
          return;
        }

        // メッセージをデータベースに保存
        db.run(
          `INSERT INTO chat_messages (sender_id, sender_type, receiver_id, receiver_type, message) 
          VALUES (?, ?, ?, ?, ?)`,
          [socket.userId, socket.userType, receiverId, receiverType, message],
          function (err) {
            if (err) {
              socket.emit('error', { message: 'メッセージの送信に失敗しました' });
              return;
            }

            const messageData = {
              id: this.lastID,
              sender_id: socket.userId,
              sender_type: socket.userType,
              receiver_id: receiverId,
              receiver_type: receiverType,
              message,
              is_read: false,
              created_at: new Date().toISOString(),
            };

            // 送信者に確認
            socket.emit('message_sent', messageData);

            // 受信者に送信
            const receiverRoomId = `${receiverType}_${receiverId}`;
            io.to(receiverRoomId).emit('new_message', messageData);
          }
        );
      }
    );

    // メッセージを既読にする
    socket.on('mark_as_read', (data: { messageIds: number[] }) => {
      const { messageIds } = data;

      if (!messageIds || messageIds.length === 0) {
        return;
      }

      const placeholders = messageIds.map(() => '?').join(',');
      db.run(
        `UPDATE chat_messages SET is_read = 1 
        WHERE id IN (${placeholders}) AND receiver_id = ? AND receiver_type = ?`,
        [...messageIds, socket.userId, socket.userType],
        (err) => {
          if (err) {
            socket.emit('error', { message: '既読の更新に失敗しました' });
          }
        }
      );
    });

    // 未読数を取得
    socket.on('get_unread_count', () => {
      db.get(
        `SELECT COUNT(*) as count FROM chat_messages 
        WHERE receiver_id = ? AND receiver_type = ? AND is_read = 0`,
        [socket.userId, socket.userType],
        (err, result: any) => {
          if (err) {
            socket.emit('error', { message: '未読数の取得に失敗しました' });
            return;
          }

          socket.emit('unread_count', { count: result.count });
        }
      );
    });

    // チャットリストを取得
    socket.on('get_chat_list', () => {
      db.all(
        `SELECT DISTINCT
          CASE 
            WHEN sender_id = ? AND sender_type = ? THEN receiver_id
            ELSE sender_id
          END as partner_id,
          CASE 
            WHEN sender_id = ? AND sender_type = ? THEN receiver_type
            ELSE sender_type
          END as partner_type,
          MAX(created_at) as last_message_time,
          (SELECT message FROM chat_messages cm2 
           WHERE ((cm2.sender_id = chat_messages.sender_id AND cm2.receiver_id = chat_messages.receiver_id)
           OR (cm2.sender_id = chat_messages.receiver_id AND cm2.receiver_id = chat_messages.sender_id))
           ORDER BY cm2.created_at DESC LIMIT 1) as last_message,
          (SELECT COUNT(*) FROM chat_messages cm3
           WHERE cm3.receiver_id = ? AND cm3.receiver_type = ? AND cm3.is_read = 0
           AND cm3.sender_id = partner_id AND cm3.sender_type = partner_type) as unread_count
        FROM chat_messages
        WHERE (sender_id = ? AND sender_type = ?) OR (receiver_id = ? AND receiver_type = ?)
        GROUP BY partner_id, partner_type
        ORDER BY last_message_time DESC`,
        [
          socket.userId,
          socket.userType,
          socket.userId,
          socket.userType,
          socket.userId,
          socket.userType,
          socket.userId,
          socket.userType,
          socket.userId,
          socket.userType,
        ],
        (err, chats) => {
          if (err) {
            socket.emit('error', { message: 'チャットリストの取得に失敗しました' });
            return;
          }

          socket.emit('chat_list', { chats });
        }
      );
    });

    // タイピング中の通知
    socket.on(
      'typing',
      (data: { receiverId: number; receiverType: 'user' | 'cast'; isTyping: boolean }) => {
        const { receiverId, receiverType, isTyping } = data;
        const receiverRoomId = `${receiverType}_${receiverId}`;

        io.to(receiverRoomId).emit('user_typing', {
          userId: socket.userId,
          userType: socket.userType,
          isTyping,
        });
      }
    );

    // 切断
    socket.on('disconnect', () => {
      console.log(`ユーザー切断: ${socket.userId} (${socket.userType})`);
    });
  });
};
