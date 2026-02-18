import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticateToken, requireRole('admin', 'zonal_manager'), getDashboardStats);

export default router;