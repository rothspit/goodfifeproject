import express from 'express';
import {
  createReview,
  getCastReviews,
  getRecentReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} from '../controllers/reviewController';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = express.Router();

// 公開用
router.post('/', authMiddleware, createReview);
router.get('/recent', getRecentReviews);
router.get('/cast/:cast_id', optionalAuth, getCastReviews);

// 管理画面用（管理者のみ）
router.get('/admin/all', authMiddleware, getAllReviews);
router.put('/admin/:id/status', authMiddleware, updateReviewStatus);
router.delete('/admin/:id', authMiddleware, deleteReview);

export default router;
