export interface User {
  id: number;
  phone_number: string;
  name?: string;
  email?: string;
  created_at: string;
  last_login?: string;
}

export interface Cast {
  id: number;
  name: string;
  age: number;
  height?: number;
  bust?: string;
  waist?: number;
  hip?: number;
  cup_size?: string;
  blood_type?: string;
  has_children?: boolean;
  smoking_ok?: boolean;
  tattoo?: boolean;
  threesome_ok?: boolean;
  hairless?: boolean;
  home_visit_ok?: boolean;
  clothing_request_ok?: boolean;
  overnight_ok?: boolean;
  sweet_sadist_ok?: boolean;
  profile_text?: string;
  is_new?: boolean;
  new_until?: string;
  status: string;
  primary_image?: string;
  images?: CastImage[];
  schedules?: CastSchedule[];
  reviews?: Review[];
  review_count?: number;
  avg_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CastImage {
  id: number;
  cast_id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface CastSchedule {
  id: number;
  cast_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  cast_id: number;
  cast_name?: string;
  cast_image?: string;
  reservation_date: string;
  start_time: string;
  duration: number;
  course: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  user_name?: string;
  cast_id: number;
  cast_name?: string;
  cast_image?: string;
  reservation_id?: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Blog {
  id: number;
  cast_id: number;
  cast_name?: string;
  cast_image?: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  sender_id: number;
  sender_type: 'user' | 'cast';
  receiver_id: number;
  receiver_type: 'user' | 'cast';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SearchFilters {
  name?: string;
  date?: string;
  time?: string;
  min_height?: number;
  max_height?: number;
  min_age?: number;
  max_age?: number;
  cup_size?: string;
  blood_type?: string;
  has_children?: boolean;
  is_new?: boolean;
  smoking_ok?: boolean;
  tattoo?: boolean;
  threesome_ok?: boolean;
  hairless?: boolean;
  home_visit_ok?: boolean;
  clothing_request_ok?: boolean;
  overnight_ok?: boolean;
  sweet_sadist_ok?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
