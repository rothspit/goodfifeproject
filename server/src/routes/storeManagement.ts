/**
 * 店舗管理ルート
 */
import express from 'express';
import {
  getStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  getStoreStaff,
  addStoreStaff,
  removeStoreStaff
} from '../controllers/storeManagementController';
import { 
  extractTenantInfo, 
  requireCompanyAdmin,
  requireStoreAdmin 
} from '../middleware/tenantAuth';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// 全てのルートで認証とテナント情報抽出
router.use(verifyToken);
router.use(extractTenantInfo);

// 店舗一覧取得
router.get('/', getStores);

// 店舗作成（企業管理者のみ）
router.post('/', requireCompanyAdmin, createStore);

// 店舗詳細取得
router.get('/:id', getStore);

// 店舗更新（企業管理者または店舗管理者）
router.put('/:id', requireStoreAdmin, updateStore);

// 店舗削除（企業管理者のみ）
router.delete('/:id', requireCompanyAdmin, deleteStore);

// 店舗スタッフ管理
router.get('/:id/staff', getStoreStaff);
router.post('/:id/staff', requireStoreAdmin, addStoreStaff);
router.delete('/:id/staff/:userId', requireStoreAdmin, removeStoreStaff);

export default router;
