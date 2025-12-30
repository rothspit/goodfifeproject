import { Request, Response } from 'express';
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');

// 本日の受注リスト取得
export const getTodayOrders = (req: Request, res: Response) => {
  const db = new Database(dbPath);
  
  try {
    const { store_id } = req.query;
    
    // 今日の日付を取得（9時を基準にする）
    const now = new Date();
    const adjustedTime = new Date(now.getTime() - 9 * 60 * 60 * 1000); // 9時間マイナス
    const today = adjustedTime.toISOString().split('T')[0];
    
    let query = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.phone_number,
        c.name as cast_name,
        s.name as store_name
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN casts c ON o.cast_id = c.id
      LEFT JOIN stores s ON o.store_id = s.id
      WHERE o.order_date = ?
    `;
    
    const params: any[] = [today];
    
    if (store_id) {
      query += ' AND o.store_id = ?';
      params.push(store_id);
    }
    
    query += ' ORDER BY o.start_time ASC';
    
    const orders = db.prepare(query).all(...params);
    
    res.json({
      success: true,
      date: today,
      orders
    });
  } catch (error: any) {
    console.error('Error fetching today orders:', error);
    res.status(500).json({
      success: false,
      message: '受注リストの取得に失敗しました',
      error: error.message
    });
  } finally {
    db.close();
  }
};

// 顧客情報取得（電話番号検索）
export const getCustomerByPhone = (req: Request, res: Response) => {
  const db = new Database(dbPath);
  
  try {
    const { phone_number } = req.params;
    
    // 顧客情報取得
    const customer = db.prepare(`
      SELECT 
        id, phone_number, name, email, role,
        customer_type, home_address, company_name,
        total_orders, total_spent, last_visit_date, notes
      FROM users
      WHERE phone_number = ?
    `).get(phone_number);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: '顧客が見つかりません'
      });
    }
    
    // 予約履歴取得
    const reservations = db.prepare(`
      SELECT 
        o.*,
        c.name as cast_name,
        s.name as store_name
      FROM orders o
      LEFT JOIN casts c ON o.cast_id = c.id
      LEFT JOIN stores s ON o.store_id = s.id
      WHERE o.customer_id = ?
      ORDER BY o.order_datetime DESC
      LIMIT 20
    `).all(customer.id);
    
    // 顧客メモ取得
    const notes = db.prepare(`
      SELECT * FROM customer_notes
      WHERE customer_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(customer.id);
    
    res.json({
      success: true,
      customer,
      reservations,
      notes
    });
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: '顧客情報の取得に失敗しました',
      error: error.message
    });
  } finally {
    db.close();
  }
};

// 本日出勤のキャスト取得
export const getTodayWorkingCasts = (req: Request, res: Response) => {
  const db = new Database(dbPath);
  
  try {
    const { store_id } = req.query;
    
    const now = new Date();
    const adjustedTime = new Date(now.getTime() - 9 * 60 * 60 * 1000);
    const today = adjustedTime.toISOString().split('T')[0];
    
    let query = `
      SELECT DISTINCT
        c.id,
        c.name,
        c.age,
        c.height,
        c.measurements,
        c.nomination_fee,
        c.profile_image,
        cs.date,
        cs.start_time,
        cs.end_time,
        cs.is_available
      FROM casts c
      INNER JOIN cast_schedules cs ON c.id = cs.cast_id
      WHERE cs.date = ? AND cs.is_available = 1
    `;
    
    const params: any[] = [today];
    
    if (store_id) {
      query += ' AND c.store_id = ?';
      params.push(store_id);
    }
    
    query += ' ORDER BY c.name ASC';
    
    const casts = db.prepare(query).all(...params);
    
    // 各キャストの予約状況を取得
    const castsWithSchedule = casts.map((cast: any) => {
      const bookings = db.prepare(`
        SELECT start_time, duration
        FROM orders
        WHERE cast_id = ? AND order_date = ? AND status != 'cancelled'
        ORDER BY start_time ASC
      `).all(cast.id, today);
      
      return {
        ...cast,
        bookings
      };
    });
    
    res.json({
      success: true,
      date: today,
      casts: castsWithSchedule
    });
  } catch (error: any) {
    console.error('Error fetching working casts:', error);
    res.status(500).json({
      success: false,
      message: '出勤キャストの取得に失敗しました',
      error: error.message
    });
  } finally {
    db.close();
  }
};

