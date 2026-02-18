import pool from '../config/database.js';

export const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, loyaltyTier, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT c.*, u.first_name, u.last_name, u.email, u.phone,
             COUNT(o.id) as total_orders,
             COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_spent,
             MAX(o.created_at) as last_order_date
      FROM customers c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN orders o ON c.id = o.customer_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (loyaltyTier && loyaltyTier !== 'all') {
      paramCount++;
      query += ` AND c.loyalty_tier = $${paramCount}`;
      params.push(loyaltyTier);
    }
    
    if (search) {
      paramCount++;
      query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    query += ` GROUP BY c.id, u.first_name, u.last_name, u.email, u.phone
               ORDER BY c.created_at DESC 
               LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const customers = await pool.query(query, params);
    
    res.json({ customers: customers.rows });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address, pincode, zoneId } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role) 
         VALUES ($1, $2, $3, $4, $5, 'customer') RETURNING id`,
        [email, password, firstName, lastName, phone]
      );
      
      const userId = userResult.rows[0].id;
      
      // Create customer
      const customerResult = await client.query(
        `INSERT INTO customers (user_id, address, pincode, zone_id) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, address, pincode, zoneId]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json({ customer: customerResult.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { address, pincode, loyaltyTier } = req.body;
    
    const result = await pool.query(
      `UPDATE customers 
       SET address = $1, pincode = $2, loyalty_tier = $3
       WHERE id = $4 RETURNING *`,
      [address, pincode, loyaltyTier, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({ customer: result.rows[0] });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};