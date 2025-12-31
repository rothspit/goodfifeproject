import express from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  uploadCSV,
  importSchedules,
  getSchedulesByDateRange,
  uploadMiddleware,
} from '../controllers/scheduleImportController';

const router = express.Router();

// CSVファイルをアップロードしてパース
router.post('/upload', authMiddleware, uploadMiddleware, uploadCSV);

// スケジュールをインポート
router.post('/import', authMiddleware, importSchedules);

// 期間指定でスケジュール取得
router.get('/range', getSchedulesByDateRange);

export default router;
