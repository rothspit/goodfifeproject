import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { verifyToken, extractTenantInfo, requireStaff } from '../middleware/tenantAuth';
import {
  fetchSheetData,
  importOrders,
  getCustomerOrders,
  getOrderStatistics,
} from '../controllers/orderImportController';

const router = express.Router();

// Googleスプレッドシートからデータ取得
router.post('/fetch-sheet', verifyToken, extractTenantInfo, requireStaff, fetchSheetData);

// データをインポート
router.post('/import', verifyToken, extractTenantInfo, requireStaff, importOrders);

// 顧客の受注履歴を取得
router.get('/customer/:customerId', verifyToken, extractTenantInfo, requireStaff, getCustomerOrders);

// 統計情報を取得
router.get('/statistics', verifyToken, extractTenantInfo, requireStaff, getOrderStatistics);

export default router;
