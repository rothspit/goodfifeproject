import express from 'express';
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

// 広告媒体管理（開発環境では認証なし）
router.get('/', getAllPlatforms);
router.get('/:id', getPlatformById);
router.post('/', createPlatform);
router.put('/:id', updatePlatform);
router.delete('/:id', deletePlatform);

// 配信ログ
router.get('/logs', getDistributionLogs);
router.get('/statistics', getDistributionStatistics);

export default router;
