"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const adPlatform_1 = __importDefault(require("./routes/adPlatform"));
const distribution_1 = __importDefault(require("./routes/distribution"));
const database_1 = require("./config/database");
// 環境変数読み込み
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// CORS設定
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3010',
    'http://localhost:3000',
];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
// ボディパーサー
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// ヘルスチェック
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: '広告媒体一括更新システム API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
// APIルート
app.use('/api/ad-platforms', adPlatform_1.default);
app.use('/api/distribution', distribution_1.default);
// 404エラー
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `エンドポイントが見つかりません: ${req.method} ${req.path}`,
    });
});
// グローバルエラーハンドラー
app.use((err, req, res, next) => {
    console.error('サーバーエラー:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'サーバーエラーが発生しました',
    });
});
// サーバー起動
app.listen(PORT, async () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║   広告媒体一括更新システム API サーバー起動                 ║
║                                                            ║
║   🌐 ポート: ${PORT}                                        ║
║   🔗 URL: http://localhost:${PORT}                        ║
║   📊 ヘルスチェック: http://localhost:${PORT}/health      ║
║                                                            ║
║   📡 エンドポイント:                                        ║
║      /api/ad-platforms - 広告媒体管理                      ║
║      /api/distribution - 配信エンジン                      ║
╚════════════════════════════════════════════════════════════╝
  `);
    // データベース接続テスト
    await (0, database_1.testConnection)();
});
exports.default = app;
//# sourceMappingURL=index.js.map