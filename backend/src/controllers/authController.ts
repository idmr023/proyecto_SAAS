import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database.js';
import { env } from '../config/env.js';
import { generateOTP, verifyOTP } from '../services/otpService.js';
import { recordFailedAttempt, isLocked, clearAttempts, getRemainingLockoutMinutes } from '../services/lockoutService.js';
import { registrarAuditoria } from '../services/auditService.js';
import type { AuthRequest, JWTPayload, RefreshPayload } from '../types/index.js';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

const mfaSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Código debe tener 6 dígitos'),
});

async function getClientIp(req: Request): Promise<string> {
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) return String(cfIp);
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.ip || 'unknown';
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  const isProduction = env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' as const : 'lax' as const,
    path: '/',
  };

  res.cookie('access_token', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
}

function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(
    { ...payload, type: 'refresh' } as RefreshPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
  );
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, password } = parsed.data;

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (admin) {
      const lockKey = `admin:${email}`;

      if (await isLocked(lockKey)) {
        const mins = await getRemainingLockoutMinutes(lockKey);
        res.status(429).json({ error: `Cuenta bloqueada. Intenta de nuevo en ${mins} minutos.` });
        return;
      }

      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid) {
        await recordFailedAttempt(lockKey);
        await registrarAuditoria({
          adminId: admin.id,
          accion: 'LOGIN_FALLIDO',
          entidad: 'Admin',
          entidadId: admin.id,
          detalle: `Intento fallido de login para ${email}`,
          ip: await getClientIp(req),
        });
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      await clearAttempts(lockKey);

      const otp = generateOTP(admin.id);
      if (env.NODE_ENV !== 'production') {
        console.log(`[OTP ADMIN] Código para ${email}: ${otp}`);
      }

      await registrarAuditoria({
        adminId: admin.id,
        accion: 'LOGIN_OTP_ENVIADO',
        entidad: 'Admin',
        entidadId: admin.id,
        detalle: `OTP enviado a ${email}`,
        ip: await getClientIp(req),
      });

      res.json({ message: 'Código de verificación enviado a tu correo', mfaRequired: true, role: 'admin' });
      return;
    }

    const colab = await prisma.colaborador.findUnique({ where: { email } });
    const lockKey = `colab:${email}`;

    if (await isLocked(lockKey)) {
      const mins = await getRemainingLockoutMinutes(lockKey);
      res.status(429).json({ error: `Cuenta bloqueada. Intenta de nuevo en ${mins} minutos.` });
      return;
    }

    if (!colab || !colab.activo) {
      await recordFailedAttempt(lockKey);
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const valid = await bcrypt.compare(password, colab.passwordHash);
    if (!valid) {
      await recordFailedAttempt(lockKey);
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    await clearAttempts(lockKey);

    const payload: JWTPayload = { adminId: colab.id, email: colab.email, role: 'colaborador' };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      message: 'Autenticación exitosa',
      token: accessToken,
      refreshToken,
      admin: { id: colab.id, email: colab.email, nombre: colab.nombre, role: 'colaborador' },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function verifyMFA(req: Request, res: Response): Promise<void> {
  try {
    const parsed = mfaSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, code } = parsed.data;

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    if (!verifyOTP(admin.id, code)) {
      await registrarAuditoria({
        adminId: admin.id,
        accion: 'MFA_FALLIDO',
        entidad: 'Admin',
        entidadId: admin.id,
        detalle: `MFA fallido para ${email}`,
        ip: await getClientIp(req),
      });
      res.status(403).json({ error: 'Código inválido o expirado' });
      return;
    }

    const payload: JWTPayload = { adminId: admin.id, email: admin.email, role: 'admin' };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    setAuthCookies(res, accessToken, refreshToken);

    await registrarAuditoria({
      adminId: admin.id,
      accion: 'LOGIN_EXITOSO',
      entidad: 'Admin',
      entidadId: admin.id,
      detalle: `Admin ${email} autenticado vía MFA`,
      ip: await getClientIp(req),
    });

    res.json({
      message: 'Autenticación exitosa',
      token: accessToken,
      refreshToken,
      admin: { id: admin.id, email: admin.email, nombre: admin.nombre, role: 'admin' },
    });
  } catch (error) {
    console.error('Error en verifyMFA:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.refresh_token || req.body?.refreshToken;

    if (!token) {
      res.status(401).json({ error: 'Refresh token no proporcionado' });
      return;
    }

    let decoded: RefreshPayload;
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
    } catch {
      res.clearCookie('access_token', { path: '/' });
      res.clearCookie('refresh_token', { path: '/' });
      res.status(401).json({ error: 'Refresh token inválido o expirado' });
      return;
    }

    if (decoded.type !== 'refresh') {
      res.status(401).json({ error: 'Tipo de token inválido' });
      return;
    }

    const payload: JWTPayload = {
      adminId: decoded.adminId,
      email: decoded.email,
      role: decoded.role,
    };

    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Error en refresh:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getSession(req: AuthRequest, res: Response): Promise<void> {
  res.json({
    admin: {
      id: req.admin!.adminId,
      email: req.admin!.email,
      role: req.admin!.role,
    },
  });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
  res.json({ message: 'Sesión cerrada exitosamente' });
}
