import { Router } from 'express';
import { pool } from '../config/database';

const router = Router();

// Get all stores
router.get('/', async (req, res) => {
  try {
    const [stores] = await pool.query('SELECT * FROM stores ORDER BY name');
    res.json(stores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
