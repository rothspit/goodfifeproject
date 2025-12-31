import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * キャストログイン
 */
export const castLogin = (req: Request, res: Response) => {
  const { cast_id, password } = req.body;

  if (!cast_id || !password) {
    return res.status(400).json({ message: 'キャストIDとパスワードを入力してください' });
  }

  // キャストIDでキャストを検索（cast_idは実際にはidカラム）
  db.get(
    'SELECT * FROM casts WHERE id = ?',
    [cast_id],
    async (err, cast: any) => {
      if (err) {
        console.error('キャスト検索エラー:', err);
        return res.status(500).json({ message: 'データベースエラー' });
      }

      if (!cast) {
        return res.status(401).json({ message: 'キャストIDまたはパスワードが正しくありません' });
      }

      // パスワード検証（仮実装：平文比較）
      // TODO: 本番環境ではbcryptでハッシュ化すること
      if (cast.password && cast.password !== password) {
        return res.status(401).json({ message: 'キャストIDまたはパスワードが正しくありません' });
      }

      // JWTトークン生成
      const token = jwt.sign(
        {
          id: cast.id,
          name: cast.name,
          role: 'cast',
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'ログインに成功しました',
        token,
        cast: {
          id: cast.id,
          name: cast.name,
          age: cast.age,
          role: 'cast',
        },
      });
    }
  );
};

/**
 * キャスト情報取得
 */
export const getCastProfile = (req: any, res: Response) => {
  const castId = req.castId;

  db.get(
    'SELECT id, name, age, height, back_rate FROM casts WHERE id = ?',
    [castId],
    (err, cast: any) => {
      if (err) {
        return res.status(500).json({ message: 'データベースエラー' });
      }

      if (!cast) {
        return res.status(404).json({ message: 'キャストが見つかりません' });
      }

      res.json({ cast });
    }
  );
};
