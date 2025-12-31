import express from 'express';
import {
  earnPoints,
  usePoints,
  checkPointBalance,
  getPointHistory,
  getAllUserPoints,
} from '../controllers/pointController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 管理者用：ポイント付与（利用履歴に金額入力時）
router.post('/admin/earn', authMiddleware, earnPoints);

// 管理者用：ポイント使用（手動）
router.post('/admin/use', authMiddleware, usePoints);

// 管理者用：全ユーザーのポイント一覧
router.get('/admin/all', authMiddleware, getAllUserPoints);

// ポイント残高確認
router.get('/balance/:user_id', authMiddleware, checkPointBalance);

// ポイント履歴取得
router.get('/history/:user_id', authMiddleware, getPointHistory);

// 顧客用：ポイント使用（システムによる自動使用）
router.post('/use', authMiddleware, usePoints);

export default router;
