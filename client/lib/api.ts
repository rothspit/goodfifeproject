import axios from 'axios';
import { getToken, clearAuth } from './authStorage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://210.131.222.152:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（トークンを自動付与）
api.interceptors.request.use(
  (config) => {
    // 統合ストレージからトークンを取得（cookie → sessionStorage → localStorage）
    if (typeof window !== 'undefined') {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API] トークン設定:', token.substring(0, 20) + '...');
      } else {
        console.warn('[API] トークンが見つかりません');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API] 401 Unauthorized エラー発生');
      // トークン無効の場合、ログアウト処理
      // ただし、ログインページやトップページからのアクセスの場合はリダイレクトしない
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        console.log('[API] 現在のパス:', currentPath);
        // ログインページ、新規登録ページ、トップページの場合はリダイレクトしない
        if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
          console.log('[API] 認証情報をクリアしてログインページへリダイレクト');
          clearAuth(); // 統合ストレージから全削除
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// 認証API
export const authApi = {
  register: (data: { phone_number: string; password: string; name?: string; email?: string }) =>
    api.post('/auth/register', data),
  login: (data: { phone_number: string; password: string }) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// キャスト公開API
export const castApi = {
  getCasts: (params?: any) => api.get('/casts', { params }),
  getCastById: (id: number) => api.get(`/casts/${id}`),
  getAvailableCasts: () => api.get('/casts/available'),
  getCastSchedule: (id: number, params?: any) => api.get(`/casts/${id}/schedule`, { params }),
};

// 予約API
export const reservationApi = {
  createReservation: (data: any) => api.post('/reservations', data),
  getUserReservations: (params?: any) => api.get('/reservations', { params }),
  getReservationById: (id: number) => api.get(`/reservations/${id}`),
  cancelReservation: (id: number) => api.put(`/reservations/${id}/cancel`),
};

// レビューAPI
export const reviewApi = {
  createReview: (data: any) => api.post('/reviews', data),
  getCastReviews: (castId: number, params?: any) => api.get(`/reviews/cast/${castId}`, { params }),
  getRecentReviews: (limit?: number) => api.get('/reviews/recent', { params: { limit } }),
  getAllReviews: (params?: any) => api.get('/reviews/admin/all', { params }),
  updateReviewStatus: (id: number, status: string) => api.put(`/reviews/admin/${id}/status`, { status }),
  deleteReview: (id: number) => api.delete(`/reviews/admin/${id}`),
};

// ブログAPI
export const blogApi = {
  getBlogs: (params?: any) => api.get('/blogs', { params }),
  getBlogById: (id: number) => api.get(`/blogs/${id}`),
  getRecentBlogs: (limit?: number) => api.get('/blogs/recent', { params: { limit } }),
  getAllBlogs: (params?: any) => api.get('/blogs/admin/all', { params }),
  createBlog: (data: any) => api.post('/blogs/admin', data),
  updateBlog: (id: number, data: any) => api.put(`/blogs/admin/${id}`, data),
  deleteBlog: (id: number) => api.delete(`/blogs/admin/${id}`),
};

// お知らせAPI
export const announcementApi = {
  getAnnouncements: (params?: any) => api.get('/announcements', { params }),
  getAnnouncementById: (id: number) => api.get(`/announcements/${id}`),
  getAllAnnouncements: (params?: any) => api.get('/announcements/admin/all', { params }),
  createAnnouncement: (data: any) => api.post('/announcements/admin', data),
  updateAnnouncement: (id: number, data: any) => api.put(`/announcements/admin/${id}`, data),
  deleteAnnouncement: (id: number) => api.delete(`/announcements/admin/${id}`),
};

// スケジュールAPI
export const scheduleApi = {
  getSchedules: (params?: any) => api.get('/schedules/public', { params }), // 公開用
  getAllSchedules: (params?: any) => api.get('/schedules', { params }), // 管理者用
  createSchedule: (data: any) => api.post('/schedules', data),
  bulkCreateSchedules: (data: { schedules: any[] }) => api.post('/schedules/bulk', data),
  updateSchedule: (id: number, data: any) => api.put(`/schedules/${id}`, data),
  deleteSchedule: (id: number) => api.delete(`/schedules/${id}`),
};

// 即姫管理API
export const instantPrincessApi = {
  getAvailable: () => api.get('/instant-princess/available'),
  getAll: () => api.get('/instant-princess/admin/all'),
  getWorkingCasts: () => api.get('/instant-princess/admin/working-casts'),
  create: (data: { cast_id: number; note?: string }) => api.post('/instant-princess/admin', data),
  update: (id: number, data: { is_active?: boolean; note?: string }) => api.put(`/instant-princess/admin/${id}`, data),
  delete: (id: number) => api.delete(`/instant-princess/admin/${id}`),
};

// チャット管理API
export const chatApi = {
  // 管理者用
  getRooms: () => api.get('/chats/rooms'), // チャットルーム一覧
  getRoomMessages: (roomId: number) => api.get(`/chats/rooms/${roomId}/messages`), // メッセージ一覧
  sendMessage: (roomId: number, message: string) => api.post(`/chats/rooms/${roomId}/messages`, { message }), // メッセージ送信
  
  // ユーザー用
  getMyRoom: () => api.get('/chats/room'), // 自分のチャットルーム取得
  getUnreadCount: () => api.get('/chats/unread-count'), // 未読数取得
};

// ランキングAPI
export const rankingApi = {
  getAllRankings: (params?: any) => api.get('/rankings/all', { params }),
  getRankingByCategory: (category: string, params?: any) => api.get(`/rankings/category/${category}`, { params }),
  getCategories: () => api.get('/rankings/categories'),
  getAdminRankings: (params?: any) => api.get('/rankings/admin/all', { params }),
  createRanking: (data: any) => api.post('/rankings/admin', data),
  updateRanking: (id: number, data: any) => api.put(`/rankings/admin/${id}`, data),
  deleteRanking: (id: number) => api.delete(`/rankings/admin/${id}`),
};

// 顧客機能API
export const customerApi = {
  // ポイント
  getPoints: () => api.get('/customer/points'),
  getPointHistory: (params?: any) => api.get('/customer/points/history', { params }),
  
  // 利用履歴
  getReservationHistory: (params?: any) => api.get('/customer/reservations', { params }),
  
  // お気に入り
  getFavorites: () => api.get('/customer/favorites'),
  addFavorite: (cast_id: number) => api.post('/customer/favorites', { cast_id }),
  removeFavorite: (cast_id: number) => api.delete(`/customer/favorites/${cast_id}`),
  
  // キャストアピール
  getAppeals: () => api.get('/customer/appeals'),
  markAppealAsRead: (id: number) => api.put(`/customer/appeals/${id}/read`),
  
  // メルマガ
  getNewsletterStatus: () => api.get('/customer/newsletter'),
  updateNewsletterStatus: (is_subscribed: boolean) => api.put('/customer/newsletter', { is_subscribed }),
  
  // ランキング
  getRanking: (params?: any) => api.get('/customer/ranking', { params }),
  
  // チャット承認
  requestChatApproval: (cast_id: number) => api.post('/customer/chat-approval', { cast_id }),
  getChatApprovalStatus: (cast_id: number) => api.get(`/customer/chat-approval/${cast_id}`),
  
  // チャット機能
  getChatRooms: () => api.get('/chats/user/rooms'), // チャットルーム一覧
  getChatMessages: (castId: number) => api.get(`/chats/user/messages/${castId}`), // 特定のキャストとのメッセージ
  sendMessage: (castId: number, message: string) => api.post('/chats/user/send', { castId, message }), // メッセージ送信
  markMessagesAsRead: (castId: number) => api.put(`/chats/user/read/${castId}`), // 既読にする
};

// ポイント管理API
export const pointApi = {
  // 管理者用：ポイント付与
  earnPoints: (data: { reservation_id: number; actual_payment: number }) => 
    api.post('/points/admin/earn', data),
  
  // 管理者用：ポイント使用
  adminUsePoints: (data: { user_id: number; points_to_use: number; reservation_id?: number }) =>
    api.post('/points/admin/use', { ...data, use_type: 'manual' }),
  
  // 管理者用：全ユーザーのポイント一覧
  getAllUserPoints: (params?: any) => api.get('/points/admin/all', { params }),
  
  // ポイント残高確認
  checkBalance: (user_id: number) => api.get(`/points/balance/${user_id}`),
  
  // ポイント履歴取得
  getHistory: (user_id: number, params?: any) => api.get(`/points/history/${user_id}`, { params }),
  
  // 顧客用：ポイント使用（システムによる自動使用）
  usePoints: (data: { user_id: number; points_to_use: number; reservation_id?: number }) =>
    api.post('/points/use', { ...data, use_type: 'system' }),
};

// キャスト認証用のAPI（トークンを自動付与）
const castAuthApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// キャスト用リクエストインターセプター
castAuthApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cast_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// キャスト専用API
export const castMemberApi = {
  // スケジュール管理
  getSchedules: (params?: any) => castAuthApi.get('/cast/schedules', { params }),
  addSchedule: (data: { date: string; startTime: string; endTime: string }) => 
    castAuthApi.post('/cast/schedules', data),
  updateSchedule: (id: number, data: { startTime: string; endTime: string }) =>
    castAuthApi.put(`/cast/schedules/${id}`, data),
  deleteSchedule: (id: number) => castAuthApi.delete(`/cast/schedules/${id}`),
  
  // 統計情報
  getStats: () => castAuthApi.get('/cast/stats'),
  
  // 精算明細
  getDailyEarnings: (date?: string) => castAuthApi.get('/cast-earnings/daily', { params: { date } }),
  getMonthlyEarnings: (year?: number, month?: number) => 
    castAuthApi.get('/cast-earnings/monthly', { params: { year, month } }),
  
  // 写メ日記
  getMyBlogs: () => castAuthApi.get('/cast-blogs/my-blogs'),
  createBlog: (formData: FormData) => castAuthApi.post('/cast-blogs/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteBlog: (id: number) => castAuthApi.delete(`/cast-blogs/${id}`),
};

// X（Twitter）連携API
export const twitterApi = {
  // X連携の設定状況を取得
  getStatus: () => api.get('/twitter/status'),
  
  // X連携の設定を保存
  saveConfig: (data: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessSecret: string;
    autoPostNewCast?: boolean;
  }) => api.post('/twitter/config', data),
  
  // X連携の接続テスト
  testConnection: () => api.post('/twitter/test'),
  
  // 新人キャストをXに投稿
  postNewCast: (castId: number) => api.post('/twitter/post-new-cast', { castId }),
  
  // カスタムメッセージをXに投稿
  postCustom: (data: { message: string; hashtags?: string[] }) => 
    api.post('/twitter/post-custom', data),
};

// キャスト認証情報管理API
export const castCredentialsApi = {
  // 全キャストの認証情報取得
  getAll: () => api.get('/cast-credentials'),
  
  // 特定のキャストの認証情報取得
  getById: (id: number) => api.get(`/cast-credentials/${id}`),
  
  // パスワード生成・更新
  generatePassword: (id: number, password?: string) => 
    api.post(`/cast-credentials/${id}/generate`, { password }),
  
  // パスワード削除
  deletePassword: (id: number) => api.delete(`/cast-credentials/${id}`),
  
  // 複数キャストのパスワード一括生成
  bulkGenerate: (cast_ids: number[]) => 
    api.post('/cast-credentials/bulk/generate', { cast_ids }),
};

// 電子領収書API
export const receiptApi = {
  // お客様用：領収書申請
  createRequest: (data: {
    reservation_id?: number;
    amount: number;
    name_on_receipt: string;
    address?: string;
    email?: string;
    phone_number?: string;
    notes?: string;
  }) => api.post('/receipts/requests', data),
  
  // お客様用：自分の申請一覧
  getMyRequests: () => api.get('/receipts/my-requests'),
  
  // お客様用：自分の領収書一覧
  getMyReceipts: () => api.get('/receipts/my-receipts'),
  
  // 管理者用：全申請一覧
  getAllRequests: (status?: string) => api.get('/receipts/requests', { params: { status } }),
  
  // 管理者用：承認
  approve: (id: number, admin_notes?: string) => 
    api.put(`/receipts/requests/${id}/approve`, { admin_notes }),
  
  // 管理者用：却下
  reject: (id: number, admin_notes?: string) => 
    api.put(`/receipts/requests/${id}/reject`, { admin_notes }),
  
  // 管理者用：発行
  issue: (id: number) => api.post(`/receipts/requests/${id}/issue`),
  
  // 領収書詳細取得
  getByNumber: (receiptNumber: string) => api.get(`/receipts/${receiptNumber}`),
};
