import { Request, Response } from 'express';
import twitterService from '../services/twitterService';
import db from '../config/database';

/**
 * X（Twitter）連携の設定を保存
 */
export const saveTwitterConfig = (req: Request, res: Response) => {
  const { apiKey, apiSecret, accessToken, accessSecret, autoPostNewCast } = req.body;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return res.status(400).json({
      success: false,
      message: 'すべての認証情報が必要です',
    });
  }

  // Twitter API を初期化
  const initialized = twitterService.initialize({
    apiKey,
    apiSecret,
    accessToken,
    accessSecret,
  });

  if (!initialized) {
    return res.status(500).json({
      success: false,
      message: 'Twitter API の初期化に失敗しました',
    });
  }

  // 設定をデータベースに保存（実装は省略、環境変数推奨）
  res.json({
    success: true,
    message: 'Twitter 連携設定を保存しました',
  });
};

/**
 * X連携の接続テスト
 */
export const testTwitterConnection = async (req: Request, res: Response) => {
  const result = await twitterService.testConnection();

  if (result.success) {
    res.json({
      success: true,
      message: '接続テスト成功',
      username: result.username,
    });
  } else {
    res.status(500).json({
      success: false,
      message: result.error || '接続テストに失敗しました',
    });
  }
};

/**
 * 新人キャストの情報をXに投稿
 */
export const postNewCastToTwitter = async (req: Request, res: Response) => {
  const { castId } = req.body;

  if (!castId) {
    return res.status(400).json({
      success: false,
      message: 'キャストIDが必要です',
    });
  }

  // キャスト情報を取得
  db.get(
    'SELECT * FROM casts WHERE id = ?',
    [castId],
    async (err, cast: any) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'データベースエラー',
        });
      }

      if (!cast) {
        return res.status(404).json({
          success: false,
          message: 'キャストが見つかりません',
        });
      }

      // Xに投稿
      const result = await twitterService.tweetNewCast({
        name: cast.name,
        age: cast.age,
        height: cast.height,
        bust: cast.bust,
        waist: cast.waist,
        hip: cast.hip,
        cup_size: cast.cup_size,
        profile: cast.profile || cast.profile_text,
      });

      if (result.success) {
        res.json({
          success: true,
          message: 'Xに投稿しました',
          tweetId: result.tweetId,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.error || '投稿に失敗しました',
        });
      }
    }
  );
};

/**
 * カスタムメッセージをXに投稿
 */
export const postCustomTweet = async (req: Request, res: Response) => {
  const { message, hashtags } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'メッセージが必要です',
    });
  }

  const result = await twitterService.tweetCustom(message, hashtags);

  if (result.success) {
    res.json({
      success: true,
      message: 'Xに投稿しました',
      tweetId: result.tweetId,
    });
  } else {
    res.status(500).json({
      success: false,
      message: result.error || '投稿に失敗しました',
    });
  }
};

/**
 * X連携の設定状況を取得
 */
export const getTwitterStatus = (req: Request, res: Response) => {
  const isConfigured = twitterService.isConfigured();

  res.json({
    success: true,
    configured: isConfigured,
    message: isConfigured ? 'X連携が有効です' : 'X連携が設定されていません',
  });
};
