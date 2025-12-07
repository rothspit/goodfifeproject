import express from 'express';
import {
  getCasts,
  getCastById,
  getAvailableCasts,
  getCastSchedule,
} from '../controllers/castController';
import { optionalAuth } from '../middleware/auth';

const router = express.Router();

router.get('/', optionalAuth, getCasts);
router.get('/available', getAvailableCasts);
router.get('/:id', optionalAuth, getCastById);
router.get('/:id/schedule', getCastSchedule);

export default router;
