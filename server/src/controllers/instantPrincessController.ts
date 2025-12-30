import { Request, Response } from 'express';
import db from '../config/database';

// 現在出勤中の即姫キャスト一覧を取得（公開用）
export const getAvailableInstantPrincess = (req: Request, res: Response) => {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

  const query = `
    SELECT DISTINCT 
      ip.id,
      c.id as cast_id,
      c.name as cast_name,
      c.age as cast_age,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as cast_image,
      ip.is_active,
      cs.start_time,
      cs.end_time,
      ip.created_at as instant_princess_since
    FROM casts c
    INNER JOIN instant_princess ip ON c.id = ip.cast_id AND ip.is_active = 1
    INNER JOIN cast_schedules cs ON c.id = cs.cast_id 
      AND cs.date = ? 
      AND cs.start_time <= ? 
      AND cs.end_time > ?
      AND cs.is_available = 1
    WHERE c.status = 'available'
    ORDER BY ip.created_at DESC
  `;

  db.all(query, [currentDate, currentTime, currentTime], (err, princesses) => {
    if (err) {
      console.error('即姫取得エラー:', err);
      return res.status(500).json({ message: '即姫の取得に失敗しました' });
    }

    res.json({ princesses });
  });
};

// ========================================
// 管理画面用機能
// ========================================

// 全即姫設定を取得（管理画面用）
export const getAllInstantPrincess = (req: Request, res: Response) => {
  const query = `
    SELECT 
      ip.id,
      ip.cast_id,
      c.name as cast_name,
      c.age as cast_age,
      ip.is_active,
      ip.created_at,
      ip.updated_at,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as primary_image
    FROM instant_princess ip
    INNER JOIN casts c ON ip.cast_id = c.id
    ORDER BY ip.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('即姫設定取得エラー:', err);
      return res.status(500).json({ message: '即姫設定の取得に失敗しました' });
    }

    res.json(rows);
  });
};

// 即姫設定を作成
export const createInstantPrincess = (req: Request, res: Response) => {
  const { cast_id } = req.body;

  if (!cast_id) {
    return res.status(400).json({ message: 'キャストIDは必須です' });
  }

  // 既に登録されているか確認
  db.get(
    'SELECT id FROM instant_princess WHERE cast_id = ?',
    [cast_id],
    (err, existing) => {
      if (err) {
        console.error('重複チェックエラー:', err);
        return res.status(500).json({ message: '即姫設定の確認に失敗しました' });
      }

      if (existing) {
        return res.status(400).json({ message: 'このキャストは既に即姫に設定されています' });
      }

      // 即姫設定を挿入
      db.run(
        `INSERT INTO instant_princess (cast_id, is_active) VALUES (?, 1)`,
        [cast_id],
        function (err) {
          if (err) {
            console.error('即姫設定作成エラー:', err);
            return res.status(500).json({ message: '即姫設定の作成に失敗しました' });
          }

          // 作成した設定を取得
          db.get(
            `SELECT ip.*, c.name as cast_name 
             FROM instant_princess ip
             INNER JOIN casts c ON ip.cast_id = c.id
             WHERE ip.id = ?`,
            [this.lastID],
            (err, instantPrincess) => {
              if (err) {
                return res.status(500).json({ message: '即姫設定の取得に失敗しました' });
              }

              res.status(201).json({
                success: true,
                message: '即姫設定を作成しました',
                instantPrincess,
              });
            }
          );
        }
      );
    }
  );
};

// 即姫設定を更新
export const updateInstantPrincess = (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_active } = req.body;

  const updates: string[] = [];
  const params: any[] = [];

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
    `UPDATE instant_princess SET ${updates.join(', ')} WHERE id = ?`,
    params,
    function (err) {
      if (err) {
        console.error('即姫設定更新エラー:', err);
        return res.status(500).json({ message: '即姫設定の更新に失敗しました' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: '即姫設定が見つかりません' });
      }

      db.get(
        `SELECT ip.*, c.name as cast_name 
         FROM instant_princess ip
         INNER JOIN casts c ON ip.cast_id = c.id
         WHERE ip.id = ?`,
        [id],
        (err, instantPrincess) => {
          if (err) {
            return res.status(500).json({ message: '即姫設定の取得に失敗しました' });
          }

          res.json({
            success: true,
            message: '即姫設定を更新しました',
            instantPrincess,
          });
        }
      );
    }
  );
};

// 即姫設定を削除
export const deleteInstantPrincess = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM instant_princess WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('即姫設定削除エラー:', err);
      return res.status(500).json({ message: '即姫設定の削除に失敗しました' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: '即姫設定が見つかりません' });
    }

    res.json({
      success: true,
      message: '即姫設定を削除しました',
    });
  });
};

// 現在出勤中のキャスト一覧を取得（即姫設定用）
export const getCurrentlyWorkingCasts = (req: Request, res: Response) => {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

  const query = `
    SELECT DISTINCT 
      c.id,
      c.name,
      c.age,
      c.status,
      cs.start_time,
      cs.end_time,
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as primary_image,
      CASE WHEN ip.id IS NOT NULL THEN 1 ELSE 0 END as is_instant_princess
    FROM casts c
    INNER JOIN cast_schedules cs ON c.id = cs.cast_id 
      AND cs.date = ? 
      AND cs.start_time <= ? 
      AND cs.end_time > ?
      AND cs.is_available = 1
    LEFT JOIN instant_princess ip ON c.id = ip.cast_id AND ip.is_active = 1
    WHERE c.status = 'available'
    ORDER BY c.name
  `;

  db.all(query, [currentDate, currentTime, currentTime], (err, rows) => {
    if (err) {
      console.error('出勤中キャスト取得エラー:', err);
      return res.status(500).json({ message: '出勤中キャストの取得に失敗しました' });
    }

    res.json(rows);
  });
};
