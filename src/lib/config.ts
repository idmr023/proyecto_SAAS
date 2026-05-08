import { createClient } from "@supabase/supabase-js"
import axios from "axios"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ""
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""

export const IS_DEMO = !supabaseUrl || !supabaseAnonKey

function createSupabaseClient() {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.info("[DEMO] Supabase no configurado. Modo demo activado.")
      return null
    }
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch {
    console.warn("[DEMO] Error creando cliente Supabase. Modo demo activado.")
    return null
  }
}

export const supabase = createSupabaseClient()

export const dockerOrchestrator = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

dockerOrchestrator.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response
      if (status === 401) {
        console.warn("Docker Orchestrator: Unauthorized")
      } else if (status === 403) {
        console.warn("Docker Orchestrator: Forbidden")
      } else if (status >= 500) {
        console.error("Docker Orchestrator: Server error", error.response.data)
      }
    }
    return Promise.reject(error)
  }
)
