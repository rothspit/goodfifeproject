import express from 'express';
import { upload } from '../config/multer';
import { 
  uploadCastImages, 
  saveCastImages,
  addCastImage,
  deleteCastImage,
  setPrimaryCastImage
} from '../controllers/uploadController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 画像アップロード（管理者のみ）
router.post('/cast-images', authMiddleware, upload.array('images', 10), uploadCastImages);

// キャストに画像を紐付け（管理者のみ）
router.post('/cast-images/save', authMiddleware, saveCastImages);



export default router;
