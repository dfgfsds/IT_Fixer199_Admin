import express from 'express';
import { getTickets, createTicket, updateTicketStatus } from '../controllers/ticketsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('admin', 'zonal_manager'), getTickets);
router.post('/', authenticateToken, requireRole('admin', 'zonal_manager'), createTicket);
router.put('/:id/status', authenticateToken, requireRole('admin', 'zonal_manager'), updateTicketStatus);

export default router;