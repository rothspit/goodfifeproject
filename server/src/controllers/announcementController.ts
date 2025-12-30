import { Request, Response } from 'express';
import db from '../config/database';

// 公開用：有効なお知らせ一覧を取得
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

// 公開用：お知らせ詳細を取得
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

// ========================================
// 管理画面用機能
// ========================================

// 管理画面用：全お知らせを取得（有効・無効含む）
export const getAllAnnouncements = (req: Request, res: Response) => {
  const { type, is_active } = req.query;

  let query = 'SELECT * FROM announcements WHERE 1=1';
  const params: any[] = [];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  if (is_active !== undefined) {
    query += ' AND is_active = ?';
    params.push(is_active === 'true' ? 1 : 0);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, announcements) => {
    if (err) {
      console.error('お知らせ取得エラー:', err);
      return res.status(500).json({ message: 'お知らせの取得に失敗しました' });
    }

    res.json({ announcements });
  });
};

// お知らせを作成
export const createAnnouncement = (req: Request, res: Response) => {
  const { title, content, type, is_active } = req.body;

  // 必須項目のチェック
  if (!title || !content) {
    return res.status(400).json({
      message: 'タイトルと内容は必須です',
    });
  }

  db.run(
    `INSERT INTO announcements (title, content, type, is_active)
     VALUES (?, ?, ?, ?)`,
    [title, content, type || 'general', is_active !== undefined ? is_active : 1],
    function (err) {
      if (err) {
        console.error('お知らせ作成エラー:', err);
        return res.status(500).json({ message: 'お知らせの作成に失敗しました' });
      }

      // 作成したお知らせを取得して返す
      db.get(
        'SELECT * FROM announcements WHERE id = ?',
        [this.lastID],
        (err, announcement) => {
          if (err) {
            return res.status(500).json({ message: 'お知らせの取得に失敗しました' });
          }

          res.status(201).json({
            success: true,
            message: 'お知らせを作成しました',
            announcement,
          });
        }
      );
    }
  );
};

// お知らせを更新
export const updateAnnouncement = (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, type, is_active } = req.body;

  // 更新するフィールドを動的に構築
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

  if (type !== undefined) {
    updates.push('type = ?');
    params.push(type);
  }

  if (is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(is_active ? 1 : 0);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: '更新する項目がありません' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  db.run(
    `UPDATE announcements SET ${updates.join(', ')} WHERE id = ?`,
    params,
    function (err) {
      if (err) {
        console.error('お知らせ更新エラー:', err);
        return res.status(500).json({ message: 'お知らせの更新に失敗しました' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'お知らせが見つかりません' });
      }

      // 更新したお知らせを取得して返す
      db.get('SELECT * FROM announcements WHERE id = ?', [id], (err, announcement) => {
        if (err) {
          return res.status(500).json({ message: 'お知らせの取得に失敗しました' });
        }

        res.json({
          success: true,
          message: 'お知らせを更新しました',
          announcement,
        });
      });
    }
  );
};

// お知らせを削除
export const deleteAnnouncement = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM announcements WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('お知らせ削除エラー:', err);
      return res.status(500).json({ message: 'お知らせの削除に失敗しました' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'お知らせが見つかりません' });
    }

    res.json({
      success: true,
      message: 'お知らせを削除しました',
    });
  });
};
