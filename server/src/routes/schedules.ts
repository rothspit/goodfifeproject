import express from 'express';
import {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  bulkCreateSchedules,
} from '../controllers/castController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 公開用：認証不要
router.get('/public', getAllSchedules);

// 管理者専用
router.get('/', authMiddleware, getAllSchedules);
router.post('/', authMiddleware, createSchedule);
router.post('/bulk', authMiddleware, bulkCreateSchedules);
router.put('/:id', authMiddleware, updateSchedule);
router.delete('/:id', authMiddleware, deleteSchedule);

export default router;
