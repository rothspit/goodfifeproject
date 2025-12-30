import express from 'express';
import {
  saveTwitterConfig,
  testTwitterConnection,
  postNewCastToTwitter,
  postCustomTweet,
  getTwitterStatus,
} from '../controllers/twitterController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// すべてのルートで認証が必要（管理者のみ）
router.use(authMiddleware);

// X連携の設定状況を取得
router.get('/status', getTwitterStatus);

// X連携の設定を保存
router.post('/config', saveTwitterConfig);

// X連携の接続テスト
router.post('/test', testTwitterConnection);

// 新人キャストをXに投稿
router.post('/post-new-cast', postNewCastToTwitter);

// カスタムメッセージをXに投稿
router.post('/post-custom', postCustomTweet);

export default router;
