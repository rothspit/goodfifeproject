import express from 'express';
import {
  getBlogs,
  getBlogById,
  getRecentBlogs,
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 公開用
router.get('/', getBlogs);
router.get('/recent', getRecentBlogs);
router.get('/:id', getBlogById);

// 管理画面用（管理者のみ）
router.get('/admin/all', authMiddleware, getAllBlogs);
router.post('/admin', authMiddleware, createBlog);
router.put('/admin/:id', authMiddleware, updateBlog);
router.delete('/admin/:id', authMiddleware, deleteBlog);

export default router;
