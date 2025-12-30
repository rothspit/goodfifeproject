import express from 'express';
import {
  getCastSchedules,
  addCastSchedule,
  deleteCastSchedule,
  updateCastSchedule,
  getCastStats,
} from '../controllers/castScheduleController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 認証が必要なルート
router.use(authMiddleware);

// スケジュール管理
router.get('/schedules', getCastSchedules);
router.post('/schedules', addCastSchedule);
router.put('/schedules/:id', updateCastSchedule);
router.delete('/schedules/:id', deleteCastSchedule);

// 統計情報
router.get('/stats', getCastStats);

export default router;
