import { Request, Response } from 'express';
import db from '../config/database';
import crypto from 'crypto';

/**
 * ランダムなパスワードを生成
 */
function generatePassword(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  
  return password;
}

/**
 * 全キャストのログイン情報を取得
 */
export const getAllCastCredentials = (req: Request, res: Response) => {
  const query = `
    SELECT 
      id,
      name,
      age,
      password,
      is_public,
      created_at
    FROM casts
    ORDER BY id ASC
  `;

  db.all(query, [], (err, casts: any[]) => {
    if (err) {
      console.error('キャスト認証情報取得エラー:', err);
      return res.status(500).json({ message: 'データベースエラー' });
    }

    const credentials = casts.map(cast => ({
      id: cast.id,
      name: cast.name,
      age: cast.age,
      has_password: !!cast.password,
      password: cast.password || null,
      is_public: cast.is_public,
      created_at: cast.created_at,
    }));

    res.json({ credentials });
  });
};

/**
 * 特定のキャストのログイン情報を取得
 */
export const getCastCredential = (req: Request, res: Response) => {
  const { id } = req.params;

  db.get(
    'SELECT id, name, age, password FROM casts WHERE id = ?',
    [id],
    (err, cast: any) => {
      if (err) {
        console.error('キャスト認証情報取得エラー:', err);
        return res.status(500).json({ message: 'データベースエラー' });
      }

      if (!cast) {
        return res.status(404).json({ message: 'キャストが見つかりません' });
      }

      res.json({
        credential: {
          id: cast.id,
          name: cast.name,
          age: cast.age,
          password: cast.password,
          has_password: !!cast.password,
        },
      });
    }
  );
};

/**
 * キャストのパスワードを生成・更新
 */
export const generateCastPassword = (req: Request, res: Response) => {
  const { id } = req.params;
  const { password: customPassword } = req.body;

  // カスタムパスワードがあればそれを使用、なければ自動生成
  const newPassword = customPassword || generatePassword(10);

  db.run(
    'UPDATE casts SET password = ? WHERE id = ?',
    [newPassword, id],
    function (err) {
      if (err) {
        console.error('パスワード更新エラー:', err);
        return res.status(500).json({ message: 'パスワードの更新に失敗しました' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'キャストが見つかりません' });
      }

      // 更新後のキャスト情報を取得
      db.get(
        'SELECT id, name, password FROM casts WHERE id = ?',
        [id],
        (err, cast: any) => {
          if (err) {
            console.error('キャスト情報取得エラー:', err);
            return res.status(500).json({ message: 'データベースエラー' });
          }

          res.json({
            message: 'パスワードを生成しました',
            credential: {
              id: cast.id,
              name: cast.name,
              password: cast.password,
            },
          });
        }
      );
    }
  );
};

/**
 * キャストのパスワードを削除
 */
export const deleteCastPassword = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run(
    'UPDATE casts SET password = NULL WHERE id = ?',
    [id],
    function (err) {
      if (err) {
        console.error('パスワード削除エラー:', err);
        return res.status(500).json({ message: 'パスワードの削除に失敗しました' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'キャストが見つかりません' });
      }

      res.json({ message: 'パスワードを削除しました' });
    }
  );
};

/**
 * 複数キャストのパスワードを一括生成
 */
export const bulkGeneratePasswords = (req: Request, res: Response) => {
  const { cast_ids } = req.body;

  if (!cast_ids || !Array.isArray(cast_ids) || cast_ids.length === 0) {
    return res.status(400).json({ message: 'キャストIDの配列が必要です' });
  }

  const results: any[] = [];
  let completed = 0;

  cast_ids.forEach((castId) => {
    const newPassword = generatePassword(10);

    db.run(
      'UPDATE casts SET password = ? WHERE id = ?',
      [newPassword, castId],
      function (err) {
        completed++;

        if (!err && this.changes > 0) {
          db.get(
            'SELECT id, name, password FROM casts WHERE id = ?',
            [castId],
            (err, cast: any) => {
              if (!err && cast) {
                results.push({
                  id: cast.id,
                  name: cast.name,
                  password: cast.password,
                });
              }

              if (completed === cast_ids.length) {
                res.json({
                  message: `${results.length}件のパスワードを生成しました`,
                  credentials: results,
                });
              }
            }
          );
        } else {
          if (completed === cast_ids.length) {
            res.json({
              message: `${results.length}件のパスワードを生成しました`,
              credentials: results,
            });
          }
        }
      }
    );
  });
};
