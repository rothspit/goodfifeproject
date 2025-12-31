# 📊 CRM管理システム Excel取込機能ガイド

## 🎯 概要

顧客管理システムにExcelファイルの直接取込機能を追加しました。
CSVファイルだけでなく、Excel形式（.xlsx, .xls）のファイルを直接アップロードできます。

---

## ✅ 新機能

### Excelファイル取込対応
- **.xlsx** (Excel 2007以降)
- **.xls** (Excel 97-2003)  
- **.csv** (従来通り対応)

### 自動変換機能
- Excelファイルをアップロードすると自動的にCSV形式に変換
- 変換後、バックエンドAPIに送信
- ユーザーは何も意識せずにExcelファイルをそのまま使用可能

### Excelテンプレートダウンロード
- 各データタイプ（顧客/キャスト/売上）のExcelテンプレートをダウンロード可能
- テンプレートにはサンプルデータが含まれています
- ダウンロードしたテンプレートにデータを入力してアップロードするだけ

---

## 📋 使用方法

### ステップ1: テンプレートをダウンロード

1. CRM管理画面にログイン
   ```
   https://9090-iwlhxuzhfaqbr3cqpityv-de59bda9.sandbox.novita.ai
   ```

2. 「データ取込」タブをクリック

3. インポート種類を選択
   - 顧客データ
   - キャスト情報
   - 売上データ

4. 「Excelテンプレートをダウンロード」リンクをクリック

5. Excelファイルがダウンロードされます
   - `顧客データテンプレート.xlsx`
   - `キャスト情報テンプレート.xlsx`
   - `売上データテンプレート.xlsx`

### ステップ2: Excelファイルにデータを入力

1. ダウンロードしたExcelファイルを開く

2. 1行目の列名はそのまま残す（変更しないでください）

3. 2行目以降にデータを入力
   - サンプルデータは削除してOK
   - 必要なデータを追加

4. ファイルを保存

### ステップ3: ファイルをアップロード

1. 「ExcelファイルまたはCSVファイルを選択」をクリック

2. 作成したExcelファイルを選択

3. ファイル名の横に「(自動的にCSV形式に変換されます)」と表示される

4. 「インポート開始」ボタンをクリック

5. インポート結果が表示されます
   - 成功件数
   - スキップ件数
   - エラー詳細

---

## 📊 Excelフォーマット

### 顧客データ

**列名（1行目）:**
| phone_number | name | email | customer_type | home_address | home_transportation_fee | notes |
|--------------|------|-------|---------------|--------------|------------------------|-------|

**サンプルデータ（2行目以降）:**
| phone_number | name | email | customer_type | home_address | home_transportation_fee | notes |
|--------------|------|--------------------------|---------|----------------------|------------|---------|
| 09012345678 | 山田太郎 | yamada@example.com | regular | 東京都新宿区1-2-3 | 3000 | VIP顧客 |
| 08012345678 | 鈴木花子 | suzuki@example.com | new | 東京都渋谷区4-5-6 | 2500 | |

**必須項目:**
- `phone_number`: 電話番号（ハイフンなし）
- `name`: 顧客名

**任意項目:**
- `email`: メールアドレス
- `customer_type`: 顧客タイプ（new/regular/vip）
- `home_address`: 自宅住所
- `home_transportation_fee`: 自宅交通費（数値）
- `notes`: 備考・メモ

---

### キャスト情報

**列名（1行目）:**
| name | display_name | age | height | bust | waist | hip | blood_type | description | nomination_fee | is_available |
|------|--------------|-----|--------|------|-------|-----|------------|-------------|----------------|--------------|

**サンプルデータ（2行目以降）:**
| name | display_name | age | height | bust | waist | hip | blood_type | description | nomination_fee | is_available |
|-------------|---------|-----|--------|------|-------|-----|---------|--------------|----------|----------|
| Tanaka Yuki | ゆき | 25 | 165 | 88 | 60 | 90 | A | 明るい性格です | 3000 | 1 |
| Sato Mika | みか | 23 | 160 | 85 | 58 | 88 | B | 癒し系です | 3000 | 1 |

