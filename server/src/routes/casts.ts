import express from 'express';
import {
  getCasts,
  getCastById,
  getAvailableCasts,
  getCastSchedule,
  createCast,
  updateCast,
  deleteCast,
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  bulkCreateSchedules,
  updateCastDisplayOrder,
} from '../controllers/castController';
import { optionalAuth, authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', optionalAuth, getCasts);
router.get('/available', getAvailableCasts);

// 並び順更新（:id ルートより前に配置）
router.put('/display-order/bulk', authMiddleware, updateCastDisplayOrder);

router.get('/:id', optionalAuth, getCastById);
router.get('/:id/schedule', getCastSchedule);

// 管理者のみ
router.post('/', authMiddleware, createCast);
router.put('/:id', authMiddleware, updateCast);
router.delete('/:id', authMiddleware, deleteCast);

export default router;
