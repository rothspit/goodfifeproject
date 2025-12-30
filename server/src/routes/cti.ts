import express from 'express';
import {
  createCallLog,
  updateCallLog,
  handleDialpadWebhook,
  getCallLogs,
  getDialpadSettings,
  saveDialpadSettings
} from '../controllers/ctiController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// CTI通話ログ作成
router.post('/call-logs', authMiddleware, createCallLog);

// CTI通話ログ更新
router.patch('/call-logs/:call_id', authMiddleware, updateCallLog);

// 通話履歴取得
router.get('/call-logs', authMiddleware, getCallLogs);

// Dialpad Webhook (認証不要)
router.post('/webhooks/dialpad', handleDialpadWebhook);

// Dialpad設定取得
router.get('/settings/dialpad', authMiddleware, getDialpadSettings);

// Dialpad設定保存
router.post('/settings/dialpad', authMiddleware, saveDialpadSettings);

export default router;