**必須項目:**
- `name`: キャスト名（英字推奨）
- `display_name`: 表示名（日本語OK）

**任意項目:**
- `age`: 年齢（数値）
- `height`: 身長（数値、cm）
- `bust`, `waist`, `hip`: スリーサイズ（数値、cm）
- `blood_type`: 血液型（A/B/O/AB）
- `description`: 説明文
- `nomination_fee`: 指名料（数値）
- `is_available`: 稼働状況（1=稼働中、0=休止中）

---

### 売上データ

**列名（1行目）:**
| business_date | order_datetime | store_id | customer_phone | cast_name | start_time | duration | location | base_price | nomination_fee | transportation_fee | option_price | discount | total_price | options | memo | order_status |
|---------------|----------------|----------|----------------|-----------|------------|----------|----------|------------|----------------|-------------------|--------------|----------|-------------|---------|------|--------------|

**サンプルデータ（2行目以降）:**
| business_date | order_datetime | store_id | customer_phone | cast_name | start_time | duration | location | base_price | nomination_fee | transportation_fee | option_price | discount | total_price | options | memo | order_status |
|------------|------------------|-----|-----------|------|--------|------|------|-------|--------|------------|----------|-------|---------|---------------|------|-----------|
| 2024-12-16 | 2024-12-16 19:00:00 | 1 | 09012345678 | ゆき | 19:00 | 90 | 自宅 | 15000 | 3000 | 2500 | 0 | 0 | 20500 | オプションなし | 指名 | completed |
| 2024-12-16 | 2024-12-16 20:00:00 | 1 | 08012345678 | | 20:00 | 60 | ホテル | 12000 | 0 | 0 | 0 | 0 | 12000 | | | confirmed |

**必須項目:**
- `business_date`: 営業日（YYYY-MM-DD形式）
- `order_datetime`: 予約日時（YYYY-MM-DD HH:MM:SS形式）
- `customer_phone`: 顧客電話番号

**任意項目:**
- `store_id`: 店舗ID（1=西船橋、2=錦糸町、3=葛西、4=松戸）
- `cast_name`: キャスト名（空の場合は指名なし）
- `start_time`: 開始時刻（HH:MM形式）
- `duration`: コース時間（分）
- `location`: 場所（自宅/ホテル）
- 料金項目: `base_price`, `nomination_fee`, `transportation_fee`, `option_price`, `discount`, `total_price`
- `options`: オプション内容
- `memo`: メモ
- `order_status`: ステータス（pending/confirmed/completed/cancelled）

---

## 🔧 技術詳細

### フロントエンド実装

#### 1. Excelファイルの読み込み

```typescript
import * as XLSX from 'xlsx';

const convertExcelToCSV = async (excelFile: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      
      // 最初のシートを取得
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // CSV形式に変換
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      
      // CSVファイルとして作成
      const blob = new Blob([csv], { type: 'text/csv' });
      const csvFile = new File([blob], excelFile.name.replace(/\.(xlsx?|xls)$/i, '.csv'), {
        type: 'text/csv'
      });
      
      resolve(csvFile);
    };
    
    reader.readAsBinaryString(excelFile);
  });
};
```

#### 2. Excelテンプレートの生成

```typescript
const downloadExcelTemplate = () => {
  // ヘッダーとサンプルデータを準備
  const headers = ['phone_number', 'name', 'email', ...];
  const sampleData = [
    ['09012345678', '山田太郎', 'yamada@example.com', ...],
    ...
  ];

  // Excelワークブックを作成
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'データ');

  // ファイルをダウンロード
  XLSX.writeFile(wb, '顧客データテンプレート.xlsx');
};
```

### 使用ライブラリ

- **xlsx**: バージョン 0.18.5
  - Excelファイルの読み込み
  - CSV形式への変換
  - Excelファイルの生成

---

## 💡 使用例

### 例1: 既存の顧客リストをインポート

