export interface Module {
  id: string
  name: string
  description: string
  icon: string
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  modules: Module[]
}

export interface Empresa {
  id: string
  name: string
  rubro: string
  subdomain: string
  status: "running" | "stopped" | "deploying" | "error"
  url?: string
  createdAt: string
  modules: string[]
  cpu: number
  memory: number
  region: string
}

export interface DeployLog {
  message: string
  timestamp: string
  type: "info" | "success" | "error" | "warn"
}
