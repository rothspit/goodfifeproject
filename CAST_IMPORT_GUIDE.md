# 女性キャスト取り込みシステム - 実装完了ガイド

## 📋 概要

Googleスプレッドシートからキャストプロフィールデータを一括インポートするシステムを実装しました。
カスタマイズされたテンプレートで、指定された順序で20項目のプロフィール情報を管理できます。

---

## ✅ 実装された項目（順番通り）

### 基本情報
1. **名前** - キャストの表示名
2. **ひらがな** - 名前のひらがな表記
3. **ローマ字** - 名前のローマ字表記
4. **生年月日** - YYYY-MM-DD形式
5. **年齢** - 数値
6. **入店日** - YYYY-MM-DD形式

### スリーサイズ
7. **身長** - cm（数値）
8. **バスト** - cm（数値またはテキスト）
9. **カップ** - A、B、C、D、E、F等
10. **ウェスト** - cm（数値）
11. **ヒップ** - cm（数値）

### キャッチコピー
12. **キャッチコピー10文字** - 短いキャッチフレーズ
13. **キャッチコピー20文字** - 詳しいキャッチフレーズ

### 属性情報
14. **スタイル** - スレンダー、グラマー、普通など
15. **タイプ** - 癒し系、お姉様系、清楚系など
16. **お酒** - 飲める、飲めない、少し飲めるなど
17. **タバコ** - 吸う、吸わないなど
18. **新人** - 1（新人）、0（既存）、または「新人」と入力

### コメント
19. **お店コメント** - お店からの紹介コメント（長文可）
20. **女の子コメント** - キャスト本人からのコメント（長文可）

---

## 📊 Googleスプレッドシートのフォーマット

### 列の構成（A〜T列）

```
| A    | B        | C        | D        | E    | F      | G    | H      | I      | J        | K      |
|------|----------|----------|----------|------|--------|------|--------|--------|----------|--------|
| 名前 | ひらがな | ローマ字 | 生年月日 | 年齢 | 入店日 | 身長 | バスト | カップ | ウェスト | ヒップ |

| L          | M          | N        | O      | P      | Q      | R    | S              | T                |
|------------|------------|----------|--------|--------|--------|------|----------------|------------------|
| キャッチ10 | キャッチ20 | スタイル | タイプ | お酒   | タバコ | 新人 | お店コメント   | 女の子コメント   |
```

### サンプルデータ

```
名前    : あいり
ひらがな: あいり
ローマ字: Airi
生年月日: 1995-05-20
年齢    : 29
入店日  : 2024-01-15
身長    : 158
バスト  : 88
カップ  : D
ウェスト: 58
ヒップ  : 86
キャッチ10: 癒し系美女
キャッチ20: 清楚で可愛らしい素敵な女性です
スタイル: スレンダー
タイプ  : 癒し系
お酒    : 飲める
タバコ  : 吸わない
新人    : 1
お店コメント: とても明るく優しい性格で、初めてのお客様でもすぐに打ち解けられます。サービスも丁寧で評判の良いキャストです。
女の子コメント: よろしくお願いします♪楽しい時間を一緒に過ごしましょう！
```

---

## 🚀 使い方

### 1. Googleスプレッドシートを準備

#### ステップ1: 新規スプレッドシート作成
1. https://sheets.google.com にアクセス
2. 「空白」をクリックして新規作成

#### ステップ2: ヘッダー行を作成（1行目）
```
A1: 名前
B1: ひらがな
C1: ローマ字
D1: 生年月日
E1: 年齢
F1: 入店日
G1: 身長
H1: バスト
I1: カップ
J1: ウェスト
K1: ヒップ
L1: キャッチ10
M1: キャッチ20
N1: スタイル
O1: タイプ
P1: お酒
Q1: タバコ
R1: 新人
S1: お店コメント
T1: 女の子コメント
```

#### ステップ3: データを入力（2行目以降）
各キャストのデータを1行ずつ入力します。

#### ステップ4: 共有設定
1. 右上の「共有」ボタンをクリック
2. 「リンクを知っている全員」に変更
3. 権限は「閲覧者」でOK
4. 「完了」をクリック

#### ステップ5: スプレッドシートIDを取得
URLから取得します：
```
https://docs.google.com/spreadsheets/d/【このID部分をコピー】/edit
```

