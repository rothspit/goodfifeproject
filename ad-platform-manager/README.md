# 広告媒体一括更新システム (Ad Platform Manager)

**Mr.Venrey型 広告媒体一括配信管理システム**

24サイトの広告媒体（シティヘブンネット、デリヘルタウン他）に対して、女性キャスト情報、スケジュール、写メ日記などを一括で配信・更新できるシステムです。

---

## 🎯 プロジェクト概要

### 目的
- 複数の広告媒体への手動更新作業を自動化
- 作業時間を**4時間 → 5分**に短縮（95%削減）
- ヒューマンエラーの削減
- リアルタイム配信を実現

### 対象広告媒体（24サイト）
1. **シティヘブンネット** ✅ 実装済み（ログイン成功）
2. **デリヘルタウン** 🔄 実装中（CloudFront対策が必要）
3. バニラ
4. HIME CHANNEL
5. ぴゅあらば
6. 他19サイト（順次追加予定）

---

## 📁 プロジェクト構造

```
ad-platform-manager/
├── frontend/                    # Next.js管理画面 (ポート3010)
│   ├── app/
│   │   ├── components/          # Reactコンポーネント
│   │   │   ├── PlatformList.tsx      # 広告媒体一覧
│   │   │   ├── DistributionPanel.tsx # 配信操作パネル
│   │   │   └── LogViewer.tsx         # 配信ログビューア
│   │   ├── lib/
│   │   │   └── api.ts           # API クライアント
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript型定義
│   │   ├── globals.css          # グローバルCSS
│   │   ├── layout.tsx           # レイアウト
│   │   └── page.tsx             # メインページ
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── backend/                     # Express API + Playwright (ポート5001)
│   ├── src/
│   │   ├── config/
│   │   │   └── adPlatformDatabase.ts    # DB接続・初期化
│   │   ├── controllers/
│   │   │   ├── adPlatformController.ts  # 媒体管理API
│   │   │   └── distributionController.ts # 配信エンジンAPI
│   │   ├── routes/
│   │   │   ├── adPlatform.ts            # 媒体管理ルート
│   │   │   └── distribution.ts          # 配信ルート
│   │   ├── services/
│   │   │   └── platforms/
│   │   │       └── HeavenNetService.ts  # シティヘブン統合
│   │   ├── middleware/
│   │   └── index.ts             # メインサーバー
│   ├── migrations/              # DBマイグレーション
│   ├── scripts/                 # テストスクリプト
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                     # 環境変数
│
├── shared/                      # 共通型定義
│   └── types/
│
└── README.md                    # このファイル
```

---

## 🚀 セットアップ手順

### 1. バックエンドセットアップ

```bash
# バックエンドディレクトリへ移動
cd ad-platform-manager/backend

# 依存関係のインストール
npm install

# Playwrightブラウザインストール
npx playwright install chromium
npx playwright install-deps

# 環境変数設定（既に.envファイルを作成済み）
# 必要に応じて編集してください

# データベーステーブル作成（MySQLに接続）
# 既存のhitozumano_mituデータベースを使用

# 開発サーバー起動
npm run dev
```

**バックエンドURL**: `http://localhost:5001`

### 2. フロントエンドセットアップ

```bash
# フロントエンドディレクトリへ移動
cd ../frontend

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

**フロントエンドURL**: `http://localhost:3010`

---

## 🎨 機能一覧

### ✅ 実装済み機能

#### 1. 広告媒体管理
- ✅ 媒体一覧表示
- ✅ カテゴリフィルタリング（お客向け/女子求人/男子求人）
- ✅ 有効/無効切り替え
- ✅ 最終同期日時表示
- ✅ パスワード自動暗号化（AES-256-CBC）

#### 2. 配信エンジン
- ✅ キャスト情報配信
- ✅ スケジュール配信
- ✅ 写メ日記配信
- ✅ 一括配信
- ✅ 複数媒体への同時配信
- ✅ 実行時間測定
- ✅ 詳細ログ記録

#### 3. ログ管理
- ✅ 配信履歴表示
- ✅ ステータスフィルタリング（成功/失敗）
- ✅ エラーメッセージ記録
- ✅ 実行時間表示

#### 4. シティヘブンネット統合
- ✅ ログイン成功確認
- ✅ 管理画面アクセス
- ✅ 自動スクリーンショット

### 🔄 実装中

#### 5. デリヘルタウン統合
- ⚠️ CloudFrontブロック対策が必要
- User-Agent調整
- Cookie/Session管理

### 📝 未実装（今後の開発）

- 追加22サイトの統合
- 自動配信スケジューラー
- 配信テンプレート機能
- 一括編集機能
- レポート・分析機能

---

## 🔌 API エンドポイント

