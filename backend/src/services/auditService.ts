import prisma from '../config/database.js';

interface AuditInput {
  adminId?: string;
  accion: string;
  entidad: string;
  entidadId?: string;
  detalle?: string;
  ip?: string;
}

export async function registrarAuditoria(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({ data: input });
  } catch (error) {
    console.error('Error registrando auditoría:', error);
  }
}