例：
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                       ↑ここをコピー
```

---

### 2. 管理画面でインポート

#### ステップ1: 管理画面にログイン
- URL: https://crm.h-mitsu.com/admin
- ログイン情報を入力

#### ステップ2: キャスト取り込みページを開く
- 左メニューから「キャスト取り込み」をクリック

#### ステップ3: スプレッドシートIDを入力
- コピーしたスプレッドシートIDを貼り付け
- データ範囲は `A:T` のまま（20列）

#### ステップ4: データを取得
- 「スプレッドシートからデータを取得」ボタンをクリック
- プレビューテーブルでデータを確認

#### ステップ5: インポート実行
- 内容を確認したら「データベースにインポート」ボタンをクリック
- 確認ダイアログで「OK」をクリック

#### ステップ6: 完了
- インポート完了のメッセージが表示されます
- 同名キャストは自動的に更新されます

---

## 🔧 技術詳細

### データベーススキーマ

```sql
ALTER TABLE casts ADD COLUMN name_hiragana VARCHAR(100);
ALTER TABLE casts ADD COLUMN name_romaji VARCHAR(100);
ALTER TABLE casts ADD COLUMN birth_date DATE;
ALTER TABLE casts ADD COLUMN join_date DATE;
ALTER TABLE casts ADD COLUMN catch_copy_10 VARCHAR(10);
ALTER TABLE casts ADD COLUMN catch_copy_20 VARCHAR(20);
ALTER TABLE casts ADD COLUMN style_type VARCHAR(50);
ALTER TABLE casts ADD COLUMN personality_type VARCHAR(50);
ALTER TABLE casts ADD COLUMN alcohol VARCHAR(20);
ALTER TABLE casts ADD COLUMN smoking VARCHAR(20);
ALTER TABLE casts ADD COLUMN shop_comment TEXT;
ALTER TABLE casts ADD COLUMN girl_comment TEXT;
```

### APIエンドポイント

#### 1. データ取得
```http
POST /api/cast-import/fetch
Content-Type: application/json
Authorization: Bearer {token}

{
  "spreadsheetId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  "range": "A:T"
}
```

#### 2. データインポート
```http
POST /api/cast-import/import
Content-Type: application/json
Authorization: Bearer {token}

{
  "casts": [
    {
      "name": "あいり",
      "name_hiragana": "あいり",
      "name_romaji": "Airi",
      "birth_date": "1995-05-20",
      "age": 29,
      "join_date": "2024-01-15",
      "height": 158,
      "bust": "88",
      "cup_size": "D",
      "waist": 58,
      "hip": 86,
      "catch_copy_10": "癒し系美女",
      "catch_copy_20": "清楚で可愛らしい素敵な女性です",
      "style_type": "スレンダー",
      "personality_type": "癒し系",
      "alcohol": "飲める",
      "smoking": "吸わない",
      "is_new": true,
      "shop_comment": "とても明るく...",
      "girl_comment": "よろしくお願いします..."
    }
  ]
}
```

#### 3. キャスト一覧取得
```http
GET /api/cast-import/list?isNew=true
Authorization: Bearer {token}
```

#### 4. キャスト詳細取得
```http
GET /api/cast-import/{castId}
Authorization: Bearer {token}
```

---

## 📝 プロフィール表示のカスタマイズ

### フロントエンドでの表示順序

キャストプロフィールページで以下の順序で表示することを推奨します：

```tsx
<div className="profile">
  {/* 基本情報 */}
  <h2>{cast.name}</h2>
  <p className="hiragana">{cast.name_hiragana}</p>
  <p className="romaji">{cast.name_romaji}</p>
  
  {/* キャッチコピー */}
  <div className="catch-copy-10">{cast.catch_copy_10}</div>
  <div className="catch-copy-20">{cast.catch_copy_20}</div>
  
  {/* 基本プロフィール */}
  <dl>
    <dt>生年月日</dt><dd>{cast.birth_date}</dd>
    <dt>年齢</dt><dd>{cast.age}歳</dd>
    <dt>入店日</dt><dd>{cast.join_date}</dd>
  </dl>
  
  {/* スリーサイズ */}
  <dl>
    <dt>身長</dt><dd>{cast.height}cm</dd>
    <dt>バスト</dt><dd>{cast.bust}</dd>
    <dt>カップ</dt><dd>{cast.cup_size}カップ</dd>
    <dt>ウェスト</dt><dd>{cast.waist}cm</dd>
    <dt>ヒップ</dt><dd>{cast.hip}cm</dd>
  </dl>
  
  {/* 属性 */}
  <dl>
    <dt>スタイル</dt><dd>{cast.style_type}</dd>
    <dt>タイプ</dt><dd>{cast.personality_type}</dd>
    <dt>お酒</dt><dd>{cast.alcohol}</dd>
    <dt>タバコ</dt><dd>{cast.smoking}</dd>
    {cast.is_new && <dt className="new-badge">新人</dt>}
  </dl>
  
  {/* コメント */}
  <div className="shop-comment">
    <h3>お店からのコメント</h3>
    <p>{cast.shop_comment}</p>
  </div>
  
  <div className="girl-comment">
    <h3>女の子からのコメント</h3>
    <p>{cast.girl_comment}</p>
  </div>
