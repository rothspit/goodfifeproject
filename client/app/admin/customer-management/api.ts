// 顧客管理システムAPI クライアント

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 認証トークンを取得
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// 認証ヘッダーを含むfetchオプション
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
});

// 本日の受注リスト取得
export const getTodayOrders = async (storeId?: string) => {
  const params = storeId ? `?store_id=${storeId}` : '';
  const response = await fetch(`${API_URL}/customer-management/today-orders${params}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('受注リストの取得に失敗しました');
  return response.json();
};

// 顧客情報取得（電話番号検索）
export const getCustomerByPhone = async (phoneNumber: string) => {
  const response = await fetch(`${API_URL}/customer-management/customer/${phoneNumber}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 404) {
      return { success: false, customer: null, message: '顧客が見つかりません' };
    }
    throw new Error('顧客情報の取得に失敗しました');
  }
  return response.json();
};

// 本日出勤のキャスト取得
export const getTodayWorkingCasts = async (storeId?: string) => {
  const params = storeId ? `?store_id=${storeId}` : '';
  const response = await fetch(`${API_URL}/customer-management/working-casts${params}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('出勤キャストの取得に失敗しました');
  return response.json();
};

// 料金プラン取得
export const getPricePlans = async (storeId?: string, castId?: number) => {
  const params = new URLSearchParams();
  if (storeId) params.append('store_id', storeId);
  if (castId) params.append('cast_id', castId.toString());
  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  const response = await fetch(`${API_URL}/customer-management/price-plans${queryString}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('料金プランの取得に失敗しました');
  return response.json();
};

// ホテルリスト取得
export const getHotels = async (storeId?: string) => {
  const params = storeId ? `?store_id=${storeId}` : '';
  const response = await fetch(`${API_URL}/customer-management/hotels${params}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('ホテルリストの取得に失敗しました');
  return response.json();
};

// 店舗一覧取得
export const getStores = async () => {
  const response = await fetch(`${API_URL}/customer-management/stores`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('店舗リストの取得に失敗しました');
  return response.json();
};

// 受注作成・更新
export const createOrUpdateOrder = async (orderData: any) => {
  const response = await fetch(`${API_URL}/customer-management/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });
  if (!response.ok) throw new Error('受注の登録・更新に失敗しました');
  return response.json();
};

// 顧客メモ追加（既存のcustomer APIを使用）
export const addCustomerNote = async (customerId: number, note: string) => {
  const response = await fetch(`${API_URL}/customer/notes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ customer_id: customerId, note }),
  });
  if (!response.ok) throw new Error('メモの追加に失敗しました');
  return response.json();
};
