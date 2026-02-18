import express from 'express';
import { getAgents, createAgent, updateAgent, updateAgentAvailability } from '../controllers/agentsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('admin', 'zonal_manager'), getAgents);
router.post('/', authenticateToken, requireRole('admin'), createAgent);
router.put('/:id', authenticateToken, requireRole('admin'), updateAgent);
router.put('/:id/availability', authenticateToken, requireRole('admin', 'zonal_manager'), updateAgentAvailability);

export default router;