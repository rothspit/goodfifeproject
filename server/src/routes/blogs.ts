import express from 'express';
import { getBlogs, getBlogById, getRecentBlogs } from '../controllers/blogController';

const router = express.Router();

router.get('/', getBlogs);
router.get('/recent', getRecentBlogs);
router.get('/:id', getBlogById);

export default router;