</div>
```

---

## 🎯 機能

### ✅ 実装済み

- [x] Googleスプレッドシートからの一括取得
- [x] 20項目の指定順序でのデータマッピング
- [x] 新規キャスト自動登録
- [x] 既存キャスト自動更新（同名の場合）
- [x] データプレビュー機能
- [x] 詳細プレビュー（1件目の全項目表示）
- [x] エラーハンドリング
- [x] トランザクション処理

### 🔄 更新機能

同じ名前のキャストが既に存在する場合：
- 既存データを**自動的に更新**
- 新規登録ではなく UPDATE を実行
- プロフィール情報を最新に保つ

---

## 🐛 トラブルシューティング

### エラー: "スプレッドシートの取得に失敗しました"

**原因1**: Google API Key未設定
→ サーバーの `.env` に `GOOGLE_API_KEY` を設定

**原因2**: スプレッドシートが非公開
→ 「リンクを知っている全員」に共有設定を変更

**原因3**: スプレッドシートIDが間違っている
→ URLから正しいIDをコピー

### データが正しく表示されない

**原因**: 列の順序が間違っている
→ A列から順番に20項目が正しく配置されているか確認

### 新人フラグが正しく設定されない

**原因**: R列の値が認識されていない
→ 以下のいずれかの値を使用:
- `1`（数値）
- `true`（テキスト）
- `新人`（日本語）

---

## 📋 チェックリスト

インポート前に確認:

- [ ] Googleスプレッドシートを作成した
- [ ] ヘッダー行（1行目）を正しく設定した
- [ ] データを入力した（2行目以降）
- [ ] スプレッドシートを「リンクを知っている全員」に共有した
- [ ] スプレッドシートIDをコピーした
- [ ] Google API Keyが設定されている
- [ ] 管理画面にログインした
- [ ] プレビューでデータを確認した

---

## 🎓 応用例

### 一括更新

既存キャストの情報を一括更新する場合：
1. 現在のキャスト情報をスプレッドシートにエクスポート（手動またはAPI）
2. 必要な項目を修正
3. 同じ名前でインポート → 自動的に更新される

### 新規追加

新しいキャストを追加する場合：
1. スプレッドシートに新しい行を追加
2. 全20項目を入力
3. インポート実行

### 部分更新

特定のキャストのみ更新する場合：
1. 対象キャストのみをスプレッドシートに記載
2. インポート実行
3. 対象キャストのみが更新される

---

## 🔐 セキュリティ

### 認証
- すべてのAPIエンドポイントは認証が必要
- 管理者権限でのみアクセス可能

### データ検証
- 必須項目（名前）のチェック
- データ型の検証
- トランザクション処理でデータ整合性を保証

---

## 📞 サポート

問題が発生した場合:

1. **ブラウザコンソール確認**
   - F12キーを押して開発者ツールを開く
   - Consoleタブでエラーメッセージを確認

2. **サーバーログ確認**
   ```bash
   ssh root@210.131.222.152
   pm2 logs goodfife-backend --lines 50
   ```

3. **データベース確認**
   ```bash
   mysql -u root -p goodfife_db
   SELECT * FROM casts ORDER BY id DESC LIMIT 10;
   ```

---

## 🎉 まとめ

### ✅ 実装完了
- 20項目のカスタマイズされたプロフィールテンプレート
- Googleスプレッドシートからの一括インポート
- 新規登録・既存更新の自動判定
- 管理画面への統合

### 🚀 次のステップ
1. Google API Keyを設定
2. テスト用スプレッドシートを作成
3. サンプルデータでインポートテスト
4. キャストプロフィールページに新項目を表示

---

**実装日**: 2025-12-16  
**バージョン**: 1.0.0  
**ステータス**: ✅ 実装完了
