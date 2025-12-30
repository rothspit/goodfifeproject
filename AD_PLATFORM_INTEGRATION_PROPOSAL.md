# 広告媒体統合管理システム 実装提案書

## 📋 プロジェクト概要

### システム名
**goodfifeproject 広告媒体統合管理システム**

### 目的
複数の広告媒体に対して、キャスト情報・スケジュール・料金表などを一元管理し、一括配信・自動更新を行うシステム

---

## 🎯 連携対象媒体リスト

### 女子求人サイト（5サイト）
1. 365日マネー女子宣言
2. 59Baito.com
3. Bwork
4. 30からの風俗アルバイト
5. 駅ちか！風俗求人ココア

### お客向けサイト（18サイト）
1. HIME CHANNEL
2. R-30.net
3. アサ芸風俗
4. アンダーナビ
5. ガールズヘブン
6. シティヘブンネット
7. ジョブヘブン【メンズヘブン】
8. デリヘル・ワールド
9. デリヘルコンビニクラブ
10. デリヘルタウン
11. バニラ
12. ぴゅあらば
13. ビンビンウェブ
14. フーコレ
15. 駅ちか人気！風俗ランキング
16. 俺の風
17. 口コミ風俗情報局
18. 当たり嬢レポート
19. 風俗じゃぱん！

### 男子求人サイト（1サイト）
1. 野郎WORK

**合計: 24サイト**

---

## 🔧 連携方法の分析

### Mr.Venreyの連携方式
- **認証方式**: ID/パスワードベース
- **更新方法**: ログイン後に更新操作
- **API**: 多くの媒体でAPI未提供

### 実装アプローチ（媒体別対応）

#### パターンA: API連携（推奨）
```
API提供媒体の場合:
├── REST API呼び出し
├── JSON/XMLデータ送信
└── レスポンス処理
```

#### パターンB: Web自動化（Headless Browser）
```
API未提供媒体の場合:
├── Puppeteer/Playwright使用
├── ログイン処理
├── フォーム自動入力
├── 画像アップロード
└── 更新ボタンクリック
```

#### パターンC: FTP/SFTP転送
```
ファイルベース更新の場合:
├── CSV/XMLファイル生成
├── FTP/SFTPアップロード
└── 媒体側で自動取り込み
```

---

## 📦 配信データ種別

### 1. キャスト基本情報
- 名前、ひらがな、ローマ字
- 生年月日、年齢
- 身長、3サイズ
- スタイル、タイプ
- お酒、タバコ
- 新人フラグ
- コメント（店舗/本人）

### 2. スケジュール情報
- 出勤日
- 出勤時間（開始・終了）
- 休み設定

### 3. 料金表
- コース別料金
- オプション料金
- 時間帯別料金

### 4. 画像管理
- プロフィール画像
- サブ画像（複数）
- 画像順序管理

### 5. コンテンツ更新
- 店舗情報更新
- キャストプロフィール更新
- お知らせ更新

### 6. 写メ日記転送
- 日記タイトル
- 日記本文
- 添付画像
- 投稿日時

### 7. 女性登録
- 新規キャスト登録
- 媒体別アカウント作成

### 8. 並び順変更
- キャスト表示順序
- 人気順/新着順など

### 9. 女性全削除機能
- 特定媒体から全キャスト削除
- 一括削除処理

### 10. 上位表示ボタン（タイマー更新）
- 上位表示リクエスト
- タイマー設定（自動クリック）
- 連打防止制御

---

## 🏗️ システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│  goodfifeproject CRM (マスターデータ管理)               │
│  ├── キャスト管理 (既存)                                │
│  ├── スケジュール管理 (既存)                            │
│  ├── 画像管理 (既存)                                    │
│  ├── 料金表管理 (新規)                                  │
│  └── 日記管理 (新規)                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  広告媒体統合管理システム (新規)                        │
│  ├── 媒体管理モジュール                                 │
│  │   ├── 媒体情報管理 (24サイト)                       │
│  │   ├── 認証情報管理 (ID/PASS暗号化保存)              │
│  │   └── 媒体別設定管理                                 │
│  ├── 配信エンジン                                       │
│  │   ├── API連携モジュール                             │
│  │   ├── Web自動化モジュール (Playwright)              │
│  │   ├── FTP転送モジュール                             │
│  │   └── データマッピング                               │
│  ├── スケジューラー                                     │
│  │   ├── 即時配信                                       │
│  │   ├── タイマー配信                                   │
│  │   └── 定期配信                                       │
│  ├── ログ管理                                           │
│  │   ├── 配信履歴                                       │
│  │   ├── エラーログ                                     │
│  │   └── 統計情報                                       │
│  └── 写メ日記転送                                       │
│      ├── 日記作成                                       │
│      ├── 画像アップロード                               │
│      └── 一括投稿                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────┬─────────────┬─────────────┐
        ↓             ↓             ↓             ↓
    ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
    │女子求人│   │お客様  │   │男子求人│   │その他  │
    │5サイト │   │18サイト│   │1サイト │   │媒体    │
    └────────┘   └────────┘   └────────┘   └────────┘
