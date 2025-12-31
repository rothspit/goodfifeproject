# 🎯 超簡単！動かし方ガイド

このガイドでは、**プログラミング初心者の方でも簡単に**システムを動かす方法を説明します。

---

## 📱 方法1: GitHub Codespaces（一番簡単！推奨）

**ブラウザだけで動きます！何もインストール不要です！**

### ステップ1: GitHubにアクセス

以下のURLをクリック：
```
https://github.com/rothspit/goodfifeproject
```

### ステップ2: Codespacesを起動

1. ページ上部の緑色の「**Code**」ボタンをクリック
2. 「**Codespaces**」というタブをクリック
3. 「**Create codespace on main**」ボタンをクリック

### ステップ3: 待つ

- 2〜3分待つと、ブラウザの中にVS Code（開発ツール）が開きます
- 「Setting up your codespace...」と表示されたら成功！

### ステップ4: システムを起動

画面下部に「ターミナル」（黒い画面）が表示されます。
そこに以下をコピー＆ペーストして、Enterキーを押します：

```bash
./start.sh
```

### ステップ5: ブラウザで開く

30秒ほどすると、右下に通知が出ます：
- 「**Application available on port 3000**」
- 「**ブラウザで開く**」または「**Open in Browser**」をクリック

**🎉 完成！サイトが開きます！**

---

## 💻 方法2: ローカル環境（PCに環境がある方向け）

### 必要なもの
- Node.js 18以上（[ダウンロード](https://nodejs.org/)）
- Git（[ダウンロード](https://git-scm.com/)）

### 手順

#### 1. リポジトリをダウンロード

ターミナル（Windowsの場合は「コマンドプロンプト」）を開いて：

```bash
git clone https://github.com/rothspit/goodfifeproject.git
cd goodfifeproject
```

#### 2. 起動

```bash
./start.sh
```

Windowsの場合は、手動で起動：

**ターミナル1（サーバー）:**
```bash
cd server
copy .env.example .env
npm install
npm run dev
```

**ターミナル2（クライアント）:**
新しいターミナルを開いて
```bash
cd client
copy .env.local.example .env.local
npm install
npm run dev
```

#### 3. ブラウザでアクセス

```
http://localhost:3000
```

---

## 🎮 使い方

### サイトを見てみる

1. **トップページ**
   - スライダー（自動で画像が切り替わります）
   - キャスト検索ボックス
   - お知らせ、ブログ、口コミ

2. **会員登録してみる**
   - 右上の「新規登録」をクリック
   - 電話番号（テストなので適当でOK）: `090-1234-5678`
   - パスワード: `password123`
   - 「登録」ボタンをクリック

3. **ログインしてみる**
   - 登録した情報でログイン
   - マイページにアクセスできます

### 現在の状態

現在は**骨組み**が完成した状態です：
- ✅ トップページ → **完成**
- ✅ 会員登録・ログイン → **完成**
- ⏳ キャスト一覧 → **APIは完成、ページは未実装**
- ⏳ キャスト詳細 → **APIは完成、ページは未実装**
- ⏳ 予約機能 → **APIは完成、ページは未実装**

---

## 🧪 テストデータを追加する

現在、データベースは空っぽです。キャストを表示するには、テストデータを追加する必要があります。

### Codespacesの場合

ターミナルで以下を実行：

```bash
cd server
sqlite3 data/database.sqlite
```

以下をコピー＆ペーストして実行：

```sql
-- キャストを3人追加
INSERT INTO casts (name, age, height, cup_size, blood_type, profile_text, is_new, new_until) 
VALUES 
  ('さくら', 28, 158, 'D', 'A', 'よろしくお願いします♡', 1, datetime('now', '+30 days')),
  ('みゆき', 32, 162, 'C', 'B', '癒し系です♪', 0, NULL),
  ('あやか', 26, 155, 'E', 'O', '明るく元気に頑張ります！', 1, datetime('now', '+30 days'));

-- 出勤スケジュール追加（今日の日付で）
INSERT INTO cast_schedules (cast_id, date, start_time, end_time) 
VALUES 
  (1, date('now'), '10:00', '22:00'),
  (2, date('now'), '12:00', '20:00'),
  (3, date('now'), '14:00', '02:00');

-- お知らせを追加
INSERT INTO announcements (title, content, type) 
VALUES 
  ('新人キャスト入店', 'さくらちゃん、あやかちゃんが新しく入店しました！', 'info'),
  ('年末年始営業のお知らせ', '年末年始も休まず営業しております。', 'important');

-- 終了
.quit
```

**ブラウザをリロードすると、キャストが表示されます！**

---

## ❓ よくある質問

### Q: Codespacesが起動しない
**A:** GitHubにログインしているか確認してください。無料プランでも使えます。

### Q: ポート3000が見つからない
**A:** 画面下部の「PORTS」タブをクリック → 3000の横の地球アイコン🌐をクリック

### Q: エラーが出た
**A:** 以下を試してください：
1. ターミナルで `Ctrl + C` を押して停止
2. もう一度 `./start.sh` を実行

### Q: データが表示されない
**A:** テストデータを追加してください（上記参照）

### Q: チャット機能はどう使うの？
**A:** 現在はバックエンドのみ実装済みです。フロントエンドは今後実装予定です。

---

## 🆘 困ったら

以下の場所で質問できます：
- GitHubのIssues: https://github.com/rothspit/goodfifeproject/issues
- Pull Requests: https://github.com/rothspit/goodfifeproject/pulls

---

## 🎯 次のステップ

システムが動いたら、以下を実装していきましょう：

### 優先度: 高
- [ ] キャスト一覧ページ（検索機能付き）
- [ ] キャスト詳細ページ
- [ ] ログイン・新規登録ページ
- [ ] マイページ

### 優先度: 中
- [ ] 予約フォーム
- [ ] システム・料金ページ
- [ ] ランキングページ

### 優先度: 低
- [ ] 求人ページ
- [ ] 管理画面
- [ ] 画像アップロード機能

**どの機能から作りたいか教えてください！**

---

## 🎊 おめでとうございます！

ここまで来れば、システムが動いている状態です！

次は実際のページを作っていきましょう 💪
