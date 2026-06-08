import { Request } from 'express';

export type UserRole = 'admin' | 'colaborador';

export interface JWTPayload {
  adminId: string;
  email: string;
  role: UserRole;
}

export interface RefreshPayload {
  adminId: string;
  email: string;
  role: UserRole;
  type: 'refresh';
}

export interface AuthRequest extends Request {
  admin?: JWTPayload;
}

export interface DeployInput {
  nombre: string;
  rubro: string;
  subdominio: string;
  modulos: string[];
}

export type ContainerStatus = 'running' | 'stopped' | 'error';
export type EmpresaEstado = 'activa' | 'detenida' | 'error';
