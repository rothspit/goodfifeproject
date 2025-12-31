import { Request, Response } from 'express';
import db from '../config/database';

// CTI通話ログ作成 (着信時)
export const createCallLog = async (req: Request, res: Response) => {
  const {
    call_id,
    phone_number,
    direction,
    call_status,
    store_id,
    dialpad_data
  } = req.body;

  if (!call_id || !phone_number || !direction) {
    return res.status(400).json({ message: '必須項目が不足しています' });
  }

  try {
    // 電話番号から顧客を検索
    db.get(
      `SELECT id, name, phone_number, email, total_orders, last_order_date
      FROM users
      WHERE phone_number LIKE ?
      LIMIT 1`,
      [`%${phone_number}%`],
      (err: any, customer: any) => {
        const customerId = customer?.id || null;

        // 通話ログを作成
        db.run(
          `INSERT INTO cti_call_logs (
            call_id, phone_number, direction, call_status,
            customer_id, store_id, call_started_at, dialpad_data
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
          [
            call_id,
            phone_number,
            direction,
            call_status || 'ringing',
            customerId,
            store_id,
            JSON.stringify(dialpad_data || {})
          ],
          function(this: any, err2: any) {
            if (err2) {
              console.error('通話ログ作成エラー:', err2);
              return res.status(500).json({ message: 'データベースエラー' });
            }

            // 顧客情報と共に返す
            res.status(201).json({
              success: true,
              callLogId: this.lastID,
              customer: customer || null,
              isNewCustomer: !customer
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('通話ログ作成エラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// CTI通話ログ更新 (通話終了時)
export const updateCallLog = async (req: Request, res: Response) => {
  const { call_id } = req.params;
  const {
    call_status,
    call_answered_at,
    call_ended_at,
    call_duration,
    recording_url,
    call_notes
  } = req.body;

  try {
    db.run(
      `UPDATE cti_call_logs SET
        call_status = COALESCE(?, call_status),
        call_answered_at = COALESCE(?, call_answered_at),
        call_ended_at = COALESCE(?, call_ended_at),
        call_duration = COALESCE(?, call_duration),
        recording_url = COALESCE(?, recording_url),
        call_notes = COALESCE(?, call_notes),
        updated_at = NOW()
      WHERE call_id = ?`,
      [
        call_status,
        call_answered_at,
        call_ended_at,
        call_duration,
        recording_url,
        call_notes,
        call_id
      ],
      function(this: any, err: any) {
        if (err) {
          console.error('通話ログ更新エラー:', err);
          return res.status(500).json({ message: 'データベースエラー' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: '通話ログが見つかりません' });
        }

        res.json({
          success: true,
          message: '通話ログが更新されました'
        });
      }
    );
  } catch (error) {
    console.error('通話ログ更新エラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// Dialpad Webhook受信エンドポイント
export const handleDialpadWebhook = async (req: Request, res: Response) => {
  const webhookData = req.body;

  console.log('Dialpad Webhook受信:', JSON.stringify(webhookData, null, 2));

  try {
    const {
      event_type,
      call_id,
      caller_number,
      callee_number,
      call_state,
      office_id
    } = webhookData;

    // イベントタイプに応じて処理
    switch (event_type) {
      case 'call.initiated':
        // 着信開始
        try {
          db.run(
            `INSERT INTO cti_call_logs (
              call_id, phone_number, direction, call_status,
              customer_id, store_id, call_started_at, dialpad_data
            ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [call_id, caller_number, 'inbound', 'ringing', null, null, JSON.stringify(webhookData)],
            (err: any) => {
              if (err) {
                console.error('通話ログ作成エラー:', err);
              }
            }
          );
        } catch (error) {
          console.error('Webhook処理エラー:', error);
        }
        res.json({ success: true, message: '着信を記録しました' });
        break;

      case 'call.answered':
        // 通話開始
        try {
          db.run(
            `UPDATE cti_call_logs SET
              call_status = ?,
              call_answered_at = ?
            WHERE call_id = ?`,
            ['answered', new Date().toISOString(), call_id],
            (err: any) => {
              if (err) {
                console.error('通話ログ更新エラー:', err);
              }
            }
          );
        } catch (error) {
          console.error('Webhook処理エラー:', error);
        }
        res.json({ success: true, message: '通話開始を記録しました' });
        break;

      case 'call.ended':
        // 通話終了
        try {
          db.run(
            `UPDATE cti_call_logs SET
              call_status = ?,
              call_ended_at = ?,
              call_duration = ?
            WHERE call_id = ?`,
            ['completed', new Date().toISOString(), webhookData.call_duration, call_id],
            (err: any) => {
              if (err) {
                console.error('通話ログ更新エラー:', err);
              }
            }
          );
        } catch (error) {
          console.error('Webhook処理エラー:', error);
        }
        res.json({ success: true, message: '通話終了を記録しました' });
        break;

      default:
        res.json({ success: true, message: 'イベントを受信しました' });
    }
  } catch (error) {
    console.error('Webhook処理エラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// 通話履歴取得
export const getCallLogs = async (req: Request, res: Response) => {
  const { store_id, customer_id, date_from, date_to, limit = 50 } = req.query;

  let query = `
    SELECT 
      cl.*,
      u.name as customer_name,
      u.email as customer_email
    FROM cti_call_logs cl
    LEFT JOIN users u ON cl.customer_id = u.id
    WHERE 1=1
  `;

  const params: any[] = [];

  if (store_id) {
    query += ' AND cl.store_id = ?';
    params.push(store_id);
  }

  if (customer_id) {
    query += ' AND cl.customer_id = ?';
    params.push(customer_id);
  }

  if (date_from) {
    query += ' AND DATE(cl.call_started_at) >= ?';
    params.push(date_from);
  }

  if (date_to) {
    query += ' AND DATE(cl.call_started_at) <= ?';
    params.push(date_to);
  }

  query += ' ORDER BY cl.call_started_at DESC LIMIT ?';
  params.push(Number(limit));

  try {
    db.all(query, params, (err: any, logs: any) => {
      if (err) {
        console.error('通話履歴取得エラー:', err);
        return res.status(500).json({ message: 'データベースエラー' });
      }

      res.json({
        success: true,
        logs: logs || []
      });
    });
  } catch (error) {
    console.error('通話履歴取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// Dialpad設定取得
export const getDialpadSettings = async (req: Request, res: Response) => {
  const { store_id } = req.query;

  if (!store_id) {
    return res.status(400).json({ message: '店舗IDは必須です' });
  }

  try {
    db.get(
      `SELECT * FROM dialpad_webhook_settings WHERE store_id = ?`,
      [store_id],
      (err: any, settings: any) => {
        if (err) {
          console.error('設定取得エラー:', err);
          return res.status(500).json({ message: 'データベースエラー' });
        }

        res.json({
          success: true,
          settings: settings || null
        });
      }
    );
  } catch (error) {
    console.error('設定取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};

// Dialpad設定保存
export const saveDialpadSettings = async (req: Request, res: Response) => {
  const {
    store_id,
    api_key,
    webhook_secret,
    office_id,
    auto_popup,
    auto_create_customer
  } = req.body;

  if (!store_id) {
    return res.status(400).json({ message: '店舗IDは必須です' });
  }

  try {
    // 既存設定確認
    db.get(
      `SELECT id FROM dialpad_webhook_settings WHERE store_id = ?`,
      [store_id],
      (err: any, existing: any) => {
        if (existing) {
          // 更新
          db.run(
            `UPDATE dialpad_webhook_settings SET
              api_key = COALESCE(?, api_key),
              webhook_secret = COALESCE(?, webhook_secret),
              office_id = COALESCE(?, office_id),
              auto_popup = COALESCE(?, auto_popup),
              auto_create_customer = COALESCE(?, auto_create_customer),
              updated_at = NOW()
            WHERE store_id = ?`,
            [api_key, webhook_secret, office_id, auto_popup, auto_create_customer, store_id],
            (err2: any) => {
              if (err2) {
                console.error('設定更新エラー:', err2);
                return res.status(500).json({ message: 'データベースエラー' });
              }

              res.json({
                success: true,
                message: '設定が更新されました'
              });
            }
          );
        } else {
          // 新規作成
          db.run(
            `INSERT INTO dialpad_webhook_settings
            (store_id, api_key, webhook_secret, office_id, auto_popup, auto_create_customer)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [store_id, api_key, webhook_secret, office_id, auto_popup, auto_create_customer],
            (err2: any) => {
              if (err2) {
                console.error('設定作成エラー:', err2);
                return res.status(500).json({ message: 'データベースエラー' });
              }

              res.status(201).json({
                success: true,
                message: '設定が作成されました'
              });
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('設定保存エラー:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
};
