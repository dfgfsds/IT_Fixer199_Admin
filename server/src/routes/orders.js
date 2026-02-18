import express from 'express';
import { getOrders, updateOrderStatus, assignAgent, refundOrder } from '../controllers/ordersController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('admin', 'zonal_manager'), getOrders);
router.put('/:id/status', authenticateToken, requireRole('admin', 'zonal_manager'), updateOrderStatus);
router.put('/:id/assign', authenticateToken, requireRole('admin', 'zonal_manager'), assignAgent);
router.put('/:id/refund', authenticateToken, requireRole('admin'), refundOrder);

export default router;