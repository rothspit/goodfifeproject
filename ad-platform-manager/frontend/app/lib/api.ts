import axios from 'axios';
import type { AdPlatform, DistributionLog, DistributionStats, DistributionResult, CastData, ScheduleData, DiaryData } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// エラーハンドリング
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// 広告媒体管理API
export const adPlatformAPI = {
  // 媒体一覧取得
  async getAll(params?: { category?: string; is_active?: boolean }): Promise<AdPlatform[]> {
    const response = await api.get<{ success: boolean; platforms: AdPlatform[] }>('/ad-platforms', { params });
    return response.data.platforms || [];
  },

  // 媒体詳細取得
  async getById(id: number): Promise<AdPlatform> {
    const response = await api.get<AdPlatform>(`/ad-platforms/${id}`);
    return response.data;
  },

  // 媒体追加
  async create(data: Partial<AdPlatform>): Promise<AdPlatform> {
    const response = await api.post<AdPlatform>('/ad-platforms', data);
    return response.data;
  },

  // 媒体更新
  async update(id: number, data: Partial<AdPlatform>): Promise<AdPlatform> {
    const response = await api.put<AdPlatform>(`/ad-platforms/${id}`, data);
    return response.data;
  },

  // 媒体削除
  async delete(id: number): Promise<void> {
    await api.delete(`/ad-platforms/${id}`);
  },

  // 配信ログ取得
  async getLogs(params?: { platform_id?: number; cast_id?: number; limit?: number }): Promise<DistributionLog[]> {
    const response = await api.get<DistributionLog[]>('/ad-platforms/logs', { params });
    return response.data;
  },

  // 配信統計取得
  async getStatistics(platformId?: number): Promise<DistributionStats> {
    const response = await api.get<DistributionStats>('/ad-platforms/statistics', {
      params: platformId ? { platform_id: platformId } : undefined,
    });
    return response.data;
  },
};

// 配信エンジンAPI
export const distributionAPI = {
  // キャスト情報配信
  async distributeCast(castId: number, platformIds: number[], data: CastData): Promise<{ results: DistributionResult[]; summary: any }> {
    const response = await api.post('/distribution/cast', { castId, platformIds, data });
    return response.data;
  },

  // スケジュール配信
  async distributeSchedule(platformIds: number[], schedules: ScheduleData[]): Promise<{ results: DistributionResult[]; summary: any }> {
    const response = await api.post('/distribution/schedule', { platformIds, schedules });
    return response.data;
  },

  // 写メ日記配信
  async distributeDiary(platformIds: number[], data: DiaryData): Promise<{ results: DistributionResult[]; summary: any }> {
    const response = await api.post('/distribution/diary', { platformIds, data });
    return response.data;
  },

  // 一括配信
  async distributeBulk(platformIds: number[], options?: any): Promise<{ results: DistributionResult[]; summary: any }> {
    const response = await api.post('/distribution/bulk', { platformIds, options });
    return response.data;
  },
};

export default api;
