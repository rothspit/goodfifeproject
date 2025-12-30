import express from 'express';
import {
  importCastsFromCSV,
  getCSVTemplate,
  generateSampleData,
} from '../controllers/castImportController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 認証が必要なルート
router.use(authMiddleware);

// CSVインポート
router.post('/import', importCastsFromCSV);

// CSVテンプレート取得
router.get('/template', getCSVTemplate);

// サンプルデータ生成
router.post('/generate-sample', generateSampleData);

export default router;