```

---

## 💾 データベース設計

### 1. 広告媒体管理テーブル
```sql
CREATE TABLE ad_platforms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,              -- 媒体名
  category ENUM('女子求人', 'お客様向け', '男子求人'),
  url VARCHAR(500),                        -- ログインURL
  login_id VARCHAR(255),                   -- ログインID
  login_password VARCHAR(255),             -- ログインパスワード(暗号化)
  connection_type ENUM('API', 'WEB', 'FTP'),
  api_endpoint VARCHAR(500),               -- APIエンドポイント
  api_key VARCHAR(255),                    -- APIキー
  ftp_host VARCHAR(255),                   -- FTPホスト
  ftp_port INT,                            -- FTPポート
  ftp_username VARCHAR(255),               -- FTPユーザー名
  ftp_password VARCHAR(255),               -- FTPパスワード
  is_active BOOLEAN DEFAULT true,          -- 有効/無効
  settings JSON,                           -- 媒体固有設定
  last_sync_at TIMESTAMP,                  -- 最終同期日時
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. 配信履歴テーブル
```sql
CREATE TABLE distribution_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  platform_id INT NOT NULL,                -- 媒体ID
  cast_id INT,                             -- キャストID
  distribution_type ENUM(
    'キャスト情報', 
    'スケジュール', 
    '料金表', 
    '画像',
    'コンテンツ更新',
    '写メ日記',
    '女性登録',
    '並び順変更',
    '上位表示'
  ),
  status ENUM('成功', '失敗', '処理中'),
  request_data JSON,                       -- リクエストデータ
  response_data JSON,                      -- レスポンスデータ
  error_message TEXT,                      -- エラーメッセージ
  execution_time INT,                      -- 実行時間（ミリ秒）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (platform_id) REFERENCES ad_platforms(id),
  FOREIGN KEY (cast_id) REFERENCES casts(id)
);
```

### 3. 配信スケジュールテーブル
```sql
CREATE TABLE distribution_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),                       -- スケジュール名
  platform_ids JSON,                       -- 配信先媒体IDリスト
  cast_ids JSON,                           -- 対象キャストIDリスト
  distribution_types JSON,                 -- 配信データ種別
  schedule_type ENUM('即時', 'タイマー', '定期'),
  schedule_datetime DATETIME,              -- 配信予定日時
  repeat_pattern VARCHAR(100),             -- 繰り返しパターン
  is_active BOOLEAN DEFAULT true,
  last_executed_at TIMESTAMP,              -- 最終実行日時
  next_execute_at TIMESTAMP,               -- 次回実行日時
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. 料金表テーブル
```sql
CREATE TABLE pricing_tables (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),                       -- 料金表名
  course_name VARCHAR(255),                -- コース名
  duration INT,                            -- 時間（分）
  price INT,                               -- 料金
  description TEXT,                        -- 説明
  display_order INT,                       -- 表示順序
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 5. 写メ日記テーブル
```sql
CREATE TABLE photo_diaries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cast_id INT NOT NULL,                    -- キャストID
  title VARCHAR(255),                      -- タイトル
  content TEXT,                            -- 本文
  images JSON,                             -- 画像URLリスト
  publish_datetime DATETIME,               -- 公開日時
  platforms JSON,                          -- 配信先媒体
  status ENUM('下書き', '配信待ち', '配信済み'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cast_id) REFERENCES casts(id)
);
```

