import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database.js';
import { env } from '../config/env.js';
import { generateOTP, verifyOTP } from '../services/otpService.js';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

const mfaSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Código debe tener 6 dígitos'),
});

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, password } = parsed.data;
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const otp = generateOTP(admin.id);
    console.log(`[OTP SIMULADO] Código para ${email}: ${otp}`);

    res.json({
      message: 'Código de verificación enviado a tu correo',
      mfaRequired: true,
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
      { adminId: admin.id, email: admin.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    res.json({
      message: 'Autenticación exitosa',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        nombre: admin.nombre,
      },
    });
  } catch (error) {
    console.error('Error en verifyMFA:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
