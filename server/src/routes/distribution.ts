/**
 * 配信APIルート
 */
import express from 'express';
import {
  distributeCastInfo,
  distributeSchedule,
  distributeDiary,
  bulkDistribute
} from '../controllers/distributionController';

const router = express.Router();

// キャスト情報配信
router.post('/cast', distributeCastInfo);

// スケジュール配信
router.post('/schedule', distributeSchedule);

// 写メ日記配信
router.post('/diary', distributeDiary);

// 一括配信
router.post('/bulk', bulkDistribute);

export default router;