```
1. 「データ取込」→「顧客データ」を選択
2. 「Excelテンプレートをダウンロード」をクリック
3. ダウンロードしたExcelファイルを開く
4. サンプルデータを削除
5. 既存の顧客リストからデータをコピー&ペースト
6. ファイルを保存
7. CRM管理画面でファイルをアップロード
8. 「インポート開始」をクリック
9. 結果を確認
```

### 例2: キャスト情報を一括登録

```
1. 「データ取込」→「キャスト情報」を選択
2. テンプレートをダウンロード
3. キャストのプロフィール情報を入力
   - 名前、表示名、年齢
   - 身長、スリーサイズ
   - 説明文、指名料
4. ファイルを保存してアップロード
5. インポート完了
```

---

## ⚠️ 注意事項

### ファイル形式
- ✅ Excel 2007以降（.xlsx）
- ✅ Excel 97-2003（.xls）
- ✅ CSV（.csv）
- ❌ OpenDocument（.ods） - 未対応

### Excel使用時の注意
1. **1行目の列名は変更しないでください**
   - 列名が一致しないとインポートに失敗します

2. **複数シートがある場合**
   - 最初のシート（一番左）のみがインポートされます
   - インポートしたいデータは最初のシートに配置してください

3. **数式は使用しないでください**
   - 数式ではなく、値を直接入力してください
   - 数式の結果が正しく変換されない場合があります

4. **日付形式**
   - `YYYY-MM-DD` 形式で入力してください
   - 例: `2024-12-16`

5. **時刻形式**
   - `YYYY-MM-DD HH:MM:SS` 形式で入力してください
   - 例: `2024-12-16 19:00:00`

---

## 🔍 トラブルシューティング

### 問題1: Excelファイルのアップロードが失敗する

**原因:**
- ファイル形式が対応していない
- ファイルが破損している
- ファイルサイズが大きすぎる

**解決策:**
```
1. ファイル形式を確認（.xlsx, .xls, .csv）
2. ファイルをExcelで開いて正常に表示されるか確認
3. ファイルサイズを確認（推奨: 5MB以下）
```

### 問題2: データが正しくインポートされない

**原因:**
- 列名が正しくない
- データ形式が間違っている
- 必須項目が空

**解決策:**
```
1. テンプレートをダウンロードして使用
2. 1行目の列名を変更していないか確認
3. 必須項目（phone_number, nameなど）が入力されているか確認
```

### 問題3: 一部のデータがスキップされる

**原因:**
- 重複データ（電話番号が既存と同じ）
- データ形式エラー
- 必須項目の欠落

**確認:**
```
インポート結果のエラー詳細を確認
- 成功: XX件
- スキップ: XX件
- エラー: XX件（詳細表示あり）
```

---

## 📊 インポート結果の見方

### 成功
```
✅ 成功: 10件
   → 10件のデータが正常にインポートされました
```

### スキップ
```
⚠️ スキップ: 3件
   → 既存データと重複しているため、更新されました
   （顧客データの場合、同じ電話番号は更新されます）
```

### エラー
```
❌ エラー: 2件
   • Row 5: phone_number is required
   • Row 8: Invalid customer_type value
   
   → 該当行のデータを修正して再度インポートしてください
```

---

## 🎯 まとめ

### 新機能の利点

1. **簡単操作**
   - Excelファイルを直接アップロード可能
   - CSVへの変換は不要

2. **テンプレート提供**
   - サンプルデータ付きのExcelテンプレート
   - コピー&ペーストで簡単入力

3. **自動変換**
   - Excel → CSV変換は自動
   - ユーザーは何も意識しなくてOK

4. **エラー詳細**
   - インポート結果を詳しく表示
   - エラー行と理由を明示

### アクセス

**CRM管理画面:**
https://9090-iwlhxuzhfaqbr3cqpityv-de59bda9.sandbox.novita.ai

**ログイン:**
- 電話番号: `admin`
- パスワード: `admin123`

---

**作成日:** 2024年12月16日  
**バージョン:** 1.0.0  
**ステータス:** ✅ 実装完了
