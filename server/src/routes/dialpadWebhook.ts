import express from 'express';
import { receiveDialpadWebhook, testIncomingCall } from '../controllers/dialpadWebhookController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Dialpad Webhookエンドポイント（認証不要 - Dialpadからの呼び出し）
router.post('/webhook', receiveDialpadWebhook);

// テスト用エンドポイント（認証必須）
router.post('/test-call', authMiddleware, testIncomingCall);

export default router;
