import express from 'express';
import {
  getAvailableInstantPrincess,
  getAllInstantPrincess,
  createInstantPrincess,
  updateInstantPrincess,
  deleteInstantPrincess,
  getCurrentlyWorkingCasts,
} from '../controllers/instantPrincessController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 公開用
router.get('/available', getAvailableInstantPrincess);

// 管理画面用（管理者のみ）
router.get('/admin/all', authMiddleware, getAllInstantPrincess);
router.get('/admin/working-casts', authMiddleware, getCurrentlyWorkingCasts);
router.post('/admin', authMiddleware, createInstantPrincess);
router.put('/admin/:id', authMiddleware, updateInstantPrincess);
router.delete('/admin/:id', authMiddleware, deleteInstantPrincess);

export default router;
