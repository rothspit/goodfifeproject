import express from 'express';
import {
  createReceiptRequest,
  getMyReceiptRequests,
  getMyReceipts,
  getAllReceiptRequests,
  approveReceiptRequest,
  rejectReceiptRequest,
  issueReceipt,
  getReceiptByNumber,
} from '../controllers/receiptController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 顧客用エンドポイント
router.post('/requests', authMiddleware, createReceiptRequest);
router.get('/my-requests', authMiddleware, getMyReceiptRequests);
router.get('/my-receipts', authMiddleware, getMyReceipts);

// 管理者用エンドポイント
router.get('/requests', authMiddleware, getAllReceiptRequests);
router.put('/requests/:id/approve', authMiddleware, approveReceiptRequest);
router.put('/requests/:id/reject', authMiddleware, rejectReceiptRequest);
router.post('/requests/:id/issue', authMiddleware, issueReceipt);

// 公開エンドポイント（領収書番号で取得）
router.get('/:receipt_number', getReceiptByNumber);

export default router;
