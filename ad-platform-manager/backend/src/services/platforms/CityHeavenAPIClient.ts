/**
 * シティヘブンネット モバイルAPI クライアント
 * Playwrightの代替として、直接APIを呼び出す高速実装
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as crypto from 'crypto';

interface CityHeavenCredentials {
  username: string;
  password: string;
}

interface SessionInfo {
  token?: string;
  sessionId?: string;
  cookies: string[];
  shopId: string;
}

interface DiaryPostData {
  castId?: number;
  castName?: string;
  title: string;
  content: string;
  images?: string[]; // Base64 encoded images
  publishDate?: string;
}

interface DiaryPostResponse {
  success: boolean;
  diaryId?: number;
  publishedAt?: string;
  error?: string;
}

interface CastInfo {
  id: number;
  name: string;
  age?: number;
  height?: number;
  measurements?: {
    bust: number;
    waist: number;
    hip: number;
    cup: string;
  };
  comment?: string;
  images?: string[];
}

export class CityHeavenAPIClient {
  private client: AxiosInstance;
  private session: SessionInfo | null = null;
  
  // 推定APIベースURL（実際のトラフィックキャプチャで確認必要）
  private readonly BASE_URL = 'https://spmanager.cityheaven.net/api/v1';
  private readonly WEB_BASE_URL = 'https://spmanager.cityheaven.net';
  
  constructor() {
    this.client = axios.create({
      baseURL: this.BASE_URL,
      timeout: 30000,
      headers: {
        'User-Agent': 'CityHeavenManager/1.0 (Android)',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // レスポンスインターセプター（エラーハンドリング）
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: AxiosError) => {
        console.error('API Error:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
        throw error;
      }
    );
  }
  
  /**
   * ログイン処理
   * 実際のエンドポイントはmitmproxyで確認必要
   */
  async login(credentials: CityHeavenCredentials): Promise<boolean> {
    try {
      console.log('シティヘブンネットAPIログイン中...');
      
      // Method 1: モバイルAPI経由のログイン（推定）
      try {
        const response = await this.client.post('/auth/login', {
          username: credentials.username,
          password: credentials.password,
          device_type: 'android',
          app_version: '1.0.0',
        });
        
        if (response.data.success) {
          this.session = {
            token: response.data.token,
            sessionId: response.data.session_id,
            cookies: response.headers['set-cookie'] || [],
            shopId: response.data.shop_id || 'cb_hitozuma_mitsu',
          };
          
          // トークンをヘッダーに設定
          this.client.defaults.headers.common['Authorization'] = `Bearer ${this.session.token}`;
          
          console.log('✅ モバイルAPIログイン成功');
          return true;
        }
      } catch (apiError) {
        console.warn('モバイルAPIログイン失敗、Webベースログインを試行');
      }
      
      // Method 2: Webベースのログイン（フォールバック）
      const webResponse = await axios.post(
        `${this.WEB_BASE_URL}/login`,
        new URLSearchParams({
          username: credentials.username,
          password: credentials.password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          maxRedirects: 0,
          validateStatus: (status: number) => status >= 200 && status < 400,
        }
      );
      
      const cookies = webResponse.headers['set-cookie'] || [];
      
      if (cookies.length > 0) {
        this.session = {
          cookies,
          shopId: this.extractShopId(webResponse.data),
        };
        
        // クッキーを設定
        this.client.defaults.headers.common['Cookie'] = cookies.join('; ');
        
        console.log('✅ Webベースログイン成功');
        return true;
      }
      
      console.error('❌ ログイン失敗');
      return false;
      
    } catch (error) {
      console.error('ログインエラー:', error);
      return false;
    }
  }
  
  /**
   * 写メ日記投稿
   * 実際のエンドポイントとパラメータはmitmproxyで確認必要
   */
  async postDiary(diaryData: DiaryPostData): Promise<DiaryPostResponse> {
    try {
      if (!this.session) {
        throw new Error('セッションが無効です。先にログインしてください。');
      }
      
      console.log(`写メ日記投稿: ${diaryData.title}`);
      
      // Method 1: モバイルAPI経由（推定）
      try {
        const response = await this.client.post('/diary/create', {
          shop_id: this.session.shopId,
          cast_id: diaryData.castId,
          cast_name: diaryData.castName,
          title: diaryData.title,
          content: diaryData.content,
          images: diaryData.images || [],
          publish_date: diaryData.publishDate || new Date().toISOString(),
        });
        
        if (response.data.success) {
          console.log('✅ モバイルAPI経由で投稿成功');
          return {
            success: true,
            diaryId: response.data.diary_id,
            publishedAt: response.data.published_at,
          };
        }
      } catch (apiError) {
        console.warn('モバイルAPI投稿失敗、Web form submitを試行');
      }
      
      // Method 2: Webフォーム経由（フォールバック）
      const formData = new URLSearchParams();
      formData.append('title', diaryData.title);
      formData.append('content', diaryData.content);
      if (diaryData.castId) {
        formData.append('cast_id', diaryData.castId.toString());
      }
      
      const webResponse = await axios.post(
        `${this.WEB_BASE_URL}/H8KeitaiDiaryEdit.php`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': this.session.cookies.join('; '),
          },
          params: {
            shopdir: this.session.shopId,
          },
        }
      );
      
      // 成功判定（実際のレスポンスで調整必要）
      if (webResponse.status === 200 && !webResponse.data.includes('error')) {
        console.log('✅ Webフォーム経由で投稿成功');
        return {
          success: true,
        };
      }
      
      return {
        success: false,
        error: 'Unknown error',
      };
      
    } catch (error) {
      console.error('写メ日記投稿エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * キャスト一覧取得
   */
  async getCastList(): Promise<CastInfo[]> {
    try {
      if (!this.session) {
        throw new Error('セッションが無効です');
      }
      
      const response = await this.client.get('/cast/list', {
        params: {
          shop_id: this.session.shopId,
        },
      });
      
      if (response.data.success) {
        return response.data.casts || [];
      }
      
      return [];
    } catch (error) {
      console.error('キャスト一覧取得エラー:', error);
      return [];
    }
  }
  
  /**
   * キャスト情報更新
   */
  async updateCast(castInfo: CastInfo): Promise<boolean> {
    try {
      if (!this.session) {
        throw new Error('セッションが無効です');
      }
      
      const response = await this.client.post('/cast/update', {
        shop_id: this.session.shopId,
        cast_id: castInfo.id,
        ...castInfo,
      });
      
      return response.data.success === true;
    } catch (error) {
      console.error('キャスト情報更新エラー:', error);
      return false;
    }
  }
  
  /**
   * セッション情報を保存
   */
  getSession(): SessionInfo | null {
    return this.session;
  }
  
  /**
   * セッション情報を復元
   */
  setSession(session: SessionInfo): void {
    this.session = session;
    if (session.token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
    }
    if (session.cookies && session.cookies.length > 0) {
      this.client.defaults.headers.common['Cookie'] = session.cookies.join('; ');
    }
  }
  
  /**
   * ログアウト
   */
  async logout(): Promise<void> {
    this.session = null;
    delete this.client.defaults.headers.common['Authorization'];
    delete this.client.defaults.headers.common['Cookie'];
  }
  
  /**
   * shop_idを抽出（HTMLから）
   */
  private extractShopId(html: string): string {
    const match = html.match(/shopdir=([a-z_]+)/);
    return match ? match[1] : 'cb_hitozuma_mitsu';
  }
}
