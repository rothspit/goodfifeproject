/**
 * 企業管理コントローラー
 * SaaS型マルチテナント対応
 */
import { Response } from 'express';
import { pool } from '../config/database';
import { TenantRequest } from '../middleware/tenantAuth';

/**
 * 企業一覧取得（システム管理者用）
 */
export const getAllCompanies = async (req: TenantRequest, res: Response) => {
  try {
    const [companies]: any = await pool.execute(`
      SELECT 
        c.*,
        COUNT(DISTINCT s.id) as store_count,
        COUNT(DISTINCT u.id) as user_count
      FROM companies c
      LEFT JOIN stores s ON c.id = s.company_id AND s.status = 'active'
      LEFT JOIN users u ON c.id = u.company_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json({
      success: true,
      companies
    });
  } catch (error: any) {
    console.error('❌ 企業一覧取得エラー:', error);
    res.status(500).json({ error: '企業一覧の取得に失敗しました' });
  }
};

/**
 * 企業詳細取得
 */
export const getCompany = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;

    // 権限チェック: 企業管理者は自社のみ
    if (req.userType !== 'company_admin' || req.companyId !== parseInt(id)) {
      if (req.userType !== 'system_admin') {
        return res.status(403).json({ error: 'アクセス権限がありません' });
      }
    }

    const [companies]: any = await pool.execute(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM stores WHERE company_id = c.id AND status = 'active') as store_count,
        (SELECT COUNT(*) FROM users WHERE company_id = c.id) as user_count,
        (SELECT COUNT(*) FROM users WHERE company_id = c.id AND user_type = 'customer') as customer_count
       FROM companies c 
       WHERE c.id = ?`,
      [id]
    );

    if (companies.length === 0) {
      return res.status(404).json({ error: '企業が見つかりません' });
    }

    // 店舗一覧も取得
    const [stores]: any = await pool.execute(
      'SELECT * FROM stores WHERE company_id = ? ORDER BY code',
      [id]
    );

    res.json({
      success: true,
      company: {
        ...companies[0],
        stores
      }
    });
  } catch (error: any) {
    console.error('❌ 企業詳細取得エラー:', error);
    res.status(500).json({ error: '企業詳細の取得に失敗しました' });
  }
};

/**
 * 企業登録
 */
export const createCompany = async (req: TenantRequest, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      name,
      slug,
      email,
      phone,
      postal_code,
      address,
      plan_type = 'trial',
      max_stores = 1,
      max_users = 5
    } = req.body;

    if (!name || !slug || !email) {
      return res.status(400).json({ 
        error: '企業名、スラッグ、メールアドレスは必須です' 
      });
    }

    await connection.beginTransaction();

    // 企業登録
    const [result]: any = await connection.execute(
      `INSERT INTO companies (
        name, slug, email, phone, postal_code, address,
        plan_type, max_stores, max_users, status, trial_ends_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'trial', DATE_ADD(NOW(), INTERVAL 30 DAY))`,
      [name, slug, email, phone, postal_code, address, plan_type, max_stores, max_users]
    );

    const companyId = result.insertId;

    // デフォルト店舗を作成
    await connection.execute(
      `INSERT INTO stores (
        company_id, code, display_name, slug, status
      ) VALUES (?, 'main', ?, ?, 'active')`,
      [companyId, `${name} 本店`, slug]
    );

    await connection.commit();

    console.log(`✅ 企業登録: ${name} (ID: ${companyId})`);

    res.status(201).json({
      success: true,
      message: '企業を登録しました',
      company: {
        id: companyId,
        name,
        slug,
        status: 'trial'
      }
    });
  } catch (error: any) {
    await connection.rollback();
    console.error('❌ 企業登録エラー:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'このスラッグは既に使用されています' });
    } else {
      res.status(500).json({ error: '企業の登録に失敗しました' });
    }
  } finally {
    connection.release();
  }
};

/**
 * 企業更新
 */
export const updateCompany = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // 権限チェック
    if (req.companyId !== parseInt(id) && req.userType !== 'system_admin') {
      return res.status(403).json({ error: 'アクセス権限がありません' });
    }

    const {
      name,
      email,
      phone,
      postal_code,
      address,
      settings
    } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (postal_code !== undefined) {
      updates.push('postal_code = ?');
      values.push(postal_code);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (settings) {
      updates.push('settings = ?');
      values.push(JSON.stringify(settings));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: '更新する項目がありません' });
    }

    values.push(id);

    await pool.execute(
      `UPDATE companies SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    console.log(`✅ 企業更新: ID=${id}`);

    res.json({
      success: true,
      message: '企業情報を更新しました'
    });
  } catch (error: any) {
    console.error('❌ 企業更新エラー:', error);
    res.status(500).json({ error: '企業情報の更新に失敗しました' });
  }
};

/**
 * 企業削除（論理削除）
 */
export const deleteCompany = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;

    // システム管理者のみ
    if (req.userType !== 'system_admin') {
      return res.status(403).json({ error: 'この操作にはシステム管理者権限が必要です' });
    }

    // ステータスを cancelled に変更
    await pool.execute(
      'UPDATE companies SET status = "cancelled" WHERE id = ?',
      [id]
    );

    console.log(`✅ 企業削除: ID=${id}`);

    res.json({
      success: true,
      message: '企業を削除しました'
    });
  } catch (error: any) {
    console.error('❌ 企業削除エラー:', error);
    res.status(500).json({ error: '企業の削除に失敗しました' });
  }
};

/**
 * 企業統計取得
 */
export const getCompanyStats = async (req: TenantRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return res.status(400).json({ error: '企業IDが指定されていません' });
    }

    // 各種統計を取得
    const [stores]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM stores WHERE company_id = ? AND status = "active"',
      [companyId]
    );

    const [users]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE company_id = ?',
      [companyId]
    );

    const [customers]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE company_id = ? AND user_type = "customer"',
      [companyId]
    );

    const [casts]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM casts WHERE company_id = ?',
      [companyId]
    );

    const [orders]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM orders WHERE company_id = ?',
      [companyId]
    );

    // 今月の統計
    const [monthlyOrders]: any = await pool.execute(
      `SELECT COUNT(*) as count, SUM(total_price) as revenue
       FROM orders 
       WHERE company_id = ? 
       AND YEAR(business_date) = YEAR(NOW())
       AND MONTH(business_date) = MONTH(NOW())`,
      [companyId]
    );

    res.json({
      success: true,
      stats: {
        stores: stores[0].count,
        users: users[0].count,
        customers: customers[0].count,
        casts: casts[0].count,
        total_orders: orders[0].count,
        monthly_orders: monthlyOrders[0].count || 0,
        monthly_revenue: monthlyOrders[0].revenue || 0
      }
    });
  } catch (error: any) {
    console.error('❌ 企業統計取得エラー:', error);
    res.status(500).json({ error: '企業統計の取得に失敗しました' });
  }
};

/**
 * サブスクリプション情報取得
 */
export const getSubscription = async (req: TenantRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    const [subscriptions]: any = await pool.execute(
      'SELECT * FROM subscriptions WHERE company_id = ? ORDER BY created_at DESC LIMIT 1',
      [companyId]
    );

    if (subscriptions.length === 0) {
      return res.json({
        success: true,
        subscription: null
      });
    }

    res.json({
      success: true,
      subscription: subscriptions[0]
    });
  } catch (error: any) {
    console.error('❌ サブスクリプション取得エラー:', error);
    res.status(500).json({ error: 'サブスクリプション情報の取得に失敗しました' });
  }
};

export default {
  getAllCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats,
  getSubscription
};
