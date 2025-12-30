/**
 * 顧客CSV/Excel一括インポートコントローラー
 * 電話番号での重複チェック＆自動結合機能付き
 * Excel対応（シート選択、行範囲指定、カラムマッピング）
 * マルチテナント対応
 */
import { Request, Response } from 'express';
import { pool } from '../config/database';
import { TenantRequest } from '../middleware/tenantAuth';
import multer from 'multer';
import csvParser from 'csv-parser';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Multer設定（CSV/Excelファイル用）
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/customer-import');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `customer-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('CSV/Excelファイルのみアップロード可能です'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

export const uploadFile = upload.single('file');

/**
 * 電話番号の正規化（ハイフン除去、0から始まる形式に統一）
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // ハイフン、スペース、括弧を除去
  let normalized = phone.replace(/[-\s()]/g, '');
  
  // +81を0に変換
  if (normalized.startsWith('+81')) {
    normalized = '0' + normalized.substring(3);
  }
  
  // 81から始まる場合も0に変換
  if (normalized.startsWith('81') && normalized.length >= 11) {
    normalized = '0' + normalized.substring(2);
  }
  
  return normalized;
}

/**
 * Excelファイルのシート一覧を取得
 */
export const getExcelSheets = async (req: TenantRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがアップロードされていません' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext !== '.xlsx' && ext !== '.xls') {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Excelファイルのみ対応しています' });
    }

    console.log(`📊 Excelファイル読み込み: ${req.file.originalname}`);

    // Excelファイルを読み込み
    const workbook = XLSX.readFile(filePath);
    const sheets = workbook.SheetNames.map((sheetName, index) => {
      const sheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
      const rowCount = range.e.r + 1; // 行数
      const colCount = range.e.c + 1; // 列数

      return {
        index,
        name: sheetName,
        rowCount,
        colCount
      };
    });

    console.log(`  ✅ シート数: ${sheets.length}`);

    res.json({
      success: true,
      fileName: req.file.originalname,
      filePath: req.file.filename, // 保存したファイル名
      sheets
    });

  } catch (error: any) {
    console.error('❌ Excelシート読み込みエラー:', error);
    res.status(500).json({ 
      error: 'Excelファイルの読み込みに失敗しました', 
      details: error.message 
    });
  }
};

/**
 * Excelシートのデータをプレビュー
 */
export const previewExcelSheet = async (req: TenantRequest, res: Response) => {
  try {
    const { fileName, sheetName, startRow, endRow } = req.body;

    if (!fileName || !sheetName) {
      return res.status(400).json({ error: 'ファイル名とシート名が必要です' });
    }

    const filePath = path.join(__dirname, '../../uploads/customer-import', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'ファイルが見つかりません' });
    }

    console.log(`📊 シートプレビュー: ${sheetName} (${startRow || 1}行目〜${endRow || '最後'}行目)`);

    // Excelファイルを読み込み
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return res.status(404).json({ error: '指定されたシートが見つかりません' });
    }

    // シート全体をJSONに変換
    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { 
      header: 1, // 配列形式で取得
      defval: '' // 空セルは空文字
    });

    // 行範囲を適用
    const start = (startRow || 1) - 1; // 1始まりを0始まりに変換
    const end = endRow ? endRow : jsonData.length;
    const slicedData = jsonData.slice(start, end);

    // ヘッダー行を検出（最初の行）
    const headers = slicedData.length > 0 ? slicedData[0] : [];

    // データ行（ヘッダーを除く）
    const dataRows = slicedData.slice(1);

    console.log(`  ✅ プレビュー完了: ${headers.length}列 × ${dataRows.length}行`);

    res.json({
      success: true,
      headers,
      data: dataRows.slice(0, 20), // 最初の20行をプレビュー
      totalRows: dataRows.length,
      columns: headers.map((h: any, idx: number) => ({
        index: idx,
        name: h || `列${idx + 1}`,
        sample: dataRows[0] ? dataRows[0][idx] : ''
      }))
    });

  } catch (error: any) {
    console.error('❌ シートプレビューエラー:', error);
    res.status(500).json({ 
      error: 'シートのプレビューに失敗しました', 
      details: error.message 
    });
  }
};

