import axios from "axios"

export const dockerOrchestrator = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

dockerOrchestrator.interceptors.request.use((config) => {
  const stored = localStorage.getItem("saas_orchestrator_session")
  if (stored) {
    try {
      const data = JSON.parse(stored)
      if (data.token) {
        config.headers.Authorization = `Bearer ${data.token}`
      }
    } catch {
      // ignore
    }
  }
  return config
})

dockerOrchestrator.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response
      if (status === 401 && !error.config?.url?.includes("/api/auth/session")) {
        localStorage.removeItem("saas_orchestrator_session")
        window.location.href = "/login"
      } else if (status === 403) {
        console.warn("Docker Orchestrator: Forbidden")
      } else if (status >= 500) {
        console.error("Docker Orchestrator: Server error", error.response.data)
      }
    }
    return Promise.reject(error)
  }
)
