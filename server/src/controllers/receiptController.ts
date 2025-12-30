import { Request, Response } from 'express';
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/database.sqlite');

interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    role: string;
  };
}

// 顧客が領収書申請を作成
export const createReceiptRequest = async (req: AuthRequest, res: Response) => {
  const db = new Database(dbPath);

  try {
    const { reservation_id, amount, name_on_receipt, address, email, phone_number, notes } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    if (!amount || !name_on_receipt) {
      return res.status(400).json({ message: '金額と宛名は必須です' });
    }

    const now = new Date();
    const requestDate = now.toISOString().split('T')[0];

    const stmt = db.prepare(`
      INSERT INTO receipt_requests 
      (user_id, reservation_id, request_date, amount, name_on_receipt, address, email, phone_number, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    const result = stmt.run(
      userId,
      reservation_id || null,
      requestDate,
      amount,
      name_on_receipt,
      address || null,
      email || null,
      phone_number || null,
      notes || null
    );

    res.status(201).json({
      message: '領収書の申請を受け付けました',
      request_id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error('領収書申請エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  } finally {
    db.close();
  }
};

// 顧客が自分の申請一覧を取得
export const getMyReceiptRequests = async (req: AuthRequest, res: Response) => {
  const db = new Database(dbPath);

  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    const stmt = db.prepare(`
      SELECT 
        id, reservation_id, request_date, amount, name_on_receipt, 
        address, email, phone_number, notes, status, 
        admin_notes, receipt_number, created_at, updated_at
      FROM receipt_requests
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);

    const requests = stmt.all(userId);

    res.json({ requests });
  } catch (error) {
    console.error('申請一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  } finally {
    db.close();
  }
};

// 顧客が自分の発行済み領収書一覧を取得
export const getMyReceipts = async (req: AuthRequest, res: Response) => {
  const db = new Database(dbPath);

  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    const stmt = db.prepare(`
      SELECT 
        id, receipt_number, amount, name_on_receipt, 
        address, issue_date, receipt_data, created_at
      FROM receipts
      WHERE user_id = ?
      ORDER BY issue_date DESC
    `);

    const receipts = stmt.all(userId);

    res.json({ receipts });
  } catch (error) {
    console.error('領収書一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  } finally {
    db.close();
  }
};

// 管理者が全申請を取得
export const getAllReceiptRequests = async (req: AuthRequest, res: Response) => {
  const db = new Database(dbPath);

  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }

    const { status } = req.query;

    let query = `
      SELECT 
        rr.id, rr.user_id, rr.reservation_id, rr.request_date, rr.amount, 
        rr.name_on_receipt, rr.address, rr.email, rr.phone_number, 
        rr.notes, rr.status, rr.admin_notes, rr.receipt_number,
        rr.created_at, rr.updated_at,
        u.name as user_name, u.phone_number as user_phone
      FROM receipt_requests rr
      LEFT JOIN users u ON rr.user_id = u.id
    `;

    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' WHERE rr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY rr.created_at DESC';

    const stmt = db.prepare(query);
    const requests = params.length > 0 ? stmt.all(...params) : stmt.all();

    res.json({ requests });
  } catch (error) {
    console.error('申請一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  } finally {
    db.close();
  }
};

// 管理者が申請を承認
export const approveReceiptRequest = async (req: AuthRequest, res: Response) => {
  const db = new Database(dbPath);

  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }

    const { id } = req.params;
    const { admin_notes } = req.body;
    const adminId = req.userId;

    const stmt = db.prepare(`
      UPDATE receipt_requests
      SET status = 'approved', 
          admin_notes = ?,
          approved_by = ?,
          approved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'pending'
    `);

    const result = stmt.run(admin_notes || null, adminId, id);

    if (result.changes === 0) {
      return res.status(404).json({ message: '申請が見つからないか、既に処理済みです' });
    }

    res.json({ message: '申請を承認しました' });
  } catch (error) {
    console.error('承認エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  } finally {
    db.close();
  }
};

// 管理者が申請を却下
export const rejectReceiptRequest = async (req: AuthRequest, res: Response) => {
  const db = new Database(dbPath);

  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }

    const { id } = req.params;
    const { admin_notes } = req.body;

    const stmt = db.prepare(`
      UPDATE receipt_requests
      SET status = 'rejected', 
          admin_notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'pending'
    `);

    const result = stmt.run(admin_notes || null, id);

    if (result.changes === 0) {
      return res.status(404).json({ message: '申請が見つからないか、既に処理済みです' });
    }

    res.json({ message: '申請を却下しました' });
  } catch (error) {
    console.error('却下エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  } finally {
    db.close();
  }
};

