import express from 'express';
import {
  createReservation,
  getUserReservations,
  getReservationById,
  cancelReservation,
} from '../controllers/reservationController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/', authMiddleware, createReservation);
router.get('/', authMiddleware, getUserReservations);
router.get('/:id', authMiddleware, getReservationById);
router.put('/:id/cancel', authMiddleware, cancelReservation);

export default router;
