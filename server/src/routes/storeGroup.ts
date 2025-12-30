import express from 'express';
import { verifyToken, extractTenantInfo, requireCompanyAdmin } from '../middleware/tenantAuth';
import {
  getAllGroups,
  getGroupDetail,
  createGroup,
  updateGroup,
  deleteGroup,
  addStoreToGroup,
  removeStoreFromGroup,
  getGroupSettings,
  getIndependentStores,
} from '../controllers/storeGroupController';

const router = express.Router();

// ============================================
// 店舗グループ管理ルート
// ============================================

/**
 * グループ一覧を取得
 * GET /api/store-groups
 */
router.get(
  '/',
  verifyToken,
  extractTenantInfo,
  requireCompanyAdmin,
  getAllGroups
);

/**
 * グループ詳細を取得
 * GET /api/store-groups/:groupId
 */
router.get(
  '/:groupId',
  verifyToken,
  extractTenantInfo,
  requireCompanyAdmin,
  getGroupDetail
);

/**
 * グループを作成
 * POST /api/store-groups
 */
router.post(
  '/',
  verifyToken,
  extractTenantInfo,
  requireCompanyAdmin,
  createGroup
);

/**
 * グループを更新
 * PUT /api/store-groups/:groupId
 */
router.put(
  '/:groupId',
  verifyToken,
  extractTenantInfo,
  requireCompanyAdmin,
  updateGroup
);

/**
 * グループを削除
 * DELETE /api/store-groups/:groupId
 */
router.delete(
  '/:groupId',
  verifyToken,
  extractTenantInfo,
  requireCompanyAdmin,
  deleteGroup
);

/**
 * 店舗をグループに追加
 * POST /api/store-groups/:groupId/stores
 */
router.post(
  '/:groupId/stores',
  verifyToken,
  extractTenantInfo,
  requireCompanyAdmin,
  addStoreToGroup
);

/**
 * 店舗をグループから除外
 * DELETE /api/store-groups/:groupId/stores/:storeId
 */
router.delete(
  '/:groupId/stores/:storeId',
  verifyToken,
  extractTenantInfo,
  requireCompanyAdmin,
  removeStoreFromGroup
);

/**
 * グループのデータ共有設定を取得
 * GET /api/store-groups/:groupId/settings
 */
router.get(
  '/:groupId/settings',
  verifyToken,
  extractTenantInfo,
  requireCompanyAdmin,
  getGroupSettings
);

/**
 * 独立店舗（グループなし）の一覧を取得
 * GET /api/store-groups/independent-stores
 */
router.get(
  '/independent/stores',
  verifyToken,
  extractTenantInfo,
  requireCompanyAdmin,
  getIndependentStores
);

export default router;
