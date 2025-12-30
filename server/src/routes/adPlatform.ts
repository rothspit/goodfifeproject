import express from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getAllPlatforms,
  getPlatformById,
  createPlatform,
  updatePlatform,
  deletePlatform,
  getDistributionLogs,
  getDistributionStatistics
} from '../controllers/adPlatformController';

const router = express.Router();

// 広告媒体管理
router.get('/platforms', authMiddleware, getAllPlatforms);
router.get('/platforms/:id', authMiddleware, getPlatformById);
router.post('/platforms', authMiddleware, createPlatform);
router.put('/platforms/:id', authMiddleware, updatePlatform);
router.delete('/platforms/:id', authMiddleware, deletePlatform);

// 配信ログ
router.get('/logs', authMiddleware, getDistributionLogs);
router.get('/statistics', authMiddleware, getDistributionStatistics);

export default router;
