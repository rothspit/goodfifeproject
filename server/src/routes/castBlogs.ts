import express from 'express';
import { Request, Response } from 'express';
import db from '../config/database';
import { authenticateCast } from '../middleware/castAuth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// キャスト認証が必要
router.use(authenticateCast);

// 画像アップロード設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/blogs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('画像ファイルのみアップロード可能です'));
    }
  },
});

// キャストの日記一覧を取得
router.get('/my-blogs', (req: any, res: Response) => {
  const castId = req.castId;

  db.all(
    `SELECT b.*, c.name as cast_name
    FROM blogs b
    INNER JOIN casts c ON b.cast_id = c.id
    WHERE b.cast_id = ?
    ORDER BY b.created_at DESC`,
    [castId],
    (err, blogs) => {
      if (err) {
        console.error('日記取得エラー:', err);
        return res.status(500).json({ message: '日記の取得に失敗しました' });
      }

      res.json({ blogs });
    }
  );
});

// 日記を投稿
router.post('/create', upload.single('image'), (req: any, res: Response) => {
  const castId = req.castId;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'タイトルと内容は必須です' });
  }

  const imageUrl = req.file ? `/uploads/blogs/${req.file.filename}` : null;

  db.run(
    `INSERT INTO blogs (cast_id, title, content, image_url) VALUES (?, ?, ?, ?)`,
    [castId, title, content, imageUrl],
    function (err) {
      if (err) {
        console.error('日記作成エラー:', err);
        return res.status(500).json({ message: '日記の投稿に失敗しました' });
      }

      db.get(
        `SELECT b.*, c.name as cast_name
        FROM blogs b
        INNER JOIN casts c ON b.cast_id = c.id
        WHERE b.id = ?`,
        [this.lastID],
        (err, blog) => {
          if (err) {
            return res.status(500).json({ message: '日記の取得に失敗しました' });
          }

          res.status(201).json({
            success: true,
            message: '日記を投稿しました',
            blog,
          });
        }
      );
    }
  );
});

// 日記を削除
router.delete('/:id', (req: any, res: Response) => {
  const castId = req.castId;
  const { id } = req.params;

  // 自分の日記かチェック
  db.get(
    'SELECT * FROM blogs WHERE id = ? AND cast_id = ?',
    [id, castId],
    (err, blog: any) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      if (!blog) {
        return res.status(404).json({ message: '日記が見つかりません' });
      }

      // 画像ファイルを削除
      if (blog.image_url) {
        const imagePath = path.join(__dirname, '../../', blog.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // データベースから削除
      db.run('DELETE FROM blogs WHERE id = ?', [id], (err) => {
        if (err) {
          return res.status(500).json({ message: '日記の削除に失敗しました' });
        }

        res.json({ success: true, message: '日記を削除しました' });
      });
    }
  );
});

export default router;
