import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase, IS_DEMO } from "@/lib/config"

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (IS_DEMO || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, _password: string): Promise<string | null> => {
    if (IS_DEMO || !supabase) {
      setUser({ email, id: "demo-user-id" } as User)
      setSession({ user: { email, id: "demo-user-id" } } as Session)
      return null
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: _password })
    return error?.message ?? null
  }

  const signOut = async () => {
    if (!IS_DEMO && supabase) {
      await supabase.auth.signOut()
    }
    setSession(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, isDemo: IS_DEMO, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
