import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import { createTicket, getTickets, assignTicket, updateTicketStatus } from '../controllers/ticketController.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const ticketLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', ticketLimiter, createTicket);
router.get('/', authMiddleware, getTickets);
router.patch('/:id/assign', authMiddleware, requireAdmin, assignTicket);
router.patch('/:id/status', authMiddleware, updateTicketStatus);

export default router;
