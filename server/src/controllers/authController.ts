import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database';

export const register = async (req: Request, res: Response) => {
  try {
    const { phone_number, password, name, email } = req.body;

    if (!phone_number || !password) {
      return res.status(400).json({ message: '電話番号とパスワードは必須です' });
    }

    // 電話番号の重複チェック
    db.get(
      'SELECT * FROM users WHERE phone_number = ?',
      [phone_number],
      async (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'データベースエラー' });
        }

        if (row) {
          return res.status(400).json({ message: 'この電話番号は既に登録されています' });
        }

        // パスワードのハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);

        // ユーザー登録
        db.run(
          'INSERT INTO users (phone_number, password, name, email) VALUES (?, ?, ?, ?)',
          [phone_number, hashedPassword, name || null, email || null],
          function (this: any, err: any) {
            if (err) {
              return res.status(500).json({ message: 'ユーザー登録に失敗しました' });
            }

            // JWTトークン生成
            const token = jwt.sign(
              { userId: this.lastID, userType: 'user' },
              process.env.JWT_SECRET!,
              { expiresIn: '30d' }
            );

            res.status(201).json({
              message: '登録が完了しました',
              token,
              user: {
                id: this.lastID,
                phone_number,
                name: name || null,
                email: email || null,
              },
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('登録エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log('🔐 ログインリクエスト受信:', req.body);
    const { phone_number, password } = req.body;

    if (!phone_number || !password) {
      return res.status(400).json({ message: '電話番号とパスワードを入力してください' });
    }

    db.get(
      'SELECT * FROM users WHERE phone_number = ?',
      [phone_number],
      async (err, user: any) => {
        if (err) {
          return res.status(500).json({ message: 'データベースエラー' });
        }

        if (!user) {
          return res.status(401).json({ message: '電話番号またはパスワードが正しくありません' });
        }

        // パスワード検証
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return res.status(401).json({ message: '電話番号またはパスワードが正しくありません' });
        }

        // 最終ログイン時刻を更新
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        // JWTトークン生成
        const token = jwt.sign(
          { userId: user.id, userType: 'user' },
          process.env.JWT_SECRET!,
          { expiresIn: '30d' }
        );

        const response = {
          message: 'ログインしました',
          token,
          user: {
            id: user.id,
            phone_number: user.phone_number,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
          },
        };
        
        console.log('✅ ログイン成功レスポンス:', response);
        res.json(response);
      }
    );
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

export const getProfile = (req: Request, res: Response) => {
  const userId = (req as any).userId;

  db.get('SELECT id, phone_number, name, email, created_at, last_login FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'データベースエラー' });
    }

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    res.json({ user });
  });
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, email, current_password, new_password } = req.body;

    // パスワード変更の場合
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ message: '現在のパスワードを入力してください' });
      }

      db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user: any) => {
        if (err || !user) {
          return res.status(500).json({ message: 'データベースエラー' });
        }

        const isValidPassword = await bcrypt.compare(current_password, user.password);

        if (!isValidPassword) {
          return res.status(401).json({ message: '現在のパスワードが正しくありません' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        db.run(
          'UPDATE users SET password = ?, name = ?, email = ? WHERE id = ?',
          [hashedPassword, name, email, userId],
          (err) => {
            if (err) {
              return res.status(500).json({ message: '更新に失敗しました' });
            }
            res.json({ message: 'プロフィールを更新しました' });
          }
        );
      });
    } else {
      // 名前とメールアドレスのみ更新
      db.run(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, userId],
        (err) => {
          if (err) {
            return res.status(500).json({ message: '更新に失敗しました' });
          }
          res.json({ message: 'プロフィールを更新しました' });
        }
      );
    }
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};
