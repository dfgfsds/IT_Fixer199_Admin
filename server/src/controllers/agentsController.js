import pool from '../config/database.js';

export const getAgents = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, zone, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT a.*, u.first_name, u.last_name, u.email, u.phone, z.name as zone_name,
             COUNT(o.id) as total_orders,
             COALESCE(AVG(o.rating), 0) as avg_rating,
             COALESCE(SUM(CASE WHEN DATE(o.completed_at) = CURRENT_DATE THEN i.amount ELSE 0 END), 0) as earnings_today,
             COALESCE(SUM(CASE WHEN DATE_TRUNC('month', o.completed_at) = DATE_TRUNC('month', CURRENT_DATE) THEN i.amount ELSE 0 END), 0) as earnings_month
      FROM agents a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN zones z ON a.zone_id = z.id
      LEFT JOIN orders o ON a.id = o.agent_id AND o.status = 'completed'
      LEFT JOIN incentives i ON a.id = i.agent_id AND i.status = 'paid'
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (status && status !== 'all') {
      paramCount++;
      if (status === 'available') {
        query += ` AND a.is_available = true`;
      } else if (status === 'offline') {
        query += ` AND a.is_available = false`;
      }
    }
    
    if (zone && zone !== 'all') {
      paramCount++;
      query += ` AND a.zone_id = $${paramCount}`;
      params.push(zone);
    }
    
    if (search) {
      paramCount++;
      query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR a.agent_code ILIKE $${paramCount} OR u.phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    query += ` GROUP BY a.id, u.first_name, u.last_name, u.email, u.phone, z.name
               ORDER BY a.created_at DESC 
               LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const agents = await pool.query(query, params);
    
    res.json({ agents: agents.rows });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAgent = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, zoneId, skills, agentCode } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role) 
         VALUES ($1, $2, $3, $4, $5, 'agent') RETURNING id`,
        [email, password, firstName, lastName, phone]
      );
      
      const userId = userResult.rows[0].id;
      
      // Create agent
      const agentResult = await client.query(
        `INSERT INTO agents (user_id, zone_id, agent_code, skills) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, zoneId, agentCode, skills]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json({ agent: agentResult.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { skills, verificationStatus, isAvailable } = req.body;
    
    const result = await pool.query(
      `UPDATE agents 
       SET skills = $1, verification_status = $2, is_available = $3
       WHERE id = $4 RETURNING *`,
      [skills, verificationStatus, isAvailable, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json({ agent: result.rows[0] });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAgentAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;
    
    const result = await pool.query(
      `UPDATE agents 
       SET is_available = $1
       WHERE id = $2 RETURNING *`,
      [is_available, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json({ agent: result.rows[0] });
  } catch (error) {
    console.error('Update agent availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};