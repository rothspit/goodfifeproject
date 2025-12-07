import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（トークンを自動付与）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // トークン無効の場合、ログアウト処理
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
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

// キャストAPI
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
};

// ブログAPI
export const blogApi = {
  getBlogs: (params?: any) => api.get('/blogs', { params }),
  getBlogById: (id: number) => api.get(`/blogs/${id}`),
  getRecentBlogs: (limit?: number) => api.get('/blogs/recent', { params: { limit } }),
};

// お知らせAPI
export const announcementApi = {
  getAnnouncements: (params?: any) => api.get('/announcements', { params }),
  getAnnouncementById: (id: number) => api.get(`/announcements/${id}`),
};
