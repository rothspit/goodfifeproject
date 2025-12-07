# 人妻の蜜 - キャバクラ予約システム

西船橋エリアの「人妻の蜜」公式予約サイトです。

## 機能

### 実装済み機能
- ✅ 会員登録・ログインシステム（電話番号認証）
- ✅ キャスト一覧・詳細表示
- ✅ 詳細検索機能（年齢、身長、カップ数、オプション等）
- ✅ リアルタイムチャット機能（Socket.io）
- ✅ 予約システム
- ✅ レビュー・口コミ機能
- ✅ キャストブログ機能
- ✅ ランキング機能
- ✅ お知らせ機能
- ✅ レスポンシブデザイン（スマホ対応）

## 技術スタック

### フロントエンド
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Socket.io Client
- Swiper (スライダー)
- React Icons

### バックエンド
- Node.js
- Express
- Socket.io
- TypeScript
- SQLite3
- JWT認証
- Bcrypt（パスワードハッシュ化）

## セットアップ

### 必要な環境
- Node.js 18以上
- npm または yarn

### インストール

1. リポジトリのクローン
```bash
git clone <repository-url>
cd webapp
```

2. サーバーのセットアップ
```bash
cd server
npm install
cp .env.example .env  # 環境変数を設定
npm run dev
```

3. クライアントのセットアップ
```bash
cd ../client
npm install
cp .env.local.example .env.local  # 環境変数を設定
npm run dev
```

### 環境変数

#### サーバー (.env)
```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

#### クライアント (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 起動方法

### 開発環境

1. サーバーを起動
```bash
cd server
npm run dev
```

2. クライアントを起動（別のターミナル）
```bash
cd client
npm run dev
```

3. ブラウザでアクセス
- フロントエンド: http://localhost:3000
- API: http://localhost:5000/api

### 本番環境

1. サーバーのビルド
```bash
cd server
npm run build
npm start
```

2. クライアントのビルド
```bash
cd client
npm run build
npm start
```

## データベース

SQLiteを使用しています。初回起動時に自動的にテーブルが作成されます。

### テーブル構成
- users: ユーザー情報
- casts: キャスト情報
- cast_images: キャスト画像
- cast_schedules: 出勤スケジュール
- reservations: 予約情報
- reviews: 口コミ
- blogs: ブログ記事
- chat_messages: チャットメッセージ
- announcements: お知らせ

## API エンドポイント

### 認証
- POST /api/auth/register - 会員登録
- POST /api/auth/login - ログイン
- GET /api/auth/profile - プロフィール取得
- PUT /api/auth/profile - プロフィール更新

### キャスト
- GET /api/casts - キャスト一覧取得
- GET /api/casts/:id - キャスト詳細取得
- GET /api/casts/available - すぐ呼べるキャスト
- GET /api/casts/:id/schedule - スケジュール取得

### 予約
- POST /api/reservations - 予約作成
- GET /api/reservations - 予約一覧取得
- GET /api/reservations/:id - 予約詳細取得
- PUT /api/reservations/:id/cancel - 予約キャンセル

### レビュー
- POST /api/reviews - レビュー投稿
- GET /api/reviews/cast/:cast_id - キャストのレビュー取得
- GET /api/reviews/recent - 新着レビュー取得

### ブログ
- GET /api/blogs - ブログ一覧取得
- GET /api/blogs/:id - ブログ詳細取得
- GET /api/blogs/recent - 新着ブログ取得

### お知らせ
- GET /api/announcements - お知らせ一覧取得
- GET /api/announcements/:id - お知らせ詳細取得

## Socket.io イベント

### クライアント → サーバー
- get_chat_history - チャット履歴取得
- send_message - メッセージ送信
- mark_as_read - 既読にする
- get_unread_count - 未読数取得
- get_chat_list - チャットリスト取得
- typing - タイピング通知

### サーバー → クライアント
- chat_history - チャット履歴
- message_sent - メッセージ送信完了
- new_message - 新着メッセージ
- unread_count - 未読数
- chat_list - チャットリスト
- user_typing - タイピング中
- error - エラー

## ディレクトリ構造

```
webapp/
├── client/               # Next.jsフロントエンド
│   ├── app/             # Next.js App Router
│   ├── components/      # Reactコンポーネント
│   ├── lib/             # ユーティリティ
│   ├── types/           # TypeScript型定義
│   └── public/          # 静的ファイル
│
├── server/              # Node.jsバックエンド
│   ├── src/
│   │   ├── config/      # 設定ファイル
│   │   ├── controllers/ # コントローラー
│   │   ├── routes/      # ルート定義
│   │   ├── middleware/  # ミドルウェア
│   │   └── index.ts     # エントリーポイント
│   ├── data/            # SQLiteデータベース
│   └── uploads/         # アップロードファイル
│
└── README.md
```

## 店舗情報

- 店舗名: 人妻の蜜
- 所在地: 西船橋
- 営業時間: 9:00 - 6:00
- 電話番号: 050-1748-7999
- コンセプト: 誠実で良い子が多いお店
- ペルソナ: 30代〜80代

## ライセンス

Private - All Rights Reserved

## 開発者向けメモ

### テストデータの追加
サーバー起動後、以下のようなSQLを実行してテストデータを追加できます：

```sql
-- キャストの追加
INSERT INTO casts (name, age, height, cup_size, blood_type, profile_text, is_new, new_until) 
VALUES ('さくら', 28, 158, 'D', 'A', 'よろしくお願いします♡', 1, datetime('now', '+30 days'));

-- 出勤スケジュールの追加
INSERT INTO cast_schedules (cast_id, date, start_time, end_time) 
VALUES (1, date('now'), '10:00', '22:00');
```

### チャット機能のテスト
1. 2つのブラウザ（または通常モードとシークレットモード）で異なるアカウントでログイン
2. キャスト詳細ページからチャットを開始
3. リアルタイムでメッセージが送受信されることを確認

## サポート

問題が発生した場合は、GitHubのIssuesに報告してください。
