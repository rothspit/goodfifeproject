import express from 'express';
import {
  getTodayOrders,
  getCustomerByPhone,
  getTodayWorkingCasts,
  getPricePlans,
  getHotels,
  createOrUpdateOrder,
  getStores
} from '../controllers/customerManagementController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// すべてのルートに認証を適用
router.use(authMiddleware);

// 本日の受注リスト
router.get('/today-orders', getTodayOrders);

// 顧客情報取得（電話番号検索）
router.get('/customer/:phone_number', getCustomerByPhone);

// 本日出勤のキャスト
router.get('/working-casts', getTodayWorkingCasts);

// 料金プラン取得
router.get('/price-plans', getPricePlans);

// ホテルリスト取得
router.get('/hotels', getHotels);

// 店舗一覧取得
router.get('/stores', getStores);

// 受注作成・更新
router.post('/orders', createOrUpdateOrder);

export default router;
