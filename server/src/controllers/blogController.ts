import { Request, Response } from 'express';
import db from '../config/database';

export const getBlogs = (req: Request, res: Response) => {
  const { cast_id, store_id, limit = 20, offset = 0 } = req.query;

  let query = `
    SELECT b.*, c.name as cast_name,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
    FROM blogs b
    INNER JOIN casts c ON b.cast_id = c.id
    WHERE 1=1
  `;

  const params: any[] = [];

  if (store_id) {
    query += ' AND c.store_id = ?';
    params.push(store_id);
  }

  if (cast_id) {
    query += ' AND b.cast_id = ?';
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

// ========================================
// 管理画面用機能
// ========================================

// 全ブログを取得（管理画面用）
export const getAllBlogs = (req: Request, res: Response) => {
  const { cast_id, search, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT b.*, c.name as cast_name,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
    FROM blogs b
    INNER JOIN casts c ON b.cast_id = c.id
  `;

  const params: any[] = [];
  const conditions: string[] = [];

  if (cast_id) {
    conditions.push('b.cast_id = ?');
    params.push(cast_id);
  }

  if (search) {
    conditions.push('(b.title LIKE ? OR b.content LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(query, params, (err, blogs) => {
    if (err) {
      console.error('ブログ取得エラー:', err);
      return res.status(500).json({ message: 'ブログの取得に失敗しました' });
    }

    // 総件数を取得
    let countQuery = 'SELECT COUNT(*) as total FROM blogs b';
    const countParams: any[] = [];

    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ').replace(/b\./g, '');
      if (cast_id) countParams.push(cast_id);
      if (search) countParams.push(`%${search}%`, `%${search}%`);
    }

    db.get(countQuery, countParams, (err, result: any) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      res.json({
        blogs,
        total: result.total,
        limit: Number(limit),
        offset: Number(offset),
      });
    });
  });
};

// ブログを作成
export const createBlog = (req: Request, res: Response) => {
  const { cast_id, title, content, image_url } = req.body;

  if (!cast_id || !title || !content) {
    return res.status(400).json({ message: 'キャストID、タイトル、内容は必須です' });
  }

  db.run(
    `INSERT INTO blogs (cast_id, title, content, image_url) VALUES (?, ?, ?, ?)`,
    [cast_id, title, content, image_url || null],
    function (err) {
      if (err) {
        console.error('ブログ作成エラー:', err);
        return res.status(500).json({ message: 'ブログの作成に失敗しました' });
      }

      db.get(
        `SELECT b.*, c.name as cast_name,
          (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
        FROM blogs b
        INNER JOIN casts c ON b.cast_id = c.id
        WHERE b.id = ?`,
        [this.lastID],
        (err, blog) => {
          if (err) {
            return res.status(500).json({ message: 'ブログの取得に失敗しました' });
          }

          res.status(201).json({
            success: true,
            message: 'ブログを作成しました',
            blog,
          });
        }
      );
    }
  );
};

// ブログを更新
export const updateBlog = (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, image_url } = req.body;

  const updates: string[] = [];
  const params: any[] = [];

  if (title !== undefined) {
    updates.push('title = ?');
    params.push(title);
  }

  if (content !== undefined) {
    updates.push('content = ?');
    params.push(content);
  }

  if (image_url !== undefined) {
    updates.push('image_url = ?');
    params.push(image_url);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: '更新する項目がありません' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  db.run(
    `UPDATE blogs SET ${updates.join(', ')} WHERE id = ?`,
    params,
    function (err) {
      if (err) {
        console.error('ブログ更新エラー:', err);
        return res.status(500).json({ message: 'ブログの更新に失敗しました' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'ブログが見つかりません' });
      }

      db.get(
        `SELECT b.*, c.name as cast_name,
          (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image
        FROM blogs b
        INNER JOIN casts c ON b.cast_id = c.id
        WHERE b.id = ?`,
        [id],
        (err, blog) => {
          if (err) {
            return res.status(500).json({ message: 'ブログの取得に失敗しました' });
          }

          res.json({
            success: true,
            message: 'ブログを更新しました',
            blog,
          });
        }
      );
    }
  );
};

// ブログを削除
export const deleteBlog = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM blogs WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('ブログ削除エラー:', err);
      return res.status(500).json({ message: 'ブログの削除に失敗しました' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'ブログが見つかりません' });
    }

    res.json({
      success: true,
      message: 'ブログを削除しました',
    });
  });
};