### 6. 上位表示タイマーテーブル
```sql
CREATE TABLE top_display_timers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  platform_id INT NOT NULL,                -- 媒体ID
  cast_id INT,                             -- キャストID（NULL=店舗全体）
  interval_minutes INT,                    -- 実行間隔（分）
  start_time TIME,                         -- 開始時刻
  end_time TIME,                           -- 終了時刻
  is_active BOOLEAN DEFAULT true,
  last_executed_at TIMESTAMP,
  next_execute_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (platform_id) REFERENCES ad_platforms(id),
  FOREIGN KEY (cast_id) REFERENCES casts(id)
);
```

### 7. キャスト媒体連携テーブル
```sql
CREATE TABLE cast_platform_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cast_id INT NOT NULL,                    -- キャストID
  platform_id INT NOT NULL,                -- 媒体ID
  platform_cast_id VARCHAR(255),           -- 媒体側のキャストID
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cast_id) REFERENCES casts(id),
  FOREIGN KEY (platform_id) REFERENCES ad_platforms(id),
  UNIQUE KEY unique_cast_platform (cast_id, platform_id)
);
```

---

## 🔌 API設計

### 広告媒体管理API

#### 媒体管理
```
POST   /api/ad-platforms              # 媒体追加
GET    /api/ad-platforms              # 媒体一覧取得
GET    /api/ad-platforms/:id          # 媒体詳細取得
PUT    /api/ad-platforms/:id          # 媒体情報更新
DELETE /api/ad-platforms/:id          # 媒体削除
POST   /api/ad-platforms/:id/test     # 接続テスト
```

#### 一括配信API
```
POST   /api/distribution/immediate    # 即時配信
POST   /api/distribution/cast         # キャスト情報配信
POST   /api/distribution/schedule     # スケジュール配信
POST   /api/distribution/pricing      # 料金表配信
POST   /api/distribution/images       # 画像配信
POST   /api/distribution/content      # コンテンツ更新
POST   /api/distribution/diary        # 写メ日記配信
POST   /api/distribution/register     # 女性登録
POST   /api/distribution/order        # 並び順変更
DELETE /api/distribution/all-casts    # 女性全削除
POST   /api/distribution/top-display  # 上位表示
```

#### スケジュール管理API
```
POST   /api/schedules                 # スケジュール作成
GET    /api/schedules                 # スケジュール一覧
GET    /api/schedules/:id             # スケジュール詳細
PUT    /api/schedules/:id             # スケジュール更新
DELETE /api/schedules/:id             # スケジュール削除
POST   /api/schedules/:id/execute     # 手動実行
```

#### ログ管理API
```
GET    /api/logs/distribution         # 配信履歴一覧
GET    /api/logs/distribution/:id     # 配信詳細ログ
GET    /api/logs/errors               # エラーログ一覧
GET    /api/logs/statistics           # 統計情報
DELETE /api/logs/old                  # 古いログ削除
```

#### 写メ日記API
```
POST   /api/photo-diaries             # 日記作成
GET    /api/photo-diaries             # 日記一覧
GET    /api/photo-diaries/:id         # 日記詳細
PUT    /api/photo-diaries/:id         # 日記更新
DELETE /api/photo-diaries/:id         # 日記削除
POST   /api/photo-diaries/:id/publish # 日記配信
```

#### 上位表示タイマーAPI
```
POST   /api/top-display-timers        # タイマー作成
GET    /api/top-display-timers        # タイマー一覧
PUT    /api/top-display-timers/:id    # タイマー更新
DELETE /api/top-display-timers/:id    # タイマー削除
POST   /api/top-display-timers/:id/execute # 手動実行
```

---

## 🎨 フロントエンド画面設計

### メニュー構成
```
管理画面
├── 広告媒体管理
│   ├── 媒体一覧（24サイト管理）
│   ├── 媒体追加
│   ├── 媒体編集
│   ├── 認証情報設定
│   └── 接続テスト
├── 一括配信
│   ├── キャスト選択
│   ├── 媒体選択
│   ├── 配信内容選択
│   │   ├── 基本情報
│   │   ├── スケジュール
│   │   ├── 料金表
│   │   ├── 画像
│   │   └── その他
│   ├── プレビュー
│   └── 配信実行
├── 写メ日記管理
│   ├── 日記一覧
│   ├── 日記作成
│   ├── 日記編集
│   └── 一括配信
├── 配信スケジュール
│   ├── スケジュール一覧
│   ├── 新規作成
│   │   ├── 即時配信
│   │   ├── タイマー配信
│   │   └── 定期配信
│   └── 実行履歴
├── 上位表示管理
│   ├── タイマー一覧
│   ├── タイマー設定
│   └── 実行ログ
├── 料金表管理
│   ├── 料金表一覧
│   ├── 料金表作成
│   └── 料金表編集
├── 配信ログ
│   ├── 配信履歴
│   ├── エラーログ
│   ├── 統計情報
│   └── リアルタイム監視
└── システム設定
    ├── 全般設定
    ├── 通知設定
    └── バックアップ
```

