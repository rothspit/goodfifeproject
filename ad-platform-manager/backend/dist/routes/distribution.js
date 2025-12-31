"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 配信APIルート
 */
const express_1 = __importDefault(require("express"));
const distributionController_1 = require("../controllers/distributionController");
const router = express_1.default.Router();
// キャスト情報配信
router.post('/cast', distributionController_1.distributeCastInfo);
// スケジュール配信
router.post('/schedule', distributionController_1.distributeSchedule);
// 写メ日記配信
router.post('/diary', distributionController_1.distributeDiary);
// 一括配信
router.post('/bulk', distributionController_1.bulkDistribute);
exports.default = router;
//# sourceMappingURL=distribution.js.map