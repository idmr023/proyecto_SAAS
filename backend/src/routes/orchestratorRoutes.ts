import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import {
  deploy,
  getStatus,
  stopEmpresa,
  startEmpresa,
  restartEmpresa,
  getLogs,
} from '../controllers/orchestratorController.js';

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.post('/deploy', deploy);
router.get('/status', getStatus);
router.post('/stop/:id', stopEmpresa);
router.post('/start/:id', startEmpresa);
router.post('/restart/:id', restartEmpresa);
router.get('/logs/:id', getLogs);

export default router;
