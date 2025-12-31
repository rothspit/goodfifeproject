# 人妻の蜜 - 管理画面機能一覧

## 実装済み管理機能

### 1. ダッシュボード (/admin)
- システム全体の統計情報表示
- 各種管理機能へのクイックアクセス

### 2. キャスト管理 (/admin/casts)
- キャスト一覧表示
- キャストの追加・編集・削除
- プロフィール画像管理
- ステータス管理（available/busy）

### 3. 出勤スケジュール管理 (/admin/schedules)
- 日別・週別スケジュール表示
- スケジュールの追加・編集・削除
- キャスト別スケジュール管理

### 4. お知らせ管理 (/admin/announcements)
- お知らせ一覧表示
- お知らせの作成・編集・削除
- カテゴリ管理（システム/イベント/重要）
- 公開/非公開設定

### 5. 即姫管理 (/admin/immediate)
**出勤時間と連動した即姫管理システム**
- 出勤中のキャスト一覧表示
- 即姫の追加・編集・削除
- 有効/無効の切り替え
- 備考管理
- リアルタイムで出勤時間と連動
  - 出勤時間内のみ表示
  - 出勤時間外は自動非表示

### 6. ブログ管理（写メ日記） (/admin/blogs)
- ブログ一覧表示（カード形式）
- ブログの作成・編集・削除
- タイトル・内容での検索
- キャスト別フィルター
- 画像プレビュー機能

### 7. 口コミ承認管理 (/admin/reviews)
- レビュー一覧表示
- 承認・却下機能
- ステータス管理（pending/approved/rejected）
- 統計ダッシュボード
  - 承認待ち件数
  - 承認済み件数
  - 却下件数
- キャスト別フィルター
- ステータス別フィルター

### 8. チャット管理 (/admin/chats)
- チャットルーム一覧表示
- メッセージ詳細表示
- メッセージ削除機能
- 既読管理
- 統計ダッシュボード
  - 総メッセージ数
  - 未読メッセージ数
  - チャットルーム数
- リアルタイム更新

## 認証・セキュリティ
- JWT認証
- 管理者権限チェック
- ログイン/ログアウト機能
- トークンベースの認証
- ミドルウェアによるルート保護

## テクノロジースタック
### フロントエンド
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- React Icons

### バックエンド
- Node.js
- Express.js
- SQLite3
- JWT認証

## API エンドポイント

### 認証
- POST /api/auth/login
- GET /api/auth/me

### キャスト
- GET /api/casts
- POST /api/casts
- PUT /api/casts/:id
- DELETE /api/casts/:id

### スケジュール
- GET /api/schedules
- POST /api/schedules
- PUT /api/schedules/:id
- DELETE /api/schedules/:id

### お知らせ
- GET /api/announcements
- POST /api/announcements/admin
- PUT /api/announcements/admin/:id
- DELETE /api/announcements/admin/:id

### 即姫管理
- GET /api/instant-princess/available （公開用）
- GET /api/instant-princess/admin/all （管理用）
- GET /api/instant-princess/admin/working-casts （出勤中キャスト取得）
- POST /api/instant-princess/admin （即姫追加）
- PUT /api/instant-princess/admin/:id （即姫更新）
- DELETE /api/instant-princess/admin/:id （即姫削除）

### ブログ
- GET /api/blogs （公開用）
- GET /api/blogs/admin/all （管理用）
- POST /api/blogs/admin （ブログ作成）
- PUT /api/blogs/admin/:id （ブログ更新）
- DELETE /api/blogs/admin/:id （ブログ削除）

### レビュー
- GET /api/reviews （公開用 - 承認済みのみ）
- GET /api/reviews/admin/all （管理用 - 全件）
- PUT /api/reviews/admin/:id/status （承認・却下）
- DELETE /api/reviews/admin/:id （レビュー削除）

### チャット
- GET /api/chats/admin/rooms （チャットルーム一覧）
- GET /api/chats/admin/rooms/:userId/:castId （メッセージ詳細）
- DELETE /api/chats/admin/:id （メッセージ削除）
- PUT /api/chats/admin/:id/read （既読にする）

## データベーススキーマ

### テーブル一覧
- users （ユーザー情報）
- casts （キャスト情報）
- cast_schedules （出勤スケジュール）
- announcements （お知らせ）
- instant_princess （即姫管理）
- blogs （ブログ/写メ日記）
- reviews （レビュー/口コミ）
- chat_messages （チャットメッセージ）
- reservations （予約情報）

## サンプルデータ
- 3件のキャスト情報
- 3件の出勤スケジュール
- 2件の即姫設定
- 6件のブログ記事
- 6件のレビュー（承認済み3件、承認待ち3件）
- 9件のチャットメッセージ（3つのチャットルーム）

## アクセス情報
- 管理画面URL: https://3002-iwlhxuzhfaqbr3cqpityv-b32ec7bb.sandbox.novita.ai
- APIサーバー: https://5000-iwlhxuzhfaqbr3cqpityv-b32ec7bb.sandbox.novita.ai

### ログイン情報
- 電話番号: 090-0000-0000
- パスワード: admin123456

## 使い方
1. 管理画面ログインページにアクセス
2. ログイン情報を入力
3. サイドバーから各管理機能にアクセス
4. 各機能で作成・編集・削除を実行

## 特徴
- レスポンシブデザイン（モバイル対応）
- リアルタイム更新
- 直感的なUI/UX
- エラーハンドリング
- エラーバウンダリ実装
- 検索・フィルター機能
- 統計ダッシュボード
