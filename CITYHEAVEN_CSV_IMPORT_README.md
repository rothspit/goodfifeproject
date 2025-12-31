# シティヘブンCSVインポート完全ガイド

## 📋 概要

シティヘブンから**エクスポートしたCSV (`girlExport.csv`)** を、当システムで直接インポートできるように自動変換します。

---

## ✅ 対応状況

- ✅ **362名の公開キャスト**を正常に変換
- ✅ **236名の新人キャスト**を自動検出（X連携で自動投稿可能）
- ✅ **102名の喫煙者**を自動判定
- ✅ 年齢範囲: 18歳 ～ 46歳（平均24.8歳）
- ✅ カップサイズ分布: C～Kカップ（最多はDカップ84名）

---

## 🚀 使用方法

### ステップ1: シティヘブンからCSVをエクスポート

1. シティヘブンの管理画面にログイン
2. 女の子管理 → データエクスポート
3. `girlExport.csv` をダウンロード

### ステップ2: サンドボックスにアップロード

アップロード先: `/home/user/uploaded_files/girlExport.csv`

### ステップ3: 変換スクリプトを実行

```bash
cd /home/user/webapp
python3 convert_cityheaven_csv.py
```

**出力ファイル**: `/home/user/webapp/cityheaven_import_ready.csv`

### ステップ4: 管理画面からインポート

1. 管理画面にログイン
   - URL: https://[SANDBOX_URL]/admin/login
   - アカウント: `090-0000-0000` / `admin123456`

2. メニューから「キャスト管理」→「CSVインポート」

3. 変換済みファイルをアップロード
   - ファイルパス: `/home/user/webapp/cityheaven_import_ready.csv`
   - または、ファイルの内容をコピー&ペースト

4. 「インポート実行」をクリック

5. **X連携が有効な場合**
   - 新人キャスト（236名）が自動的にXに投稿されます
   - 投稿結果はインポート結果画面で確認できます

---

## 📊 変換仕様

### 入力フォーマット（シティヘブンCSV）

- **総カラム数**: 92カラム
- **重要カラム**:
  - `女性名` (1): キャスト名
  - `年齢` (16): 年齢
  - `身長` (20): 身長（cm）
  - `バスト` (21): バストサイズ（cm）
  - `カップ` (22): カップサイズ
  - `ウェスト` (23): ウエストサイズ（cm）
  - `ヒップ` (24): ヒップサイズ（cm）
  - `血液型` (18): 血液型
  - `趣味` (28): 趣味
  - `体重` (39): 体重（kg）
  - `タバコ` (42): 喫煙（〇=喫煙者）
  - `新人` (43): 新人フラグ（〇=新人）
  - `公開状態` (44): 公開フラグ（〇=公開中）
  - `お店コメント基本` (45): 店舗コメント
  - `女の子コメント基本` (54): 本人コメント

### 出力フォーマット（システム用CSV）

27カラム:
```
name, age, height, weight, bust, waist, hip, cup_size,
blood_type, hobby, specialty, profile, is_new, smoking_ok,
tattoo, has_children, threesome_ok, hairless, home_visit_ok,
clothing_request_ok, overnight_ok, sweet_sadist_ok, anal_ok,
sm_ok, cosplay_ok, toy_ok, lotion_ok
```

### 変換ルール

#### 1. フィルタリング
- **公開状態が「〇」のキャストのみ**を出力
- 名前が空の行はスキップ

#### 2. データマッピング
| 元データ | 変換後 | 処理内容 |
|---------|--------|---------|
| 女性名 | name | そのまま転記 |
| 年齢 | age | そのまま転記 |
| 身長・体重・BWH | height, weight, bust, waist, hip | そのまま転記 |
| カップ・血液型・趣味 | cup_size, blood_type, hobby | そのまま転記 |
| お店コメント + 女の子コメント | profile | 両方結合（区切り付き） |
| 新人（'〇'） | is_new | true/false変換 |
| タバコ（'〇'） | smoking_ok | true/false変換 |

#### 3. デフォルト設定値
人妻デリヘル店の特性を考慮:
- `has_children`: **true** (出産経験あり)
- `home_visit_ok`: **true** (自宅訪問OK)
- `clothing_request_ok`: **true** (服装リクエストOK)
- `overnight_ok`: **true** (お泊まりOK)
- `toy_ok`: **true** (おもちゃOK)
- `lotion_ok`: **true** (ローションOK)
- `tattoo`: **false** (刺青なし)
- `threesome_ok`, `hairless`, `sweet_sadist_ok`, `anal_ok`, `sm_ok`, `cosplay_ok`: **false**

---

## 📁 ファイル構成

```
/home/user/webapp/
├── convert_cityheaven_csv.py          # 変換スクリプト
├── cityheaven_import_ready.csv        # 変換済みCSV（システム用）
└── CITYHEAVEN_CSV_IMPORT_README.md    # このファイル

/home/user/uploaded_files/
└── girlExport.csv                     # シティヘブンからエクスポートしたCSV
```

