import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import fs from 'fs';
import pool from '../config/database';

const router = Router();
const upload = multer({ dest: '/tmp/' });

// Helper function to safely parse integers
const safeParseInt = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = parseInt(String(value));
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper function to safely parse floats
const safeParseFloat = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper function to parse time string (e.g., "16:10" or "16：10")
const parseTimeString = (timeStr: string, businessDate: string): string | null => {
  if (!timeStr || !businessDate) return null;
  
  // Convert full-width characters to half-width
  const normalized = String(timeStr)
    .replace(/：/g, ':')  // Full-width colon
    .replace(/；/g, ':')  // Full-width semicolon
    .replace(/[\uFF10-\uFF19]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)) // Full-width digits
    .trim();
  
  // Check if it's "おわり" or similar
  if (normalized === 'おわり' || normalized === '終わり' || normalized === '') {
    return null;
  }
  
  // Parse time - handle both "HH:MM" and "HHMM" formats
  let hour: number;
  let minute: number;
  
  const timeMatch = normalized.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    hour = parseInt(timeMatch[1]);
    minute = parseInt(timeMatch[2]);
  } else {
    // Try HHMM format (e.g., "1610")
    const plainMatch = normalized.match(/^(\d{1,4})$/);
    if (plainMatch) {
      const timeNum = plainMatch[1].padStart(4, '0');
      hour = parseInt(timeNum.substring(0, 2));
      minute = parseInt(timeNum.substring(2, 4));
    } else {
      return null;
    }
  }
  
  // Validate minute
  if (minute < 0 || minute > 59) {
    return null;
  }
  
  // Handle hours >= 24 (next day times)
  // For example, 25:10 means 1:10 AM the next day
  let dateOffset = 0;
  if (hour >= 24) {
    dateOffset = Math.floor(hour / 24);
    hour = hour % 24;
  }
  
  // Validate hour
  if (hour < 0 || hour > 23) {
    return null;
  }
  
  // Calculate the actual date if we need to add days
  if (dateOffset > 0) {
    const date = new Date(businessDate);
    date.setDate(date.getDate() + dateOffset);
    const adjustedDate = date.toISOString().split('T')[0];
    return `${adjustedDate} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  }
  
  return `${businessDate} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
};

// Helper function to find or create customer
const findOrCreateCustomer = async (name: string, phone: string): Promise<number> => {
  if (!phone) {
    throw new Error('電話番号が必要です');
  }
  
  // Normalize phone number (remove hyphens and spaces)
  const normalizedPhone = phone.replace(/[-\s]/g, '');
  
  // Try to find existing customer by phone
  const [existing]: any = await pool.query(
    'SELECT id FROM users WHERE phone_number = ? OR phone_number = ?',
    [phone, normalizedPhone]
  );
  
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  // Create new customer
  const [result]: any = await pool.query(
    `INSERT INTO users (name, phone_number, created_at) VALUES (?, ?, NOW())`,
    [name || '名無し', phone]
  );
  
  return result.insertId;
};

