import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database.js';
import { env } from '../config/env.js';
import { generateOTP, verifyOTP } from '../services/otpService.js';
import { recordFailedAttempt, isLocked, clearAttempts, getRemainingLockoutMinutes } from '../services/lockoutService.js';
import { registrarAuditoria } from '../services/auditService.js';

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

      if (isLocked(lockKey)) {
        const mins = getRemainingLockoutMinutes(lockKey);
        res.status(429).json({ error: `Cuenta bloqueada. Intenta de nuevo en ${mins} minutos.` });
        return;
      }

      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid) {
        recordFailedAttempt(lockKey);
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      clearAttempts(lockKey);

      const otp = generateOTP(admin.id);
      console.log(`[OTP ADMIN] Código para ${email}: ${otp}`);

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

    if (isLocked(lockKey)) {
      const mins = getRemainingLockoutMinutes(lockKey);
      res.status(429).json({ error: `Cuenta bloqueada. Intenta de nuevo en ${mins} minutos.` });
      return;
    }

    if (!colab || !colab.activo) {
      recordFailedAttempt(lockKey);
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const valid = await bcrypt.compare(password, colab.passwordHash);
    if (!valid) {
      recordFailedAttempt(lockKey);
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    clearAttempts(lockKey);

    const token = jwt.sign(
      { adminId: colab.id, email: colab.email, role: 'colaborador' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    res.json({
      message: 'Autenticación exitosa',
      token,
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
      res.status(403).json({ error: 'Código inválido o expirado' });
      return;
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

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
      token,
      admin: { id: admin.id, email: admin.email, nombre: admin.nombre, role: 'admin' },
    });
  } catch (error) {
    console.error('Error en verifyMFA:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