// 管理者が領収書を発行
export const issueReceipt = async (req: AuthRequest, res: Response) => {
  const db = new Database(dbPath);

  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }

    const { id } = req.params;
    const adminId = req.userId;

    // 申請情報を取得
    const requestStmt = db.prepare('SELECT * FROM receipt_requests WHERE id = ? AND status = ?');
    const request = requestStmt.get(id, 'approved');

    if (!request) {
      return res.status(404).json({ message: '承認済みの申請が見つかりません' });
    }

    // 領収書番号を生成 (例: R20251211-0001)
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count FROM receipts 
      WHERE substr(receipt_number, 1, 9) = ?
    `);
    const { count } = countStmt.get(`R${dateStr}`);
    const receiptNumber = `R${dateStr}-${String(count + 1).padStart(4, '0')}`;

    // 領収書データを生成（HTML形式）
    const receiptData = generateReceiptHTML({
      receipt_number: receiptNumber,
      issue_date: now.toISOString().split('T')[0],
      name_on_receipt: request.name_on_receipt,
      address: request.address,
      amount: request.amount,
    });

    // receiptsテーブルに挿入
    const receiptStmt = db.prepare(`
      INSERT INTO receipts 
      (receipt_number, request_id, user_id, reservation_id, amount, name_on_receipt, address, issue_date, issued_by, receipt_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    receiptStmt.run(
      receiptNumber,
      request.id,
      request.user_id,
      request.reservation_id,
      request.amount,
      request.name_on_receipt,
      request.address,
      now.toISOString().split('T')[0],
      adminId,
      receiptData
    );

    // 申請のステータスを更新
    const updateStmt = db.prepare(`
      UPDATE receipt_requests
      SET status = 'issued',
          receipt_number = ?,
          issued_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(receiptNumber, id);

    res.json({
      message: '領収書を発行しました',
      receipt_number: receiptNumber,
    });
  } catch (error) {
    console.error('発行エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  } finally {
    db.close();
  }
};

// 領収書番号で領収書を取得
export const getReceiptByNumber = async (req: Request, res: Response) => {
  const db = new Database(dbPath);

  try {
    const { receipt_number } = req.params;

    const stmt = db.prepare(`
      SELECT 
        r.*,
        u.name as user_name,
        u.phone_number as user_phone
      FROM receipts r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.receipt_number = ?
    `);

    const receipt = stmt.get(receipt_number);

    if (!receipt) {
      return res.status(404).json({ message: '領収書が見つかりません' });
    }

    res.json({ receipt });
  } catch (error) {
    console.error('領収書取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  } finally {
    db.close();
  }
};

// 領収書HTML生成
function generateReceiptHTML(data: {
  receipt_number: string;
  issue_date: string;
  name_on_receipt: string;
  address: string | null;
  amount: number;
}): string {
  const amountStr = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(data.amount);

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>領収書 - ${data.receipt_number}</title>
  <style>
    body {
      font-family: 'Noto Sans JP', 'MS Gothic', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      background: white;
    }
    .receipt-container {
      border: 2px solid #333;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 36px;
      margin: 0;
      font-weight: bold;
    }
    .receipt-number {
      text-align: right;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .recipient {
      margin-bottom: 30px;
    }
    .recipient-name {
      font-size: 24px;
      font-weight: bold;
      border-bottom: 1px solid #333;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .amount-section {
      text-align: center;
      margin: 40px 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .amount {
      font-size: 32px;
      font-weight: bold;
      margin: 10px 0;
    }
    .details {
      margin: 30px 0;
    }
    .details-row {
      display: flex;
      margin: 10px 0;
      border-bottom: 1px solid #ddd;
      padding: 10px 0;
    }
    .details-label {
      width: 150px;
      font-weight: bold;
    }
    .details-value {
      flex: 1;
    }
    .footer {
      margin-top: 60px;
      text-align: right;
    }
    .company-info {
      margin-top: 20px;
      text-align: right;
    }
    .stamp-area {
      width: 80px;
      height: 80px;
      border: 1px solid #999;
      margin: 10px 0 10px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }
    @media print {
      body {
        margin: 0;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="receipt-number">
      領収書番号: ${data.receipt_number}
    </div>

    <div class="header">
      <h1>領収書</h1>
    </div>

    <div class="recipient">
      <div class="recipient-name">
        ${data.name_on_receipt} 様
      </div>
      ${data.address ? `<div>${data.address}</div>` : ''}
    </div>

    <div class="amount-section">
      <div>お支払い金額</div>
      <div class="amount">${amountStr}</div>
      <div>上記の通り、正に領収いたしました</div>
    </div>

    <div class="details">
      <div class="details-row">
        <div class="details-label">発行日</div>
        <div class="details-value">${data.issue_date}</div>
      </div>
      <div class="details-row">
        <div class="details-label">内容</div>
        <div class="details-value">サービス利用料</div>
      </div>
    </div>

    <div class="footer">
      <div class="stamp-area">印</div>
      <div class="company-info">
        <div style="font-weight: bold; font-size: 18px;">人妻の蜜</div>
        <div>〒000-0000</div>
        <div>東京都○○区○○ 1-2-3</div>
        <div>TEL: 03-XXXX-XXXX</div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}
