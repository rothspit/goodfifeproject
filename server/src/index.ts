import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// ルートのインポート
import authRoutes from './routes/auth';
import castRoutes from './routes/casts';
import reservationRoutes from './routes/reservations';
import reviewRoutes from './routes/reviews';
import blogRoutes from './routes/blogs';
import announcementRoutes from './routes/announcements';

// Socket.ioハンドラーのインポート
import { setupSocketHandlers } from './controllers/socketController';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ミドルウェア
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの提供
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/casts', castRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/announcements', announcementRoutes);

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '人妻の蜜 API is running' });
});

// Socket.ioの設定
setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 サーバーがポート${PORT}で起動しました`);
  console.log(`📱 クライアントURL: ${process.env.CLIENT_URL}`);
});

export { io };