// 料金プラン取得
export const getPricePlans = (req: Request, res: Response) => {
  const db = new Database(dbPath);
  
  try {
    const { store_id, cast_id } = req.query;
    
    let query = 'SELECT * FROM price_plans WHERE 1=1';
    const params: any[] = [];
    
    if (store_id) {
      query += ' AND store_id = ?';
      params.push(store_id);
    }
    
    if (cast_id) {
      query += ' AND (cast_id = ? OR cast_id IS NULL)';
      params.push(cast_id);
    }
    
    query += ' ORDER BY duration ASC';
    
    const plans = db.prepare(query).all(...params);
    
    res.json({
      success: true,
      plans
    });
  } catch (error: any) {
    console.error('Error fetching price plans:', error);
    res.status(500).json({
      success: false,
      message: '料金プランの取得に失敗しました',
      error: error.message
    });
  } finally {
    db.close();
  }
};

// ホテルリスト取得
export const getHotels = (req: Request, res: Response) => {
  const db = new Database(dbPath);
  
  try {
    const { store_id } = req.query;
    
    let query = 'SELECT * FROM hotels WHERE 1=1';
    const params: any[] = [];
    
    if (store_id) {
      query += ' AND store_id = ?';
      params.push(store_id);
    }
    
    query += ' ORDER BY name ASC';
    
    const hotels = db.prepare(query).all(...params);
    
    res.json({
      success: true,
      hotels
    });
  } catch (error: any) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({
      success: false,
      message: 'ホテルリストの取得に失敗しました',
      error: error.message
    });
  } finally {
    db.close();
  }
};

// 受注作成・更新
export const createOrUpdateOrder = (req: Request, res: Response) => {
  const db = new Database(dbPath);
  
  try {
    const {
      id,
      order_date,
      order_datetime,
      store_id,
      customer_id,
      cast_id,
      start_time,
      duration,
      location_type,
      location_name,
      address,
      base_price,
      nomination_fee,
      transportation_fee,
      option_fee,
      discount,
      total_price,
      options,
      memo,
      status,
      is_nomination
    } = req.body;
    
    if (id) {
      // 更新
      const stmt = db.prepare(`
        UPDATE orders SET
          order_date = ?,
          order_datetime = ?,
          store_id = ?,
          customer_id = ?,
          cast_id = ?,
          start_time = ?,
          duration = ?,
          location_type = ?,
          location_name = ?,
          address = ?,
          base_price = ?,
          nomination_fee = ?,
          transportation_fee = ?,
          option_fee = ?,
          discount = ?,
          total_price = ?,
          options = ?,
          memo = ?,
          status = ?,
          is_nomination = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      stmt.run(
        order_date,
        order_datetime,
        store_id,
        customer_id,
        cast_id,
        start_time,
        duration,
        location_type,
        location_name,
        address,
        base_price,
        nomination_fee || 0,
        transportation_fee || 0,
        option_fee || 0,
        discount || 0,
        total_price,
        options ? JSON.stringify(options) : null,
        memo,
        status,
        is_nomination ? 1 : 0,
        id
      );
      
      res.json({
        success: true,
        message: '受注情報を更新しました',
        order_id: id
      });
    } else {
      // 新規作成
      const stmt = db.prepare(`
        INSERT INTO orders (
          order_date,
          order_datetime,
          store_id,
          customer_id,
          cast_id,
          start_time,
          duration,
          location_type,
          location_name,
          address,
          base_price,
          nomination_fee,
          transportation_fee,
          option_fee,
          discount,
          total_price,
          options,
          memo,
          status,
          is_nomination,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      
      const result = stmt.run(
        order_date,
        order_datetime,
        store_id,
        customer_id,
        cast_id,
        start_time,
        duration,
        location_type,
        location_name,
        address,
        base_price,
        nomination_fee || 0,
        transportation_fee || 0,
        option_fee || 0,
        discount || 0,
        total_price,
        options ? JSON.stringify(options) : null,
        memo,
        status || 'pending',
        is_nomination ? 1 : 0
      );
      
      // 顧客の利用回数・総額を更新
      db.prepare(`
        UPDATE users SET
          total_orders = total_orders + 1,
          total_spent = total_spent + ?,
          last_visit_date = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(total_price, customer_id);
      
      res.json({
        success: true,
        message: '受注を登録しました',
        order_id: result.lastInsertRowid
      });
    }
  } catch (error: any) {
    console.error('Error creating/updating order:', error);
    res.status(500).json({
      success: false,
      message: '受注の登録・更新に失敗しました',
      error: error.message
    });
  } finally {
    db.close();
  }
};

// 店舗一覧取得
export const getStores = (req: Request, res: Response) => {
  const db = new Database(dbPath);
  
  try {
    const stores = db.prepare('SELECT * FROM stores ORDER BY name ASC').all();
    
    res.json({
      success: true,
      stores
    });
  } catch (error: any) {
    console.error('Error fetching stores:', error);
    res.status(500).json({
      success: false,
      message: '店舗リストの取得に失敗しました',
      error: error.message
    });
  } finally {
    db.close();
  }
};
