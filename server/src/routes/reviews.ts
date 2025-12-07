import express from 'express';
import { createReview, getCastReviews, getRecentReviews } from '../controllers/reviewController';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = express.Router();

router.post('/', authMiddleware, createReview);
router.get('/recent', getRecentReviews);
router.get('/cast/:cast_id', optionalAuth, getCastReviews);

export default router;
