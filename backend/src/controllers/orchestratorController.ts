import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { deployContainer, stopContainer, startContainer, restartContainer, getContainerLogs } from '../services/dockerService.js';
import type { AuthRequest } from '../types/index.js';

const deploySchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  rubro: z.string().min(2, 'Rubro requerido'),
  subdominio: z.string().min(2, 'Subdominio requerido').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  modulos: z.array(z.string()).min(1, 'Selecciona al menos un módulo'),
});

export async function deploy(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = deploySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { nombre, rubro, subdominio, modulos } = parsed.data;
    const adminId = req.admin!.adminId;

    const existing = await prisma.mypeEmpresa.findUnique({ where: { subdominio } });
    if (existing) {
      res.status(409).json({ error: 'El subdominio ya está en uso' });
      return;
    }

    const empresa = await prisma.mypeEmpresa.create({
      data: {
        adminId,
        nombre,
        rubro,
        subdominio,
        modulos: {
          create: modulos.map((modulo) => ({
            modulo,
            activo: true,
            config: {},
          })),
        },
      },
      include: { modulos: true },
    });

    const dockerResult = deployContainer(empresa.id, subdominio, modulos);

    await prisma.contenedorLog.create({
      data: {
        empresaId: empresa.id,
        contenedorId: dockerResult.containerId || null,
        imagen: 'node:20-alpine',
        puerto: dockerResult.port || null,
        estado: dockerResult.success ? 'running' : 'error',
        mensaje: dockerResult.message,
      },
    });

    if (!dockerResult.success) {
      await prisma.mypeEmpresa.update({
        where: { id: empresa.id },
        data: { estado: 'error' },
      });
      res.status(500).json({ error: 'Error en despliegue Docker', details: dockerResult.message });
      return;
    }

    res.status(201).json({
      message: 'Empresa desplegada exitosamente',
      empresa: {
        id: empresa.id,
        nombre: empresa.nombre,
        subdominio: empresa.subdominio,
        modulos: empresa.modulos.map((m) => m.modulo),
        contenedorId: dockerResult.containerId,
        puerto: dockerResult.port,
      },
    });
  } catch (error) {
    console.error('Error en deploy:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const adminId = req.admin!.adminId;
    const empresas = await prisma.mypeEmpresa.findMany({
      where: { adminId },
      include: {
        contenedores: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const statusMap = empresas.map((emp) => {
      const ultimoLog = emp.contenedores[0];
      return {
        id: emp.id,
        nombre: emp.nombre,
        subdominio: emp.subdominio,
        estado: emp.estado,
        contenedorEstado: ultimoLog?.estado || 'stopped',
        contenedorId: ultimoLog?.contenedorId || null,
        puerto: ultimoLog?.puerto || null,
      };
    });

    const total = statusMap.length;
    const activas = statusMap.filter((e) => e.estado === 'activa').length;
    const detenidas = statusMap.filter((e) => e.estado === 'detenida').length;
    const error = statusMap.filter((e) => e.estado === 'error').length;

    res.json({
      empresas: statusMap,
      resumen: { total, activas, detenidas, error },
    });
  } catch (error) {
    console.error('Error en getStatus:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function stopEmpresa(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const empresa = await prisma.mypeEmpresa.findFirst({
      where: { id, adminId: req.admin!.adminId },
    });

    if (!empresa) {
      res.status(404).json({ error: 'Empresa no encontrada' });
      return;
    }

    const containerName = `mype-${empresa.subdominio}`;
    const result = stopContainer(containerName);

    await prisma.contenedorLog.create({
      data: {
        empresaId: empresa.id,
        estado: 'stopped',
        mensaje: result.message,
        imagen: 'node:20-alpine',
      },
    });

    await prisma.mypeEmpresa.update({ where: { id }, data: { estado: 'detenida' } });

    res.json({ message: result.message });
  } catch (error) {
    console.error('Error en stopEmpresa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function startEmpresa(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const empresa = await prisma.mypeEmpresa.findFirst({
      where: { id, adminId: req.admin!.adminId },
    });

    if (!empresa) {
      res.status(404).json({ error: 'Empresa no encontrada' });
      return;
    }

    const containerName = `mype-${empresa.subdominio}`;
    const result = startContainer(containerName);

    await prisma.contenedorLog.create({
      data: {
        empresaId: empresa.id,
        estado: 'running',
        mensaje: result.message,
        imagen: 'node:20-alpine',
      },
    });

    await prisma.mypeEmpresa.update({ where: { id }, data: { estado: 'activa' } });

    res.json({ message: result.message });
  } catch (error) {
    console.error('Error en startEmpresa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function restartEmpresa(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const empresa = await prisma.mypeEmpresa.findFirst({
      where: { id, adminId: req.admin!.adminId },
    });

    if (!empresa) {
      res.status(404).json({ error: 'Empresa no encontrada' });
      return;
    }

    const containerName = `mype-${empresa.subdominio}`;
    const result = restartContainer(containerName);

    await prisma.contenedorLog.create({
      data: {
        empresaId: empresa.id,
        estado: 'running',
        mensaje: result.message,
        imagen: 'node:20-alpine',
      },
    });

    await prisma.mypeEmpresa.update({ where: { id }, data: { estado: 'activa' } });

    res.json({ message: result.message });
  } catch (error) {
    console.error('Error en restartEmpresa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const empresa = await prisma.mypeEmpresa.findFirst({
      where: { id, adminId: req.admin!.adminId },
    });

    if (!empresa) {
      res.status(404).json({ error: 'Empresa no encontrada' });
      return;
    }

    const containerName = `mype-${empresa.subdominio}`;
    const logs = getContainerLogs(containerName);

    const dbLogs = await prisma.contenedorLog.findMany({
      where: { empresaId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ logs, historial: dbLogs });
  } catch (error) {
    console.error('Error en getLogs:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
