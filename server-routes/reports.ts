import { Router } from 'express';
import { pool } from '../config/database';

const router = Router();

// Generate daily report
router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }

    // Orders for the day
    const [orders] = await pool.query(`
      SELECT o.*, 
             u.name as customer_name, 
             u.phone_number as customer_phone,
             c.display_name as cast_name,
             s.name as store_name
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN casts c ON o.cast_id = c.id
      LEFT JOIN stores s ON o.store_id = s.id
      WHERE o.business_date = ?
      ORDER BY o.start_time
    `, [date]);

    // Summary
    const [summary]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(DISTINCT customer_id) as unique_customers,
        COALESCE(SUM(CASE WHEN order_status != 'cancelled' THEN total_price ELSE 0 END), 0) as total_sales,
        COALESCE(AVG(CASE WHEN order_status != 'cancelled' THEN total_price ELSE NULL END), 0) as avg_order_value
      FROM orders
      WHERE business_date = ?
    `, [date]);

    // Cast performance
    const [castPerformance] = await pool.query(`
      SELECT 
        c.display_name,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_price), 0) as total_sales
      FROM casts c
      LEFT JOIN orders o ON c.id = o.cast_id AND o.business_date = ? AND o.order_status != 'cancelled'
      WHERE c.is_available = 1
      GROUP BY c.id, c.display_name
      ORDER BY total_sales DESC
    `, [date]);

    res.json({
      date,
      summary: summary[0],
      orders,
      castPerformance,
      generated_at: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate monthly report
router.get('/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ error: 'year and month are required' });
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(Number(year), Number(month), 0).toISOString().split('T')[0];

    // Daily summary
    const [dailySummary] = await pool.query(`
      SELECT 
        business_date,
        COUNT(*) as order_count,
        COUNT(DISTINCT customer_id) as customer_count,
        COALESCE(SUM(CASE WHEN order_status != 'cancelled' THEN total_price ELSE 0 END), 0) as sales
      FROM orders
      WHERE business_date BETWEEN ? AND ?
      GROUP BY business_date
      ORDER BY business_date
    `, [startDate, endDate]);

    // Monthly totals
    const [monthlyTotals]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(DISTINCT customer_id) as unique_customers,
        COALESCE(SUM(CASE WHEN order_status != 'cancelled' THEN total_price ELSE 0 END), 0) as total_sales,
        COALESCE(AVG(CASE WHEN order_status != 'cancelled' THEN total_price ELSE NULL END), 0) as avg_order_value
      FROM orders
      WHERE business_date BETWEEN ? AND ?
    `, [startDate, endDate]);

    // New customers
    const [newCustomers]: any = await pool.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE role = 'customer' 
      AND DATE(created_at) BETWEEN ? AND ?
    `, [startDate, endDate]);

    // Top customers
    const [topCustomers] = await pool.query(`
      SELECT 
        u.name,
        u.phone_number,
        COUNT(o.id) as visit_count,
        COALESCE(SUM(o.total_price), 0) as total_spent
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.business_date BETWEEN ? AND ?
      AND o.order_status != 'cancelled'
      GROUP BY u.id, u.name, u.phone_number
      ORDER BY total_spent DESC
      LIMIT 10
    `, [startDate, endDate]);

    // Cast performance
    const [castPerformance] = await pool.query(`
      SELECT 
        c.display_name,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_price), 0) as total_sales,
        COALESCE(AVG(o.total_price), 0) as avg_order_value
      FROM casts c
      LEFT JOIN orders o ON c.id = o.cast_id 
        AND o.business_date BETWEEN ? AND ?
        AND o.order_status != 'cancelled'
      WHERE c.is_available = 1
      GROUP BY c.id, c.display_name
      ORDER BY total_sales DESC
    `, [startDate, endDate]);

    res.json({
      year,
      month,
      period: { start: startDate, end: endDate },
      summary: {
        ...monthlyTotals[0],
        new_customers: newCustomers[0].count
      },
      dailySummary,
      topCustomers,
      castPerformance,
      generated_at: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
