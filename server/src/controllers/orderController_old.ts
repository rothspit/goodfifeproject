import { Request, Response } from 'express';
import db from '../config/database';

// 顧客検索 (電話番号)
export const searchCustomerByPhone = async (req: Request, res: Response) => {
  const { phone_number } = req.query;

  if (!phone_number) {
    return res.status(400).json({ message: '電話番号は必須です' });
  }

  try {
    // 電話番号から顧客を検索
    db.get(
      `SELECT 
        u.*,
        COUNT(DISTINCT o.id) as order_count,
        SUM(o.total_amount) as lifetime_value
      FROM users u
      LEFT JOIN orders o ON u.id = o.customer_id
      WHERE u.phone_number LIKE ?
      GROUP BY u.id`,
      [`%${phone_number}%`],
      async (err: any, customer: any) => {
        if (err) {
          console.error('顧客検索エラー:', err);
          return res.status(500).json({ message: 'データベースエラー' });
        }

        if (!customer) {
          return res.json({
            found: false,
            customer: null,
            message: '該当する顧客が見つかりません'
          });
        }

        // 最近の注文履歴を取得
        db.all(
          `SELECT 
            o.*,
            c.name as cast_name
          FROM orders o
          LEFT JOIN casts c ON o.cast_id = c.id
          WHERE o.customer_id = ?
          ORDER BY o.reservation_date DESC, o.reservation_time DESC
          LIMIT 10`,
          [customer.id],
          (err2: any, recentOrders: any) => {
            if (err2) {
              console.error('注文履歴取得エラー:', err2);
            }

            // 顧客メモを取得
            db.all(
              `SELECT * FROM customer_notes
              WHERE customer_id = ?
              ORDER BY created_at DESC
              LIMIT 5`,
              [customer.id],
              (err3: any, notes: any) => {
                if (err3) {
                  console.error('メモ取得エラー:', err3);
                }

                res.json({
                  found: true,
                  customer: {
                    ...customer,
                    recentOrders: recentOrders || [],
                    notes: notes || []
                  }
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('顧客検索エラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// キャストとの利用履歴確認
export const getCustomerCastHistory = async (req: Request, res: Response) => {
  const { customer_id, cast_id } = req.query;

  if (!customer_id || !cast_id) {
    return res.status(400).json({ message: '顧客IDとキャストIDは必須です' });
  }

  try {
    db.get(
      `SELECT * FROM customer_cast_history
      WHERE customer_id = ? AND cast_id = ?`,
      [customer_id, cast_id],
      (err: any, history: any) => {
        if (err) {
          console.error('利用履歴取得エラー:', err);
          return res.status(500).json({ message: 'データベースエラー' });
        }

        res.json({
          isFirstTime: !history,
          visitCount: history?.visit_count || 0,
          lastVisit: history?.last_visit_date || null,
          totalSpent: history?.total_spent || 0
        });
      }
    );
  } catch (error) {
    console.error('利用履歴取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// 受注作成
export const createOrder = async (req: Request, res: Response) => {
  const {
    store_id,
    customer_id,
    cast_id,
    reservation_date,
    reservation_time,
    duration,
    course_name,
    course_price,
    options,
    subtotal,
    discount = 0,
    total_amount,
    order_source,
    customer_request,
    admin_notes,
    call_id
  } = req.body;

  // バリデーション
  if (!store_id || !customer_id || !cast_id || !reservation_date || !reservation_time || !duration) {
    return res.status(400).json({ message: '必須項目が不足しています' });
  }

  try {
    // 受注番号生成 (例: ORD-20241213-0001)
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    db.get(
      `SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()`,
      [],
      async (err: any, result: any) => {
        if (err) {
          console.error('受注番号生成エラー:', err);
          return res.status(500).json({ message: 'データベースエラー' });
        }

        const orderNumber = `ORD-${today}-${String((result.count || 0) + 1).padStart(4, '0')}`;

        // 受注を作成
        db.run(
          `INSERT INTO orders (
            order_number, store_id, customer_id, cast_id,
            reservation_date, reservation_time, duration,
            course_name, course_price, options,
            subtotal, discount, total_amount,
            status, order_source, customer_request, admin_notes,
            call_id, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
          [
            orderNumber, store_id, customer_id, cast_id,
            reservation_date, reservation_time, duration,
            course_name, course_price, JSON.stringify(options),
            subtotal, discount, total_amount,
            order_source, customer_request, admin_notes,
            call_id, (req as any).user?.id
          ],
          function(this: any, err: any) {
            if (err) {
              console.error('受注作成エラー:', err);
              return res.status(500).json({ message: 'データベースエラー' });
            }

            const orderId = this.lastID;

            // 顧客統計更新
            db.run(
              `UPDATE users SET
                total_orders = total_orders + 1,
                total_spent = total_spent + ?,
                last_order_date = NOW()
              WHERE id = ?`,
              [total_amount, customer_id],
              (err2: any) => {
                if (err2) {
                  console.error('顧客統計更新エラー:', err2);
                }
              }
            );

            // 顧客-キャスト履歴更新
            db.get(
              `SELECT * FROM customer_cast_history
              WHERE customer_id = ? AND cast_id = ?`,
              [customer_id, cast_id],
              (err3: any, existing: any) => {
                if (existing) {
                  // 既存レコード更新
                  db.run(
                    `UPDATE customer_cast_history SET
                      visit_count = visit_count + 1,
                      last_visit_date = NOW(),
                      total_spent = total_spent + ?,
                      order_id = ?
                    WHERE customer_id = ? AND cast_id = ?`,
                    [total_amount, orderId, customer_id, cast_id]
                  );
                } else {
                  // 新規作成
                  db.run(
                    `INSERT INTO customer_cast_history
                    (customer_id, cast_id, order_id, visit_count, first_visit_date, last_visit_date, total_spent)
                    VALUES (?, ?, ?, 1, NOW(), NOW(), ?)`,
                    [customer_id, cast_id, orderId, total_amount]
                  );
                }
              }
            );

            // CTI通話ログ更新 (call_idがある場合)
            if (call_id) {
              db.run(
                `UPDATE cti_call_logs SET
                  order_id = ?,
                  customer_id = ?
                WHERE call_id = ?`,
                [orderId, customer_id, call_id]
              );
            }

            res.status(201).json({
              success: true,
              message: '受注が作成されました',
              order: {
                id: orderId,
                order_number: orderNumber
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('受注作成エラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// 受注一覧取得
export const getOrders = async (req: Request, res: Response) => {
  const { store_id, status, date_from, date_to, customer_id } = req.query;

  let query = `
    SELECT 
      o.*,
      u.name as customer_name,
      u.phone_number,
      c.name as cast_name
    FROM orders o
    LEFT JOIN users u ON o.customer_id = u.id
    LEFT JOIN casts c ON o.cast_id = c.id
    WHERE 1=1
  `;

  const params: any[] = [];

  if (store_id) {
    query += ' AND o.store_id = ?';
    params.push(store_id);
  }

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  if (date_from) {
    query += ' AND o.reservation_date >= ?';
    params.push(date_from);
  }

  if (date_to) {
    query += ' AND o.reservation_date <= ?';
    params.push(date_to);
  }

  if (customer_id) {
    query += ' AND o.customer_id = ?';
    params.push(customer_id);
  }

  query += ' ORDER BY o.reservation_date DESC, o.reservation_time DESC LIMIT 100';

  try {
    db.all(query, params, (err: any, orders: any) => {
      if (err) {
        console.error('受注一覧取得エラー:', err);
        return res.status(500).json({ message: 'データベースエラー' });
      }

      res.json({
        success: true,
        orders: orders || []
      });
    });
  } catch (error) {
    console.error('受注一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// 受注詳細取得
export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    db.get(
      `SELECT 
        o.*,
        u.name as customer_name,
        u.phone_number,
        u.email as customer_email,
        c.name as cast_name
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN casts c ON o.cast_id = c.id
      WHERE o.id = ?`,
      [id],
      (err: any, order: any) => {
        if (err) {
          console.error('受注詳細取得エラー:', err);
          return res.status(500).json({ message: 'データベースエラー' });
        }

        if (!order) {
          return res.status(404).json({ message: '受注が見つかりません' });
        }

        res.json({
          success: true,
          order
        });
      }
    );
  } catch (error) {
    console.error('受注詳細取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// 受注ステータス更新
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'ステータスは必須です' });
  }

  try {
    db.run(
      `UPDATE orders SET
        status = ?,
        admin_notes = COALESCE(?, admin_notes),
        updated_at = NOW()
      WHERE id = ?`,
      [status, admin_notes, id],
      function(this: any, err: any) {
        if (err) {
          console.error('ステータス更新エラー:', err);
          return res.status(500).json({ message: 'データベースエラー' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: '受注が見つかりません' });
        }

        res.json({
          success: true,
          message: 'ステータスが更新されました'
        });
      }
    );
  } catch (error) {
    console.error('ステータス更新エラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// 顧客メモ追加
export const addCustomerNote = async (req: Request, res: Response) => {
  const { customer_id, note_type, content } = req.body;

  if (!customer_id || !content) {
    return res.status(400).json({ message: '顧客IDとメモ内容は必須です' });
  }

  try {
    db.run(
      `INSERT INTO customer_notes (customer_id, note_type, content, created_by)
      VALUES (?, ?, ?, ?)`,
      [customer_id, note_type || 'general', content, (req as any).user?.id],
      function(this: any, err: any) {
        if (err) {
          console.error('メモ追加エラー:', err);
          return res.status(500).json({ message: 'データベースエラー' });
        }

        res.status(201).json({
          success: true,
          message: 'メモが追加されました',
          noteId: this.lastID
        });
      }
    );
  } catch (error) {
    console.error('メモ追加エラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
