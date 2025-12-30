import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import adPlatformRoutes from './routes/adPlatform';
import distributionRoutes from './routes/distribution';
import { testConnection } from './config/database';

// 環境変数読み込み
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5001;

// CORS設定
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3010',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ボディパーサー
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ヘルスチェック
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: '広告媒体一括更新システム API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// APIルート
app.use('/api/ad-platforms', adPlatformRoutes);
app.use('/api/distribution', distributionRoutes);

// 404エラー
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `エンドポイントが見つかりません: ${req.method} ${req.path}`,
  });
});

// グローバルエラーハンドラー
app.use((err: Error, req: Request, res: Response, next: any) => {
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
  await testConnection();
});

export default app;
