import express from 'express';
import { login, createUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', createUser);

export default router;