### 主要画面イメージ

#### 1. 媒体一覧画面
```
┌─────────────────────────────────────────────────────┐
│ 広告媒体管理                    [+ 新規追加]        │
├─────────────────────────────────────────────────────┤
│ カテゴリ: [全て▼] [女子求人] [お客様向け] [男子] │
├─────────────────────────────────────────────────────┤
│ 媒体名              │ 状態 │ 最終同期      │ 操作  │
├─────────────────────────────────────────────────────┤
│ シティヘブンネット  │ ✓   │ 2025-12-15   │ [編集]│
│ HIME CHANNEL        │ ✓   │ 2025-12-15   │ [編集]│
│ バニラ              │ ✓   │ 2025-12-14   │ [編集]│
│ ガールズヘブン      │ ✗   │ エラー       │ [編集]│
│ ...                 │     │              │       │
└─────────────────────────────────────────────────────┘
```

#### 2. 一括配信画面
```
┌─────────────────────────────────────────────────────┐
│ 一括配信                                            │
├─────────────────────────────────────────────────────┤
│ ステップ1: キャスト選択                             │
│ □ 全選択                                            │
│ ☑ 山田花子  ☑ 佐藤美咲  ☐ 鈴木愛   ...           │
├─────────────────────────────────────────────────────┤
│ ステップ2: 媒体選択                                 │
│ [女子求人 (5)] [お客様向け (18)] [男子求人 (1)]   │
│ ☑ シティヘブンネット  ☑ バニラ  ☐ ガールズヘブン │
├─────────────────────────────────────────────────────┤
│ ステップ3: 配信内容選択                             │
│ ☑ キャスト基本情報  ☑ スケジュール  ☐ 料金表     │
│ ☑ 画像  ☐ 写メ日記  ☐ 並び順                     │
├─────────────────────────────────────────────────────┤
│ ステップ4: 配信方式                                 │
│ ○ 即時配信  ○ タイマー設定  [2025-12-20 10:00]  │
├─────────────────────────────────────────────────────┤
│ プレビュー: 2キャスト × 15媒体 = 30件の配信       │
│                                  [キャンセル] [配信]│
└─────────────────────────────────────────────────────┘
```

#### 3. 配信ログ画面
```
┌─────────────────────────────────────────────────────┐
│ 配信履歴              期間: [今日▼] [絞込検索]     │
├─────────────────────────────────────────────────────┤
│ 時刻     │媒体         │キャスト  │種別  │状態    │
├─────────────────────────────────────────────────────┤
│ 10:25:34 │シティヘブン │山田花子  │情報  │✓成功  │
│ 10:25:32 │バニラ       │山田花子  │情報  │✓成功  │
│ 10:25:30 │HIME CH      │山田花子  │情報  │✗失敗  │
│ 10:22:15 │シティヘブン │佐藤美咲  │画像  │✓成功  │
│ ...                                                 │
├─────────────────────────────────────────────────────┤
│ 成功: 245件  失敗: 3件  処理中: 2件              │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ 技術実装詳細

### 1. Web自動化（Playwright使用）

#### 基本的な実装パターン
```typescript
// /server/src/services/WebAutomationService.ts
import { chromium, Browser, Page } from 'playwright';

