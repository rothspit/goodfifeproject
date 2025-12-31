import { Router } from 'express';
import { pool } from '../config/database';

const router = Router();

// CTI webhook for incoming calls
router.post('/incoming-call', async (req, res) => {
  try {
    const { phone_number, call_id, timestamp } = req.body;
    
    if (!phone_number) {
      return res.status(400).json({ error: 'phone_number is required' });
    }

    // Search for customer
    const [customers]: any = await pool.query(
      'SELECT * FROM users WHERE phone_number = ? AND role = "customer" LIMIT 1',
      [phone_number]
    );

    if (customers.length === 0) {
      return res.json({
        found: false,
        message: '新規顧客です'
      });
    }

    const customer = customers[0];

    // Get recent orders
    const [recentOrders] = await pool.query(`
      SELECT o.*, 
             s.name as store_name,
             c.display_name as cast_name
      FROM orders o
      LEFT JOIN stores s ON o.store_id = s.id
      LEFT JOIN casts c ON o.cast_id = c.id
      WHERE o.customer_id = ?
      ORDER BY o.order_datetime DESC
      LIMIT 5
    `, [customer.id]);

    // Get customer notes
    const [notes] = await pool.query(
      'SELECT * FROM customer_notes WHERE customer_id = ? ORDER BY created_at DESC LIMIT 3',
      [customer.id]
    );

    res.json({
      found: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone_number: customer.phone_number,
        customer_type: customer.customer_type,
        total_orders: customer.total_orders,
        last_visit_date: customer.last_visit_date,
        notes: customer.notes
      },
      recentOrders,
      customerNotes: notes,
      call_info: {
        call_id,
        timestamp: timestamp || new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer info by phone (for CTI)
router.get('/customer-lookup', async (req, res) => {
  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({ error: 'phone is required' });
    }

    // Remove hyphens and spaces
    const cleanPhone = String(phone).replace(/[-\s]/g, '');

    // Search for customer
    const [customers]: any = await pool.query(
      'SELECT * FROM users WHERE REPLACE(phone_number, "-", "") = ? AND role = "customer" LIMIT 1',
      [cleanPhone]
    );

    if (customers.length === 0) {
      return res.json({
        found: false,
        message: '顧客が見つかりません'
      });
    }

    const customer = customers[0];

    // Get recent orders
    const [recentOrders] = await pool.query(`
      SELECT o.*, 
             s.name as store_name,
             c.display_name as cast_name
      FROM orders o
      LEFT JOIN stores s ON o.store_id = s.id
      LEFT JOIN casts c ON o.cast_id = c.id
      WHERE o.customer_id = ?
      ORDER BY o.order_datetime DESC
      LIMIT 5
    `, [customer.id]);

    res.json({
      found: true,
      customer,
      recentOrders
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
