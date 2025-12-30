import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface CastAuthRequest extends Request {
  castId?: number;
  cast?: any;
}

export const authenticateCast = (
  req: CastAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '認証トークンが必要です' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // キャストのトークンであることを確認
    if (decoded.role !== 'cast') {
      return res.status(403).json({ message: 'キャスト専用の機能です' });
    }

    req.castId = decoded.id;
    req.cast = decoded;
    next();
  } catch (error) {
    console.error('キャスト認証エラー:', error);
    return res.status(401).json({ message: '無効な認証トークンです' });
  }
};
