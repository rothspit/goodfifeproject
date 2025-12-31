# 人妻の蜜 - マルチ店舗対応キャバクラ予約・顧客管理システム

西船橋、錦糸町、葛西、松戸の4店舗に対応した「人妻の蜜」公式予約・顧客管理サイトです。

## 🆕 最新機能（2024-12-13更新）

### マルチ店舗対応
- ✅ 4店舗（西船橋、錦糸町、葛西、松戸）対応
- ✅ 動的ルーティング：`/{store_id}/casts`, `/{store_id}/schedule` など
- ✅ ブランドトップページ
- ✅ 店舗別データフィルタリング

### 顧客管理・受注システム（CTI連携）
- ✅ 電話番号で顧客検索
- ✅ 顧客・キャスト履歴管理
- ✅ 受注モーダル（OrderModal）
- ✅ Dialpad API連携（Webhook）
- ✅ 通話ログ・メモ機能
- ✅ 初見/リピーター判定

### データベース
- ✅ SQLite → MySQL/MariaDB完全移行
- ✅ 顧客管理テーブル（orders, customer_cast_history, cti_call_logs, customer_notes）
- ✅ マイグレーションスクリプト完備

---

## 🚀 本番環境デプロイ（サーバー管理者向け）

### ⚡ ワンコマンドデプロイ（推奨）

**すべてのエラーを自動修正して最新コードをデプロイ：**

```bash
ssh root@210.131.222.152 'cd /var/www/goodfifeproject && git fetch origin && git reset --hard origin/genspark_ai_developer && chmod +x fix-all-v2.sh && ./fix-all-v2.sh'
```

**実行時間:** 約10〜15分  
**自動処理内容:**
- ✅ 最新コード取得（genspark_ai_developer ブランチ）
- ✅ バックエンド: TypeScript → JavaScript ビルド + PM2起動
- ✅ フロントエンド: Next.jsリビルド + PM2起動
- ✅ データベースマイグレーション実行
- ✅ 環境変数自動設定

### 📍 本番環境URL

| サービス | URL |
|---------|-----|
| **管理画面（CTI受注）** | http://210.131.222.152:3000/admin/login |
| **ブランドトップ** | http://210.131.222.152/ |
| **西船橋店** | http://210.131.222.152/nishifuna |
| **錦糸町店** | http://210.131.222.152/kinshicho |
| **葛西店** | http://210.131.222.152/kasai |
| **松戸店** | http://210.131.222.152/matsudo |
| **バックエンドAPI** | http://210.131.222.152:5000/api |

### 🔐 管理画面ログイン

| 項目 | 情報 |
|------|------|
| URL | http://210.131.222.152:3000/admin/login |
| 電話番号 | `09000000000` |
| パスワード | `admin123` |

**⚠️ セキュリティ注意:** 初回ログイン後、必ずパスワードを変更してください！

### 📚 デプロイドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [FINAL_DEPLOY_SOLUTION.md](FINAL_DEPLOY_SOLUTION.md) | 📖 完全デプロイガイド（総合版） |
| [TS_NODE_FIX.md](TS_NODE_FIX.md) | ts-node エラー解決方法 |
| [QUICK_FIX.md](QUICK_FIX.md) | Next.js ビルドエラー緊急修正 |
| [ADMIN_CREDENTIALS.md](ADMIN_CREDENTIALS.md) | 管理者ログイン情報 |
| [README_DEPLOY.md](README_DEPLOY.md) | デプロイ簡易ガイド |

### 🚀 デプロイスクリプト

| スクリプト | 用途 | 実行時間 |
|-----------|------|---------|
| `fix-all-v2.sh` | 🎯 完全自動修正（推奨） | 10〜15分 |
| `emergency-fix.sh` | フロントエンドのみ修正 | 5〜10分 |
| `fix-backend.sh` | バックエンドのみ修正 | 3〜5分 |

---

## 🚀 開発環境クイックスタート（初めての方向け）

### GitHub Codespacesで動かす（最も簡単！）

1. このリポジトリのページで緑色の「**Code**」ボタンをクリック
2. 「**Codespaces**」タブを選択
3. 「**Create codespace on main**」をクリック
4. 開いたターミナルで以下を実行：
   ```bash
   ./start.sh
   ```
5. 「Application available on port 3000」の通知が出たら「**ブラウザで開く**」をクリック

**詳しい手順は [SETUP.md](SETUP.md) をご覧ください！**

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

本番環境は **MySQL/MariaDB**、開発環境は **SQLite** を使用しています。

### テーブル構成

#### 基本機能
- `users`: ユーザー情報（顧客・管理者・キャスト・スタッフ）
- `casts`: キャスト情報
- `cast_images`: キャスト画像
- `cast_schedules`: 出勤スケジュール
- `reservations`: 予約情報（旧システム）
- `reviews`: 口コミ
- `blogs`: ブログ記事
- `chat_messages`: チャットメッセージ
- `announcements`: お知らせ

#### マルチ店舗対応
- `stores`: 店舗情報（西船橋、錦糸町、葛西、松戸）
- `instant_princess`: 即姫設定（店舗別）

#### 顧客管理・CTI連携
- `orders`: 受注情報（顧客、キャスト、予約日時、料金）
- `customer_cast_history`: 顧客・キャスト接客履歴
- `cti_call_logs`: 通話ログ（Dialpad連携）
- `customer_notes`: 顧客メモ（タイムライン形式）
- `dialpad_webhook_settings`: Dialpad Webhook設定（店舗別）

### マイグレーション

マイグレーションファイルは `server/migrations/` に格納されています：

```bash
# 管理者アカウント作成
mysql -u hitozumano_mitu -p'Hjmitsu^90' -D hitozumano_mitu < server/migrations/create_admin_user.sql

# 顧客管理テーブル作成
mysql -u hitozumano_mitu -p'Hjmitsu^90' -D hitozumano_mitu < server/migrations/create_customer_management_tables.sql
```

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
