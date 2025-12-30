# ヘブンネット・ソープランドヘブン実装ドキュメント

## 概要

シティヘブンネットと同様の構造を持つ「ヘブンネット (heavennet.cc)」および「ソープランドヘブン (soapheaven.jp)」の自動更新サービスを実装しました。

## 実装状況

### ✅ 完了項目

1. **基本サービスクラス作成**
   - `HeavenNetCCService.ts` (9,495文字)
   - `SoaplandHeavenService.ts` (9,553文字)

2. **実装機能**
   - ログイン機能（Playwright使用）
   - キャスト情報更新（基本構造）
   - スケジュール更新（基本構造）
   - 写メ日記投稿機能（基本構造）

3. **テストスクリプト**
   - `test-heavennet-cc.ts`
   - `test-soapheaven.ts`

### 🔄 部分実装（要実地調査）

以下の機能は基本構造を実装済みですが、実際の管理画面構造に応じた調整が必要です：

1. **キャスト情報更新の詳細実装**
   - フォームフィールドのマッピング
   - 画像アップロード処理
   - バリデーション処理

2. **スケジュール更新の詳細実装**
   - カレンダーUIの操作
   - 時間選択の処理
   - 複数日程の一括更新

3. **写メ日記投稿の詳細実装**
   - 投稿フォームの正確なセレクタ
   - 画像アップロードの詳細処理
   - プレビュー機能の操作

## 技術仕様

### 使用技術

- **Playwright**: ブラウザ自動化
- **TypeScript**: 型安全な実装
- **Headless Browser**: 本番環境での自動実行

### アンチボット対策

両サービスとも以下のボット検出対策を実装：

```typescript
// navigator.webdriverプロパティの隠蔽
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined,
  });
});

// ユーザーエージェント設定
userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...'

// 日本のロケール・タイムゾーン設定
locale: 'ja-JP',
timezoneId: 'Asia/Tokyo',
```

### ログイン処理の実装

複数のセレクタパターンを用意し、柔軟に対応：

```typescript
const usernameSelectors = [
  'input[name="username"]',
  'input[name="login_id"]',
  'input[name="user_id"]',
  'input[type="text"]',
  '#username',
  '#login_id'
];

const passwordSelectors = [
  'input[name="password"]',
  'input[name="passwd"]',
  'input[type="password"]',
  '#password'
];
```

## URL構造

### ヘブンネット (heavennet.cc)

```
ベースURL: https://www.heavennet.cc/admin/
ログインURL: https://www.heavennet.cc/admin/login.php
キャスト一覧: https://www.heavennet.cc/admin/cast/list.php
写メ日記一覧: https://www.heavennet.cc/admin/diary/list.php
```

**注意**: 上記URLは推定値です。実際のURLは管理画面にアクセスして確認する必要があります。

### ソープランドヘブン (soapheaven.jp)

```
ベースURL: https://www.soapheaven.jp/admin/
ログインURL: https://www.soapheaven.jp/admin/login.php
姫一覧: https://www.soapheaven.jp/admin/cast/list.php
写メ日記一覧: https://www.soapheaven.jp/admin/diary/list.php
```

**注意**: 上記URLは推定値です。実際のURLは管理画面にアクセスして確認する必要があります。

## テスト方法

### 環境変数設定

```bash
# ヘブンネット
export HEAVENNET_CC_USERNAME="your_username"
export HEAVENNET_CC_PASSWORD="your_password"

# ソープランドヘブン
export SOAPHEAVEN_USERNAME="your_username"
export SOAPHEAVEN_PASSWORD="your_password"
```

### テスト実行

```bash
# ヘブンネットテスト
cd /home/user/webapp/ad-platform-manager/backend
npx ts-node test-heavennet-cc.ts

# ソープランドヘブンテスト
npx ts-node test-soapheaven.ts
```

### スクリーンショット確認

テスト実行後、以下のスクリーンショットが生成されます：

```
screenshots/
  ├── heavennet-login-page.png       # ログインページ
  ├── heavennet-after-login.png      # ログイン後のダッシュボード
  ├── heavennet-diary-list.png       # 写メ日記一覧
  ├── heavennet-diary-form.png       # 写メ日記投稿フォーム
  ├── soapheaven-login-page.png      # ログインページ
  ├── soapheaven-after-login.png     # ログイン後のダッシュボード
  ├── soapheaven-diary-list.png      # 写メ日記一覧
  └── soapheaven-diary-form.png      # 写メ日記投稿フォーム
```

