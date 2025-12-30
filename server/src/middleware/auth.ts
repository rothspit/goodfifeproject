import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '../../data/database.sqlite');

export interface AuthRequest extends Request {
  userId?: number;
  userType?: 'user' | 'cast' | 'admin';
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: '認証トークンがありません' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      userType: 'user' | 'cast' | 'admin';
    };

    req.userId = decoded.userId;
    req.userType = decoded.userType;
    
    // データベースからユーザー情報を取得してroleを含める
    try {
      const db = new Database(dbPath);
      const user = db.prepare('SELECT id, phone_number, name, email, role FROM users WHERE id = ?').get(decoded.userId);
      db.close();
      
      if (user) {
        // customerControllerとの互換性のため、userオブジェクトを設定
        (req as any).user = {
          id: user.id,
          phone_number: user.phone_number,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          type: decoded.userType
        };
      } else {
        (req as any).user = {
          id: decoded.userId,
          type: decoded.userType,
          role: 'user'
        };
      }
    } catch (dbError) {
      console.error('ユーザー情報取得エラー:', dbError);
      (req as any).user = {
        id: decoded.userId,
        type: decoded.userType,
        role: 'user'
      };
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: '無効な認証トークンです' });
  }
};

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: number;
        userType: 'user' | 'cast' | 'admin';
      };
      req.userId = decoded.userId;
      req.userType = decoded.userType;
    }
    next();
  } catch (error) {
    next();
  }
};
