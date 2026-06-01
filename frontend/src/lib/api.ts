import { dockerOrchestrator } from "./config"

export interface DeployPayload {
  nombre: string
  rubro: string
  subdominio: string
  modulos: string[]
}

export interface EmpresaStatus {
  id: string
  nombre: string
  subdominio: string
  estado: string
  contenedorEstado: string
  contenedorId: string | null
  puerto: number | null
}

export interface StatusResponse {
  empresas: EmpresaStatus[]
  resumen: { total: number; activas: number; detenidas: number; error: number }
}

export interface AuthResponse {
  message: string
  token?: string
  admin?: { id: string; email: string; nombre: string }
  mfaRequired?: boolean
}

export interface DeployResponse {
  message: string
  empresa: {
    id: string
    nombre: string
    subdominio: string
    modulos: string[]
    contenedorId?: string
    puerto?: number
  }
}

export interface LogEntry {
  id: string
  empresaId: string
  contenedorId: string | null
  imagen: string
  puerto: number | null
  estado: string
  mensaje: string | null
  createdAt: string
}

export interface LogsResponse {
  logs: string
  historial: LogEntry[]
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await dockerOrchestrator.post<AuthResponse>("/api/auth/login", { email, password })
  return data
}

export async function verifyMfa(email: string, code: string): Promise<AuthResponse> {
  const { data } = await dockerOrchestrator.post<AuthResponse>("/api/auth/verify-mfa", { email, code })
  return data
}

export async function deployModule(payload: DeployPayload): Promise<DeployResponse> {
  const { data } = await dockerOrchestrator.post<DeployResponse>("/api/orchestrator/deploy", payload)
  return data
}

export async function getStatus(): Promise<StatusResponse> {
  const { data } = await dockerOrchestrator.get<StatusResponse>("/api/orchestrator/status")
  return data
}

export async function stopEmpresa(id: string): Promise<{ message: string }> {
  const { data } = await dockerOrchestrator.post<{ message: string }>(`/api/orchestrator/stop/${id}`)
  return data
}

export async function startEmpresa(id: string): Promise<{ message: string }> {
  const { data } = await dockerOrchestrator.post<{ message: string }>(`/api/orchestrator/start/${id}`)
  return data
}

export async function restartEmpresa(id: string): Promise<{ message: string }> {
  const { data } = await dockerOrchestrator.post<{ message: string }>(`/api/orchestrator/restart/${id}`)
  return data
}

export async function getLogs(id: string): Promise<LogsResponse> {
  const { data } = await dockerOrchestrator.get<LogsResponse>(`/api/orchestrator/logs/${id}`)
  return data
}
