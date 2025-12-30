# プロジェクト構造一覧

**作成日**: 2025-12-16  
**現在の状態**: 2つの独立したプロジェクトで並行開発中

---

## 📊 プロジェクト全体像

```
/home/user/webapp/
│
├── 🏢 メインCRMシステム                    (既存プロジェクト)
│   ├── client/                           Next.js フロントエンド (ポート3000)
│   ├── server/                           Express バックエンド (ポート5000)
│   └── crm-admin/                        CRM管理画面 (ポート8080/9090)
│
└── 📡 広告媒体一括更新システム             (新規独立プロジェクト)
    └── ad-platform-manager/              完全に独立したプロジェクト
        ├── frontend/                     Next.js 管理画面 (ポート3010)
        └── backend/                      Express API + Playwright (ポート5001)
```

---

## 🏢 プロジェクト1: メインCRMシステム

### 📍 プロジェクトパス
`/home/user/webapp/`

### 🎯 目的
人妻の蜜 - マルチ店舗対応 顧客管理・予約システム

### 🔧 構成要素

#### 1. クライアント（顧客向け）
- **パス**: `/home/user/webapp/client/`
- **ポート**: 3000
- **技術**: Next.js 16, React, Tailwind CSS
- **機能**:
  - キャスト一覧・検索
  - 予約システム
  - チャット機能
  - レビュー投稿
  - ブログ閲覧

#### 2. サーバー（バックエンド）
- **パス**: `/home/user/webapp/server/`
- **ポート**: 5000
- **技術**: Node.js, Express, MySQL
- **機能**:
  - 認証API
  - キャスト管理API
  - 予約管理API
  - Socket.io（リアルタイムチャット）

#### 3. CRM管理画面
- **パス**: `/home/user/webapp/crm-admin/`
- **ポート**: 8080, 9090
- **技術**: Next.js 14, React, Tailwind CSS
- **機能**:
  - ✅ 顧客検索（電話番号）
  - ✅ 予約管理
  - ✅ ダッシュボード（KPI）
  - ✅ データインポート（Excel/CSV）
  - ✅ CTI連携（Dialpad）
  - ✅ レポート自動生成

### 📊 現在の状況
- **完成度**: 約90%
- **状態**: 稼働中
- **アクセスURL**: 
  - 管理画面: https://9090-iwlhxuzhfaqbr3cqpityv-de59bda9.sandbox.novita.ai
  - 本番: http://162.43.91.102:3000

### 📚 主要ドキュメント
- `CRM_COMPLETE_SYSTEM_GUIDE.md`
- `CRM_FINAL_UPDATE.md`
- `CRM_EXCEL_IMPORT_GUIDE.md`
- `CRM_DIALPAD_INTEGRATION.md`

---

## 📡 プロジェクト2: 広告媒体一括更新システム

### 📍 プロジェクトパス
`/home/user/webapp/ad-platform-manager/`

### 🎯 目的
24サイトの広告媒体に対して、キャスト情報・スケジュール・写メ日記を一括配信

### 🔧 構成要素

#### 1. フロントエンド（管理画面）
- **パス**: `/home/user/webapp/ad-platform-manager/frontend/`
- **ポート**: 3010
- **技術**: Next.js 14, React, TypeScript, Tailwind CSS
- **機能**:
  - 広告媒体管理（CRUD）
  - 一括配信パネル
  - 配信ログビューア
  - 配信統計ダッシュボード

#### 2. バックエンド（配信エンジン）
- **パス**: `/home/user/webapp/ad-platform-manager/backend/`
- **ポート**: 5001
- **技術**: Node.js, Express, TypeScript, Playwright, MySQL
- **機能**:
  - 広告媒体管理API
  - 配信エンジンAPI
  - Web自動化（Playwright）
  - パスワード暗号化（AES-256）

### 📊 現在の状況
- **完成度**: 約40%（基盤完成）
- **状態**: 開発中（独立プロジェクトとして分離完了）
- **実装済み**: 
  - ✅ データベース設計
  - ✅ 全APIエンドポイント
  - ✅ フロントエンドUI
  - ✅ シティヘブンネット統合（ログイン成功）

### 🎯 対象広告媒体（24サイト）
1. ✅ シティヘブンネット（実装80%）
2. 🔄 デリヘルタウン（実装50%）
3. ⏳ バニラ
4. ⏳ HIME CHANNEL
5. ⏳ ぴゅあらば
6. ⏳ 他19サイト

### 📚 主要ドキュメント
- `ad-platform-manager/README.md` - 完全ガイド
- `ad-platform-manager/QUICKSTART.md` - クイックスタート
- `AD_PLATFORM_SYSTEM_SUMMARY.md` - システム概要
- `AD_PLATFORM_SEPARATION_COMPLETE.md` - 分離完了レポート

---

## 🔗 プロジェクト間の関係

### データベース共有
両プロジェクトは同じMySQLデータベースを共有:
- **ホスト**: 162.43.91.102
- **データベース**: hitozumano_mitu