/**
 * Excelデータをインポート用に解析
 */
export const parseExcelData = async (req: TenantRequest, res: Response) => {
  try {
    const { 
      fileName, 
      sheetName, 
      startRow, 
      endRow,
      columnMapping // { phone: 0, name: 1, email: 2, ... }
    } = req.body;

    if (!fileName || !sheetName || !columnMapping) {
      return res.status(400).json({ error: '必要なパラメータが不足しています' });
    }

    const filePath = path.join(__dirname, '../../uploads/customer-import', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'ファイルが見つかりません' });
    }

    console.log(`📊 Excel解析開始: ${sheetName}`);

    // Excelファイルを読み込み
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];

    // シート全体をJSONに変換
    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { 
      header: 1,
      defval: ''
    });

    // 行範囲を適用（ヘッダー行を除く）
    const start = (startRow || 2) - 1; // データは2行目から（1行目はヘッダー）
    const end = endRow ? endRow : jsonData.length;
    const dataRows = jsonData.slice(start, end);

    const customers: any[] = [];

    for (const row of dataRows) {
      const phoneNumber = row[columnMapping.phone];
      
      // 電話番号が存在する行のみ処理
      if (phoneNumber && phoneNumber.toString().trim()) {
        customers.push({
          phone_number: normalizePhoneNumber(phoneNumber.toString()),
          name: row[columnMapping.name] || '',
          email: row[columnMapping.email] || '',
          home_address: row[columnMapping.address] || '',
          notes: row[columnMapping.notes] || '',
          birth_date: row[columnMapping.birthDate] || '',
          customer_type: row[columnMapping.customerType] || 'new',
          home_transportation_fee: parseInt(row[columnMapping.transportFee] || '0') || 0
        });
      }
    }

    console.log(`  ✅ 有効データ: ${customers.length}件`);

    // 既存顧客との照合チェック
    const customerWithStatus: any[] = [];
    
    for (const customer of customers) {
      // 電話番号で既存顧客を検索（テナント分離）
      const [existing]: any = await pool.execute(
        `SELECT id, name, email, total_orders, last_visit_date 
         FROM users 
         WHERE phone_number = ? AND company_id = ? AND store_id = ?`,
        [customer.phone_number, req.companyId, req.storeId]
      );

      if (existing.length > 0) {
        // 既存顧客が見つかった場合
        customerWithStatus.push({
          ...customer,
          status: 'existing',
          existing_id: existing[0].id,
          existing_name: existing[0].name,
          existing_orders: existing[0].total_orders || 0,
          last_visit: existing[0].last_visit_date,
          action: '更新'
        });
      } else {
        // 新規顧客
        customerWithStatus.push({
          ...customer,
          status: 'new',
          action: '新規登録'
        });
      }
    }

    // 統計情報
    const stats = {
      total: customers.length,
      new: customerWithStatus.filter(c => c.status === 'new').length,
      existing: customerWithStatus.filter(c => c.status === 'existing').length
    };

    console.log(`📊 統計: 合計${stats.total}件（新規${stats.new}件、既存${stats.existing}件）`);

    res.json({
      success: true,
      message: 'Excelファイルを解析しました',
      customers: customerWithStatus,
      stats
    });

  } catch (error: any) {
    console.error('❌ Excel解析エラー:', error);
    res.status(500).json({ 
      error: 'Excelファイルの解析に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * CSVファイルをパース（既存機能：互換性のため残す）
 */
export const parseCustomerCSV = async (req: TenantRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがアップロードされていません' });
    }

    const filePath = req.file.path;
    const customers: any[] = [];
    
    console.log(`📄 CSVファイル解析開始: ${req.file.originalname}`);

    // CSVをパース
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          // 電話番号が存在する行のみ処理
          const phoneNumber = row['電話番号'] || row['phone'] || row['tel'] || row['電話'];
          
          if (phoneNumber) {
            customers.push({
              phone_number: normalizePhoneNumber(phoneNumber),
              name: row['顧客名'] || row['名前'] || row['name'] || '',
              email: row['メールアドレス'] || row['email'] || row['メール'] || '',
              home_address: row['住所'] || row['address'] || row['自宅住所'] || '',
              notes: row['備考'] || row['メモ'] || row['note'] || row['notes'] || '',
              birth_date: row['生年月日'] || row['誕生日'] || row['birth_date'] || '',
              customer_type: row['顧客タイプ'] || row['type'] || 'new',
              home_transportation_fee: parseInt(row['交通費'] || row['自宅交通費'] || '0') || 0,
              // 追加データ（将来の拡張用）
              raw_data: JSON.stringify(row)
            });
          }
        })
        .on('end', () => {
          console.log(`✅ CSV解析完了: ${customers.length}件`);
          resolve();
        })
        .on('error', (error) => {
          console.error('❌ CSV解析エラー:', error);
          reject(error);
        });
    });

    // 一時ファイルを削除
    fs.unlinkSync(filePath);

    // 既存顧客との照合チェック
    const customerWithStatus: any[] = [];
    
    for (const customer of customers) {
      // 電話番号で既存顧客を検索（テナント分離）
      const [existing]: any = await pool.execute(
        `SELECT id, name, email, total_orders, last_visit_date 
         FROM users 
         WHERE phone_number = ? AND company_id = ? AND store_id = ?`,
        [customer.phone_number, req.companyId, req.storeId]
      );

      if (existing.length > 0) {
        // 既存顧客が見つかった場合
        customerWithStatus.push({
          ...customer,
          status: 'existing',
          existing_id: existing[0].id,
          existing_name: existing[0].name,
          existing_orders: existing[0].total_orders || 0,
          last_visit: existing[0].last_visit_date,
          action: '更新'
        });
      } else {
        // 新規顧客
        customerWithStatus.push({
          ...customer,
          status: 'new',
          action: '新規登録'
        });
      }
    }

    // 統計情報
    const stats = {
      total: customers.length,
      new: customerWithStatus.filter(c => c.status === 'new').length,
      existing: customerWithStatus.filter(c => c.status === 'existing').length
    };

    console.log(`📊 統計: 合計${stats.total}件（新規${stats.new}件、既存${stats.existing}件）`);

    res.json({
      success: true,
      message: 'CSVファイルを解析しました',
      customers: customerWithStatus,
      stats
    });

  } catch (error: any) {
    console.error('❌ CSV解析エラー:', error);
    res.status(500).json({ 
      error: 'CSVファイルの解析に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * 顧客データを一括インポート（新規＋更新）
 */
export const importCustomers = async (req: TenantRequest, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const { customers } = req.body;
    
    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ error: '顧客データが指定されていません' });
    }

    console.log(`📥 顧客インポート開始: ${customers.length}件`);

    await connection.beginTransaction();

    const results = {
      total: customers.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as any[]
    };

    for (const customer of customers) {
      try {
        const {
          phone_number,
          name,
          email,
          home_address,
          notes,
          birth_date,
          customer_type,
          home_transportation_fee,
          status
        } = customer;

        // 電話番号の正規化
        const normalizedPhone = normalizePhoneNumber(phone_number);

        if (!normalizedPhone) {
          results.failed++;
          results.errors.push({
            phone_number,
            error: '電話番号が無効です'
          });
          continue;
        }

        if (status === 'existing') {
          // 既存顧客を更新
          const updateFields: string[] = [];
          const updateValues: any[] = [];

          if (name) {
            updateFields.push('name = ?');
            updateValues.push(name);
          }
          if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
          }
          if (home_address) {
            updateFields.push('home_address = ?');
            updateValues.push(home_address);
          }
          if (notes) {
            updateFields.push('notes = ?');
            updateValues.push(notes);
          }
          if (customer_type) {
            updateFields.push('customer_type = ?');
            updateValues.push(customer_type);
          }
          if (home_transportation_fee !== undefined) {
            updateFields.push('home_transportation_fee = ?');
            updateValues.push(home_transportation_fee);
          }

          if (updateFields.length > 0) {
            updateValues.push(normalizedPhone);
            updateValues.push(req.companyId);
            updateValues.push(req.storeId);
            
            await connection.execute(
              `UPDATE users SET ${updateFields.join(', ')} WHERE phone_number = ? AND company_id = ? AND store_id = ?`,
              updateValues
            );
            
            console.log(`  ✅ 更新: ${name} (${normalizedPhone})`);
            results.updated++;
          }

        } else {
          // 新規顧客を登録（テナント情報を含む）
          const defaultPassword = 'customer123'; // デフォルトパスワード
          
          await connection.execute(`
            INSERT INTO users (
              company_id, store_id, phone_number, password, name, email, role,
              home_address, notes, customer_type, home_transportation_fee, user_type
            ) VALUES (?, ?, ?, ?, ?, ?, 'user', ?, ?, ?, ?, 'customer')
          `, [
            req.companyId,
            req.storeId,
            normalizedPhone,
            defaultPassword, // 本来はハッシュ化すべき
            name || '',
            email || '',
            home_address || '',
            notes || '',
            customer_type || 'new',
            home_transportation_fee || 0
          ]);

          console.log(`  ✅ 新規: ${name} (${normalizedPhone})`);
          results.created++;
        }

      } catch (error: any) {
        console.error(`  ❌ エラー: ${customer.phone_number}`, error.message);
        results.failed++;
        results.errors.push({
          phone_number: customer.phone_number,
          name: customer.name,
          error: error.message
        });
      }
    }

    await connection.commit();

    console.log(`✅ インポート完了: 新規${results.created}件、更新${results.updated}件、失敗${results.failed}件`);

    res.json({
      success: true,
      message: `顧客データをインポートしました（新規${results.created}件、更新${results.updated}件）`,
      results
    });

  } catch (error: any) {
    await connection.rollback();
    console.error('❌ インポートエラー:', error);
    res.status(500).json({ 
      error: '顧客データのインポートに失敗しました', 
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

/**
 * 電話番号で顧客を検索
 */
export const searchCustomerByPhone = async (req: TenantRequest, res: Response) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ error: '電話番号を指定してください' });
    }

    const normalizedPhone = normalizePhoneNumber(phone as string);

    console.log(`🔍 顧客検索: ${phone} -> ${normalizedPhone}`);

    // 顧客情報を取得（テナント分離）
    const [customers]: any = await pool.execute(`
      SELECT 
        id, phone_number, name, email, role,
        home_address, home_transportation_fee,
        customer_type, total_orders, last_visit_date, notes,
        created_at
      FROM users 
      WHERE phone_number = ? AND company_id = ? AND store_id = ?
    `, [normalizedPhone, req.companyId, req.storeId]);

    if (customers.length === 0) {
      return res.json({
        success: true,
        found: false,
        message: '該当する顧客が見つかりませんでした'
      });
    }

    const customer = customers[0];

    // 受注履歴を取得
    const [orders]: any = await pool.execute(`
      SELECT 
        o.id, o.order_number, o.business_date, o.start_time,
        o.total_price, o.status,
        c.name as cast_name,
        s.display_name as store_name
      FROM orders o
      LEFT JOIN casts c ON o.cast_id = c.id
      LEFT JOIN stores s ON o.store_id = s.id
      WHERE o.customer_id = ?
      ORDER BY o.business_date DESC, o.start_time DESC
      LIMIT 10
    `, [customer.id]);

    console.log(`  ✅ 顧客発見: ${customer.name} (受注${orders.length}件)`);

    res.json({
      success: true,
      found: true,
      customer: {
        ...customer,
        order_history: orders
      }
    });

  } catch (error: any) {
    console.error('❌ 顧客検索エラー:', error);
    res.status(500).json({ 
      error: '顧客の検索に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * CSVテンプレートをダウンロード
 */
export const downloadTemplate = async (req: TenantRequest, res: Response) => {
  try {
    const template = `電話番号,顧客名,メールアドレス,住所,生年月日,顧客タイプ,交通費,備考
090-1234-5678,山田太郎,yamada@example.com,東京都渋谷区,1985-01-15,regular,2000,VIP顧客
080-9876-5432,佐藤花子,sato@example.com,千葉県船橋市,1990-05-20,new,0,
`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="customer_template.csv"');
    res.send('\uFEFF' + template); // BOM付きUTF-8

  } catch (error: any) {
    console.error('❌ テンプレートダウンロードエラー:', error);
    res.status(500).json({ 
      error: 'テンプレートのダウンロードに失敗しました', 
      details: error.message 
    });
  }
};
