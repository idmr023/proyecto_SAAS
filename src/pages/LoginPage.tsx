import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Container, Eye, EyeOff, Loader2, FlaskConical } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const { signIn, session, isDemo } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  if (session) {
    navigate("/dashboard", { replace: true })
    return null
  }

  const validate = (): boolean => {
    const errs: { email?: string; password?: string } = {}
    if (!email.trim()) errs.email = "El correo es obligatorio"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Correo inválido"
    if (!password && !isDemo) errs.password = "La contraseña es obligatoria"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const error = await signIn(email, password)
    setSubmitting(false)

    if (error) {
      toast.error("Error al iniciar sesión", { description: error })
    } else {
      toast.success("Sesión iniciada correctamente")
      navigate("/dashboard", { replace: true })
    }
  }

  const enterDemoMode = async () => {
    setEmail("demo@saas.local")
    setPassword("demo123")
    setSubmitting(true)
    const error = await signIn("demo@saas.local", "demo123")
    setSubmitting(false)
    if (!error) {
      toast.success("Modo demo activado")
      navigate("/dashboard", { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isDemo && (
            <div className="mx-auto mb-4 flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-600 dark:text-amber-400">
              <FlaskConical className="h-3.5 w-3.5" />
              Modo demo — Sin backend
            </div>
          )}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Container className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">SaaS Orchestrator</CardTitle>
          <CardDescription>Inicia sesión para acceder al panel de orquestación</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>

            {isDemo && (
              <Button type="button" variant="outline" className="w-full" onClick={enterDemoMode} disabled={submitting}>
                <FlaskConical className="h-4 w-4 mr-1" />
                Entrar en modo demo
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
