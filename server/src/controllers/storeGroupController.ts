import { Response } from 'express';
import { TenantRequest } from '../middleware/tenantAuth';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// ============================================
// 店舗グループ管理コントローラー
// ============================================

/**
 * グループ一覧を取得
 */
export const getAllGroups = async (req: TenantRequest, res: Response) => {
  try {
    const { companyId } = req.tenant || {};

    if (!companyId) {
      return res.status(403).json({ error: 'テナント情報が必要です' });
    }

    const [groups] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        sg.*,
        COUNT(DISTINCT s.id) as member_count,
        COUNT(DISTINCT u.id) as customer_count,
        COUNT(DISTINCT c.id) as cast_count,
        COUNT(DISTINCT o.id) as order_count
      FROM store_groups sg
      LEFT JOIN stores s ON sg.id = s.group_id AND s.is_active = TRUE
      LEFT JOIN users u ON s.id = u.store_id
      LEFT JOIN casts c ON s.id = c.store_id
      LEFT JOIN orders o ON s.id = o.store_id
      WHERE sg.company_id = ?
      GROUP BY sg.id
      ORDER BY sg.display_order ASC, sg.created_at DESC`,
      [companyId]
    );

    res.json({
      success: true,
      groups,
      count: groups.length,
    });
  } catch (error: any) {
    console.error('グループ一覧取得エラー:', error);
    res.status(500).json({ 
      error: 'グループ一覧の取得に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * グループ詳細を取得
 */
export const getGroupDetail = async (req: TenantRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { companyId } = req.tenant || {};

    if (!companyId) {
      return res.status(403).json({ error: 'テナント情報が必要です' });
    }

    // グループ基本情報
    const [groups] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM store_groups WHERE id = ? AND company_id = ?',
      [groupId, companyId]
    );

    if (groups.length === 0) {
      return res.status(404).json({ error: 'グループが見つかりません' });
    }

    const group = groups[0];

    // グループに所属する店舗一覧
    const [stores] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        s.*,
        COUNT(DISTINCT u.id) as customer_count,
        COUNT(DISTINCT c.id) as cast_count,
        COUNT(DISTINCT o.id) as order_count
      FROM stores s
      LEFT JOIN users u ON s.id = u.store_id
      LEFT JOIN casts c ON s.id = c.store_id
      LEFT JOIN orders o ON s.id = o.store_id
      WHERE s.group_id = ? AND s.company_id = ?
      GROUP BY s.id
      ORDER BY s.store_name`,
      [groupId, companyId]
    );

    res.json({
      success: true,
      group: {
        ...group,
        stores,
      },
    });
  } catch (error: any) {
    console.error('グループ詳細取得エラー:', error);
    res.status(500).json({ 
      error: 'グループ詳細の取得に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * グループを作成
 */
export const createGroup = async (req: TenantRequest, res: Response) => {
  try {
    const { companyId } = req.tenant || {};
    const {
      group_name,
      group_code,
      description,
      share_customers = true,
      share_casts = false,
      share_orders = true,
      share_reviews = false,
      display_order = 0,
    } = req.body;

    if (!companyId) {
      return res.status(403).json({ error: 'テナント情報が必要です' });
    }

    if (!group_name) {
      return res.status(400).json({ error: 'グループ名が必要です' });
    }

    // グループコードの重複チェック
    if (group_code) {
      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM store_groups WHERE company_id = ? AND group_code = ?',
        [companyId, group_code]
      );

      if (existing.length > 0) {
        return res.status(400).json({ 
          error: 'このグループコードは既に使用されています' 
        });
      }
    }

    // グループ作成
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO store_groups 
        (company_id, group_name, group_code, description, 
         share_customers, share_casts, share_orders, share_reviews, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        group_name,
        group_code || null,
        description || null,
        share_customers,
        share_casts,
        share_orders,
        share_reviews,
        display_order,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'グループを作成しました',
      groupId: result.insertId,
    });
  } catch (error: any) {
    console.error('グループ作成エラー:', error);
    res.status(500).json({ 
      error: 'グループの作成に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * グループを更新
 */
export const updateGroup = async (req: TenantRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { companyId } = req.tenant || {};
    const {
      group_name,
      group_code,
      description,
      share_customers,
      share_casts,
      share_orders,
      share_reviews,
      is_active,
      display_order,
    } = req.body;

    if (!companyId) {
      return res.status(403).json({ error: 'テナント情報が必要です' });
    }

    // グループの存在確認
    const [groups] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM store_groups WHERE id = ? AND company_id = ?',
      [groupId, companyId]
    );

    if (groups.length === 0) {
      return res.status(404).json({ error: 'グループが見つかりません' });
    }

    // グループコードの重複チェック（自分以外）
    if (group_code) {
      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM store_groups WHERE company_id = ? AND group_code = ? AND id != ?',
        [companyId, group_code, groupId]
      );

      if (existing.length > 0) {
        return res.status(400).json({ 
          error: 'このグループコードは既に使用されています' 
        });
      }
    }

    // 更新
    await pool.execute(
      `UPDATE store_groups SET
        group_name = COALESCE(?, group_name),
        group_code = COALESCE(?, group_code),
        description = COALESCE(?, description),
        share_customers = COALESCE(?, share_customers),
        share_casts = COALESCE(?, share_casts),
        share_orders = COALESCE(?, share_orders),
        share_reviews = COALESCE(?, share_reviews),
        is_active = COALESCE(?, is_active),
        display_order = COALESCE(?, display_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND company_id = ?`,
      [
        group_name,
        group_code,
        description,
        share_customers,
        share_casts,
        share_orders,
        share_reviews,
        is_active,
        display_order,
        groupId,
        companyId,
      ]
    );

    res.json({
      success: true,
      message: 'グループを更新しました',
    });
  } catch (error: any) {
    console.error('グループ更新エラー:', error);
    res.status(500).json({ 
      error: 'グループの更新に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * グループを削除
 */
export const deleteGroup = async (req: TenantRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { companyId } = req.tenant || {};

    if (!companyId) {
      return res.status(403).json({ error: 'テナント情報が必要です' });
    }

    // グループに所属している店舗を確認
    const [stores] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM stores WHERE group_id = ?',
      [groupId]
    );

    if (stores[0].count > 0) {
      return res.status(400).json({ 
        error: 'このグループには店舗が所属しています。先に店舗の所属を解除してください',
        storeCount: stores[0].count,
      });
    }

    // グループ削除
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM store_groups WHERE id = ? AND company_id = ?',
      [groupId, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'グループが見つかりません' });
    }

    res.json({
      success: true,
      message: 'グループを削除しました',
    });
  } catch (error: any) {
    console.error('グループ削除エラー:', error);
    res.status(500).json({ 
      error: 'グループの削除に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * 店舗をグループに追加
 */
export const addStoreToGroup = async (req: TenantRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { storeId } = req.body;
    const { companyId, userId } = req.tenant || {};

    if (!companyId) {
      return res.status(403).json({ error: 'テナント情報が必要です' });
    }

    if (!storeId) {
      return res.status(400).json({ error: '店舗IDが必要です' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // グループの存在確認
      const [groups] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM store_groups WHERE id = ? AND company_id = ?',
        [groupId, companyId]
      );

      if (groups.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'グループが見つかりません' });
      }

      // 店舗の存在確認
      const [stores] = await connection.execute<RowDataPacket[]>(
        'SELECT id, group_id FROM stores WHERE id = ? AND company_id = ?',
        [storeId, companyId]
      );

      if (stores.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: '店舗が見つかりません' });
      }

      const previousGroupId = stores[0].group_id;

      // 店舗のグループを更新
      await connection.execute(
        'UPDATE stores SET group_id = ? WHERE id = ? AND company_id = ?',
        [groupId, storeId, companyId]
      );

      // 履歴を記録
      await connection.execute(
        `INSERT INTO store_group_history 
          (store_id, group_id, action, previous_group_id, changed_by, notes)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          storeId,
          groupId,
          previousGroupId ? 'move' : 'join',
          previousGroupId,
          userId || null,
          previousGroupId ? `グループID ${previousGroupId} から ${groupId} に移動` : `グループID ${groupId} に追加`,
        ]
      );

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: '店舗をグループに追加しました',
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error: any) {
    console.error('店舗追加エラー:', error);
    res.status(500).json({ 
      error: '店舗の追加に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * 店舗をグループから除外
 */
export const removeStoreFromGroup = async (req: TenantRequest, res: Response) => {
  try {
    const { groupId, storeId } = req.params;
    const { companyId, userId } = req.tenant || {};

    if (!companyId) {
      return res.status(403).json({ error: 'テナント情報が必要です' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 店舗の存在とグループ所属を確認
      const [stores] = await connection.execute<RowDataPacket[]>(
        'SELECT id, group_id FROM stores WHERE id = ? AND company_id = ? AND group_id = ?',
        [storeId, companyId, groupId]
      );

      if (stores.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ 
          error: '店舗が見つからないか、このグループに所属していません' 
        });
      }

      // グループから除外（独立店舗にする）
      await connection.execute(
        'UPDATE stores SET group_id = NULL WHERE id = ? AND company_id = ?',
        [storeId, companyId]
      );

      // 履歴を記録
      await connection.execute(
        `INSERT INTO store_group_history 
          (store_id, group_id, action, previous_group_id, changed_by, notes)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          storeId,
          null,
          'leave',
          groupId,
          userId || null,
          `グループID ${groupId} から除外（独立店舗化）`,
        ]
      );

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: '店舗をグループから除外しました',
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error: any) {
    console.error('店舗除外エラー:', error);
    res.status(500).json({ 
      error: '店舗の除外に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * グループのデータ共有設定を取得
 */
export const getGroupSettings = async (req: TenantRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { companyId } = req.tenant || {};

    if (!companyId) {
      return res.status(403).json({ error: 'テナント情報が必要です' });
    }

    const [groups] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        id, group_name, 
        share_customers, share_casts, share_orders, share_reviews
      FROM store_groups 
      WHERE id = ? AND company_id = ?`,
      [groupId, companyId]
    );

    if (groups.length === 0) {
      return res.status(404).json({ error: 'グループが見つかりません' });
    }

    res.json({
      success: true,
      settings: groups[0],
    });
  } catch (error: any) {
    console.error('設定取得エラー:', error);
    res.status(500).json({ 
      error: '設定の取得に失敗しました', 
      details: error.message 
    });
  }
};

/**
 * 独立店舗（グループなし）の一覧を取得
 */
export const getIndependentStores = async (req: TenantRequest, res: Response) => {
  try {
    const { companyId } = req.tenant || {};

    if (!companyId) {
      return res.status(403).json({ error: 'テナント情報が必要です' });
    }

    const [stores] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        s.*,
        COUNT(DISTINCT u.id) as customer_count,
        COUNT(DISTINCT c.id) as cast_count,
        COUNT(DISTINCT o.id) as order_count
      FROM stores s
      LEFT JOIN users u ON s.id = u.store_id
      LEFT JOIN casts c ON s.id = c.store_id
      LEFT JOIN orders o ON s.id = o.store_id
      WHERE s.company_id = ? AND s.group_id IS NULL
      GROUP BY s.id
      ORDER BY s.store_name`,
      [companyId]
    );

    res.json({
      success: true,
      stores,
      count: stores.length,
    });
  } catch (error: any) {
    console.error('独立店舗取得エラー:', error);
    res.status(500).json({ 
      error: '独立店舗の取得に失敗しました', 
      details: error.message 
    });
  }
};