export class WebAutomationService {
  private browser: Browser | null = null;
  
  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox']
    });
  }
  
  async loginToPlatform(platform: AdPlatform): Promise<Page> {
    const page = await this.browser!.newPage();
    
    // ログインページにアクセス
    await page.goto(platform.url);
    
    // ID/パスワード入力
    await page.fill('input[name="login_id"]', platform.login_id);
    await page.fill('input[name="password"]', platform.login_password);
    await page.click('button[type="submit"]');
    
    // ログイン完了を待つ
    await page.waitForNavigation();
    
    return page;
  }
  
  async updateCastInfo(
    page: Page,
    cast: Cast,
    platform: AdPlatform
  ): Promise<boolean> {
    try {
      // プロフィール編集ページに移動
      await page.goto(`${platform.url}/cast/edit/${cast.id}`);
      
      // フォーム入力
      await page.fill('input[name="name"]', cast.name);
      await page.fill('input[name="age"]', String(cast.age));
      await page.fill('textarea[name="profile"]', cast.shop_comment);
      
      // 画像アップロード
      if (cast.images && cast.images.length > 0) {
        const fileInput = await page.$('input[type="file"]');
        await fileInput?.setInputFiles(cast.images[0].path);
      }
      
      // 保存ボタンクリック
      await page.click('button[type="submit"]');
      await page.waitForSelector('.success-message');
      
      return true;
    } catch (error) {
      console.error('Update failed:', error);
      return false;
    }
  }
  
  async clickTopDisplayButton(
    page: Page,
    platform: AdPlatform
  ): Promise<boolean> {
    try {
      // 上位表示ボタンを探してクリック
      const button = await page.$('.top-display-button');
      if (button) {
        await button.click();
        await page.waitForTimeout(1000);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Top display click failed:', error);
      return false;
    }
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
```

### 2. 配信エンジン

```typescript
// /server/src/services/DistributionEngine.ts
import { WebAutomationService } from './WebAutomationService';

export class DistributionEngine {
  private webAutomation: WebAutomationService;
  
  constructor() {
    this.webAutomation = new WebAutomationService();
  }
  
  async distributeCastInfo(
    castIds: number[],
    platformIds: number[]
  ): Promise<DistributionResult[]> {
    const results: DistributionResult[] = [];
    
    await this.webAutomation.initialize();
    
    for (const platformId of platformIds) {
      const platform = await this.getPlatform(platformId);
      
      // ログイン
      const page = await this.webAutomation.loginToPlatform(platform);
      
      for (const castId of castIds) {
        const cast = await this.getCast(castId);
        
        const startTime = Date.now();
        const success = await this.webAutomation.updateCastInfo(
          page,
          cast,
          platform
        );
        const executionTime = Date.now() - startTime;
        
        // ログ記録
        const log = await this.saveLog({
          platform_id: platformId,
          cast_id: castId,
          distribution_type: 'キャスト情報',
          status: success ? '成功' : '失敗',
          execution_time: executionTime
        });
        
        results.push({
          platform: platform.name,
          cast: cast.name,
          success,
          executionTime
        });
        
        // 次の配信まで少し待つ（連続アクセス防止）
        await page.waitForTimeout(2000);
      }
      
      await page.close();
    }
    
    await this.webAutomation.close();
    
    return results;
  }
  
  async distributeSchedule(
    castIds: number[],
    platformIds: number[],
    scheduleData: ScheduleData
  ): Promise<DistributionResult[]> {
    // スケジュール配信ロジック
    // 同様の実装パターン
  }
  
  async uploadPhotoDiary(
    diary: PhotoDiary,
    platformIds: number[]
  ): Promise<DistributionResult[]> {
    // 写メ日記配信ロジック
  }
  
  async deleteAllCasts(platformId: number): Promise<boolean> {
    // 全キャスト削除ロジック
    const platform = await this.getPlatform(platformId);
    const page = await this.webAutomation.loginToPlatform(platform);
    
    // 削除処理
    // ...
  }
  
  private async getPlatform(id: number): Promise<AdPlatform> {
    // データベースから媒体情報取得
  }
  
  private async getCast(id: number): Promise<Cast> {
    // データベースからキャスト情報取得
  }
  
  private async saveLog(logData: any): Promise<void> {
    // ログ保存
  }
}
```

### 3. スケジューラー

```typescript
// /server/src/services/SchedulerService.ts
import cron from 'node-cron';

export class SchedulerService {
  private tasks: Map<number, cron.ScheduledTask> = new Map();
  
  async initialize() {
    // データベースから有効なスケジュールを読み込み
    const schedules = await this.getActiveSchedules();
    
    for (const schedule of schedules) {
      this.registerSchedule(schedule);
    }
  }
  
  registerSchedule(schedule: DistributionSchedule) {
    if (schedule.schedule_type === 'タイマー') {
      // 特定日時に1回実行
      const cronExpression = this.convertToCronExpression(
        schedule.schedule_datetime
      );
      
      const task = cron.schedule(cronExpression, async () => {
        await this.executeSchedule(schedule);
        // 実行後にスケジュール削除
        this.unregisterSchedule(schedule.id);
      });
      
      this.tasks.set(schedule.id, task);
      
    } else if (schedule.schedule_type === '定期') {
      // 定期的に実行
      const cronExpression = schedule.repeat_pattern;
      
      const task = cron.schedule(cronExpression, async () => {
        await this.executeSchedule(schedule);
      });
      
      this.tasks.set(schedule.id, task);
    }
  }
  
  async executeSchedule(schedule: DistributionSchedule) {
    const engine = new DistributionEngine();
    
    // 配信実行
    const results = await engine.distributeCastInfo(
      schedule.cast_ids,
      schedule.platform_ids
    );
    
    // 実行日時更新
    await this.updateLastExecutedAt(schedule.id);
    
    // 通知（必要に応じて）
    await this.sendNotification(schedule, results);
  }
  
  unregisterSchedule(scheduleId: number) {
    const task = this.tasks.get(scheduleId);
    if (task) {
      task.stop();
      this.tasks.delete(scheduleId);
    }
  }
  
  private convertToCronExpression(datetime: Date): string {
    // 日時をcron形式に変換
    const minute = datetime.getMinutes();
    const hour = datetime.getHours();
    const day = datetime.getDate();
    const month = datetime.getMonth() + 1;
    
    return `${minute} ${hour} ${day} ${month} *`;
  }
}
```

### 4. 上位表示タイマー

```typescript
// /server/src/services/TopDisplayTimerService.ts
export class TopDisplayTimerService {
  private timers: Map<number, NodeJS.Timer> = new Map();
  
  async initialize() {
    const timers = await this.getActiveTimers();
    
    for (const timer of timers) {
      this.startTimer(timer);
    }
  }
  
  startTimer(timer: TopDisplayTimer) {
    const intervalMs = timer.interval_minutes * 60 * 1000;
    
    const interval = setInterval(async () => {
      // 時刻チェック
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = this.parseTime(timer.start_time);
      const endTime = this.parseTime(timer.end_time);
      
      if (currentTime >= startTime && currentTime <= endTime) {
        // 実行時間内なのでクリック実行
        await this.executeTopDisplay(timer);
      }
    }, intervalMs);
    
    this.timers.set(timer.id, interval);
  }
  
  async executeTopDisplay(timer: TopDisplayTimer) {
    const webAutomation = new WebAutomationService();
    await webAutomation.initialize();
    
    const platform = await this.getPlatform(timer.platform_id);
    const page = await webAutomation.loginToPlatform(platform);
    
    const success = await webAutomation.clickTopDisplayButton(
      page,
      platform
    );
    
    // ログ保存
    await this.saveLog({
      platform_id: timer.platform_id,
      cast_id: timer.cast_id,
      distribution_type: '上位表示',
      status: success ? '成功' : '失敗'
    });
    
    await page.close();
    await webAutomation.close();
    
    // 最終実行日時更新
    await this.updateLastExecutedAt(timer.id);
  }
  
  stopTimer(timerId: number) {
    const interval = this.timers.get(timerId);
    if (interval) {
      clearInterval(interval);
      this.timers.delete(timerId);
    }
  }
  
  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
```

---

## 📊 実装工程表

### フェーズ1: 基盤構築（4週間）

#### Week 1-2: データベース・基本API
- [ ] データベース設計・実装
- [ ] 広告媒体管理API
- [ ] 基本的な配信エンジン
- [ ] 認証情報暗号化
- [ ] ログ管理システム

#### Week 3-4: Web自動化基盤
- [ ] Playwright統合
- [ ] ログイン自動化
- [ ] フォーム入力自動化
- [ ] 画像アップロード自動化
- [ ] エラーハンドリング

### フェーズ2: 媒体連携実装（6週間）

#### Week 5-6: 主要媒体3サイト連携
1. シティヘブンネット
2. バニラ
3. HIME CHANNEL

- [ ] ログイン処理
- [ ] キャスト情報更新
- [ ] スケジュール更新
- [ ] 画像アップロード
- [ ] 動作テスト

#### Week 7-8: 次の5サイト連携
4. ガールズヘブン
5. デリヘルタウン
6. ぴゅあらば
7. 風俗じゃぱん！
8. R-30.net

#### Week 9-10: 残りの媒体連携
- お客向けサイト（残り10サイト）
- 女子求人サイト（5サイト）
- 男子求人サイト（1サイト）

### フェーズ3: 高度機能実装（4週間）

#### Week 11-12: スケジューラー・タイマー
- [ ] 配信スケジューラー
- [ ] タイマー配信
- [ ] 定期配信
- [ ] 上位表示タイマー

#### Week 13-14: 写メ日記・追加機能
- [ ] 写メ日記管理
- [ ] 料金表管理
- [ ] 並び順変更
- [ ] 全削除機能

### フェーズ4: UI・最終調整（2週間）

#### Week 15: フロントエンド実装
- [ ] 媒体管理画面
- [ ] 一括配信画面
- [ ] ログ表示画面
- [ ] スケジュール管理画面

#### Week 16: テスト・調整
- [ ] 総合テスト
- [ ] パフォーマンス最適化
- [ ] ドキュメント作成
- [ ] 本番リリース

**合計: 約4ヶ月（16週間）**

---

## 💰 開発コスト概算

### 工数見積もり

| フェーズ | 作業内容 | 工数 |
|---------|---------|------|
| フェーズ1 | 基盤構築 | 160時間 |
| フェーズ2 | 媒体連携（24サイト） | 480時間 |
| フェーズ3 | 高度機能実装 | 160時間 |
| フェーズ4 | UI・最終調整 | 80時間 |
| **合計** | | **880時間** |

### サイト別連携工数（平均）
- **主要サイト**（複雑）: 25-30時間/サイト
- **標準サイト**: 15-20時間/サイト
- **シンプルサイト**: 10-15時間/サイト

### コスト要素
1. **開発費用**: 工数×時間単価
2. **サーバー費用**: 追加リソース（メモリ・CPU）
3. **ブラウザ自動化**: Playwrightライセンス（OSS: 無料）
4. **保守費用**: 月次メンテナンス

---

## 🔐 セキュリティ対策

### 1. 認証情報管理
```typescript
// パスワード暗号化
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = process.env.ENCRYPTION_KEY;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

### 2. アクセス制限
- 管理者のみアクセス可能
- 二段階認証（オプション）
- IPアドレス制限（オプション）

### 3. 監査ログ
- 全ての配信操作を記録
- ログイン履歴
- 設定変更履歴

---

## 📈 パフォーマンス最適化

### 1. 並列処理
```typescript
// 複数媒体への同時配信
async function parallelDistribution(
  casts: Cast[],
  platforms: AdPlatform[]
) {
  const promises = platforms.map(platform =>
    distributeToPlatform(casts, platform)
  );
  
  const results = await Promise.allSettled(promises);
  return results;
}
```

### 2. キュー処理
```typescript
// Bull Queue使用
import Queue from 'bull';

const distributionQueue = new Queue('distribution', {
  redis: {
    host: 'localhost',
    port: 6379
  }
});

distributionQueue.process(async (job) => {
  const { castId, platformId } = job.data;
  await distributeCastToPlatform(castId, platformId);
});
```

### 3. キャッシング
- 媒体設定のキャッシュ
- ログイン状態の保持
- 画像のCDN配信

---

## 🎯 まとめ

### 実装可能性
✅ **完全に実装可能です**

### 技術的強み
1. ✅ 既存のCRMシステムとの統合
2. ✅ 24サイトへの一括配信
3. ✅ Web自動化による柔軟な対応
4. ✅ スケジューラーによる自動化
5. ✅ 詳細なログ管理

### 期待される効果
1. **作業時間削減**: 手動更新 → 一括自動更新
2. **ミス防止**: 自動化による入力ミス削減
3. **スピード**: 24サイトへ数分で配信
4. **管理効率**: 一元管理による効率化

### 次のステップ

1. **要件確認**
   - 各媒体のログイン情報確認
   - 優先度の高い媒体の選定
   - 配信頻度の決定

2. **プロトタイプ作成**
   - 主要3サイトで動作確認
   - 実際の配信テスト
   - フィードバック収集

3. **本格開発**
   - 全24サイト対応
   - 全機能実装
   - 本番環境デプロイ

---

**提案書作成日**: 2025年12月15日  
**システム名**: goodfifeproject 広告媒体統合管理システム  
**対象媒体数**: 24サイト
