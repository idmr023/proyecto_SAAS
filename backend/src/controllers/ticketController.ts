import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import type { AuthRequest } from '../types/index.js';
import { registrarAuditoria } from '../services/auditService.js';

const createTicketSchema = z.object({
  empresaId: z.string().uuid().optional(),
  cliente: z.string().min(2, 'Nombre del cliente requerido'),
  email: z.string().email().optional().or(z.literal('')),
  telefono: z.string().optional(),
  descripcion: z.string().min(10, 'Describe el pedido (mín. 10 caracteres)'),
});

const assignSchema = z.object({
  colaboradorId: z.string().uuid('Colaborador inválido'),
});

const statusSchema = z.object({
  estado: z.enum(['pendiente', 'en_proceso', 'resuelto', 'cerrado']),
});

async function getClientIp(req: any): Promise<string> {
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) return String(cfIp);
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.ip || 'unknown';
}

export async function createTicket(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = createTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const ticket = await prisma.ticket.create({ data: parsed.data });

    await registrarAuditoria({
      accion: 'TICKET_CREADO',
      entidad: 'Ticket',
      entidadId: ticket.id,
      detalle: `Ticket de ${parsed.data.cliente}`,
      ip: await getClientIp(req),
    });

    res.status(201).json({ message: 'Ticket creado exitosamente', ticket });
  } catch (error) {
    console.error('Error creando ticket:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getTickets(req: AuthRequest, res: Response): Promise<void> {
  try {
    const isAdmin = req.admin?.role === 'admin';
    const isColab = req.admin?.role === 'colaborador';

    const where: any = {};

    if (isColab) {
      where.asignadoAId = req.admin!.adminId;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        empresa: { select: { nombre: true, subdominio: true } },
        asignadoA: { select: { id: true, nombre: true, email: true } },
      },
    });

    const colaboradores = isAdmin
      ? await prisma.colaborador.findMany({
          where: { activo: true },
          select: { id: true, nombre: true, email: true },
          orderBy: { nombre: 'asc' },
        })
      : [];

    res.json({ tickets, colaboradores });
  } catch (error) {
    console.error('Error obteniendo tickets:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function assignTicket(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsed = assignSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const colab = await prisma.colaborador.findUnique({ where: { id: parsed.data.colaboradorId } });
    if (!colab || !colab.activo) {
      res.status(404).json({ error: 'Colaborador no encontrado' });
      return;
    }

    const ticket = await prisma.ticket.update({
      where: { id: id as string },
      data: {
        asignadoAId: colab.id,
        asignadoPor: req.admin?.email,
        estado: 'en_proceso',
      },
      include: {
        asignadoA: { select: { id: true, nombre: true, email: true } },
      },
    });

    await registrarAuditoria({
      adminId: req.admin?.adminId,
      accion: 'TICKET_ASIGNADO',
      entidad: 'Ticket',
      entidadId: ticket.id,
      detalle: `Asignado a ${colab.nombre} (${colab.email})`,
      ip: await getClientIp(req),
    });

    res.json({ message: 'Ticket asignado', ticket });
  } catch (error) {
    console.error('Error asignando ticket:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function updateTicketStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Estado inválido' });
      return;
    }

    const ticket = await prisma.ticket.update({
      where: { id: id as string },
      data: { estado: parsed.data.estado },
    });

    await registrarAuditoria({
      adminId: req.admin?.adminId,
      accion: 'TICKET_ESTADO',
      entidad: 'Ticket',
      entidadId: ticket.id,
      detalle: `Estado cambiado a ${parsed.data.estado}`,
      ip: await getClientIp(req),
    });

    res.json({ message: 'Estado actualizado', ticket });
  } catch (error) {
    console.error('Error actualizando ticket:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
