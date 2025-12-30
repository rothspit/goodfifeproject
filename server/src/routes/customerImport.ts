/**
 * 顧客CSV/Excelインポートルート
 * マルチテナント対応
 */
import express from 'express';
import {
  uploadFile,
  parseCustomerCSV,
  getExcelSheets,
  previewExcelSheet,
  parseExcelData,
  importCustomers,
  searchCustomerByPhone,
  downloadTemplate
} from '../controllers/customerImportController';
import { verifyToken } from '../middleware/auth';
import { extractTenantInfo, requireStaff } from '../middleware/tenantAuth';

const router = express.Router();

// 全てのルートで認証とテナント情報抽出
router.use(verifyToken);
router.use(extractTenantInfo);
router.use(requireStaff); // スタッフ以上の権限が必要

// CSVテンプレートダウンロード
router.get('/template', downloadTemplate);

// CSVファイルアップロード＆解析（互換性のため残す）
router.post('/upload-csv', uploadFile, parseCustomerCSV);

// === Excel専用エンドポイント ===

// Excelファイルアップロード＆シート一覧取得
router.post('/upload-excel', uploadFile, getExcelSheets);

// Excelシートのプレビュー取得
router.post('/preview-sheet', previewExcelSheet);

// Excelデータの解析（カラムマッピング適用）
router.post('/parse-excel', parseExcelData);

// 顧客データ一括インポート
router.post('/import', importCustomers);

// 電話番号で顧客検索
router.get('/search', searchCustomerByPhone);

export default router;
