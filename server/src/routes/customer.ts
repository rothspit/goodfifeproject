import express from 'express';
import {
  getUserPoints,
  getPointHistory,
  getReservationHistory,
  getFavorites,
  addFavorite,
  removeFavorite,
  getCastAppeals,
  markAppealAsRead,
  getNewsletterStatus,
  updateNewsletterStatus,
  getRanking,
  requestChatApproval,
  getChatApprovalStatus,
} from '../controllers/customerController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// ポイント関連
router.get('/points', authMiddleware, getUserPoints);
router.get('/points/history', authMiddleware, getPointHistory);

// 利用履歴
router.get('/reservations', authMiddleware, getReservationHistory);

// お気に入り
router.get('/favorites', authMiddleware, getFavorites);
router.post('/favorites', authMiddleware, addFavorite);
router.delete('/favorites/:cast_id', authMiddleware, removeFavorite);

// キャストアピール
router.get('/appeals', authMiddleware, getCastAppeals);
router.put('/appeals/:id/read', authMiddleware, markAppealAsRead);

// メルマガ
router.get('/newsletter', authMiddleware, getNewsletterStatus);
router.put('/newsletter', authMiddleware, updateNewsletterStatus);

// ランキング（公開）
router.get('/ranking', getRanking);

// チャット承認
router.post('/chat-approval', authMiddleware, requestChatApproval);
router.get('/chat-approval/:cast_id', authMiddleware, getChatApprovalStatus);

export default router;
