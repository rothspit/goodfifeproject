# mitmproxy セットアップガイド - シティヘブンネット モバイルAPI解析

## 目的

シティヘブンネット モバイルアプリの実際のAPI通信を傍受し、以下を特定する：

1. 実際のAPIエンドポイント
2. リクエストパラメータ
3. 認証方式（トークン、Cookie等）
4. レスポンス形式

## 必要なもの

- **PC**: macOS、Linux、またはWindows
- **スマートフォン**: Android または iOS（同じWiFiネットワーク）
- **アプリ**: シティヘブンネット Manager アプリ

## Step 1: mitmproxy インストール

### macOS / Linux

```bash
# Homebrew経由（macOS）
brew install mitmproxy

# または pip経由
pip3 install mitmproxy
```

### Windows

```bash
# Python pip経由
pip install mitmproxy

# または公式インストーラー
# https://mitmproxy.org/ からダウンロード
```

### インストール確認

```bash
mitmproxy --version
```

## Step 2: mitmproxy 起動

```bash
# Webインターフェース付きで起動
mitmweb --listen-host 0.0.0.0 --listen-port 8080

# または、CLI版
mitmproxy --listen-host 0.0.0.0 --listen-port 8080
```

**起動成功メッセージ**:
```
Web server listening at http://0.0.0.0:8081/
Proxy server listening at http://*:8080
```

- **Proxy**: ポート8080で動作
- **Web UI**: ブラウザで `http://localhost:8081` にアクセス

## Step 3: PCのIPアドレス確認

```bash
# macOS / Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4
```

例: `192.168.1.100`

## Step 4: スマートフォン設定

### Android

1. **WiFi設定を開く**
2. **接続中のネットワークを長押し > ネットワークを変更**
3. **詳細設定を表示**
4. **プロキシ設定**:
   - プロキシ: `手動`
   - プロキシのホスト名: `192.168.1.100` (PCのIPアドレス)
   - プロキシのポート: `8080`
5. **保存**

### iOS

1. **設定 > WiFi**
2. **接続中のネットワークの (i) をタップ**
3. **HTTPプロキシ > プロキシを構成 > 手動**
4. **設定**:
   - サーバー: `192.168.1.100` (PCのIPアドレス)
   - ポート: `8080`
5. **保存**

## Step 5: mitmproxy証明書インストール

HTTPS通信を傍受するため、mitmproxyのCA証明書をインストールする必要があります。

### スマートフォンでブラウザを開く

```
http://mitm.it
```

### Android

1. **Android** ボタンをタップ
2. 証明書ファイル `mitmproxy-ca-cert.cer` をダウンロード
3. **設定 > セキュリティ > 暗号化と認証情報 > 証明書のインストール**
4. **CA証明書** を選択
5. ダウンロードした証明書を選択してインストール

### iOS

1. **Apple** ボタンをタップ
2. 構成プロファイルをインストール
3. **設定 > 一般 > プロファイル** から確認
4. **設定 > 一般 > 情報 > 証明書信頼設定**
5. **mitmproxy** を有効化

## Step 6: トラフィックキャプチャ

### 準備完了の確認

1. スマホのブラウザで `https://www.google.com` にアクセス
2. mitmproxy Web UI (`http://localhost:8081`) でトラフィックが表示されることを確認

### シティヘブンネット アプリを起動

1. **アプリを開く**
2. **ログイン**
   - ユーザー名: `2500000713`
   - パスワード: `ZKs60jlq`
3. **ダッシュボードを確認**
4. **写メ日記を投稿**
   - タイトル: "テスト投稿"
   - 本文: "mitmproxyテスト"
   - 投稿ボタンをタップ

### mitmproxy Web UIで確認

#### ログイン リクエスト

探すべきエンドポイント例:
```
POST https://spmanager.cityheaven.net/api/v1/auth/login
POST https://spmanager.cityheaven.net/login
POST https://spmanager.cityheaven.net/api/auth
```

#### リクエストボディ

```json
{
  "username": "2500000713",
  "password": "ZKs60jlq",
  "device_type": "android",
  "app_version": "1.0.0"
}
```

または

```
username=2500000713&password=ZKs60jlq
```

