import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { dockerOrchestrator } from "@/lib/config"

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
  signIn: (email: string, password: string) => Promise<string | null>
  verifyMfa: (code: string) => Promise<string | null>
  signOut: () => Promise<void>
  mfaPending: boolean
  setMfaPending: (v: boolean) => void
  pendingEmail: string
  qrCode: string | null
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
  const [qrCode, setQrCode] = useState<string | null>(null)

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await dockerOrchestrator.get("/api/auth/session")
        if (res.data.admin) {
          const { id, email, role } = res.data.admin
          const userData = { id, email, role }
          setUser(userData)
          setSession(true)
          localStorage.setItem(AUTH_KEY, JSON.stringify({ token: "", user: userData }))
        }
      } catch {
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
    try {
      const res = await dockerOrchestrator.post("/api/auth/login", { email, password })
      if (res.data.mfaRequired) {
        setPendingEmail(email)
        setMfaPending(true)
        setQrCode(res.data.qrCode || null)
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
        setQrCode(null)
        return null
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Código inválido o expirado"
      return msg
    }

    return "Error inesperado"
  }

  const signOut = async () => {
    try {
      await dockerOrchestrator.post("/api/auth/logout")
    } catch {
      // ignore
    }
    localStorage.removeItem(AUTH_KEY)
    setSession(false)
    setUser(null)
    setMfaPending(false)
    setPendingEmail("")
    setQrCode(null)
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, verifyMfa, signOut, mfaPending, setMfaPending, pendingEmail, qrCode }}>
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
