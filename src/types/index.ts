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

export interface Portal {
  id: string
  name: string
  category: string
  module: string
  status: "running" | "stopped" | "deploying" | "error"
  url?: string
  createdAt: string
}
