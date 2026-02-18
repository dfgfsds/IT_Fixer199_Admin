import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const getTickets = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT t.*, 
             CONCAT(cu.first_name, ' ', cu.last_name) as customer_name,
             cu.phone as customer_phone,
             o.order_number,
             CONCAT(au.first_name, ' ', au.last_name) as assigned_name
      FROM tickets t
      JOIN customers c ON t.customer_id = c.id
      JOIN users cu ON c.user_id = cu.id
      LEFT JOIN orders o ON t.order_id = o.id
      LEFT JOIN users au ON t.assigned_to = au.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (status && status !== 'all') {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }
    
    if (priority && priority !== 'all') {
      paramCount++;
      query += ` AND t.priority = $${paramCount}`;
      params.push(priority);
    }
    
    if (search) {
      paramCount++;
      query += ` AND (t.ticket_number ILIKE $${paramCount} OR t.subject ILIKE $${paramCount} OR cu.first_name ILIKE $${paramCount} OR cu.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const tickets = await pool.query(query, params);
    
    res.json({ tickets: tickets.rows });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { customerId, orderId, subject, description, priority = 'normal' } = req.body;
    
    const ticketNumber = `TKT-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO tickets (ticket_number, customer_id, order_id, subject, description, priority) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [ticketNumber, customerId, orderId, subject, description, priority]
    );
    
    res.status(201).json({ ticket: result.rows[0] });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution, assignedTo } = req.body;
    
    let updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    let params = [status];
    let paramCount = 1;
    
    if (resolution) {
      paramCount++;
      updateFields.push(`resolution = $${paramCount}`);
      params.push(resolution);
    }
    
    if (assignedTo) {
      paramCount++;
      updateFields.push(`assigned_to = $${paramCount}`);
      params.push(assignedTo);
    }
    
    if (status === 'resolved') {
      updateFields.push('resolved_at = CURRENT_TIMESTAMP');
    }
    
    paramCount++;
    const query = `
      UPDATE tickets 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    params.push(id);
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ ticket: result.rows[0] });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};