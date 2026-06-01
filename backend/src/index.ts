import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import orchestratorRoutes from './routes/orchestratorRoutes.js';

const app = express();

app.use(helmet());

const allowedOrigins: (string | RegExp)[] = env.NODE_ENV === 'production'
  ? [/\.ripnel\.app$/, ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])]
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/orchestrator', orchestratorRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(env.PORT, () => {
  console.log(`🚀 SaaS Orchestrator API corriendo en puerto ${env.PORT}`);
  console.log(`   Entorno: ${env.NODE_ENV}`);
});

export default app;
