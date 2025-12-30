import express from 'express';
import { 
  addCastImage,
  deleteCastImage,
  setPrimaryCastImage
} from '../controllers/uploadController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// キャスト画像管理エンドポイント
router.post('/', authMiddleware, addCastImage);
router.delete('/:id', authMiddleware, deleteCastImage);
router.put('/:id/primary', authMiddleware, setPrimaryCastImage);

export default router;
