import express from 'express';
import { getCoupons, createCoupon, updateCoupon, toggleCouponStatus } from '../controllers/couponsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('admin', 'zonal_manager'), getCoupons);
router.post('/', authenticateToken, requireRole('admin'), createCoupon);
router.put('/:id', authenticateToken, requireRole('admin'), updateCoupon);
router.put('/:id/toggle', authenticateToken, requireRole('admin'), toggleCouponStatus);

export default router;