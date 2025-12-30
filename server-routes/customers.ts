import { Router } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { pool } from '../config/database';

const router = Router();
const upload = multer({ dest: '/tmp/' });

// Get all customers
router.get('/', async (req, res) => {
  try {
    const [customers] = await pool.query('SELECT * FROM users WHERE role = "customer" ORDER BY created_at DESC');
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search customer by phone
router.get('/search', async (req, res) => {
  try {
    const { phone_number } = req.query;
    if (!phone_number) {
      return res.status(400).json({ error: 'phone_number is required' });
    }
    
    const [customers]: any = await pool.query(
      'SELECT * FROM users WHERE phone_number = ? AND role = "customer" LIMIT 1',
      [phone_number]
    );
    
    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customers[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const [customers]: any = await pool.query(
      'SELECT * FROM users WHERE id = ? AND role = "customer"',
      [req.params.id]
    );
    
    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customers[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer orders
router.get('/:id/orders', async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.*, 
             s.name as store_name,
             c.display_name as cast_name
      FROM orders o
      LEFT JOIN stores s ON o.store_id = s.id
      LEFT JOIN casts c ON o.cast_id = c.id
      WHERE o.customer_id = ?
      ORDER BY o.order_datetime DESC
    `, [req.params.id]);
    
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const { phone_number, name, email, customer_type, home_address, home_transportation_fee, notes } = req.body;
    
    const [result]: any = await pool.query(`
      INSERT INTO users (phone_number, name, email, customer_type, home_address, home_transportation_fee, notes, role, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'customer', '')
    `, [phone_number, name, email || null, customer_type || 'new', home_address || null, home_transportation_fee || 0, notes || null]);
    
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, email, customer_type, home_address, home_transportation_fee, notes } = req.body;
    
    await pool.query(`
      UPDATE users 
      SET name = ?, email = ?, customer_type = ?, home_address = ?, home_transportation_fee = ?, notes = ?
      WHERE id = ? AND role = 'customer'
    `, [name, email, customer_type, home_address, home_transportation_fee, notes, req.params.id]);
    
    res.json({ id: req.params.id, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Import customers from CSV
router.post('/import', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results: any[] = [];
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file!.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const row of results) {
      try {
        const { phone_number, name, email, customer_type, home_address, home_transportation_fee, notes } = row;
        
        if (!phone_number || !name) {
          errors.push(`Row skipped: missing phone_number or name`);
          skipped++;
          continue;
        }

        // Check if customer exists
        const [existing]: any = await pool.query(
          'SELECT id FROM users WHERE phone_number = ? AND role = "customer"',
          [phone_number]
        );

        if (existing.length > 0) {
          // Update existing
          await pool.query(`
            UPDATE users 
            SET name = ?, email = ?, customer_type = ?, home_address = ?, home_transportation_fee = ?, notes = ?
            WHERE id = ?
          `, [name, email || null, customer_type || 'new', home_address || null, parseFloat(home_transportation_fee) || 0, notes || null, existing[0].id]);
        } else {
          // Insert new
          await pool.query(`
            INSERT INTO users (phone_number, name, email, customer_type, home_address, home_transportation_fee, notes, role, password_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'customer', '')
          `, [phone_number, name, email || null, customer_type || 'new', home_address || null, parseFloat(home_transportation_fee) || 0, notes || null]);
        }

        imported++;
      } catch (error: any) {
        errors.push(`Error processing row: ${error.message}`);
        skipped++;
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      imported,
      skipped,
      errors
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
