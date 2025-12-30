"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adPlatformController_1 = require("../controllers/adPlatformController");
const router = express_1.default.Router();
// 広告媒体管理（開発環境では認証なし）
router.get('/', adPlatformController_1.getAllPlatforms);
router.get('/:id', adPlatformController_1.getPlatformById);
router.post('/', adPlatformController_1.createPlatform);
router.put('/:id', adPlatformController_1.updatePlatform);
router.delete('/:id', adPlatformController_1.deletePlatform);
// 配信ログ
router.get('/logs', adPlatformController_1.getDistributionLogs);
router.get('/statistics', adPlatformController_1.getDistributionStatistics);
exports.default = router;
//# sourceMappingURL=adPlatform.js.map