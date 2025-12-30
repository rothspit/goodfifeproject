import express from 'express';
import {
  getAnnouncements,
  getAnnouncementById,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 公開用
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);

// 管理画面用（管理者のみ）
router.get('/admin/all', authMiddleware, getAllAnnouncements);
router.post('/admin', authMiddleware, createAnnouncement);
router.put('/admin/:id', authMiddleware, updateAnnouncement);
router.delete('/admin/:id', authMiddleware, deleteAnnouncement);

export default router;
