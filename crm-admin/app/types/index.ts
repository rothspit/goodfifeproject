// Customer types
export interface Customer {
  id: number;
  phone_number: string;
  name: string;
  email?: string;
  customer_type: 'new' | 'regular' | 'vip';
  home_address?: string;
  home_transportation_fee?: number;
  total_orders: number;
  last_visit_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Reservation/Order types
export interface Reservation {
  id: number;
  business_date: string;
  order_datetime: string;
  store_id: number;
  customer_id: number;
  cast_id?: number;
  start_time: string;
  duration: number;
  location: string;
  base_price: number;
  nomination_fee: number;
  transportation_fee: number;
  option_price: number;
  discount: number;
  total_price: number;
  options?: string;
  memo?: string;
  nomination_status: 'none' | 'nominated' | 'random';
  order_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  customer?: Customer;
  cast?: Cast;
  store?: Store;
}

// Cast types
export interface Cast {
  id: number;
  name: string;
  display_name: string;
  age: number;
  height: number;
  bust: number;
  waist: number;
  hip: number;
  blood_type?: string;
  description?: string;
  preferences?: string;
  nomination_fee: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Store types
export interface Store {
  id: number;
  name: string;
  address?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard KPI types
export interface DashboardKPI {
  todaySales: number;
  todayOrders: number;
  newCustomers: number;
  repeatRate: number;
  avgOrderValue: number;
  castUtilization: number;
}

// CSV Import types
export interface CSVImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  skipped: number;
}

// CTI types
export interface CTICallEvent {
  phone_number: string;
  call_type: 'incoming' | 'outgoing';
  timestamp: string;
}
