import { Router } from 'express';
import { login, verifyMFA } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/verify-mfa', verifyMFA);

export default router;
