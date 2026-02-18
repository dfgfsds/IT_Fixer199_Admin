import pool from '../config/database.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get today's stats
    const today = new Date().toISOString().split('T')[0];
    
    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      activeAgents,
      pendingTickets,
      completedToday,
      avgRating
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM orders'),
      pool.query('SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = $1', [today]),
      pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = $1', ['completed']),
      pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = $1 AND DATE(created_at) = $2', ['completed', today]),
      pool.query('SELECT COUNT(*) as count FROM agents WHERE is_available = true'),
      pool.query('SELECT COUNT(*) as count FROM tickets WHERE status IN ($1, $2)', ['open', 'in_progress']),
      pool.query('SELECT COUNT(*) as count FROM orders WHERE status = $1 AND DATE(completed_at) = $2', ['completed', today]),
      pool.query('SELECT COALESCE(AVG(rating), 0) as avg FROM orders WHERE rating IS NOT NULL')
    ]);
    
    // Get recent orders
    const recentOrders = await pool.query(`
      SELECT o.*, c.user_id, u.first_name, u.last_name, u.phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);
    
    // Get top agents
    const topAgents = await pool.query(`
      SELECT a.*, u.first_name, u.last_name, 
             COUNT(o.id) as total_orders,
             COALESCE(AVG(o.rating), 0) as avg_rating
      FROM agents a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN orders o ON a.id = o.agent_id AND o.status = 'completed'
      GROUP BY a.id, u.first_name, u.last_name
      ORDER BY total_orders DESC, avg_rating DESC
      LIMIT 5
    `);
    
    // Get revenue trend for last 7 days
    const revenueTrend = await pool.query(`
      SELECT DATE(created_at) as date, 
             COALESCE(SUM(total_amount), 0) as revenue,
             COUNT(*) as orders
      FROM orders 
      WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    
    res.json({
      stats: {
        totalOrders: parseInt(totalOrders.rows[0].count),
        todayOrders: parseInt(todayOrders.rows[0].count),
        totalRevenue: parseFloat(totalRevenue.rows[0].total),
        todayRevenue: parseFloat(todayRevenue.rows[0].total),
        activeAgents: parseInt(activeAgents.rows[0].count),
        pendingTickets: parseInt(pendingTickets.rows[0].count),
        completedToday: parseInt(completedToday.rows[0].count),
        avgRating: parseFloat(avgRating.rows[0].avg)
      },
      recentOrders: recentOrders.rows,
      topAgents: topAgents.rows,
      revenueTrend: revenueTrend.rows
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};