#### レスポンス

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "session_id": "abc123xyz",
  "shop_id": "cb_hitozuma_mitsu",
  "user": {
    "id": 123,
    "name": "ひとづま密着熟女大宮人妻店"
  }
}
```

#### 写メ日記投稿 リクエスト

探すべきエンドポイント例:
```
POST https://spmanager.cityheaven.net/api/v1/diary/create
POST https://spmanager.cityheaven.net/api/diary
POST https://spmanager.cityheaven.net/H8KeitaiDiaryEdit.php
```

#### リクエストボディ

```json
{
  "shop_id": "cb_hitozuma_mitsu",
  "cast_id": 123,
  "title": "テスト投稿",
  "content": "mitmproxyテスト",
  "images": ["base64_encoded_image_data"],
  "publish_date": "2025-12-17T10:00:00+09:00"
}
```

#### レスポンス

```json
{
  "success": true,
  "diary_id": 456789,
  "published_at": "2025-12-17T10:00:00+09:00",
  "url": "https://www.cityheaven.net/saitama/A1101/A110102/cb_hitozuma_mitsu/diary/456789"
}
```

## Step 7: データをエクスポート

### mitmproxy Web UI

1. **フィルター**: `~u cityheaven` (URLでフィルタリング)
2. **特定のリクエストを選択**
3. **Export > Copy as curl**

### curlコマンドをコピー

```bash
curl 'https://spmanager.cityheaven.net/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -H 'User-Agent: CityHeavenManager/1.0 (Android)' \
  --data-raw '{"username":"2500000713","password":"ZKs60jlq"}'
```

### または HAR形式でエクスポート

1. **File > Save**
2. **flows.mitm** として保存
3. 後で `mitmweb -r flows.mitm` で再生可能

## Step 8: コード更新

### CityHeavenAPIClient.ts を更新

キャプチャした情報をもとに、以下を更新：

#### 1. ベースURL

```typescript
private readonly BASE_URL = 'https://spmanager.cityheaven.net/api/v1'; // 実際のURL
```

#### 2. ログインエンドポイント

```typescript
const response = await this.client.post('/auth/login', { // 実際のパス
  username: credentials.username,
  password: credentials.password,
  // 実際に必要なパラメータを追加
});
```

#### 3. レスポンス処理

```typescript
if (response.data.success) {
  this.session = {
    token: response.data.token, // 実際のフィールド名
    sessionId: response.data.session_id,
    shopId: response.data.shop_id,
    // ...
  };
}
```

#### 4. 写メ日記投稿エンドポイント

```typescript
const response = await this.client.post('/diary/create', { // 実際のパス
  shop_id: this.session.shopId,
  cast_id: diaryData.castId,
  title: diaryData.title,
  content: diaryData.content,
  // 実際に必要なパラメータを追加
});
```

## Step 9: テスト実行

```bash
cd /root/ad-platform-manager/backend

# APIクライアントテスト
npx ts-node test-cityheaven-api.ts
```

## トラブルシューティング

### 証明書エラー

**Android**:
```
設定 > セキュリティ > ユーザー認証情報 > mitmproxyを削除
再度インストール手順を実施
```

**iOS**:
```
設定 > 一般 > プロファイル > mitmproxyを削除
設定 > 一般 > 情報 > 証明書信頼設定 > 無効化
再度インストール手順を実施
```

### トラフィックが表示されない

1. **PCとスマホが同じWiFi**か確認
2. **プロキシ設定が正しい**か確認（IPアドレス、ポート）
3. **mitmproxyが起動中**か確認
4. **ファイアウォール設定**を確認（ポート8080を開放）

### アプリが接続できない

- **SSL Pinning**が有効な場合、mitmproxyでは傍受できない
- **代替手段**: Frida（動的解析）、APKリバースエンジニアリング

## 代替ツール

### Charles Proxy (GUI版)

- **ダウンロード**: https://www.charlesproxy.com/
- **特徴**: GUIで使いやすい
- **価格**: $50（30日間無料トライアル）

### Fiddler

- **ダウンロード**: https://www.telerik.com/fiddler
- **特徴**: Windows向け、無料
- **設定**: mitmproxyと同様

### Frida (SSL Pinning回避)

```bash
# インストール
npm install -g frida-tools

# SSL Pinningを無効化するスクリプト
frida -U -f net.cityheaven.sp.manager -l ssl-unpinning.js
```

## まとめ

1. ✅ mitmproxy インストール
2. ✅ スマホにプロキシ設定
3. ✅ 証明書インストール
4. ✅ アプリを使ってトラフィックキャプチャ
5. ✅ エンドポイントとパラメータを特定
6. ✅ CityHeavenAPIClient.ts を更新
7. ✅ テスト実行

**所要時間**: 30分〜1時間

**次のステップ**: 実際のAPIエンドポイントを使ってテスト
