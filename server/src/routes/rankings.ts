import express from 'express';
import {
  getAllRankings,
  getRankingByCategory,
  getCategories,
  getAdminRankings,
  createRanking,
  updateRanking,
  deleteRanking,
} from '../controllers/rankingController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 公開用（認証不要）
router.get('/all', getAllRankings);
router.get('/category/:category', getRankingByCategory);
router.get('/categories', getCategories);

// 管理者専用
router.get('/admin/all', authMiddleware, getAdminRankings);
router.post('/admin', authMiddleware, createRanking);
router.put('/admin/:id', authMiddleware, updateRanking);
router.delete('/admin/:id', authMiddleware, deleteRanking);

export default router;
