import express from 'express';
import { getDailyEarnings, getMonthlyEarnings } from '../controllers/castEarningsController';
import { authenticateCast } from '../middleware/castAuth';

const router = express.Router();

// キャスト認証が必要なルート
router.use(authenticateCast);

// 日別精算明細
router.get('/daily', getDailyEarnings);

// 月間精算サマリー
router.get('/monthly', getMonthlyEarnings);

export default router;
