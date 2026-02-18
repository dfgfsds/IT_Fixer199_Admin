import express from 'express';
import { getCustomers, createCustomer, updateCustomer } from '../controllers/customersController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('admin', 'zonal_manager'), getCustomers);
router.post('/', authenticateToken, requireRole('admin'), createCustomer);
router.put('/:id', authenticateToken, requireRole('admin'), updateCustomer);

export default router;