#### 共通テーブル
- `casts` - キャスト情報（両方で使用）
- `users` - ユーザー情報
- `stores` - 店舗情報

#### CRM専用テーブル
- `orders` - 受注情報
- `customer_cast_history` - 顧客履歴
- `reservations` - 予約情報

#### 広告媒体専用テーブル
- `ad_platforms` - 広告媒体管理
- `distribution_logs` - 配信ログ

### 独立性
- ✅ コードベースは完全に分離
- ✅ ポート番号は重複なし
- ✅ 依存関係は独立管理
- ✅ デプロイは個別に可能

---

## 🚀 両プロジェクトの起動方法

### 並行起動手順

#### ターミナル1: CRMバックエンド
```bash
cd /home/user/webapp/server
npm run dev  # ポート5000
```

#### ターミナル2: CRMフロントエンド
```bash
cd /home/user/webapp/client
npm run dev  # ポート3000
```

#### ターミナル3: CRM管理画面
```bash
cd /home/user/webapp/crm-admin
npm run dev  # ポート9090
```

#### ターミナル4: 広告媒体バックエンド
```bash
cd /home/user/webapp/ad-platform-manager/backend
npm run dev  # ポート5001
```

#### ターミナル5: 広告媒体フロントエンド
```bash
cd /home/user/webapp/ad-platform-manager/frontend
npm run dev  # ポート3010
```

### アクセスURL一覧

| サービス | URL | 状態 |
|---------|-----|------|
| CRMフロントエンド | http://localhost:3000 | 稼働中 |
| CRMバックエンド | http://localhost:5000 | 稼働中 |
| CRM管理画面 | http://localhost:9090 | 稼働中 |
| 広告媒体管理画面 | http://localhost:3010 | 開発中 |
| 広告媒体API | http://localhost:5001 | 開発中 |

---

## 📊 開発状況比較

| 項目 | CRMシステム | 広告媒体システム |
|-----|-----------|--------------|
| 完成度 | 約90% | 約40% |
| 状態 | 稼働中 | 開発中 |
| フロント | ✅ 完成 | ✅ 基盤完成 |
| バックエンド | ✅ 完成 | ✅ 基盤完成 |
| データベース | ✅ 完成 | ✅ 完成 |
| ドキュメント | ✅ 充実 | ✅ 充実 |
| テスト | ✅ 実施済み | ⏳ 未実施 |
| 本番デプロイ | ✅ 完了 | ⏳ 未実施 |

---

## 🎯 今後の開発方針

### CRMシステム
- ✅ Freee会計連携（残タスク）
- ✅ メール自動送信
- ✅ SMS通知機能

### 広告媒体システム
- 🔄 デリヘルタウン実装完了
- 🔄 追加22サイトの統合
- 🔄 自動配信スケジューラー
- 🔄 配信テンプレート機能
- 🔄 本番デプロイ

---

## 💡 並行開発のメリット

### 1. リスク分散
- 一方のシステムの問題が他方に影響しない
- 独立してバグ修正・機能追加が可能

### 2. 専門化
- 各システムに特化した開発が可能
- 担当者を分けられる

### 3. スケーラビリティ
- 将来的に他店舗でも利用可能
- SaaS化の可能性

### 4. 保守性
- コードベースが分離されてメンテナンスしやすい
- バージョン管理が明確

---

## 📚 全ドキュメント一覧

### CRM関連
1. `CRM_COMPLETE_SYSTEM_GUIDE.md` - 完全ガイド
2. `CRM_FINAL_UPDATE.md` - 最新更新情報
3. `CRM_EXCEL_IMPORT_GUIDE.md` - Excelインポート
4. `CRM_DIALPAD_INTEGRATION.md` - Dialpad CTI連携
5. `CRM_DEPLOYMENT_SUMMARY.md` - デプロイ完了
6. `CUSTOMER_MANAGEMENT_COMPLETE_GUIDE.md` - 顧客管理

### 広告媒体関連
1. `ad-platform-manager/README.md` - 完全ガイド
2. `ad-platform-manager/QUICKSTART.md` - クイックスタート
3. `AD_PLATFORM_SYSTEM_SUMMARY.md` - システム概要
4. `AD_PLATFORM_PROGRESS_REPORT.md` - 進捗レポート
5. `AD_PLATFORM_SEPARATION_COMPLETE.md` - 分離完了

### 総合
1. `README.md` - プロジェクト全体ガイド
2. `PROJECT_STRUCTURE_OVERVIEW.md` - このファイル

---

## 🎉 まとめ

現在、**2つの独立したプロジェクト**で並行開発が進行中です：

1. **CRMシステム** - 約90%完成、稼働中
2. **広告媒体システム** - 約40%完成、開発中

両プロジェクトは完全に独立しており、互いに影響を与えずに開発・デプロイが可能です。

---

**作成者**: GenSpark AI Developer  
**作成日**: 2025-12-16  
**バージョン**: 1.0.0
