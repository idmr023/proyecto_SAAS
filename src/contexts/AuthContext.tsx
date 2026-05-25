import { createContext, useContext, useState, type ReactNode } from "react"
import { supabase, IS_DEMO } from "@/lib/config"
import { toast } from "sonner"

interface AuthContextType {
  session: boolean
  user: { email: string; id: string; name?: string } | null
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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<boolean>(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      try {
        JSON.parse(stored)
        return true
      } catch {
        localStorage.removeItem(AUTH_KEY)
      }
    }
    return false
  })
  const [user, setUser] = useState<{ email: string; id: string; name?: string } | null>(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        localStorage.removeItem(AUTH_KEY)
      }
    }
    return null
  })
  const [loading] = useState(false)
  const [mfaPending, setMfaPending] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")

  const signIn = async (email: string, _password: string): Promise<string | null> => {
    if (IS_DEMO || !supabase) {
      setPendingEmail(email)
      setMfaPending(true)
      toast.success("Código enviado a " + email)
      return null
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: _password })
    if (error) return error.message

    setPendingEmail(email)
    setMfaPending(true)
    toast.success("Código enviado a " + email)
    return null
  }

  const verifyMfa = async (code: string): Promise<string | null> => {
    if (code !== "123456" && IS_DEMO) {
      return "Código inválido"
    }

    const userData = { email: pendingEmail, id: "user-" + Date.now(), name: pendingEmail.split("@")[0] }
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData))
    setUser(userData)
    setSession(true)
    setMfaPending(false)
    setPendingEmail("")
    return null
  }

  const signOut = async () => {
    if (!IS_DEMO && supabase) {
      await supabase.auth.signOut()
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
