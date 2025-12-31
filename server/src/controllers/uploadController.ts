import { Request, Response } from 'express';
import db from '../config/database';

export const uploadCastImages = (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: '画像がアップロードされていません' 
      });
    }

    const imageUrls = files.map((file) => {
      // ファイル名をサーバーのURLに変換
      return `/uploads/${file.filename}`;
    });

    res.json({
      success: true,
      message: `${files.length}枚の画像をアップロードしました`,
      images: imageUrls,
    });
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    res.status(500).json({ 
      success: false,
      message: '画像のアップロードに失敗しました' 
    });
  }
};

export const saveCastImages = (req: Request, res: Response) => {
  const { cast_id, image_urls } = req.body;

  if (!cast_id || !image_urls || !Array.isArray(image_urls)) {
    return res.status(400).json({ 
      success: false,
      message: 'キャストIDと画像URLが必要です' 
    });
  }

  // 既存の画像を削除
  db.run('DELETE FROM cast_images WHERE cast_id = ?', [cast_id], (err) => {
    if (err) {
      console.error('既存画像削除エラー:', err);
      return res.status(500).json({ 
        success: false,
        message: '既存画像の削除に失敗しました' 
      });
    }

    // 新しい画像を保存
    let completed = 0;
    let hasError = false;

    image_urls.forEach((imageUrl: string, index: number) => {
      const isPrimary = index === 0 ? 1 : 0;

      db.run(
        'INSERT INTO cast_images (cast_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
        [cast_id, imageUrl, isPrimary, index],
        (err) => {
          completed++;

          if (err && !hasError) {
            hasError = true;
            console.error('画像保存エラー:', err);
            return res.status(500).json({ 
              success: false,
              message: '画像の保存に失敗しました' 
            });
          }

          if (completed === image_urls.length && !hasError) {
            res.json({
              success: true,
              message: '画像を保存しました',
            });
          }
        }
      );
    });
  });
};

// キャスト画像を追加
export const addCastImage = (req: Request, res: Response) => {
  const { cast_id, image_url, is_primary, display_order } = req.body;

  if (!cast_id || !image_url) {
    return res.status(400).json({
      success: false,
      message: 'キャストIDと画像URLが必要です',
    });
  }

  // is_primaryが1の場合、既存のprimaryを0にする
  if (is_primary === 1) {
    db.run(
      'UPDATE cast_images SET is_primary = 0 WHERE cast_id = ?',
      [cast_id],
      (err) => {
        if (err) {
          console.error('既存プライマリ画像更新エラー:', err);
        }
      }
    );
  }

  db.run(
    'INSERT INTO cast_images (cast_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
    [cast_id, image_url, is_primary || 0, display_order || 0],
    function (err) {
      if (err) {
        console.error('画像追加エラー:', err);
        return res.status(500).json({
          success: false,
          message: '画像の追加に失敗しました',
        });
      }

      res.status(201).json({
        success: true,
        message: '画像を追加しました',
        image: {
          id: this.lastID,
          cast_id,
          image_url,
          is_primary: is_primary || 0,
          display_order: display_order || 0,
        },
      });
    }
  );
};

// キャスト画像を削除
export const deleteCastImage = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM cast_images WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('画像削除エラー:', err);
      return res.status(500).json({
        success: false,
        message: '画像の削除に失敗しました',
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: '画像が見つかりません',
      });
    }

    res.json({
      success: true,
      message: '画像を削除しました',
    });
  });
};

// キャスト画像をメインに設定
export const setPrimaryCastImage = (req: Request, res: Response) => {
  const { id } = req.params;

  // まず、画像のcast_idを取得
  db.get('SELECT cast_id FROM cast_images WHERE id = ?', [id], (err, image: any) => {
    if (err) {
      console.error('画像取得エラー:', err);
      return res.status(500).json({
        success: false,
        message: '画像の取得に失敗しました',
      });
    }

    if (!image) {
      return res.status(404).json({
        success: false,
        message: '画像が見つかりません',
      });
    }

    // 同じキャストの他の画像のis_primaryを0にする
    db.run(
      'UPDATE cast_images SET is_primary = 0 WHERE cast_id = ?',
      [image.cast_id],
      (err) => {
        if (err) {
          console.error('既存プライマリ画像更新エラー:', err);
          return res.status(500).json({
            success: false,
            message: 'プライマリ画像の更新に失敗しました',
          });
        }

        // 指定された画像をプライマリに設定
        db.run(
          'UPDATE cast_images SET is_primary = 1 WHERE id = ?',
          [id],
          function (err) {
            if (err) {
              console.error('プライマリ画像設定エラー:', err);
              return res.status(500).json({
                success: false,
                message: 'プライマリ画像の設定に失敗しました',
              });
            }

            res.json({
              success: true,
              message: 'メイン画像を設定しました',
            });
          }
        );
      }
    );
  });
};
