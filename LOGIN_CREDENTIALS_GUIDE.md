# 🔐 広告媒体ログイン情報設定ガイド

## 📋 現在の状態

### ✅ 認証情報設定済み（2サイト）

| ID | サイト名 | ログインID | パスワード | 状態 |
|----|---------|-----------|----------|------|
| 1 | **シティヘブンネット** | 2500000713 | ZKs60jlq | ✅ 有効 |
| 2 | **デリヘルタウン** | info@h-mitsu.com | hitodumamitu | ✅ 有効 |

### ⚠️ 認証情報未設定（20サイト）

#### 🔴 高優先度（4サイト）
| ID | サイト名 | URL | 状態 |
|----|---------|-----|------|
| 4 | 風俗じゃぱん | https://www.fuzoku-japan.com/admin/ | ⚠️ 未設定 |
| 5 | ぴゅあらば | https://www.p-a.jp/admin/ | ⚠️ 未設定 |
| 6 | シティコレクション | https://www.citycollection.net/admin/ | ⚠️ 未設定 |
| 7 | 駅ちか | https://www.ekichika.jp/admin/ | ⚠️ 未設定 |

#### 🟡 中優先度（8サイト）
| ID | サイト名 | URL | 状態 |
|----|---------|-----|------|
| 8 | ピンクコンパニオン | https://www.pinkcompanion.com/admin/ | ⚠️ 未設定 |
| 9 | 風俗総合情報 | https://www.fuzoku-info.com/admin/ | ⚠️ 未設定 |
| 10 | Qプリ | https://www.qpri.jp/admin/ | ⚠️ 未設定 |
| 11 | デリゲット | https://www.deli-get.com/admin/ | ⚠️ 未設定 |
| 12 | 風俗情報局 | https://www.fuzoku-joho.com/admin/ | ⚠️ 未設定 |
| 13 | エッチな4610 | https://www.h4610.com/admin/ | ⚠️ 未設定 |
| 14 | 一撃 | https://www.ichigeki.com/admin/ | ⚠️ 未設定 |
| 15 | ぽっちゃりChannel | https://www.pocchari-ch.jp/admin/ | ⚠️ 未設定 |

#### 🔵 低優先度（7サイト）
| ID | サイト名 | URL | 状態 |
|----|---------|-----|------|
| 16 | Navi Fuzoku | https://www.navi-fuzoku.com/admin/ | ⚠️ 未設定 |
| 17 | 熟女Style | https://www.jukujo-style.com/admin/ | ⚠️ 未設定 |
| 18 | ガールズヘブンネット | https://www.girlsheaven.net/admin/ | ⚠️ 未設定 |
| 19 | ボーイズヘブンネット | https://www.boysheaven.net/admin/ | ⚠️ 未設定 |
| 20 | 風俗テレクラ情報 | https://www.teleclub.jp/admin/ | ⚠️ 未設定 |
| 21 | ピンサロドットコム | https://www.pinsaro.com/admin/ | ⚠️ 未設定 |
| 22 | キャバクラヘブン | https://www.cabaret-heaven.com/admin/ | ⚠️ 未設定 |

#### ⚪ その他
| ID | サイト名 | URL | 状態 |
|----|---------|-----|------|
| 3 | ヘブンネット | https://www.heavennet.cc/admin/login.php | ⚠️ 未設定 |

---

## 🔧 認証情報設定方法

### 方法1: 一括設定スクリプト（推奨）

#### ステップ1: 認証情報ファイル作成
```bash
cd /home/user/webapp/ad-platform-manager/backend
nano credentials.json
```

#### ステップ2: JSONファイルに認証情報を記載
```json
{
  "platforms": [
    {
      "id": 4,
      "name": "風俗じゃぱん",
      "login_id": "your_username",
      "login_password": "your_password"
    },
    {
      "id": 5,
      "name": "ぴゅあらば",
      "login_id": "your_username",
      "login_password": "your_password"
    },
    {
      "id": 6,
      "name": "シティコレクション",
      "login_id": "your_username",
      "login_password": "your_password"
    },
    {
      "id": 7,
      "name": "駅ちか",
      "login_id": "your_username",
      "login_password": "your_password"
    }
  ]
}
```

#### ステップ3: 一括設定スクリプト実行
```bash
npx ts-node update-credentials.ts credentials.json
```

---

### 方法2: 個別SQL更新

各サイトごとにSQLで直接更新：

```sql
-- 風俗じゃぱん
UPDATE ad_platforms SET
  login_id = 'your_username',
  login_password = 'your_password',
  is_active = 1
WHERE id = 4;

-- ぴゅあらば
UPDATE ad_platforms SET
  login_id = 'your_username',
  login_password = 'your_password',
  is_active = 1
WHERE id = 5;

-- シティコレクション
UPDATE ad_platforms SET
  login_id = 'your_username',
  login_password = 'your_password',
  is_active = 1
WHERE id = 6;

-- 駅ちか
UPDATE ad_platforms SET
  login_id = 'your_username',
  login_password = 'your_password',
  is_active = 1
WHERE id = 7;
```

---

## 🧪 認証情報設定後のテスト手順

### 1. 高優先度4サイトのログインテスト

```bash
cd /home/user/webapp/ad-platform-manager/backend

# 風俗じゃぱん
npx ts-node test-fuzoku-japan.ts

# ぴゅあらば
npx ts-node test-pure-lovers.ts

# シティコレクション
npx ts-node test-city-collection.ts

# 駅ちか
npx ts-node test-ekichika.ts
```

### 2. スクリーンショット確認

```bash
# ログイン成功/失敗のスクリーンショットを確認
ls -lh screenshots/

# 最新のスクリーンショットを表示
ls -lt screenshots/ | head -10
```

### 3. 全サイト一括テスト

```bash
# 全サービスクラスのインスタンス化テスト
npx ts-node test-all-services.ts

# 認証情報設定済みサイトのみテスト
npx ts-node test-active-platforms.ts
```

---

## 📊 次のステップ

### 🔴 即時（認証情報設定後）
1. ✅ **高優先度4サイトの認証情報設定**
2. ✅ **ログインテスト実施**
3. ✅ **スクリーンショット確認**
4. ✅ **写メ日記投稿テスト**

### 🟡 短期（1-2週間）
5. **中優先度8サイトの認証情報設定**
6. **ログイン/投稿機能の個別調整**
7. **エラーハンドリング強化**

### 🟢 中期（1-3ヶ月）
8. **低優先度7サイトの認証情報設定**
9. **全サイト統合テスト**
10. **配信スケジューラー実装**

---

## 🔒 セキュリティ注意事項

### ⚠️ 重要
- **認証情報ファイルをGitにコミットしないでください**
- `credentials.json`を`.gitignore`に追加
- 本番環境では環境変数（`.env`）を使用
- パスワードは定期的に変更

### .gitignore設定
```bash
# 認証情報ファイルを追加
echo "credentials.json" >> .gitignore
echo "*.credentials" >> .gitignore
```

---

## 📞 サポート

### ログイン情報確認
```bash
npx ts-node get-login-info.ts
```

### データベース直接確認
```bash
sqlite3 local-dev.db "SELECT id, name, login_id, is_active FROM ad_platforms;"
```

### トラブルシューティング
- **ログイン失敗**: URLと認証情報を再確認
- **スクリーンショットが保存されない**: `screenshots/`ディレクトリの権限確認
- **Playwrightエラー**: `npx playwright install`でブラウザ再インストール

---

**作成日**: 2025-12-25  
**総サイト数**: 22サイト  
**設定済み**: 2サイト ✅  
**未設定**: 20サイト ⚠️
