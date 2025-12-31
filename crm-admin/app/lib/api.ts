import axios from 'axios';
import type { Customer, Reservation, Cast, Store, DashboardKPI, CSVImportResult } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Customer API
export const customerAPI = {
  search: async (phone_number: string): Promise<Customer | null> => {
    try {
      const res = await api.get(`/api/customers/search?phone_number=${phone_number}`);
      return res.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },
  
  getAll: async (): Promise<Customer[]> => {
    const res = await api.get('/api/customers');
    return res.data;
  },
  
  getById: async (id: number): Promise<Customer> => {
    const res = await api.get(`/api/customers/${id}`);
    return res.data;
  },
  
  getOrders: async (customerId: number): Promise<Reservation[]> => {
    const res = await api.get(`/api/customers/${customerId}/orders`);
    return res.data;
  },
  
  create: async (customer: Partial<Customer>): Promise<Customer> => {
    const res = await api.post('/api/customers', customer);
    return res.data;
  },
  
  update: async (id: number, customer: Partial<Customer>): Promise<Customer> => {
    const res = await api.put(`/api/customers/${id}`, customer);
    return res.data;
  },
  
  importCSV: async (file: File): Promise<CSVImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/api/customers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

// Reservation/Order API
export const reservationAPI = {
  getAll: async (): Promise<Reservation[]> => {
    const res = await api.get('/api/reservations');
    return res.data;
  },
  
  getToday: async (): Promise<Reservation[]> => {
    const today = new Date().toISOString().split('T')[0];
    const res = await api.get(`/api/reservations?date=${today}`);
    return res.data;
  },
  
  getByDate: async (date: string): Promise<Reservation[]> => {
    const res = await api.get(`/api/reservations?date=${date}`);
    return res.data;
  },
  
  getById: async (id: number): Promise<Reservation> => {
    const res = await api.get(`/api/reservations/${id}`);
    return res.data;
  },
  
  create: async (reservation: Partial<Reservation>): Promise<Reservation> => {
    const res = await api.post('/api/reservations', reservation);
    return res.data;
  },
  
  update: async (id: number, reservation: Partial<Reservation>): Promise<Reservation> => {
    const res = await api.put(`/api/reservations/${id}`, reservation);
    return res.data;
  },
  
  cancel: async (id: number): Promise<void> => {
    await api.delete(`/api/reservations/${id}`);
  },
  
  importSalesCSV: async (file: File): Promise<CSVImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/api/reservations/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

// Cast API
export const castAPI = {
  getAll: async (): Promise<Cast[]> => {
    const res = await api.get('/api/casts');
    return res.data;
  },
  
  getById: async (id: number): Promise<Cast> => {
    const res = await api.get(`/api/casts/${id}`);
    return res.data;
  },
  
  create: async (cast: Partial<Cast>): Promise<Cast> => {
    const res = await api.post('/api/casts', cast);
    return res.data;
  },
  
  update: async (id: number, cast: Partial<Cast>): Promise<Cast> => {
    const res = await api.put(`/api/casts/${id}`, cast);
    return res.data;
  },
  
  importCSV: async (file: File): Promise<CSVImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/api/casts/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

// Store API
export const storeAPI = {
  getAll: async (): Promise<Store[]> => {
    const res = await api.get('/api/stores');
    return res.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getKPIs: async (): Promise<DashboardKPI> => {
    const res = await api.get('/api/dashboard/kpis');
    return res.data;
  },
  
  getSalesData: async (startDate: string, endDate: string) => {
    const res = await api.get(`/api/dashboard/sales?start=${startDate}&end=${endDate}`);
    return res.data;
  },
  
  generateDailyReport: async (date: string) => {
    const res = await api.get(`/api/reports/daily?date=${date}`);
    return res.data;
  },
  
  generateMonthlyReport: async (year: number, month: number) => {
    const res = await api.get(`/api/reports/monthly?year=${year}&month=${month}`);
    return res.data;
  },
};

// Auth API
export const authAPI = {
  login: async (phone_number: string, password: string) => {
    const res = await api.post('/api/auth/login', { phone_number, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default api;
