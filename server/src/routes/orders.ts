import express from 'express';
import {
  searchCustomerByPhone,
  getCustomerCastHistory,
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  addCustomerNote
} from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 顧客検索 (電話番号)
router.get('/customers/search', authMiddleware, searchCustomerByPhone);

// 顧客-キャスト利用履歴
router.get('/customers/cast-history', authMiddleware, getCustomerCastHistory);

// 顧客メモ追加
router.post('/customers/notes', authMiddleware, addCustomerNote);

// 受注作成
router.post('/', authMiddleware, createOrder);

// 受注一覧取得
router.get('/', authMiddleware, getOrders);

// 受注詳細取得
router.get('/:id', authMiddleware, getOrderById);

// 受注ステータス更新
router.patch('/:id/status', authMiddleware, updateOrderStatus);

export default router;
