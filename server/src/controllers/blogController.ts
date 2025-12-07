import { Request, Response } from 'express';
import db from '../config/database';

export const getBlogs = (req: Request, res: Response) => {
  const { cast_id, limit = 20, offset = 0 } = req.query;

  let query = `
    SELECT b.*, c.name as cast_name,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
    FROM blogs b
    INNER JOIN casts c ON b.cast_id = c.id
  `;

  const params: any[] = [];

  if (cast_id) {
    query += ' WHERE b.cast_id = ?';
    params.push(cast_id);
  }

  query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(query, params, (err, blogs) => {
    if (err) {
      return res.status(500).json({ message: 'データベースエラー' });
    }

    res.json({ blogs });
  });
};

export const getBlogById = (req: Request, res: Response) => {
  const { id } = req.params;

  db.get(
    `SELECT b.*, c.name as cast_name,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
    FROM blogs b
    INNER JOIN casts c ON b.cast_id = c.id
    WHERE b.id = ?`,
    [id],
    (err, blog) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      if (!blog) {
        return res.status(404).json({ message: 'ブログが見つかりません' });
      }

      res.json({ blog });
    }
  );
};

export const getRecentBlogs = (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  db.all(
    `SELECT b.*, c.name as cast_name,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
    FROM blogs b
    INNER JOIN casts c ON b.cast_id = c.id
    ORDER BY b.created_at DESC
    LIMIT ?`,
    [limit],
    (err, blogs) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      res.json({ blogs });
    }
  );
};
