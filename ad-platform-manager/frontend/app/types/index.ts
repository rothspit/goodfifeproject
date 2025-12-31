// 広告媒体情報
export interface AdPlatform {
  id: number;
  name: string;
  category: 'お客向け' | '女子求人' | '男子求人';
  url?: string;
  login_id?: string;
  login_password?: string;
  connection_type: 'WEB' | 'API' | 'FTP';
  api_endpoint?: string;
  api_key?: string;
  api_secret?: string;
  ftp_host?: string;
  ftp_port?: number;
  ftp_username?: string;
  ftp_password?: string;
  is_active: boolean;
  last_sync_at?: string;
  settings?: any;
  created_at: string;
  updated_at: string;
}

// 配信ログ
export interface DistributionLog {
  id: number;
  platform_id: number;
  platform_name?: string;
  cast_id?: number;
  cast_name?: string;
  distribution_type: string;
  status: '成功' | '失敗' | '処理中';
  error_message?: string;
  execution_time?: number;
  metadata?: any;
  created_at: string;
}

// 配信統計
export interface DistributionStats {
  total: number;
  success: number;
  failure: number;
  processing: number;
  avgExecutionTime: number;
}

// 配信結果
export interface DistributionResult {
  platformId: number;
  platformName: string;
  success: boolean;
  errorMessage?: string;
  executionTime: number;
}

// キャストデータ
export interface CastData {
  name: string;
  age?: number;
  height?: number;
  bust?: number;
  waist?: number;
  hip?: number;
  profile?: string;
  images?: string[];
}

// スケジュールデータ
export interface ScheduleData {
  castId: number;
  date: string;
  startTime: string;
  endTime: string;
}

// 写メ日記データ
export interface DiaryData {
  castId: number;
  title: string;
  content: string;
  images?: string[];
}
