import pool from '../config/database.js';

export const getCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT c.*,
             CASE 
               WHEN c.usage_limit > 0 THEN (c.used_count::float / c.usage_limit * 100)
               ELSE 0
             END as redemption_rate,
             COALESCE(SUM(CASE WHEN c.discount_type = 'flat' THEN c.discount_value ELSE 0 END), 0) as total_savings
      FROM coupons c
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (status && status !== 'all') {
      paramCount++;
      if (status === 'active') {
        query += ` AND c.is_active = true AND c.valid_until > CURRENT_TIMESTAMP`;
      } else if (status === 'inactive') {
        query += ` AND c.is_active = false`;
      } else if (status === 'expired') {
        query += ` AND c.valid_until < CURRENT_TIMESTAMP`;
      }
    }
    
    if (type && type !== 'all') {
      paramCount++;
      query += ` AND c.discount_type = $${paramCount}`;
      params.push(type);
    }
    
    if (search) {
      paramCount++;
      query += ` AND (c.code ILIKE $${paramCount} OR c.title ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    query += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const coupons = await pool.query(query, params);
    
    res.json({ coupons: coupons.rows });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount,
      usage_limit,
      valid_from,
      valid_until
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO coupons (
        code, title, description, discount_type, discount_value,
        min_order_amount, max_discount, usage_limit, valid_from, valid_until
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        code, title, description, discount_type, discount_value,
        min_order_amount, max_discount, usage_limit, valid_from, valid_until
      ]
    );
    
    res.status(201).json({ coupon: result.rows[0] });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      discount_value,
      min_order_amount,
      max_discount,
      usage_limit,
      valid_from,
      valid_until
    } = req.body;
    
    const result = await pool.query(
      `UPDATE coupons 
       SET title = $1, description = $2, discount_value = $3,
           min_order_amount = $4, max_discount = $5, usage_limit = $6,
           valid_from = $7, valid_until = $8
       WHERE id = $9 RETURNING *`,
      [title, description, discount_value, min_order_amount, max_discount, usage_limit, valid_from, valid_until, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    
    res.json({ coupon: result.rows[0] });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const result = await pool.query(
      `UPDATE coupons 
       SET is_active = $1
       WHERE id = $2 RETURNING *`,
      [is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    
    res.json({ coupon: result.rows[0] });
  } catch (error) {
    console.error('Toggle coupon status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};