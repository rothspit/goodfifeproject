# 🚀 セットアップガイド - 人妻の蜜

このガイドでは、システムをGitHub上で動かす方法を説明します。

## 方法1: GitHub Codespaces（最も簡単・推奨）✨

ブラウザだけで完結！インストール不要で動作確認ができます。

### 手順

1. **リポジトリにアクセス**
   ```
   https://github.com/rothspit/goodfifeproject
   ```

2. **Codespacesを起動**
   - 緑色の「**Code**」ボタンをクリック
   - 「**Codespaces**」タブを選択
   - 「**Create codespace on main**」をクリック
   - 数分待つとブラウザ上で開発環境が開きます

3. **システムを起動**
   
   Codespaceが開いたら、下部のターミナルで以下を実行：

   ```bash
   ./start.sh
   ```

   または、手動で起動する場合：

   **ターミナル1（サーバー）:**
   ```bash
   cd server
   cp .env.example .env
   npm install
   npm run dev
   ```

   **ターミナル2（クライアント）:**
   新しいターミナルを開いて（+ボタンをクリック）
   ```bash
   cd client
   cp .env.local.example .env.local
   npm install
   npm run dev
   ```

4. **アクセス**
   
   数秒後、右下に通知が表示されます：
   - 「Application available on port 3000」→ 「**ブラウザで開く**」をクリック
   - または、「PORTS」タブから「3000」の地球アイコンをクリック

---

## 方法2: GitHub Actions（自動デプロイ）

### 準備中...
今後、GitHub Actionsを使って自動的にデプロイする機能を追加予定です。

---

## 方法3: ローカル環境で実行

PCに環境がある方向けです。

### 必要なもの
- Node.js 18以上
- npm または yarn
- Git

### 手順

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/rothspit/goodfifeproject.git
   cd goodfifeproject
   ```

2. **システムを起動**
   ```bash
   ./start.sh
   ```

   または手動で：

   **サーバー起動:**
   ```bash
   cd server
   cp .env.example .env
   npm install
   npm run dev
   ```

   **クライアント起動（別ターミナル）:**
   ```bash
   cd client
   cp .env.local.example .env.local
   npm install
   npm run dev
   ```

3. **ブラウザでアクセス**
   ```
   http://localhost:3000
   ```

---

## 📖 使い方

### 初めてアクセスしたら

1. **トップページが表示されます**
   - 画像スライダー
   - キャスト検索
   - すぐ呼べるキャスト
   - お知らせ、ブログ、口コミ

2. **会員登録してみる**
   - 右上の「新規登録」ボタンをクリック
   - 電話番号とパスワードを入力
   - ※現在はテスト環境なので実際の電話番号は不要です
   - 例: 090-1234-5678

3. **キャストを見る**
   - 「キャスト一覧」をクリック
   - ※現在はテストデータがないため空です

4. **テストデータを追加する**
   - 下記の「テストデータの追加方法」を参照

---

## 🧪 テストデータの追加方法

現在、データベースは空の状態です。テストデータを追加するには：

### 方法1: SQLiteコマンド

```bash
cd server
sqlite3 data/database.sqlite
```

以下のSQLを実行：

```sql
-- キャストを追加
INSERT INTO casts (name, age, height, cup_size, blood_type, profile_text, is_new, new_until) 
VALUES ('さくら', 28, 158, 'D', 'A', 'よろしくお願いします♡', 1, datetime('now', '+30 days'));

INSERT INTO casts (name, age, height, cup_size, blood_type, profile_text, is_new, new_until) 
VALUES ('みゆき', 32, 162, 'C', 'B', '癒し系です♪', 0, NULL);

INSERT INTO casts (name, age, height, cup_size, blood_type, profile_text, is_new, new_until) 
VALUES ('あやか', 26, 155, 'E', 'O', '明るく元気に頑張ります！', 1, datetime('now', '+30 days'));

-- 画像を追加（ダミー）
INSERT INTO cast_images (cast_id, image_url, is_primary) 
VALUES (1, '/images/cast/dummy1.jpg', 1);

INSERT INTO cast_images (cast_id, image_url, is_primary) 
VALUES (2, '/images/cast/dummy2.jpg', 1);

INSERT INTO cast_images (cast_id, image_url, is_primary) 
VALUES (3, '/images/cast/dummy3.jpg', 1);

-- 出勤スケジュールを追加
INSERT INTO cast_schedules (cast_id, date, start_time, end_time) 
VALUES (1, date('now'), '10:00', '22:00');

INSERT INTO cast_schedules (cast_id, date, start_time, end_time) 
VALUES (2, date('now'), '12:00', '20:00');

INSERT INTO cast_schedules (cast_id, date, start_time, end_time) 
VALUES (3, date('now'), '14:00', '02:00');

-- お知らせを追加
INSERT INTO announcements (title, content, type) 
VALUES ('新人キャスト入店', 'さくらちゃん、あやかちゃんが新しく入店しました！', 'info');

INSERT INTO announcements (title, content, type) 
VALUES ('年末年始営業のお知らせ', '年末年始も休まず営業しております。', 'important');

-- 終了
.quit
```

### 方法2: 管理画面（今後実装予定）

管理画面からGUIで簡単にデータを追加できる機能を実装予定です。

---

## ⚠️ トラブルシューティング

### ポートが既に使用されている
```bash
# プロセスを確認
lsof -i :3000
lsof -i :5000

# プロセスを終了
kill -9 <PID>
```

### データベースエラー
```bash
# データベースファイルを削除して再作成
cd server
rm -f data/database.sqlite
npm run dev  # 自動的に再作成されます
```

### モジュールが見つからないエラー
```bash
# 依存関係を再インストール
cd server && rm -rf node_modules && npm install
cd ../client && rm -rf node_modules && npm install
```

---

## 📞 サポート

問題が発生した場合は、GitHubのIssuesに報告してください。

---

## 🎯 次のステップ

システムが動いたら、以下のページを実装していきます：

- [ ] キャスト一覧ページ（検索機能付き）
- [ ] キャスト詳細ページ
- [ ] 予約フォーム
- [ ] マイページ
- [ ] ログイン・登録ページ
- [ ] システム・料金ページ
- [ ] ランキングページ
- [ ] 求人ページ

ご要望があれば教えてください！
