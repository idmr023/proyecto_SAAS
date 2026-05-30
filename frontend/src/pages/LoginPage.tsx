import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Container, Eye, EyeOff, Loader2, FlaskConical, ArrowLeft, ShieldCheck, Globe } from "lucide-react"
import { toast } from "sonner"
import { loginSchema, type LoginInput } from "@/lib/validations"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"

export default function LoginPage() {
  const { t } = useTranslation()
  const { signIn, verifyMfa, session, isDemo, mfaPending, setMfaPending, pendingEmail } = useAuth()
  const navigate = useNavigate()
  const { handleSuccess, handleError } = useErrorHandler("LoginPage")
  const [showPassword, setShowPassword] = useState(false)
  const [mfaCode, setMfaCode] = useState(["", "", "", "", "", ""])
  const [mfaError, setMfaError] = useState("")
  const [isMfaLoading, setIsMfaLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  useEffect(() => {
    if (session) {
      navigate("/dashboard", { replace: true })
    }
  }, [session, navigate])

  if (session) {
    return null
  }

  const onSubmit = async (data: LoginInput) => {
    const error = await signIn(data.email, data.password)
    if (error) {
      handleError(error, t("auth.error_login"))
    }
  }

  const handleMfaChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return
    setMfaError("")
    const newCode = [...mfaCode]
    newCode[index] = value
    setMfaCode(newCode)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !mfaCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleMfaSubmit = async () => {
    const code = mfaCode.join("")
    if (code.length !== 6) {
      setMfaError(t("auth.mfa_error"))
      return
    }
    setIsMfaLoading(true)
    const error = await verifyMfa(code)
    if (error) {
      setMfaError(error)
      setIsMfaLoading(false)
      setMfaCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } else {
      handleSuccess(t("auth.success_login"))
      navigate("/dashboard", { replace: true })
    }
  }

  const handleGoogleLogin = () => {
    toast.info("Google Sign-In será integrado próximamente")
  }

  const enterDemoMode = async () => {
    setValue("email", "demo@saas.local")
    setValue("password", "demo123")
    const error = await signIn("demo@saas.local", "demo123")
    if (!error) {
      toast.success(t("auth.success_demo"))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-blue-50/50">
      <AnimatePresence mode="wait">
        {mfaPending ? (
          <motion.div
            key="mfa"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md"
          >
            <Card className="border-blue-200/50 shadow-lg shadow-blue-500/5">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{t("auth.mfa_title")}</CardTitle>
                <CardDescription>
                  {t("auth.mfa_description")}
                  <br />
                  <span className="text-xs text-blue-600 font-medium">{pendingEmail}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-center gap-2">
                    {mfaCode.map((digit, i) => (
                      <Input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleMfaChange(i, e.target.value)}
                        onKeyDown={(e) => handleMfaKeyDown(i, e)}
                        className={`h-12 w-12 text-center text-lg font-bold ${mfaError ? "border-destructive ring-destructive" : ""}`}
                        aria-label={`Digito ${i + 1}`}
                        autoFocus={i === 0}
                        disabled={isMfaLoading}
                      />
                    ))}
                  </div>
                  {mfaError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive text-center"
                    >
                      {mfaError}
                    </motion.p>
                  )}
                  <Button
                    className="w-full h-10"
                    onClick={handleMfaSubmit}
                    disabled={isMfaLoading || mfaCode.join("").length !== 6}
                  >
                    {isMfaLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isMfaLoading ? t("auth.mfa_loading") : t("auth.mfa_submit")}
                  </Button>
                  <div className="flex justify-center">
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={() => toast.success("Nuevo código enviado a " + pendingEmail)}
                    >
                      {t("auth.mfa_resend")}
                    </Button>
                  </div>
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => { setMfaPending(false); setMfaCode(["", "", "", "", "", ""]); setMfaError("") }}
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      Volver al inicio de sesión
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md"
          >
            <Card className="border-blue-200/50 shadow-lg shadow-blue-500/5">
              <CardHeader className="text-center">
                {isDemo && (
                  <div className="mx-auto mb-4 flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-600 dark:text-amber-400">
                    <FlaskConical className="h-3.5 w-3.5" />
                    {t("auth.demo_badge")}
                  </div>
                )}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-500/20">
                  <Container className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl">{t("app.name")}</CardTitle>
                <CardDescription>{t("auth.login_description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full h-10 gap-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  onClick={handleGoogleLogin}
                >
                  <Globe className="h-4 w-4" />
                  {t("auth.google_button")}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t("auth.divider")}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth.email_placeholder")}
                      aria-invalid={!!errors.email}
                      {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t("auth.password")}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.password_placeholder")}
                        aria-invalid={!!errors.password}
                        {...register("password")}
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
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                  </div>

                  <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSubmitting ? t("auth.login_loading") : t("auth.login_button")}
                  </Button>
                </form>

                {isDemo && (
                  <Button type="button" variant="outline" className="w-full h-10 border-amber-200 hover:bg-amber-50" onClick={enterDemoMode} disabled={isSubmitting}>
                    <FlaskConical className="h-4 w-4 mr-1" />
                    {t("auth.demo_button")}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
