import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import orchestratorRoutes from './routes/orchestratorRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';

const app = express();

if (!env.DATABASE_URL || !env.JWT_SECRET || !env.JWT_REFRESH_SECRET) {
  console.error('❌ Faltan variables de entorno críticas: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET');
  process.exit(1);
}

// HTTPS redirect en producción
if (env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https' && req.headers['x-forwarded-proto'] !== undefined) {
      res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
      return;
    }
    next();
  });
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", env.NODE_ENV === 'production' ? 'https://*.supabase.co' : 'http://localhost:5173'],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

const allowedOrigins: (string | RegExp)[] = env.NODE_ENV === 'production'
  ? [/\.ripnel\.app$/, ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])]
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(cookieParser());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/orchestrator', orchestratorRoutes);
app.use('/api/tickets', ticketRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(env.PORT, () => {
  console.log(`🚀 SaaS Orchestrator API corriendo en puerto ${env.PORT}`);
  console.log(`   Entorno: ${env.NODE_ENV}`);
  console.log(`   CSP habilitado, rate limits activos, httpOnly cookies activas`);
});

export default app;
