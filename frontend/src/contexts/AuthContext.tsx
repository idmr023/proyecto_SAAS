import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase, IS_DEMO, dockerOrchestrator } from "@/lib/config"
import { toast } from "sonner"

export type UserRole = "admin" | "colaborador"

interface StoredSession {
  token: string
  user: {
    email: string
    id: string
    name?: string
    role: UserRole
  }
}

interface AuthContextType {
  session: boolean
  user: { email: string; id: string; name?: string; role: UserRole } | null
  loading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  verifyMfa: (code: string) => Promise<string | null>
  signOut: () => Promise<void>
  mfaPending: boolean
  setMfaPending: (v: boolean) => void
  pendingEmail: string
}

const AUTH_KEY = "saas_orchestrator_session"

function loadSession(): StoredSession | null {
  const stored = localStorage.getItem(AUTH_KEY)
  if (!stored) return null
  try {
    const parsed = JSON.parse(stored)
    if (!parsed.user?.role) {
      localStorage.removeItem(AUTH_KEY)
      return null
    }
    return parsed
  } catch {
    localStorage.removeItem(AUTH_KEY)
    return null
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadSession()
  const [session, setSession] = useState<boolean>(!!initial?.token)
  const [user, setUser] = useState<{ email: string; id: string; name?: string; role: UserRole } | null>(
    initial?.user ?? null
  )
  const [loading, setLoading] = useState(true)
  const [mfaPending, setMfaPending] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")

  // Verificar sesión activa vía cookie/httpOnly en el backend
  useEffect(() => {
    if (IS_DEMO) {
      setLoading(false)
      return
    }

    async function checkSession() {
      try {
        const res = await dockerOrchestrator.get("/api/auth/session")
        if (res.data.admin) {
          const { id, email, role } = res.data.admin
          const userData = { id, email, role }
          setUser(userData)
          setSession(true)
          // Sincronizar localStorage con datos frescos
          localStorage.setItem(AUTH_KEY, JSON.stringify({ token: "", user: userData }))
        }
      } catch {
        // No hay sesión activa en el backend
        localStorage.removeItem(AUTH_KEY)
        setUser(null)
        setSession(false)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const signIn = async (email: string, password: string): Promise<string | null> => {
    if (IS_DEMO || !supabase) {
      if (email.includes("colab")) {
        const data: StoredSession = {
          token: "demo-token-" + Date.now(),
          user: { email, id: "demo-" + Date.now(), name: email.split("@")[0], role: "colaborador" },
        }
        localStorage.setItem(AUTH_KEY, JSON.stringify(data))
        setUser(data.user)
        setSession(true)
        return null
      }
      setPendingEmail(email)
      setMfaPending(true)
      toast.success("Código enviado a " + email)
      return null
    }

    try {
      const res = await dockerOrchestrator.post("/api/auth/login", { email, password })
      if (res.data.mfaRequired) {
        setPendingEmail(email)
        setMfaPending(true)
        toast.success("Código enviado a " + email)
        return null
      }
      if (res.data.token) {
        const data: StoredSession = {
          token: res.data.token,
          user: {
            email: res.data.admin.email,
            id: res.data.admin.id,
            name: res.data.admin.nombre,
            role: res.data.admin.role,
          },
        }
        localStorage.setItem(AUTH_KEY, JSON.stringify(data))
        setUser(data.user)
        setSession(true)
        toast.success("Sesión iniciada")
        return null
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Error al iniciar sesión"
      return msg
    }

    return "Error inesperado"
  }

  const verifyMfa = async (code: string): Promise<string | null> => {
    if (!pendingEmail) return "No hay sesión pendiente"

    if (!IS_DEMO) {
      try {
        const res = await dockerOrchestrator.post("/api/auth/verify-mfa", {
          email: pendingEmail,
          code,
        })
        if (res.data.token) {
          const data: StoredSession = {
            token: res.data.token,
            user: {
              email: res.data.admin.email,
              id: res.data.admin.id,
              name: res.data.admin.nombre,
              role: res.data.admin.role ?? "admin",
            },
          }
          localStorage.setItem(AUTH_KEY, JSON.stringify(data))
          setUser(data.user)
          setSession(true)
          setMfaPending(false)
          setPendingEmail("")
          return null
        }
      } catch (err: any) {
        const msg = err?.response?.data?.error || "Código inválido o expirado"
        return msg
      }
    }

    if (code !== "123456") return "Código inválido"

    const role: UserRole = pendingEmail.includes("colab") ? "colaborador" : "admin"
    const userData = {
      email: pendingEmail,
      id: "demo-" + Date.now(),
      name: pendingEmail.split("@")[0],
      role,
    }
    const data: StoredSession = { token: "demo-token-" + Date.now(), user: userData }
    localStorage.setItem(AUTH_KEY, JSON.stringify(data))
    setUser(userData)
    setSession(true)
    setMfaPending(false)
    setPendingEmail("")
    return null
  }

  const signOut = async () => {
    if (!IS_DEMO) {
      try {
        await dockerOrchestrator.post("/api/auth/logout")
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(AUTH_KEY)
    setSession(false)
    setUser(null)
    setMfaPending(false)
    setPendingEmail("")
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, isDemo: IS_DEMO, signIn, verifyMfa, signOut, mfaPending, setMfaPending, pendingEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
