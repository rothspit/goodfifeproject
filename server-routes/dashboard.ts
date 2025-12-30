import { Router } from 'express';
import { pool } from '../config/database';

const router = Router();

// Get dashboard KPIs
router.get('/kpis', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Today's sales
    const [todaySales]: any = await pool.query(`
      SELECT COALESCE(SUM(total_price), 0) as total, COUNT(*) as count
      FROM orders
      WHERE business_date = ? AND order_status != 'cancelled'
    `, [today]);

    // New customers this month
    const [newCustomers]: any = await pool.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE role = 'customer' AND created_at >= ?
    `, [monthStartStr]);

    // Repeat rate (last 30 days)
    const [totalCustomers]: any = await pool.query(`
      SELECT COUNT(DISTINCT customer_id) as count
      FROM orders
      WHERE business_date >= ?
    `, [thirtyDaysAgoStr]);

    const [repeatCustomers]: any = await pool.query(`
      SELECT COUNT(*) as count
      FROM (
        SELECT customer_id
        FROM orders
        WHERE business_date >= ?
        GROUP BY customer_id
        HAVING COUNT(*) > 1
      ) as repeats
    `, [thirtyDaysAgoStr]);

    const repeatRate = totalCustomers[0].count > 0 
      ? (repeatCustomers[0].count / totalCustomers[0].count) * 100 
      : 0;

    // Average order value
    const [avgOrder]: any = await pool.query(`
      SELECT COALESCE(AVG(total_price), 0) as avg
      FROM orders
      WHERE order_status != 'cancelled'
    `);

    // Cast utilization (today)
    const [totalCasts]: any = await pool.query(`
      SELECT COUNT(*) as count FROM casts WHERE is_available = 1
    `);

    const [workingCasts]: any = await pool.query(`
      SELECT COUNT(DISTINCT cast_id) as count
      FROM orders
      WHERE business_date = ? AND cast_id IS NOT NULL
    `, [today]);

    const castUtilization = totalCasts[0].count > 0 
      ? (workingCasts[0].count / totalCasts[0].count) * 100 
      : 0;

    res.json({
      todaySales: todaySales[0].total,
      todayOrders: todaySales[0].count,
      newCustomers: newCustomers[0].count,
      repeatRate,
      avgOrderValue: avgOrder[0].avg,
      castUtilization
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales data for date range
router.get('/sales', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end dates are required' });
    }

    const [salesData] = await pool.query(`
      SELECT 
        business_date as date,
        COALESCE(SUM(total_price), 0) as total,
        COUNT(*) as count
      FROM orders
      WHERE business_date BETWEEN ? AND ?
      AND order_status != 'cancelled'
      GROUP BY business_date
      ORDER BY business_date
    `, [start, end]);

    res.json(salesData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
