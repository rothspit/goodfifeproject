/**
 * 店舗管理コントローラー
 * マルチテナント対応
 */
import { Response } from 'express';
import { pool } from '../config/database';
import { TenantRequest } from '../middleware/tenantAuth';

/**
 * 企業の全店舗取得
 */
export const getStores = async (req: TenantRequest, res: Response) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return res.status(400).json({ error: '企業IDが指定されていません' });
    }

    const [stores]: any = await pool.execute(
      `SELECT 
        s.*,
        COUNT(DISTINCT c.id) as cast_count,
        COUNT(DISTINCT o.id) as order_count,
        COUNT(DISTINCT u.id) as customer_count
       FROM stores s
       LEFT JOIN casts c ON s.id = c.store_id
       LEFT JOIN orders o ON s.id = o.store_id
       LEFT JOIN users u ON s.id = u.store_id AND u.user_type = 'customer'
       WHERE s.company_id = ?
       GROUP BY s.id
       ORDER BY s.code`,
      [companyId]
    );

    res.json({
      success: true,
      stores
    });
  } catch (error: any) {
    console.error('❌ 店舗一覧取得エラー:', error);
    res.status(500).json({ error: '店舗一覧の取得に失敗しました' });
  }
};

/**
 * 店舗詳細取得
 */
export const getStore = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [stores]: any = await pool.execute(
      `SELECT s.* FROM stores s WHERE s.id = ? AND s.company_id = ?`,
      [id, req.companyId]
    );

    if (stores.length === 0) {
      return res.status(404).json({ error: '店舗が見つかりません' });
    }

    // 店舗統計
    const [stats]: any = await pool.execute(
      `SELECT 
        (SELECT COUNT(*) FROM casts WHERE store_id = ?) as cast_count,
        (SELECT COUNT(*) FROM orders WHERE store_id = ?) as order_count,
        (SELECT COUNT(*) FROM users WHERE store_id = ? AND user_type = 'customer') as customer_count,
        (SELECT COUNT(*) FROM store_users WHERE store_id = ? AND is_active = TRUE) as staff_count
      `,
      [id, id, id, id]
    );

    res.json({
      success: true,
      store: {
        ...stores[0],
        stats: stats[0]
      }
    });
  } catch (error: any) {
    console.error('❌ 店舗詳細取得エラー:', error);
    res.status(500).json({ error: '店舗詳細の取得に失敗しました' });
  }
};

/**
 * 店舗作成
 */
