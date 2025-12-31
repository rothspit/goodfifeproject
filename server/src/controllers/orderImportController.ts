import { Request, Response } from 'express';
import { TenantRequest } from '../middleware/tenantAuth';
import { google } from 'googleapis';
import db, { pool } from '../config/database';

// Googleスプレッドシートからデータを取得
export const fetchSheetData = async (req: TenantRequest, res: Response) => {
  try {
    const { spreadsheetId, range } = req.body;

    if (!spreadsheetId) {
      return res.status(400).json({ error: 'スプレッドシートIDが必要です' });
    }

    // Google Sheets API認証（APIキーを使用、または公開スプレッドシート）
    const sheets = google.sheets({ 
      version: 'v4', 
      auth: process.env.GOOGLE_API_KEY 
    });

    // スプレッドシートデータを取得
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: range || 'A:H', // デフォルトはA〜H列
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'データが見つかりません' });
    }

    // ヘッダー行を除外
    const header = rows[0];
    const dataRows = rows.slice(1);

    // データを整形
    const formattedData = dataRows.map((row) => ({
      name: row[0] || '',
      phone: row[1] || '',
      amount: parseInt(row[2]) || 0,
      location: row[3] || '', // ホテル名または自宅
      cast: row[4] || '',
      options: row[5] || '',
      memo: row[6] || '',
    }));

    res.json({
      success: true,
      header,
      data: formattedData,
      count: formattedData.length,
    });
  } catch (error: any) {
    console.error('スプレッドシート取得エラー:', error);
    res.status(500).json({ error: 'スプレッドシートの取得に失敗しました', details: error.message });
  }
};

// データをインポート（データベースに保存）
export const importOrders = async (req: TenantRequest, res: Response) => {
  try {
    const { orders, orderDate, fiscalYear, fiscalMonth } = req.body;
    const { companyId, storeId } = req.tenant || {};

    if (!companyId || !storeId) {
      return res.status(403).json({ error: 'テナント情報が必要です' });
    }

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ error: '受注データが必要です' });
    }

    if (!orderDate || !fiscalYear || !fiscalMonth) {
      return res.status(400).json({ error: '受注日、年度、月が必要です' });
    }

    const successCount = 0;
    const errorCount = 0;
    const errors: any[] = [];

    // トランザクション開始
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const order of orders) {
        const { name, phone, amount, location, cast, options, memo } = order;

        // 電話番号を正規化
        const normalizedPhone = phone.replace(/[^0-9]/g, '');

        if (!normalizedPhone) {
          errors.push({ name, error: '電話番号が不正です' });
          continue;
        }

        // 顧客を電話番号で検索（テナント内）
        const [users]: any = await connection.execute(
          'SELECT id FROM users WHERE phone_number = ? AND company_id = ? AND store_id = ?',
          [normalizedPhone, companyId, storeId]
        );

        let userId = null;
        if (users.length > 0) {
          userId = users[0].id;
        } else {
          // 新規顧客として登録（テナント情報含む）
          const [result]: any = await connection.execute(
            'INSERT INTO users (phone_number, name, password, company_id, store_id) VALUES (?, ?, ?, ?, ?)',
            [normalizedPhone, name, 'temp_password_' + Date.now(), companyId, storeId]
          );
          userId = result.insertId;
        }

        // 受注データを保存（テナント情報含む）
        await connection.execute(
          `INSERT INTO orders 
           (user_id, customer_name, customer_phone, amount, location, cast_name, options, memo, order_date, fiscal_year, fiscal_month, company_id, store_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, name, normalizedPhone, amount, location, cast, options, memo, orderDate, fiscalYear, fiscalMonth, companyId, storeId]
        );
      }

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: `${orders.length - errors.length}件のデータをインポートしました`,
        imported: orders.length - errors.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error: any) {
    console.error('インポートエラー:', error);
    res.status(500).json({ error: 'データのインポートに失敗しました', details: error.message });
  }
};

// 顧客の受注履歴を取得
export const getCustomerOrders = async (req: TenantRequest, res: Response) => {
  try {
    const { customerId } = req.params;
    const { fiscalYear, fiscalMonth } = req.query;
    const { companyId, storeId } = req.tenant || {};

    if (!companyId || !storeId) {
      return res.status(403).json({ error: 'テナント情報が必要です' });
    }

    let query = 'SELECT * FROM orders WHERE user_id = ? AND company_id = ? AND store_id = ?';
    const params: any[] = [customerId, companyId, storeId];

    if (fiscalYear) {
      query += ' AND fiscal_year = ?';
      params.push(fiscalYear);
    }

    if (fiscalMonth) {
      query += ' AND fiscal_month = ?';
      params.push(fiscalMonth);
    }

    query += ' ORDER BY order_date DESC';

    const orders = await db.all(query, params);

    res.json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error: any) {
    console.error('受注履歴取得エラー:', error);
    res.status(500).json({ error: '受注履歴の取得に失敗しました', details: error.message });
  }
};

// 年度・月ごとの受注統計
export const getOrderStatistics = async (req: TenantRequest, res: Response) => {
  try {
    const { fiscalYear, fiscalMonth } = req.query;
    const { companyId, storeId } = req.tenant || {};

    if (!companyId || !storeId) {
      return res.status(403).json({ error: 'テナント情報が必要です' });
    }

    let query = `
      SELECT 
        fiscal_year,
        fiscal_month,
        COUNT(*) as order_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        COUNT(DISTINCT user_id) as unique_customers
      FROM orders
      WHERE company_id = ? AND store_id = ?
    `;

    const params: any[] = [companyId, storeId];

    if (fiscalYear) {
      query += ' AND fiscal_year = ?';
      params.push(fiscalYear);
    }

    if (fiscalMonth) {
      query += ' AND fiscal_month = ?';
      params.push(fiscalMonth);
    }

    query += ' GROUP BY fiscal_year, fiscal_month ORDER BY fiscal_year DESC, fiscal_month DESC';

    const statistics = await db.all(query, params);

    res.json({
      success: true,
      statistics,
    });
  } catch (error: any) {
    console.error('統計取得エラー:', error);
    res.status(500).json({ error: '統計の取得に失敗しました', details: error.message });
  }
};
