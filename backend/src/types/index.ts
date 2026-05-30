import { Request } from 'express';

export interface JWTPayload {
  adminId: string;
  email: string;
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
