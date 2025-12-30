/**
 * テナント分離ミドルウェア
 * マルチテナント対応のため、リクエストごとに company_id と store_id を検証
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

/**
 * 拡張Requestインターフェース
 * company_id, store_id, groupId を追加
 */
export interface TenantRequest extends Request {
  companyId?: number;
  storeId?: number;
  groupId?: number | null;
  userId?: number;
  userType?: 'company_admin' | 'store_admin' | 'staff' | 'customer';
  permissions?: any;
  tenant?: {
    companyId: number;
    storeId: number;
    groupId?: number | null;
    userId: number;
    userType: string;
  };
}

/**
 * JWT トークンを検証するミドルウェア
 */
export const verifyToken = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: '認証トークンがありません' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      userId: number;
      userType?: string;
    };

    // JWT から userId を取得
    (req as any).userId = decoded.userId;
    (req as any).userType = decoded.userType;

    next();
  } catch (error) {
    return res.status(401).json({ error: '無効な認証トークンです' });
  }
};

/**
 * テナント情報を取得するミドルウェア
 * JWT認証後に使用
 */
export const extractTenantInfo = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // JWT認証済みのユーザーIDを取得
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    // ユーザー情報とグループ情報を取得
    const [users]: any = await pool.execute(
      `SELECT 
        u.id, u.company_id, u.store_id, u.user_type, u.role, u.permissions,
        s.group_id
      FROM users u
      LEFT JOIN stores s ON u.store_id = s.id
      WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    const user = users[0];

    // Requestにテナント情報を追加
    req.userId = user.id;
    req.companyId = user.company_id;
    req.storeId = user.store_id;
    req.groupId = user.group_id;
    req.userType = user.user_type;
    req.permissions = user.permissions ? JSON.parse(user.permissions) : {};
    
    // tenant オブジェクトにまとめる
    req.tenant = {
      companyId: user.company_id,
      storeId: user.store_id,
      groupId: user.group_id,
      userId: user.id,
      userType: user.user_type,
    };

    console.log(`🔐 テナント情報: User=${userId}, Company=${req.companyId}, Store=${req.storeId}, Group=${req.groupId}, Type=${req.userType}`);

    next();
  } catch (error) {
    console.error('❌ テナント情報取得エラー:', error);
    res.status(500).json({ error: 'テナント情報の取得に失敗しました' });
  }
};

/**
 * 企業管理者権限チェック
 */
export const requireCompanyAdmin = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userType !== 'company_admin') {
    return res.status(403).json({ 
      error: 'この操作には企業管理者権限が必要です',
      requiredRole: 'company_admin',
      currentRole: req.userType
    });
  }
  next();
};

/**
 * 店舗管理者以上の権限チェック
 */
export const requireStoreAdmin = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  if (!['company_admin', 'store_admin'].includes(req.userType || '')) {
    return res.status(403).json({ 
      error: 'この操作には店舗管理者以上の権限が必要です',
      requiredRole: 'store_admin',
      currentRole: req.userType
    });
  }
  next();
};

/**
 * スタッフ以上の権限チェック
 */
export const requireStaff = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  if (!['company_admin', 'store_admin', 'staff'].includes(req.userType || '')) {
    return res.status(403).json({ 
      error: 'この操作にはスタッフ以上の権限が必要です',
      requiredRole: 'staff',
      currentRole: req.userType
    });
  }
  next();
};

/**
 * 店舗アクセス権限チェック
 * ユーザーが指定された店舗にアクセス権限があるか確認
 */
export const requireStoreAccess = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestedStoreId = req.params.storeId || req.query.storeId || req.body.storeId;

    if (!requestedStoreId) {
      return res.status(400).json({ error: '店舗IDが指定されていません' });
    }

    // 企業管理者は全店舗アクセス可能
    if (req.userType === 'company_admin') {
      // 同じ企業の店舗かチェック
      const [stores]: any = await pool.execute(
        'SELECT id FROM stores WHERE id = ? AND company_id = ?',
        [requestedStoreId, req.companyId]
      );

      if (stores.length === 0) {
        return res.status(403).json({ error: 'この店舗へのアクセス権限がありません' });
      }

      req.storeId = parseInt(requestedStoreId);
      return next();
    }

    // 店舗管理者・スタッフは割り当てられた店舗のみ
    if (req.storeId && req.storeId === parseInt(requestedStoreId)) {
      return next();
    }

    // store_users テーブルで複数店舗アクセス権をチェック
    const [storeUsers]: any = await pool.execute(
      `SELECT su.store_id, su.role, su.permissions
       FROM store_users su
       WHERE su.user_id = ? AND su.store_id = ? AND su.is_active = TRUE`,
      [req.userId, requestedStoreId]
    );

    if (storeUsers.length === 0) {
      return res.status(403).json({ error: 'この店舗へのアクセス権限がありません' });
    }

    req.storeId = parseInt(requestedStoreId);
    next();
  } catch (error) {
    console.error('❌ 店舗アクセス権限チェックエラー:', error);
    res.status(500).json({ error: '権限チェックに失敗しました' });
  }
};

/**
 * クエリに自動的に store_id フィルタを追加するヘルパー
 */
export const addStoreFilter = (query: string, req: TenantRequest): string => {
  // 企業管理者は company_id でフィルタ
  if (req.userType === 'company_admin') {
    return query.replace(/WHERE/i, `WHERE company_id = ${req.companyId} AND`);
  }
  
  // それ以外は store_id でフィルタ
  return query.replace(/WHERE/i, `WHERE store_id = ${req.storeId} AND`);
};

/**
 * テナント分離を強制するミドルウェア
 * 全てのクエリに自動的にテナントフィルタを追加
 */
export const enforceTenantIsolation = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.companyId) {
    return res.status(403).json({ error: 'テナント情報が取得できません' });
  }

  // オリジナルのpool.executeをラップしてテナントフィルタを自動追加
  // （実装例 - 実際には更に高度な実装が必要）
  
  console.log(`🔒 テナント分離: Company=${req.companyId}, Store=${req.storeId || 'ALL'}`);
  next();
};

/**
 * 特定の権限をチェックする汎用ミドルウェアファクトリ
 */
export const requirePermission = (permission: string) => {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    if (req.userType === 'company_admin') {
      // 企業管理者は全権限を持つ
      return next();
    }

    const permissions = req.permissions || {};
    
    if (!permissions[permission]) {
      return res.status(403).json({ 
        error: 'この操作を実行する権限がありません',
        requiredPermission: permission
      });
    }

    next();
  };
};

/**
 * リクエストから店舗IDを取得するヘルパー
 */
export const getStoreId = (req: TenantRequest): number | null => {
  return req.storeId || null;
};

/**
 * リクエストから企業IDを取得するヘルパー
 */
export const getCompanyId = (req: TenantRequest): number | null => {
  return req.companyId || null;
};

/**
 * ユーザーが複数店舗にアクセスできるかチェック
 */
export const getAccessibleStores = async (req: TenantRequest): Promise<number[]> => {
  try {
    // 企業管理者は全店舗
    if (req.userType === 'company_admin') {
      const [stores]: any = await pool.execute(
        'SELECT id FROM stores WHERE company_id = ? AND status = "active"',
        [req.companyId]
      );
      return stores.map((s: any) => s.id);
    }

    // ユーザーに割り当てられた店舗
    const [storeUsers]: any = await pool.execute(
      'SELECT store_id FROM store_users WHERE user_id = ? AND is_active = TRUE',
      [req.userId]
    );

    const storeIds = storeUsers.map((su: any) => su.store_id);
    
    // デフォルトの店舗も追加
    if (req.storeId && !storeIds.includes(req.storeId)) {
      storeIds.push(req.storeId);
    }

    return storeIds;
  } catch (error) {
    console.error('❌ アクセス可能店舗取得エラー:', error);
    return [];
  }
};

/**
 * グループ内の店舗IDリストを取得
 * データ共有の判定に使用
 */
export const getGroupStoreIds = async (req: TenantRequest): Promise<number[]> => {
  try {
    if (!req.groupId) {
      // グループに所属していない場合は自店舗のみ
      return req.storeId ? [req.storeId] : [];
    }

    // グループ内の全店舗を取得
    const [stores]: any = await pool.execute(
      'SELECT id FROM stores WHERE group_id = ? AND is_active = TRUE',
      [req.groupId]
    );

    return stores.map((s: any) => s.id);
  } catch (error) {
    console.error('❌ グループ店舗取得エラー:', error);
    return req.storeId ? [req.storeId] : [];
  }
};

/**
 * データタイプに応じた適切なストアフィルタを返す
 * @param req TenantRequest
 * @param dataType 'customers' | 'casts' | 'orders' | 'reviews'
 * @returns WHERE句の条件文字列とパラメータ
 */
export const getDataScopeFilter = async (
  req: TenantRequest,
  dataType: 'customers' | 'casts' | 'orders' | 'reviews'
): Promise<{ condition: string; params: any[] }> => {
  try {
    const { companyId, storeId, groupId } = req.tenant || {};

    if (!companyId || !storeId) {
      return { condition: 'WHERE 1=0', params: [] }; // アクセス不可
    }

    // グループに所属していない場合は自店舗のみ
    if (!groupId) {
      return {
        condition: 'WHERE company_id = ? AND store_id = ?',
        params: [companyId, storeId],
      };
    }

    // グループの共有設定を取得
    const [groups]: any = await pool.execute(
      `SELECT share_customers, share_casts, share_orders, share_reviews 
       FROM store_groups WHERE id = ?`,
      [groupId]
    );

    if (groups.length === 0) {
      // グループが見つからない場合は自店舗のみ
      return {
        condition: 'WHERE company_id = ? AND store_id = ?',
        params: [companyId, storeId],
      };
    }

    const group = groups[0];
    let isShared = false;

    // データタイプごとの共有設定をチェック
    switch (dataType) {
      case 'customers':
        isShared = group.share_customers;
        break;
      case 'casts':
        isShared = group.share_casts;
        break;
      case 'orders':
        isShared = group.share_orders;
        break;
      case 'reviews':
        isShared = group.share_reviews;
        break;
    }

    if (isShared) {
      // グループ内全店舗のデータにアクセス可能
      const [groupStores]: any = await pool.execute(
        'SELECT id FROM stores WHERE group_id = ? AND is_active = TRUE',
        [groupId]
      );
      
      const storeIds = groupStores.map((s: any) => s.id);
      
      if (storeIds.length === 0) {
        return {
          condition: 'WHERE company_id = ? AND store_id = ?',
          params: [companyId, storeId],
        };
      }
      
      return {
        condition: `WHERE company_id = ? AND store_id IN (${storeIds.map(() => '?').join(',')})`,
        params: [companyId, ...storeIds],
      };
    } else {
      // 共有されていない場合は自店舗のみ
      return {
        condition: 'WHERE company_id = ? AND store_id = ?',
        params: [companyId, storeId],
      };
    }
  } catch (error) {
    console.error('❌ データスコープフィルタ取得エラー:', error);
    return { condition: 'WHERE 1=0', params: [] };
  }
};

/**
 * 監査ログ記録ミドルウェア
 */
export const auditLog = (action: string, resourceType: string) => {
  return async (req: TenantRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      // レスポンス送信後に監査ログを記録
      if (res.statusCode >= 200 && res.statusCode < 300) {
        pool.execute(
          `INSERT INTO audit_logs 
           (company_id, store_id, user_id, action, resource_type, description, ip_address, user_agent)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.companyId || null,
            req.storeId || null,
            req.userId || null,
            action,
            resourceType,
            `${action} ${resourceType}`,
            req.ip,
            req.get('user-agent') || ''
          ]
        ).catch(err => console.error('監査ログ記録エラー:', err));
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

export default {
  verifyToken,
  extractTenantInfo,
  requireCompanyAdmin,
  requireStoreAdmin,
  requireStaff,
  requireStoreAccess,
  enforceTenantIsolation,
  requirePermission,
  getStoreId,
  getCompanyId,
  getAccessibleStores,
  getGroupStoreIds,
  getDataScopeFilter,
  auditLog
};
