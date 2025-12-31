import express from 'express';
import { castLogin, getCastProfile } from '../controllers/castAuthController';
import { authenticateCast } from '../middleware/castAuth';

const router = express.Router();

// キャストログイン
router.post('/login', castLogin);

// キャストプロフィール取得（認証必要）
router.get('/profile', authenticateCast, getCastProfile);

export default router;
