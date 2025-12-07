import { Request, Response } from 'express';
import db from '../config/database';

export const getCasts = (req: Request, res: Response) => {
  const {
    name,
    date,
    time,
    min_height,
    max_height,
    min_age,
    max_age,
    cup_size,
    blood_type,
    is_new,
    smoking_ok,
    tattoo,
    threesome_ok,
    hairless,
    home_visit_ok,
    clothing_request_ok,
    overnight_ok,
    sweet_sadist_ok,
    has_children,
  } = req.query;

  let query = `
    SELECT DISTINCT c.*, 
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as primary_image,
      (SELECT COUNT(*) FROM reviews WHERE cast_id = c.id) as review_count,
      (SELECT AVG(rating) FROM reviews WHERE cast_id = c.id) as avg_rating
    FROM casts c
    WHERE 1=1
  `;

  const params: any[] = [];

  // 名前検索
  if (name) {
    query += ' AND c.name LIKE ?';
    params.push(`%${name}%`);
  }

  // 年齢フィルター
  if (min_age) {
    query += ' AND c.age >= ?';
    params.push(min_age);
  }
  if (max_age) {
    query += ' AND c.age <= ?';
    params.push(max_age);
  }

  // 身長フィルター
  if (min_height) {
    query += ' AND c.height >= ?';
    params.push(min_height);
  }
  if (max_height) {
    query += ' AND c.height <= ?';
    params.push(max_height);
  }

  // カップサイズ
  if (cup_size) {
    query += ' AND c.cup_size = ?';
    params.push(cup_size);
  }

  // 血液型
  if (blood_type) {
    query += ' AND c.blood_type = ?';
    params.push(blood_type);
  }

  // 出産経験
  if (has_children !== undefined) {
    query += ' AND c.has_children = ?';
    params.push(has_children === 'true' ? 1 : 0);
  }

  // こだわりオプション
  if (is_new === 'true') {
    query += ' AND c.is_new = 1 AND c.new_until >= datetime("now")';
  }
  if (smoking_ok === 'false') {
    query += ' AND c.smoking_ok = 0';
  }
  if (tattoo === 'false') {
    query += ' AND c.tattoo = 0';
  }
  if (threesome_ok === 'true') {
    query += ' AND c.threesome_ok = 1';
  }
  if (hairless === 'true') {
    query += ' AND c.hairless = 1';
  }
  if (home_visit_ok === 'true') {
    query += ' AND c.home_visit_ok = 1';
  }
  if (clothing_request_ok === 'true') {
    query += ' AND c.clothing_request_ok = 1';
  }
  if (overnight_ok === 'true') {
    query += ' AND c.overnight_ok = 1';
  }
  if (sweet_sadist_ok === 'true') {
    query += ' AND c.sweet_sadist_ok = 1';
  }

  // 日時での絞り込み
  if (date && time) {
    query += `
      AND EXISTS (
        SELECT 1 FROM cast_schedules cs 
        WHERE cs.cast_id = c.id 
        AND cs.date = ? 
        AND cs.start_time <= ? 
        AND cs.end_time >= ?
        AND cs.is_available = 1
      )
    `;
    params.push(date, time, time);
  }

  query += ' ORDER BY c.created_at DESC';

  db.all(query, params, (err, casts) => {
    if (err) {
      console.error('キャスト取得エラー:', err);
      return res.status(500).json({ message: 'データベースエラー' });
    }

    res.json({ casts });
  });
};

export const getCastById = (req: Request, res: Response) => {
  const { id } = req.params;

  db.get(
    `SELECT c.*, 
      (SELECT COUNT(*) FROM reviews WHERE cast_id = c.id) as review_count,
      (SELECT AVG(rating) FROM reviews WHERE cast_id = c.id) as avg_rating
    FROM casts c 
    WHERE c.id = ?`,
    [id],
    (err, cast: any) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      if (!cast) {
        return res.status(404).json({ message: 'キャストが見つかりません' });
      }

      // 画像を取得
      db.all(
        'SELECT * FROM cast_images WHERE cast_id = ? ORDER BY is_primary DESC, display_order ASC',
        [id],
        (err, images) => {
          if (err) {
            return res.status(500).json({ message: 'データベースエラー' });
          }

          // スケジュールを取得
          db.all(
            'SELECT * FROM cast_schedules WHERE cast_id = ? AND date >= date("now") ORDER BY date, start_time',
            [id],
            (err, schedules) => {
              if (err) {
                return res.status(500).json({ message: 'データベースエラー' });
              }

              // 口コミを取得
              db.all(
                `SELECT r.*, u.name as user_name 
                FROM reviews r 
                LEFT JOIN users u ON r.user_id = u.id 
                WHERE r.cast_id = ? 
                ORDER BY r.created_at DESC 
                LIMIT 10`,
                [id],
                (err, reviews) => {
                  if (err) {
                    return res.status(500).json({ message: 'データベースエラー' });
                  }

                  res.json({
                    cast: {
                      ...cast,
                      images,
                      schedules,
                      reviews,
                    },
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};

export const getAvailableCasts = (req: Request, res: Response) => {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

  db.all(
    `SELECT c.*, 
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as primary_image,
      cs.start_time, cs.end_time
    FROM casts c
    INNER JOIN cast_schedules cs ON c.id = cs.cast_id
    WHERE cs.date = ? 
    AND cs.start_time <= ? 
    AND cs.end_time >= ?
    AND cs.is_available = 1
    AND c.status = 'available'
    ORDER BY cs.start_time ASC`,
    [currentDate, currentTime, currentTime],
    (err, casts) => {
      if (err) {
        console.error('すぐ呼べるキャスト取得エラー:', err);
        return res.status(500).json({ message: 'データベースエラー' });
      }

      res.json({ casts });
    }
  );
};

export const getCastSchedule = (req: Request, res: Response) => {
  const { id } = req.params;
  const { start_date, end_date } = req.query;

  let query = 'SELECT * FROM cast_schedules WHERE cast_id = ?';
  const params: any[] = [id];

  if (start_date) {
    query += ' AND date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY date, start_time';

  db.all(query, params, (err, schedules) => {
    if (err) {
      return res.status(500).json({ message: 'データベースエラー' });
    }

    res.json({ schedules });
  });
};
