import express from 'express';
import {
  getAllCastCredentials,
  getCastCredential,
  generateCastPassword,
  deleteCastPassword,
  bulkGeneratePasswords,
} from '../controllers/castCredentialsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 管理者認証が必要
router.use(authMiddleware);

// 全キャストのログイン情報取得
router.get('/', getAllCastCredentials);

// 特定のキャストのログイン情報取得
router.get('/:id', getCastCredential);

// キャストのパスワード生成・更新
router.post('/:id/generate', generateCastPassword);

// キャストのパスワード削除
router.delete('/:id', deleteCastPassword);

// 複数キャストのパスワード一括生成
router.post('/bulk/generate', bulkGeneratePasswords);

export default router;
