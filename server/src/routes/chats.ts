import express from 'express';
import {
  getAllChatMessages,
  getChatRooms,
  getRoomMessages,
  deleteMessage,
  markAsRead,
  getUserChatRooms,
  getUserCastMessages,
  sendUserMessage,
  markUserMessagesAsRead,
} from '../controllers/chatController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 管理画面用（管理者のみ）
router.get('/admin/all', authMiddleware, getAllChatMessages);
router.get('/admin/rooms', authMiddleware, getChatRooms);
router.get('/admin/rooms/:userId/:castId', authMiddleware, getRoomMessages);
router.delete('/admin/:id', authMiddleware, deleteMessage);
router.put('/admin/:id/read', authMiddleware, markAsRead);

// 顧客向けチャット機能（認証必要）
router.get('/user/rooms', authMiddleware, getUserChatRooms); // チャットルーム一覧
router.get('/user/messages/:castId', authMiddleware, getUserCastMessages); // 特定のキャストとのメッセージ
router.post('/user/send', authMiddleware, sendUserMessage); // メッセージ送信
router.put('/user/read/:castId', authMiddleware, markUserMessagesAsRead); // 既読にする

export default router;