---

## 🔧 変換スクリプト詳細

### 実行方法

```bash
cd /home/user/webapp
python3 convert_cityheaven_csv.py
```

### 出力例

```
シティヘブンCSV変換開始...
入力: /home/user/uploaded_files/girlExport.csv
出力: /home/user/webapp/cityheaven_import_ready.csv

✅ 変換完了！
  変換成功: 362名（公開中のキャスト）
  スキップ: 30名（非公開または不完全なデータ）

出力ファイル: /home/user/webapp/cityheaven_import_ready.csv
```

### スクリプトの機能

1. **自動フィルタリング**: 公開状態が「〇」のキャストのみ処理
2. **データ検証**: 必須項目（名前）のチェック
3. **プロフィール結合**: 店舗コメントと本人コメントを自動結合
4. **エラーハンドリング**: 不正な行をスキップして続行
5. **UTF-8 BOM付き出力**: Excel互換性確保

---

## 🐦 X（Twitter）連携との統合

### 新人キャスト自動投稿

変換されたCSVをインポートすると、`is_new=true` のキャスト（236名）が自動的にXに投稿されます。

#### 投稿内容例

```
🎉 新人キャスト入店のお知らせ 🎉

✨ 夜宵（やよい）さん（22歳）✨

📏 スペック:
身長: 163cm
B91-W57-H87 (Fカップ)

💬 黒髪ロングヘアーに高身長スレンダーFカップ！
おっとり優しいながらも明るく人懐っこい性格で、この業界...

ご予約お待ちしております！💕
#人妻の蜜西船橋店 #新人 #デリヘル #西船橋
```

#### 設定方法

1. 管理画面 → X連携
2. Twitter API認証情報を入力
3. 「新人キャスト登録時に自動的にXに投稿する」をON
4. CSVインポート時に自動投稿

---

## ⚠️ 注意事項

### 1. ファイルサイズ制限

- サーバーのペイロード制限: **50MB**
- シティヘブンCSV: 約814KB（問題なし）
- 変換後CSV: 約585KB（問題なし）

### 2. 文字エンコーディング

- 入力CSVは**UTF-8**を想定
- 出力CSVは**UTF-8 BOM付き**（Excel互換）

### 3. X投稿のレート制限

- Twitter APIには投稿回数制限があります
- 236名の新人を一度にインポートする場合、投稿に時間がかかる可能性があります
- エラーが発生した場合は、インポート結果画面で確認できます

### 4. データの重複

- 同名のキャストが存在する場合、重複登録される可能性があります
- 事前にデータベースをクリアするか、重複チェックを行うことを推奨

---

## 🛠️ トラブルシューティング

### 問題: 変換スクリプトが見つからない

```bash
# スクリプトの存在確認
ls -la /home/user/webapp/convert_cityheaven_csv.py

# 実行権限の付与（必要に応じて）
chmod +x /home/user/webapp/convert_cityheaven_csv.py
```

### 問題: CSV読み込みエラー

- ファイルのエンコーディングを確認: `file -i /home/user/uploaded_files/girlExport.csv`
- UTF-8以外の場合は変換: `iconv -f SHIFT-JIS -t UTF-8 girlExport.csv > girlExport_utf8.csv`

### 問題: インポート時にペイロードエラー

- サーバーのペイロード制限が50MBに設定されていることを確認
- CSVを分割してインポート（既に作成済みのバッチファイルを使用）

### 問題: X投稿が失敗する

- X連携設定画面で接続テストを実行
- Twitter API認証情報が正しいか確認
- APIのレート制限に達していないか確認

---

## 📞 サポート情報

### 管理画面URL
- **ログイン**: https://[SANDBOX_URL]/admin/login
- **キャスト管理**: https://[SANDBOX_URL]/admin/casts
- **CSVインポート**: https://[SANDBOX_URL]/admin/casts/import
- **X連携設定**: https://[SANDBOX_URL]/admin/twitter

### ログイン情報
- 電話番号: `090-0000-0000`
- パスワード: `admin123456`

---

## 📝 変更履歴

### 2025-12-09
- ✅ シティヘブンCSV変換スクリプト作成
- ✅ 362名の公開キャストデータ変換成功
- ✅ 236名の新人キャスト検出
- ✅ X連携による自動投稿機能と統合
- ✅ 完全なドキュメント作成

---

## 🎉 まとめ

シティヘブンからエクスポートしたCSVを、わずか数ステップで当システムにインポートできます：

1. ✅ シティヘブンからCSVエクスポート
2. ✅ 変換スクリプト実行（`python3 convert_cityheaven_csv.py`）
3. ✅ 管理画面からインポート
4. ✅ 新人キャストが自動的にXに投稿（X連携ON時）

**362名のキャストを一括登録し、236名の新人をXで自動告知できます！**
