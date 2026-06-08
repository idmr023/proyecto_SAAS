import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthRequest, JWTPayload } from '../types/index.js';

function extractToken(req: AuthRequest): string | null {
  // 1. Try httpOnly cookie first
  if (req.cookies?.access_token) {
    return req.cookies.access_token;
  }
  // 2. Fallback to Authorization header (for transition period)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.admin || req.admin.role !== 'admin') {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    return;
  }
  next();
}
