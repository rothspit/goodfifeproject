import { TwitterApi } from 'twitter-api-v2';

interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
}

class TwitterService {
  private client: TwitterApi | null = null;
  private config: TwitterConfig | null = null;

  /**
   * Twitter API クライアントを初期化
   */
  initialize(config: TwitterConfig) {
    try {
      this.config = config;
      this.client = new TwitterApi({
        appKey: config.apiKey,
        appSecret: config.apiSecret,
        accessToken: config.accessToken,
        accessSecret: config.accessSecret,
      });
      
      console.log('✓ Twitter API クライアント初期化成功');
      return true;
    } catch (error) {
      console.error('Twitter API 初期化エラー:', error);
      return false;
    }
  }

  /**
   * 環境変数から設定を読み込んで初期化
   */
  initializeFromEnv() {
    const config = {
      apiKey: process.env.TWITTER_API_KEY || '',
      apiSecret: process.env.TWITTER_API_SECRET || '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
    };

    if (!config.apiKey || !config.apiSecret || !config.accessToken || !config.accessSecret) {
      console.warn('⚠️ Twitter API credentials not configured');
      return false;
    }

    return this.initialize(config);
  }

  /**
   * 設定状況を確認
   */
  isConfigured(): boolean {
    return this.client !== null && this.config !== null;
  }

  /**
   * ツイートを投稿
   */
  async tweet(text: string): Promise<{ success: boolean; tweetId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Twitter API が設定されていません',
      };
    }

    try {
      const tweet = await this.client!.v2.tweet(text);
      console.log('✓ ツイート投稿成功:', tweet.data.id);
      
      return {
        success: true,
        tweetId: tweet.data.id,
      };
    } catch (error: any) {
      console.error('ツイート投稿エラー:', error);
      return {
        success: false,
        error: error.message || 'ツイートの投稿に失敗しました',
      };
    }
  }

  /**
   * 新人キャスト用のツイートを作成して投稿
   */
  async tweetNewCast(castData: {
    name: string;
    age: number;
    height?: number;
    bust?: number;
    waist?: number;
    hip?: number;
    cup_size?: string;
    profile?: string;
  }): Promise<{ success: boolean; tweetId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Twitter API が設定されていません',
      };
    }

    // ツイート本文を作成
    let tweetText = `🎉 新人キャスト入店のお知らせ 🎉\n\n`;
    tweetText += `✨ ${castData.name}さん（${castData.age}歳）✨\n\n`;

    // スペック情報
    if (castData.height || castData.bust || castData.waist || castData.hip) {
      tweetText += `📏 スペック:\n`;
      if (castData.height) tweetText += `身長: ${castData.height}cm\n`;
      if (castData.bust && castData.waist && castData.hip) {
        const cupInfo = castData.cup_size ? ` (${castData.cup_size}カップ)` : '';
        tweetText += `B${castData.bust}-W${castData.waist}-H${castData.hip}${cupInfo}\n`;
      }
      tweetText += `\n`;
    }

    // プロフィール（簡略版）
    if (castData.profile) {
      const shortProfile = castData.profile.substring(0, 50);
      tweetText += `💬 ${shortProfile}${castData.profile.length > 50 ? '...' : ''}\n\n`;
    }

    tweetText += `ご予約お待ちしております！💕\n`;
    tweetText += `#人妻の蜜西船橋店 #新人 #デリヘル #西船橋`;

    // 280文字制限チェック
    if (tweetText.length > 280) {
      tweetText = tweetText.substring(0, 277) + '...';
    }

    return this.tweet(tweetText);
  }

  /**
   * カスタムメッセージでツイート
   */
  async tweetCustom(message: string, hashtags?: string[]): Promise<{ success: boolean; tweetId?: string; error?: string }> {
    let tweetText = message;

    if (hashtags && hashtags.length > 0) {
      tweetText += '\n\n' + hashtags.map(tag => `#${tag}`).join(' ');
    }

    // 280文字制限
    if (tweetText.length > 280) {
      tweetText = tweetText.substring(0, 277) + '...';
    }

    return this.tweet(tweetText);
  }

  /**
   * 接続テスト
   */
  async testConnection(): Promise<{ success: boolean; username?: string; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Twitter API が設定されていません',
      };
    }

    try {
      const me = await this.client!.v2.me();
      console.log('✓ Twitter 接続テスト成功:', me.data.username);
      
      return {
        success: true,
        username: me.data.username,
      };
    } catch (error: any) {
      console.error('Twitter 接続テストエラー:', error);
      return {
        success: false,
        error: error.message || '接続テストに失敗しました',
      };
    }
  }
}

// シングルトンインスタンス
const twitterService = new TwitterService();

// 起動時に環境変数から初期化を試行
twitterService.initializeFromEnv();

export default twitterService;