これらのスクリーンショットを確認することで、実際のフォーム構造を把握し、必要な調整を行います。

## シティヘブンネットとの構造比較

| 機能 | シティヘブンネット | ヘブンネット | ソープランドヘブン |
|------|-------------------|-------------|-------------------|
| 運営会社 | 同系列と推定 | 同系列と推定 | 同系列と推定 |
| ログイン方式 | ID/パスワード | ID/パスワード（推定） | ID/パスワード（推定） |
| 管理画面構造 | PHP形式 | PHP形式（推定） | PHP形式（推定） |
| 写メ日記機能 | あり | あり（推定） | あり（推定） |
| キャスト管理 | 「女の子」 | 「キャスト」（推定） | 「姫」（業界用語） |

## 実装の前提条件

### シティヘブンネット類似構造

両サービスは以下の点でシティヘブンネットと類似していると仮定：

1. **URL構造**: `/admin/`, `/login.php`, `/cast/`, `/diary/` などの命名規則
2. **フォーム構造**: input[name="username"], input[name="password"] などの標準的なHTML
3. **ダッシュボード要素**: 「写メ日記」「キャスト」「スケジュール」などのメニュー
4. **投稿フォーム**: タイトル、本文、画像アップロードの標準的なフォーム

### 実装の柔軟性

実際の構造が異なる場合に備え、以下の対応を実装：

- **複数セレクタパターン**: フォームフィールドを複数の方法で検索
- **URLチェック**: ログイン成功判定を複数の条件で実施
- **スクリーンショット保存**: 実際の画面構造を確認可能
- **詳細ログ出力**: デバッグ情報を詳細に記録

## 次のステップ

### 1. 実地テスト（優先度: 高）

実際の認証情報を使用してログインテストを実施：

```bash
# 環境変数を設定してテスト実行
HEAVENNET_CC_USERNAME="actual_username" \
HEAVENNET_CC_PASSWORD="actual_password" \
npx ts-node test-heavennet-cc.ts
```

### 2. スクリーンショット分析

生成されたスクリーンショットを確認し、以下を特定：

- 実際のログインフォームのセレクタ
- ダッシュボードのメニュー構造
- 写メ日記投稿フォームの詳細

### 3. コード調整

実際の構造に合わせてセレクタとロジックを調整：

- ログインフォームのフィールド名
- 投稿フォームのフィールド名
- ボタンのセレクタ
- ナビゲーションURL

### 4. 本格実装

調整後、以下の機能を完全実装：

- [ ] キャスト情報の完全な更新処理
- [ ] スケジュールの詳細な登録・更新
- [ ] 写メ日記の画像アップロード含む完全な投稿処理
- [ ] エラーハンドリングとリトライロジック
- [ ] ログ記録と監視機能

## トラブルシューティング

### ログイン失敗時

1. **スクリーンショット確認**
   ```bash
   open screenshots/heavennet-login-page.png
   ```

2. **URL確認**
   - 実際の管理画面URLが推定URLと異なる可能性
   - ブラウザで手動アクセスして正しいURLを確認

3. **フォーム構造確認**
   - 開発者ツールでHTMLソースを確認
   - セレクタを実際の構造に合わせて調整

4. **認証情報確認**
   - 環境変数が正しく設定されているか確認
   - 実際の管理画面で手動ログインが成功するか確認

### 写メ日記投稿失敗時

1. **フォームスクリーンショット確認**
   ```bash
   open screenshots/heavennet-diary-form.png
   ```

2. **HTMLソース保存**
   ```typescript
   const html = await page.content();
   fs.writeFileSync('./screenshots/diary-form.html', html);
   ```

3. **セレクタ調整**
   - 実際のフィールド名とidを特定
   - コード内のセレクタを更新

## 所要時間

- **基本実装**: 2時間（完了）
- **テスト実行**: 1時間（一部完了）
- **実地調査**: 2時間（保留 - 認証情報待ち）
- **詳細実装**: 3時間（保留 - 実地調査後）

**合計**: 8時間（予定通り）

## 結論

ヘブンネット・ソープランドヘブンの基本実装が完了しました。シティヘブンネットと類似の構造を想定して実装しており、実際の管理画面でのテストにより迅速に本格実装へ移行可能です。

実運用に向けては、実際の認証情報を使用したログインテストと、生成されたスクリーンショットの分析が次のステップとなります。
