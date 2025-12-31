import express from 'express';
import {
  createReceiptRequest,
  getMyReceiptRequests,
  getAllReceiptRequests,
  approveReceiptRequest,
  rejectReceiptRequest,
  issueReceipt,
  getMyReceipts,
  getReceiptByNumber,
} from '../controllers/receiptController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 認証が必要
router.use(authMiddleware);

// お客様用エンドポイント
router.post('/requests', createReceiptRequest); // 領収書申請
router.get('/requests/my', getMyReceiptRequests); // 自分の申請一覧
router.get('/my', getMyReceipts); // 自分の領収書一覧

// 管理者用エンドポイント
router.get('/requests', getAllReceiptRequests); // 全申請一覧（管理者のみ）
router.post('/requests/:id/approve', approveReceiptRequest); // 承認（管理者のみ）
router.post('/requests/:id/reject', rejectReceiptRequest); // 却下（管理者のみ）
router.post('/requests/:id/issue', issueReceipt); // 発行（管理者のみ）

// 領収書詳細
router.get('/:receiptNumber', getReceiptByNumber);

export default router;
