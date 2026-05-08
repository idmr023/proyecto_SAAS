import { dockerOrchestrator } from "./config"

export interface DeployPayload {
  clientName: string
  category: string
  module: string
  parameters?: Record<string, string>
}

export interface PortalInfo {
  id: string
  name: string
  category: string
  module: string
  status: "running" | "stopped" | "deploying" | "error"
  url?: string
  createdAt: string
}

export async function deployModule(payload: DeployPayload): Promise<{ deploymentId: string }> {
  const { data } = await dockerOrchestrator.post<{ deploymentId: string }>("/api/deploy", payload)
  return data
}

export async function getPortals(): Promise<PortalInfo[]> {
  const { data } = await dockerOrchestrator.get<PortalInfo[]>("/api/portals")
  return data
}

export async function getPortalStatus(id: string): Promise<PortalInfo> {
  const { data } = await dockerOrchestrator.get<PortalInfo>(`/api/portals/${id}`)
  return data
}

export async function deletePortal(id: string): Promise<void> {
  await dockerOrchestrator.delete(`/api/portals/${id}`)
}