// Helper function to find cast by name
const findCastByName = async (castName: string): Promise<number | null> => {
  if (!castName) return null;
  
  const [casts]: any = await pool.query(
    'SELECT id FROM casts WHERE name = ? OR katakana = ? LIMIT 1',
    [castName, castName]
  );
  
  return casts.length > 0 ? casts[0].id : null;
};

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    
    let query = `
      SELECT o.*, 
             u.name as customer_name,
             u.phone_number as customer_phone,
             c.name as cast_name,
             c.name as cast_display_name
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN casts c ON o.cast_id = c.id
    `;
    
    const params: any[] = [];
    
    if (date) {
      query += ` WHERE DATE(o.business_date) = ?`;
      params.push(date);
    }
    
    query += ` ORDER BY o.order_datetime DESC`;
    
    const [orders] = await pool.query(query, params);
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const [orders]: any = await pool.query(`
      SELECT o.*, 
             u.name as customer_name,
             u.phone_number as customer_phone,
             c.name as cast_name
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN casts c ON o.cast_id = c.id
      WHERE o.id = ?
    `, [req.params.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(orders[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Import orders from Excel
router.post('/import', upload.single('file'), async (req, res) => {
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];
  const { year, month } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがアップロードされていません' });
    }

    if (!year || !month) {
      return res.status(400).json({ error: '年月の指定が必要です' });
    }

    const workbook = XLSX.readFile(req.file.path);
    
    // Process sheets from 1日 to 31日
    for (let day = 1; day <= 31; day++) {
      const sheetName = `${day}日`;
      
      if (!workbook.SheetNames.includes(sheetName)) {
        continue;
      }
      
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 2 });
      
      // Business date for this sheet
      const businessDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Process rows
      for (let i = 0; i < Math.min(data.length, 84); i++) {
        const row: any = data[i];
        
        try {
          // Column mapping (0-indexed)
          // C=2, D=3, E=4, F=5, I=8, J=9, K=10, L=11, M=12, N=13, O=14, P=15, Q=16, R=17, S=18, T=19, U=20, V=21, W=22, X=23, Y=24, AA=26, AB=27, AC=28
          
          const castName = row[2]; // C: キャスト
          const customerName = row[3]; // D: 客の名前
          const customerPhone = row[4]; // E: 客電話
          const orderer = row[5]; // F: 受注
          const customerType = row[8]; // I: 属性
          const paymentMethod = row[9]; // J: カード
          const customerNotes = row[10]; // K: お客情報
          const startTimeStr = row[11]; // L: イン
          const durationValue = row[12]; // M: コース
          const endTimeStr = row[13]; // N: アウト
          const discountType = row[14]; // O: 割引種類
          const locationName = row[15]; // P: 場所（ホテル、自宅）
          const driverSend = row[16]; // Q: 送ドライバー
          const driverPickup = row[17]; // R: 迎ドライバー
          const totalPrice = row[18]; // S: 現金売上
          const castCommission = row[19]; // T: バック
          const nominationFee = row[20]; // U: 指名料
          const discount = row[21]; // V: 割引
          const transportationFee = row[22]; // W: 交通費
          const optionFee = row[23]; // X: オプション
          const extensionFee = row[24]; // Y: 延長
          const storeCommission = row[26]; // AA: 店落ち
          const miscExpenses = row[27]; // AB: 交通費
          const collectionAmount = row[28]; // AC: 回収
          
          // Skip if no cast name or customer phone
          if (!castName || !customerPhone) {
            continue;
          }
          
          // Find or create customer
          const customerId = await findOrCreateCustomer(customerName, customerPhone);
          
          // Find cast
          const castId = await findCastByName(castName);
          if (!castId) {
            skipped++;
            errors.push(`${businessDate} ${castName}: キャストが見つかりません`);
            continue;
          }
          
          // Parse start time
          const startTime = parseTimeString(startTimeStr, businessDate);
          if (!startTime) {
            skipped++;
            errors.push(`${businessDate} ${castName}: 開始時刻が不正です (${startTimeStr})`);
            continue;
          }
          
          // Parse end time
          const endTime = parseTimeString(endTimeStr, businessDate);
          
          // Parse duration and numeric values safely
          const duration = safeParseInt(durationValue, 0);
          const basePriceVal = safeParseInt(totalPrice, 0);
          const nominationFeeVal = safeParseInt(nominationFee, 0);
          const transportationFeeVal = safeParseInt(transportationFee, 0);
          const optionFeeVal = safeParseInt(optionFee, 0);
          const extensionFeeVal = safeParseInt(extensionFee, 0);
          const discountVal = safeParseInt(discount, 0);
          const castCommissionVal = safeParseInt(castCommission, 0);
          const storeCommissionVal = safeParseInt(storeCommission, 0);
          const miscExpensesVal = safeParseInt(miscExpenses, 0);
          const collectionAmountVal = safeParseInt(collectionAmount, 0);
          const cashAmountVal = 0; // Not used in this sheet
          
          // Determine location type
          let locationType = 'other';
          if (locationName) {
            const locationStr = String(locationName).toLowerCase();
            if (locationStr.includes('ホテル') || locationStr.includes('hotel')) {
              locationType = 'hotel';
            } else if (locationStr.includes('自宅') || locationStr.includes('home')) {
              locationType = 'home';
            }
          }
          
          // Generate order number
          const orderNumber = `ORD-${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}-${String(i + 3).padStart(3, '0')}`;
          
          // Check if order already exists
          const [existingOrders]: any = await pool.query(
            'SELECT id FROM orders WHERE order_number = ?',
            [orderNumber]
          );
          
          if (existingOrders.length > 0) {
            // Update existing order
            await pool.query(
              `UPDATE orders SET
                business_date = ?,
                order_datetime = ?,
                store_id = '1',
                customer_id = ?,
                cast_id = ?,
                start_time = ?,
                end_time = ?,
                duration = ?,
                location_type = ?,
                location_name = ?,
                base_price = ?,
                nomination_fee = ?,
                transportation_fee = ?,
                option_fee = ?,
                extension_fee = ?,
                discount = ?,
                total_price = ?,
                cast_commission = ?,
                store_commission = ?,
                misc_expenses = ?,
                orderer = ?,
                customer_type = ?,
                payment_method = ?,
                customer_notes = ?,
                discount_type = ?,
                driver_send = ?,
                driver_pickup = ?,
                collection_amount = ?,
                cash_amount = ?,
                status = 'completed'
              WHERE id = ?`,
              [
                businessDate,
                startTime,
                customerId,
                castId,
                startTime,
                endTime,
                duration,
                locationType,
                locationName || '',
                basePriceVal,
                nominationFeeVal,
                transportationFeeVal,
                optionFeeVal,
                extensionFeeVal,
                discountVal,
                basePriceVal,
                castCommissionVal,
                storeCommissionVal,
                miscExpensesVal,
                orderer || '',
                customerType || '',
                paymentMethod || '',
                customerNotes || '',
                discountType || '',
                driverSend || '',
                driverPickup || '',
                collectionAmountVal,
                cashAmountVal,
                existingOrders[0].id
              ]
            );
            updated++;
          } else {
            // Insert new order
            await pool.query(
              `INSERT INTO orders (
                order_number, business_date, order_datetime, store_id, customer_id, cast_id,
                start_time, end_time, duration, location_type, location_name,
                base_price, nomination_fee, transportation_fee, option_fee, extension_fee,
                discount, total_price, cast_commission, store_commission, misc_expenses,
                orderer, customer_type, payment_method,
                customer_notes, discount_type, driver_send, driver_pickup,
                collection_amount, cash_amount, status, created_at
              ) VALUES (?, ?, ?, '1', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW())`,
              [
                orderNumber,
                businessDate,
                startTime,
                customerId,
                castId,
                startTime,
                endTime,
                duration,
                locationType,
                locationName || '',
                basePriceVal,
                nominationFeeVal,
                transportationFeeVal,
                optionFeeVal,
                extensionFeeVal,
                discountVal,
                basePriceVal,
                castCommissionVal,
                storeCommissionVal,
                miscExpensesVal,
                orderer || '',
                customerType || '',
                paymentMethod || '',
                customerNotes || '',
                discountType || '',
                driverSend || '',
                driverPickup || '',
                collectionAmountVal,
                cashAmountVal
              ]
            );
            imported++;
          }
        } catch (error: any) {
          skipped++;
          errors.push(`${businessDate} Row ${i + 3}: ${error.message}`);
        }
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'インポートが完了しました',
      imported,
      updated,
      skipped,
      errors: errors.slice(0, 100) // Limit errors to 100
    });
  } catch (error: any) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    res.status(500).json({ error: error.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const {
      order_number,
      business_date,
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
      is_nomination
    } = req.body;

    const [result]: any = await pool.query(`
      INSERT INTO orders (
        order_number, business_date, order_datetime, store_id, customer_id, cast_id,
        start_time, duration, location_type, location_name, address,
        base_price, nomination_fee, transportation_fee, option_fee, discount, total_price,
        options, memo, is_nomination, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `, [
      order_number, business_date, order_datetime, store_id, customer_id, cast_id,
      start_time, duration, location_type, location_name, address,
      base_price, nomination_fee, transportation_fee, option_fee, discount, total_price,
      JSON.stringify(options), memo, is_nomination
    ]);

    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const {
      business_date,
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
      status
    } = req.body;

    await pool.query(`
      UPDATE orders SET
        business_date = ?,
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
        status = ?
      WHERE id = ?
    `, [
      business_date, start_time, duration, location_type, location_name, address,
      base_price, nomination_fee, transportation_fee, option_fee, discount, total_price,
      JSON.stringify(options), memo, status, req.params.id
    ]);

    res.json({ id: req.params.id, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
router.put('/:id/cancel', async (req, res) => {
  try {
    await pool.query(`
      UPDATE orders SET status = 'cancelled' WHERE id = ?
    `, [req.params.id]);
    
    res.json({ success: true, message: 'Order cancelled' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
