/**
 * 企業管理ルート
 */
import express from 'express';
import {
  getAllCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats,
  getSubscription
} from '../controllers/companyController';
import { 
  extractTenantInfo, 
  requireCompanyAdmin 
} from '../middleware/tenantAuth';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// 全てのルートで認証とテナント情報抽出
router.use(verifyToken);
router.use(extractTenantInfo);

// 企業一覧取得（システム管理者のみ）
router.get('/', getAllCompanies);

// 企業登録（システム管理者のみ）
router.post('/', createCompany);

// 企業詳細取得
router.get('/:id', getCompany);

// 企業更新（企業管理者）
router.put('/:id', requireCompanyAdmin, updateCompany);

// 企業削除（システム管理者のみ）
router.delete('/:id', deleteCompany);

// 企業統計
router.get('/:id/stats', getCompanyStats);

// サブスクリプション情報
router.get('/:id/subscription', getSubscription);

export default router;
