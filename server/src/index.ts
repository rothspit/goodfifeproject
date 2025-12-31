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
import uploadRoutes from './routes/upload';
import scheduleRoutes from './routes/schedules';
import instantPrincessRoutes from './routes/instantPrincess';
import chatRoutes from './routes/chat';
import rankingRoutes from './routes/rankings';
import customerRoutes from './routes/customer';
import pointRoutes from './routes/points';
import castApiRoutes from './routes/castRoutes';
import castImportRoutes from './routes/castImport';
import castImageRoutes from './routes/castImageRoutes';
import twitterRoutes from './routes/twitter';
import castEarningsRoutes from './routes/castEarnings';
import castAuthRoutes from './routes/castAuth';
import castCredentialsRoutes from './routes/castCredentials';
import castBlogsRoutes from './routes/castBlogs';
import receiptRoutes from './routes/receipt';
import orderRoutes from './routes/orders';
import ctiRoutes from './routes/cti';
import customerManagementRoutes from './routes/customerManagement';
import dialpadWebhookRoutes from './routes/dialpadWebhook';

// Socket.ioハンドラーのインポート
import { setupSocketHandlers } from './controllers/socketController';
import { setSocketIO } from './controllers/dialpadWebhookController';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://3000-iwlhxuzhfaqbr3cqpityv-b32ec7bb.sandbox.novita.ai',
      'https://3001-iwlhxuzhfaqbr3cqpityv-b32ec7bb.sandbox.novita.ai',
      'https://3002-iwlhxuzhfaqbr3cqpityv-b32ec7bb.sandbox.novita.ai',
      'https://crm.h-mitsu.com',
      'http://210.131.222.152:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ミドルウェア
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://3000-iwlhxuzhfaqbr3cqpityv-b32ec7bb.sandbox.novita.ai',
    'https://3001-iwlhxuzhfaqbr3cqpityv-b32ec7bb.sandbox.novita.ai',
    'https://3002-iwlhxuzhfaqbr3cqpityv-b32ec7bb.sandbox.novita.ai',
    'https://crm.h-mitsu.com',
    'http://210.131.222.152:3000',
  ],
  credentials: true,
}));
// ペイロードサイズ制限を拡大（CSVインポート用）
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静的ファイルの提供
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/casts', castRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/instant-princess', instantPrincessRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/cast', castApiRoutes);
app.use('/api/cast-import', castImportRoutes);
app.use('/api/cast-images', castImageRoutes);
app.use('/api/twitter', twitterRoutes);
app.use('/api/cast-earnings', castEarningsRoutes);
app.use('/api/cast-auth', castAuthRoutes);
app.use('/api/cast-credentials', castCredentialsRoutes);
app.use('/api/cast-blogs', castBlogsRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cti', ctiRoutes);
app.use('/api/customer-management', customerManagementRoutes);
app.use('/api/dialpad', dialpadWebhookRoutes);

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '人妻の蜜 API is running' });
});

// Socket.ioの設定
setupSocketHandlers(io);

// Dialpad WebhookコントローラーにSocket.IOインスタンスを渡す
setSocketIO(io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 サーバーがポート${PORT}で起動しました`);
  console.log(`📱 クライアントURL: ${process.env.CLIENT_URL}`);
});

export { io };
