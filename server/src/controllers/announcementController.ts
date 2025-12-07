import { Request, Response } from 'express';
import db from '../config/database';

export const getAnnouncements = (req: Request, res: Response) => {
  const { limit = 10, offset = 0 } = req.query;

  db.all(
    `SELECT * FROM announcements 
    WHERE is_active = 1 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, announcements) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      res.json({ announcements });
    }
  );
};

export const getAnnouncementById = (req: Request, res: Response) => {
  const { id } = req.params;

  db.get(
    'SELECT * FROM announcements WHERE id = ? AND is_active = 1',
    [id],
    (err, announcement) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      if (!announcement) {
        return res.status(404).json({ message: 'お知らせが見つかりません' });
      }

      res.json({ announcement });
    }
  );
};