export const createStore = async (req: TenantRequest, res: Response) => {
  try {
    const {
      code,
      display_name,
      slug,
      phone,
      email,
      postal_code,
      address,
      business_hours,
      service_area
    } = req.body;

    if (!code || !display_name || !slug) {
      return res.status(400).json({ 
        error: '店舗コード、表示名、スラッグは必須です' 
      });
    }

    const [result]: any = await pool.execute(
      `INSERT INTO stores (
        company_id, code, display_name, slug,
        phone, email, postal_code, address,
        business_hours, service_area, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        req.companyId,
        code,
        display_name,
        slug,
        phone,
        email,
        postal_code,
        address,
        business_hours ? JSON.stringify(business_hours) : null,
        service_area
      ]
    );

    console.log(`✅ 店舗作成: ${display_name} (ID: ${result.insertId})`);

    res.status(201).json({
      success: true,
      message: '店舗を作成しました',
      store: {
        id: result.insertId,
        code,
        display_name,
        slug
      }
    });
  } catch (error: any) {
    console.error('❌ 店舗作成エラー:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'この店舗コードまたはスラッグは既に使用されています' });
    } else {
      res.status(500).json({ error: '店舗の作成に失敗しました' });
    }
  }
};

/**
 * 店舗更新
 */
export const updateStore = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const {
      display_name,
      phone,
      email,
      postal_code,
      address,
      business_hours,
      service_area,
      settings,
      status
    } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (display_name) {
      updates.push('display_name = ?');
      values.push(display_name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (postal_code !== undefined) {
      updates.push('postal_code = ?');
      values.push(postal_code);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (business_hours) {
      updates.push('business_hours = ?');
      values.push(JSON.stringify(business_hours));
    }
    if (service_area !== undefined) {
      updates.push('service_area = ?');
      values.push(service_area);
    }
    if (settings) {
      updates.push('settings = ?');
      values.push(JSON.stringify(settings));
    }
    if (status) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: '更新する項目がありません' });
    }

    values.push(id);
    values.push(req.companyId);

    await pool.execute(
      `UPDATE stores SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`,
      values
    );

    console.log(`✅ 店舗更新: ID=${id}`);

    res.json({
      success: true,
      message: '店舗情報を更新しました'
    });
  } catch (error: any) {
    console.error('❌ 店舗更新エラー:', error);
    res.status(500).json({ error: '店舗情報の更新に失敗しました' });
  }
};

/**
 * 店舗削除（論理削除）
 */
export const deleteStore = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE stores SET status = "closed" WHERE id = ? AND company_id = ?',
      [id, req.companyId]
    );

    console.log(`✅ 店舗削除: ID=${id}`);

    res.json({
      success: true,
      message: '店舗を削除しました'
    });
  } catch (error: any) {
    console.error('❌ 店舗削除エラー:', error);
    res.status(500).json({ error: '店舗の削除に失敗しました' });
  }
};

/**
 * 店舗スタッフ一覧取得
 */
export const getStoreStaff = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [staff]: any = await pool.execute(
      `SELECT 
        su.id as assignment_id,
        su.role,
        su.is_active,
        u.id as user_id,
        u.name,
        u.email,
        u.phone_number,
        u.user_type,
        u.created_at
       FROM store_users su
       JOIN users u ON su.user_id = u.id
       WHERE su.store_id = ?
       ORDER BY su.role, u.name`,
      [id]
    );

    res.json({
      success: true,
      staff
    });
  } catch (error: any) {
    console.error('❌ スタッフ一覧取得エラー:', error);
    res.status(500).json({ error: 'スタッフ一覧の取得に失敗しました' });
  }
};

/**
 * 店舗スタッフ追加
 */
export const addStoreStaff = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, role = 'staff', permissions } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'ユーザーIDは必須です' });
    }

    // ユーザーが同じ企業に所属しているか確認
    const [users]: any = await pool.execute(
      'SELECT id FROM users WHERE id = ? AND company_id = ?',
      [user_id, req.companyId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    const [result]: any = await pool.execute(
      `INSERT INTO store_users (store_id, user_id, role, permissions)
       VALUES (?, ?, ?, ?)`,
      [id, user_id, role, permissions ? JSON.stringify(permissions) : null]
    );

    console.log(`✅ スタッフ追加: Store=${id}, User=${user_id}`);

    res.status(201).json({
      success: true,
      message: 'スタッフを追加しました'
    });
  } catch (error: any) {
    console.error('❌ スタッフ追加エラー:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'このユーザーは既に店舗に登録されています' });
    } else {
      res.status(500).json({ error: 'スタッフの追加に失敗しました' });
    }
  }
};

/**
 * 店舗スタッフ削除
 */
export const removeStoreStaff = async (req: TenantRequest, res: Response) => {
  try {
    const { id, userId } = req.params;

    await pool.execute(
      'DELETE FROM store_users WHERE store_id = ? AND user_id = ?',
      [id, userId]
    );

    console.log(`✅ スタッフ削除: Store=${id}, User=${userId}`);

    res.json({
      success: true,
      message: 'スタッフを削除しました'
    });
  } catch (error: any) {
    console.error('❌ スタッフ削除エラー:', error);
    res.status(500).json({ error: 'スタッフの削除に失敗しました' });
  }
};

export default {
  getStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  getStoreStaff,
  addStoreStaff,
  removeStoreStaff
};
