import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT o.*, c.user_id, u.first_name as customer_first_name, u.last_name as customer_last_name, u.phone,
             a.user_id as agent_user_id, au.first_name as agent_first_name, au.last_name as agent_last_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN agents a ON o.agent_id = a.id
      LEFT JOIN users au ON a.user_id = au.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (status && status !== 'all') {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
    }
    
    if (search) {
      paramCount++;
      query += ` AND (o.order_number ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const orders = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM orders o JOIN customers c ON o.customer_id = c.id JOIN users u ON c.user_id = u.id WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;
    
    if (status && status !== 'all') {
      countParamCount++;
      countQuery += ` AND o.status = $${countParamCount}`;
      countParams.push(status);
    }
    
    if (search) {
      countParamCount++;
      countQuery += ` AND (o.order_number ILIKE $${countParamCount} OR u.first_name ILIKE $${countParamCount} OR u.last_name ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }
    
    const totalCount = await pool.query(countQuery, countParams);
    
    res.json({
      orders: orders.rows,
      pagination: {
        total: parseInt(totalCount.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, agentId } = req.body;
    
    const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    let updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    let params = [status];
    let paramCount = 1;
    
    if (agentId) {
      paramCount++;
      updateFields.push(`agent_id = $${paramCount}`);
      params.push(agentId);
    }
    
    if (status === 'in_progress') {
      updateFields.push('started_at = CURRENT_TIMESTAMP');
    } else if (status === 'completed') {
      updateFields.push('completed_at = CURRENT_TIMESTAMP');
    }
    
    paramCount++;
    const query = `
      UPDATE orders 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    params.push(id);
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }
    
    // Check if agent exists and is available
    const agentResult = await pool.query(
      'SELECT id FROM agents WHERE id = $1 AND is_available = true',
      [agentId]
    );
    
    if (agentResult.rows.length === 0) {
      return res.status(400).json({ error: 'Agent not found or not available' });
    }
    
    const result = await pool.query(
      `UPDATE orders 
       SET agent_id = $1, status = 'assigned', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [agentId, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or already assigned' });
    }
    
    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Assign agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refundOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundAmount } = req.body;
    
    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update order status
      const orderResult = await client.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['refunded', id]
      );
      
      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }
      
      // Create refund record (you might want to add a refunds table)
      // For now, we'll just update the payment status
      await client.query(
        'UPDATE payments SET status = $1 WHERE order_id = $2',
        ['refunded', id]
      );
      
      await client.query('COMMIT');
      
      res.json({ order: orderResult.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Refund order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};