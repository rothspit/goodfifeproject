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
    admin,
    store_id,
  } = req.query;

  let query = `
    SELECT DISTINCT c.*, 
      (SELECT image_url FROM cast_images WHERE cast_id = c.id AND is_primary = 1 LIMIT 1) as primary_image,
      (SELECT COUNT(*) FROM reviews WHERE cast_id = c.id) as review_count,
      (SELECT AVG(rating) FROM reviews WHERE cast_id = c.id) as avg_rating,
      CASE 
        WHEN c.is_new = 1 AND c.new_until >= NOW() THEN 1
        ELSE 0
      END as is_currently_new
    FROM casts c
    WHERE 1=1
  `;

  const params: any[] = [];

  // 店舗フィルター
  if (store_id) {
    query += ' AND c.store_id = ?';
    params.push(store_id);
  }

  // 公開/非公開フィルター (管理者以外は公開のみ)
  if (admin !== 'true') {
    query += ' AND c.is_public = 1';
  }

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

  // こだわりオプション（新人フィルター）
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

  // 管理者の場合はdisplay_orderでソート、公開ページはcreated_atでソート
  if (admin === 'true') {
    query += ' ORDER BY c.display_order ASC, c.id ASC';
  } else {
    query += ' ORDER BY c.created_at DESC';
  }

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
  const { admin } = req.query;

  // 公開/非公開フィルター (管理者以外は公開のみ)
  const publicFilter = admin === 'true' ? '' : ' AND c.is_public = 1';

  db.get(
    `SELECT c.*, 
      (SELECT COUNT(*) FROM reviews WHERE cast_id = c.id) as review_count,
      (SELECT AVG(rating) FROM reviews WHERE cast_id = c.id) as avg_rating
    FROM casts c 
    WHERE c.id = ?${publicFilter}`,
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

                  // ブログ（写メ日記）を取得
                  db.all(
                    `SELECT * FROM blogs 
                    WHERE cast_id = ? 
                    ORDER BY created_at DESC 
                    LIMIT 10`,
                    [id],
                    (err, blogs) => {
                      if (err) {
                        return res.status(500).json({ message: 'データベースエラー' });
                      }

                      res.json({
                        cast: {
                          ...cast,
                          images,
                          schedules,
                          reviews,
                          blogs,
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

// キャスト作成
export const createCast = (req: Request, res: Response) => {
  const {
    name,
    age,
    height,
    bust,
    waist,
    hip,
    cup_size,
    blood_type,
    cast_comment,
    manager_comment,
    profile_text,
    is_new,
    smoking_ok,
    tattoo,
    has_children,
    threesome_ok,
    home_visit_ok,
    clothing_request_ok,
    overnight_ok,
    sweet_sadist_ok,
    hairless,
    deep_kiss,
    body_lip,
    sixtynine,
    fellatio,
    sumata,
    rotor,
    vibrator,
    no_panties_visit,
    no_bra_visit,
    pantyhose,
    pantyhose_rip,
    instant_cunnilingus,
    instant_fellatio,
    night_crawling_set,
    lotion_bath,
    mini_electric_massager,
    remote_vibrator_meetup,
    holy_water,
    anal_fuck,
    image_urls,
  } = req.body;

  if (!name || !age || !height || !bust || !waist || !hip || !cup_size) {
    return res.status(400).json({ message: '必須項目を入力してください' });
  }

  // 新人の場合、new_untilを1ヶ月後に設定
  const newUntil = is_new 
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30日後
    : null;

  const query = `
    INSERT INTO casts (
      name, age, height, bust, waist, hip, cup_size, blood_type,
      cast_comment, manager_comment, profile_text, is_new, new_until,
      smoking_ok, tattoo, has_children, threesome_ok, home_visit_ok,
      clothing_request_ok, overnight_ok, sweet_sadist_ok, hairless,
      deep_kiss, body_lip, sixtynine, fellatio, sumata, rotor, vibrator,
      no_panties_visit, no_bra_visit, pantyhose, pantyhose_rip,
      instant_cunnilingus, instant_fellatio, night_crawling_set,
      lotion_bath, mini_electric_massager, remote_vibrator_meetup,
      holy_water, anal_fuck, status, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
  `;

  const params = [
    name, age, height, bust, waist, hip, cup_size, blood_type || null,
    cast_comment || null, manager_comment || null, profile_text || null, is_new ? 1 : 0, newUntil,
    smoking_ok ? 1 : 0, tattoo ? 1 : 0, has_children ? 1 : 0, threesome_ok ? 1 : 0, home_visit_ok ? 1 : 0,
    clothing_request_ok ? 1 : 0, overnight_ok ? 1 : 0, sweet_sadist_ok ? 1 : 0, hairless ? 1 : 0,
    deep_kiss ? 1 : 0, body_lip ? 1 : 0, sixtynine ? 1 : 0, fellatio ? 1 : 0, sumata ? 1 : 0, rotor ? 1 : 0, vibrator ? 1 : 0,
    no_panties_visit ? 1 : 0, no_bra_visit ? 1 : 0, pantyhose ? 1 : 0, pantyhose_rip ? 1 : 0,
    instant_cunnilingus ? 1 : 0, instant_fellatio ? 1 : 0, night_crawling_set ? 1 : 0,
    lotion_bath ? 1 : 0, mini_electric_massager ? 1 : 0, remote_vibrator_meetup ? 1 : 0,
    holy_water ? 1 : 0, anal_fuck ? 1 : 0,
  ];

  db.run(query, params, function (err) {
    if (err) {
      console.error('キャスト登録エラー:', err);
      return res.status(500).json({ message: 'キャストの登録に失敗しました' });
    }

    const castId = this.lastID;

    // 画像URLが提供されている場合は画像を保存
    if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
      let completed = 0;
      let hasError = false;

      image_urls.forEach((imageUrl: string, index: number) => {
        const isPrimary = index === 0 ? 1 : 0;

        db.run(
          'INSERT INTO cast_images (cast_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
          [castId, imageUrl, isPrimary, index],
          (err) => {
            completed++;

            if (err && !hasError) {
              hasError = true;
              console.error('画像保存エラー:', err);
            }

            if (completed === image_urls.length) {
              res.status(201).json({
                success: true,
                message: 'キャストと画像を登録しました',
                cast: {
                  id: castId,
                  name,
                  age,
                },
              });
            }
          }
        );
      });
    } else {
      res.status(201).json({
        success: true,
        message: 'キャストを登録しました',
        cast: {
          id: castId,
          name,
          age,
        },
      });
    }
  });
};

// キャスト更新
export const updateCast = (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    age,
    height,
    bust,
    waist,
    hip,
    cup_size,
    blood_type,
    cast_comment,
    manager_comment,
    profile_text,
    is_new,
    smoking_ok,
    tattoo,
    has_children,
    threesome_ok,
    home_visit_ok,
    clothing_request_ok,
    overnight_ok,
    sweet_sadist_ok,
    hairless,
    deep_kiss,
    body_lip,
    sixtynine,
    fellatio,
    sumata,
    rotor,
    vibrator,
    no_panties_visit,
    no_bra_visit,
    pantyhose,
    pantyhose_rip,
    instant_cunnilingus,
    instant_fellatio,
    night_crawling_set,
    lotion_bath,
    mini_electric_massager,
    remote_vibrator_meetup,
    holy_water,
    anal_fuck,
    status,
  } = req.body;

  const query = `
    UPDATE casts SET
      name = ?, age = ?, height = ?, bust = ?, waist = ?, hip = ?, cup_size = ?, blood_type = ?,
      cast_comment = ?, manager_comment = ?, profile_text = ?, is_new = ?,
      smoking_ok = ?, tattoo = ?, has_children = ?, threesome_ok = ?, home_visit_ok = ?,
      clothing_request_ok = ?, overnight_ok = ?, sweet_sadist_ok = ?, hairless = ?,
      deep_kiss = ?, body_lip = ?, sixtynine = ?, fellatio = ?, sumata = ?, rotor = ?, vibrator = ?,
      no_panties_visit = ?, no_bra_visit = ?, pantyhose = ?, pantyhose_rip = ?,
      instant_cunnilingus = ?, instant_fellatio = ?, night_crawling_set = ?,
      lotion_bath = ?, mini_electric_massager = ?, remote_vibrator_meetup = ?,
      holy_water = ?, anal_fuck = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const params = [
    name, age, height, bust, waist, hip, cup_size, blood_type || null,
    cast_comment || null, manager_comment || null, profile_text || null, is_new ? 1 : 0,
    smoking_ok ? 1 : 0, tattoo ? 1 : 0, has_children ? 1 : 0, threesome_ok ? 1 : 0, home_visit_ok ? 1 : 0,
    clothing_request_ok ? 1 : 0, overnight_ok ? 1 : 0, sweet_sadist_ok ? 1 : 0, hairless ? 1 : 0,
    deep_kiss ? 1 : 0, body_lip ? 1 : 0, sixtynine ? 1 : 0, fellatio ? 1 : 0, sumata ? 1 : 0, rotor ? 1 : 0, vibrator ? 1 : 0,
    no_panties_visit ? 1 : 0, no_bra_visit ? 1 : 0, pantyhose ? 1 : 0, pantyhose_rip ? 1 : 0,
    instant_cunnilingus ? 1 : 0, instant_fellatio ? 1 : 0, night_crawling_set ? 1 : 0,
    lotion_bath ? 1 : 0, mini_electric_massager ? 1 : 0, remote_vibrator_meetup ? 1 : 0,
    holy_water ? 1 : 0, anal_fuck ? 1 : 0, status || 'available',
    id,
  ];

  db.run(query, params, function (err) {
    if (err) {
      console.error('キャスト更新エラー:', err);
      return res.status(500).json({ message: 'キャストの更新に失敗しました' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'キャストが見つかりません' });
    }

    res.json({
      success: true,
      message: 'キャストを更新しました',
    });
  });
};

// キャスト削除
export const deleteCast = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM casts WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('キャスト削除エラー:', err);
      return res.status(500).json({ message: 'キャストの削除に失敗しました' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'キャストが見つかりません' });
    }

    res.json({
      success: true,
      message: 'キャストを削除しました',
    });
  });
};

// ========================================
// スケジュール管理機能
// ========================================

// 全キャストのスケジュールを取得（管理画面用）
export const getAllSchedules = (req: Request, res: Response) => {
  const { start_date, end_date, cast_id, store_id } = req.query;

  let query = `
    SELECT cs.*, c.name as cast_name
    FROM cast_schedules cs
    INNER JOIN casts c ON cs.cast_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (store_id) {
    query += ' AND c.store_id = ?';
    params.push(store_id);
  }

  if (cast_id) {
    query += ' AND cs.cast_id = ?';
    params.push(cast_id);
  }

  if (start_date) {
    query += ' AND cs.date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND cs.date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY cs.date, cs.start_time, c.name';

  db.all(query, params, (err, schedules) => {
    if (err) {
      console.error('スケジュール取得エラー:', err);
      return res.status(500).json({ message: 'スケジュールの取得に失敗しました' });
    }

    res.json({ schedules });
  });
};

// スケジュールを作成
export const createSchedule = (req: Request, res: Response) => {
  const { cast_id, date, start_time, end_time, is_available } = req.body;

  // 必須項目のチェック
  if (!cast_id || !date || !start_time || !end_time) {
    return res.status(400).json({
      message: 'キャスト、日付、開始時刻、終了時刻は必須です',
    });
  }

  // 同じキャスト・日付・時間帯の重複チェック
  db.get(
    `SELECT id FROM cast_schedules 
     WHERE cast_id = ? AND date = ? 
     AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
    [cast_id, date, start_time, start_time, end_time, end_time],
    (err, existing) => {
      if (err) {
        console.error('スケジュール重複チェックエラー:', err);
        return res.status(500).json({ message: 'スケジュールの確認に失敗しました' });
      }

      if (existing) {
        return res.status(400).json({
          message: 'この時間帯は既に登録されています',
        });
      }

      // スケジュールを挿入
      db.run(
        `INSERT INTO cast_schedules (cast_id, date, start_time, end_time, is_available)
         VALUES (?, ?, ?, ?, ?)`,
        [cast_id, date, start_time, end_time, is_available !== undefined ? is_available : 1],
        function (err) {
          if (err) {
            console.error('スケジュール作成エラー:', err);
            return res.status(500).json({ message: 'スケジュールの作成に失敗しました' });
          }

          // 作成したスケジュールを取得して返す
          db.get(
            `SELECT cs.*, c.name as cast_name 
             FROM cast_schedules cs
             INNER JOIN casts c ON cs.cast_id = c.id
             WHERE cs.id = ?`,
            [this.lastID],
            (err, schedule) => {
              if (err) {
                return res.status(500).json({ message: 'スケジュールの取得に失敗しました' });
              }

              res.status(201).json({
                success: true,
                message: 'スケジュールを登録しました',
                schedule,
              });
            }
          );
        }
      );
    }
  );
};

// スケジュールを更新
export const updateSchedule = (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, start_time, end_time, is_available } = req.body;

  // 更新するフィールドを動的に構築
  const updates: string[] = [];
  const params: any[] = [];

  if (date !== undefined) {
    updates.push('date = ?');
    params.push(date);
  }

  if (start_time !== undefined) {
    updates.push('start_time = ?');
    params.push(start_time);
  }

  if (end_time !== undefined) {
    updates.push('end_time = ?');
    params.push(end_time);
  }

  if (is_available !== undefined) {
    updates.push('is_available = ?');
    params.push(is_available ? 1 : 0);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: '更新する項目がありません' });
  }

  params.push(id);

  db.run(
    `UPDATE cast_schedules SET ${updates.join(', ')} WHERE id = ?`,
    params,
    function (err) {
      if (err) {
        console.error('スケジュール更新エラー:', err);
        return res.status(500).json({ message: 'スケジュールの更新に失敗しました' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'スケジュールが見つかりません' });
      }

      // 更新したスケジュールを取得して返す
      db.get(
        `SELECT cs.*, c.name as cast_name 
         FROM cast_schedules cs
         INNER JOIN casts c ON cs.cast_id = c.id
         WHERE cs.id = ?`,
        [id],
        (err, schedule) => {
          if (err) {
            return res.status(500).json({ message: 'スケジュールの取得に失敗しました' });
          }

          res.json({
            success: true,
            message: 'スケジュールを更新しました',
            schedule,
          });
        }
      );
    }
  );
};

// スケジュールを削除
export const deleteSchedule = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM cast_schedules WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('スケジュール削除エラー:', err);
      return res.status(500).json({ message: 'スケジュールの削除に失敗しました' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'スケジュールが見つかりません' });
    }

    res.json({
      success: true,
      message: 'スケジュールを削除しました',
    });
  });
};

// 一括スケジュール登録（複数日・複数キャスト対応）
export const bulkCreateSchedules = (req: Request, res: Response) => {
  const { schedules } = req.body;

  if (!Array.isArray(schedules) || schedules.length === 0) {
    return res.status(400).json({
      message: 'スケジュールの配列が必要です',
    });
  }

  // トランザクションで一括挿入
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    let completed = 0;
    let hasError = false;
    const errors: string[] = [];

    schedules.forEach((schedule, index) => {
      const { cast_id, date, start_time, end_time, is_available } = schedule;

      if (!cast_id || !date || !start_time || !end_time) {
        errors.push(`スケジュール${index + 1}: 必須項目が不足しています`);
        completed++;
        hasError = true;
        return;
      }

      db.run(
        `INSERT INTO cast_schedules (cast_id, date, start_time, end_time, is_available)
         VALUES (?, ?, ?, ?, ?)`,
        [cast_id, date, start_time, end_time, is_available !== undefined ? is_available : 1],
        function (err) {
          if (err) {
            console.error(`スケジュール${index + 1}挿入エラー:`, err);
            errors.push(`スケジュール${index + 1}: ${err.message}`);
            hasError = true;
          }

          completed++;

          if (completed === schedules.length) {
            if (hasError) {
              db.run('ROLLBACK');
              return res.status(400).json({
                message: '一部のスケジュール登録に失敗しました',
                errors,
              });
            }

            db.run('COMMIT', (err) => {
              if (err) {
                return res.status(500).json({ message: 'コミットに失敗しました' });
              }

              res.status(201).json({
                success: true,
                message: `${schedules.length}件のスケジュールを登録しました`,
              });
            });
          }
        }
      );
    });
  });
};

// キャスト並び順更新
export const updateCastDisplayOrder = (req: Request, res: Response) => {
  const { orders } = req.body; // orders: [{ id: number, display_order: number }]

  if (!orders || !Array.isArray(orders)) {
    return res.status(400).json({
      success: false,
      message: '並び順データが不正です',
    });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    try {
      const stmt = db.prepare('UPDATE casts SET display_order = ? WHERE id = ?');

      orders.forEach((item: { id: number; display_order: number }) => {
        stmt.run(item.display_order, item.id, (err: Error | null) => {
          if (err) {
            throw err;
          }
        });
      });

      stmt.finalize();

      db.run('COMMIT', (err: Error | null) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'トランザクションのコミットに失敗しました',
          });
        }

        res.json({
          success: true,
          message: `${orders.length}件のキャストの並び順を更新しました`,
        });
      });
    } catch (error) {
      db.run('ROLLBACK');
      console.error('並び順更新エラー:', error);
      res.status(500).json({
        success: false,
        message: '並び順の更新に失敗しました',
      });
    }
  });
};
