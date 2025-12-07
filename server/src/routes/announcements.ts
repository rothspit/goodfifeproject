import express from 'express';
import { getAnnouncements, getAnnouncementById } from '../controllers/announcementController';

const router = express.Router();

router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);

export default router;