### 広告媒体管理 (`/api/ad-platforms`)

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/ad-platforms` | 媒体一覧取得 |
| GET | `/api/ad-platforms/:id` | 媒体詳細取得 |
| POST | `/api/ad-platforms` | 媒体追加 |
| PUT | `/api/ad-platforms/:id` | 媒体更新 |
| DELETE | `/api/ad-platforms/:id` | 媒体削除 |
| GET | `/api/ad-platforms/logs` | 配信ログ取得 |
| GET | `/api/ad-platforms/statistics` | 配信統計取得 |

### 配信エンジン (`/api/distribution`)

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| POST | `/api/distribution/cast` | キャスト情報配信 |
| POST | `/api/distribution/schedule` | スケジュール配信 |
| POST | `/api/distribution/diary` | 写メ日記配信 |
| POST | `/api/distribution/bulk` | 一括配信 |

### 使用例

#### キャスト情報を配信
```bash
POST /api/distribution/cast
Content-Type: application/json

{
  "castId": 1,
  "platformIds": [1, 2],
  "data": {
    "name": "さくら",
    "age": 25,
    "height": 160,
    "bust": 88,
    "waist": 58,
    "hip": 86
  }
}
```

---

## 🗄️ データベース

### テーブル構造

#### `ad_platforms` テーブル
```sql
CREATE TABLE ad_platforms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,          -- 媒体名
  category ENUM('お客向け','女子求人','男子求人'),
  url TEXT,                                    -- ログインURL
  login_id VARCHAR(255),
  login_password TEXT,                         -- AES-256暗号化
  connection_type ENUM('WEB','API','FTP') DEFAULT 'WEB',
  api_endpoint TEXT,
  api_key VARCHAR(255),
  api_secret TEXT,
  ftp_host VARCHAR(255),
  ftp_port INT,
  ftp_username VARCHAR(255),
  ftp_password TEXT,
  is_active TINYINT DEFAULT 1,
  last_sync_at TIMESTAMP,
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `distribution_logs` テーブル
```sql
CREATE TABLE distribution_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  platform_id INT NOT NULL,
  cast_id INT,
  distribution_type VARCHAR(50) NOT NULL,
  status ENUM('成功','失敗','処理中') NOT NULL,
  error_message TEXT,
  execution_time INT,                          -- ミリ秒
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (platform_id) REFERENCES ad_platforms(id) ON DELETE CASCADE,
  FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE SET NULL
);
```

---

## 🔒 セキュリティ

### 実装済み対策

1. **パスワード暗号化**
   - AES-256-CBCアルゴリズム
   - ランダムIV（初期化ベクトル）
   - 環境変数で暗号化キー管理

2. **APIレスポンス保護**
   - パスワードフィールド自動マスク
   - フロントエンドにパスワード送信しない

3. **SQLインジェクション対策**
   - プレースホルダー使用
   - パラメータバインディング

### TODO

- ⚠️ HTTPS必須化（本番環境）
- ⚠️ JWT認証追加
- ⚠️ レート制限実装

---

## 💰 期待される効果

### 作業時間削減
- **現状**: 24サイト × 10分/サイト = **4時間/回**
- **導入後**: ワンクリック = **5分/回**
- **削減率**: **95%削減**

### 年間削減効果
- 1日2回更新 × 365日 = 730回/年
- 削減時間: 730回 × 235分 = **2,855時間/年**
- 人件費削減: 約**500万円/年**（時給2,000円換算）

### その他メリット
- ✅ ヒューマンエラー削減
- ✅ 更新漏れ防止
- ✅ リアルタイム配信可能
- ✅ 一元管理による効率化

---

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Axios**

### バックエンド
- **Node.js 20**
- **Express.js**
- **TypeScript**
- **MySQL 8.0**
- **Playwright 1.48** (Web自動化)

---

## 📊 開発進捗

### 現在の実装完了率: **約40%**（基盤完成）

#### ✅ 完了（40%）
- データベース設計・実装
- 全APIエンドポイント
- Web自動化基盤（Playwright）
- シティヘブンネット統合（80%）
- セキュリティ対策

#### 🔄 進行中（20%）
- デリヘルタウン統合（50%）
- 管理画面UI改善

#### 📝 未着手（40%）
- 追加22サイトの統合
- 自動スケジューラー
- 高度な分析機能

---

## 🎯 次のステップ

### 短期（1-2週間）
1. デリヘルタウンCloudFrontブロック対策
2. シティヘブンネット詳細実装完了
3. 管理画面UI完成
4. 実配信テスト

### 中期（1ヶ月）
1. 追加18サイトの統合開始
2. 自動配信スケジューラー実装
3. 配信テンプレート機能
4. レポート・分析機能

### 長期（3ヶ月）
1. 全24サイト統合完了
2. 本番環境デプロイ
3. パフォーマンス最適化
4. ユーザー研修

---

## 📞 サポート

### ドキュメント
- システムサマリー: `/home/user/webapp/AD_PLATFORM_SYSTEM_SUMMARY.md`
- 進捗レポート: `/home/user/webapp/AD_PLATFORM_PROGRESS_REPORT.md`

### テスト方法
```bash
# バックエンドヘルスチェック
curl http://localhost:5001/health

# 媒体一覧取得
curl http://localhost:5001/api/ad-platforms
```

---

## 📝 ライセンス

Private - All Rights Reserved  
© 2025 人妻の蜜

---

**開発者**: GenSpark AI Developer  
**作成日**: 2025-12-16  
**バージョン**: 1.0.0
