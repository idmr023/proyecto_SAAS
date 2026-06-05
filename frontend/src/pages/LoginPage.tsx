import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Container, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { loginSchema, type LoginInput } from "@/lib/validations"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"

export default function LoginPage() {
  const { t } = useTranslation()
  const { signIn, verifyMfa, session, user, isDemo, mfaPending } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [mfaCode, setMfaCode] = useState(["", "", "", "", "", ""])
  const [mfaError, setMfaError] = useState("")
  const [isMfaLoading, setIsMfaLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (session && user && !mfaPending) {
      const routes: Record<string, string> = {
        admin: "/dashboard",
        colaborador: "/",
      }
      navigate(routes[user.role] || "/", { replace: true })
    }
  }, [session, user, mfaPending, navigate])

  useEffect(() => {
    if (mfaPending && inputRefs.current[0]) inputRefs.current[0].focus()
  }, [mfaPending])

  const handleMfaChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const newCode = [...mfaCode]
    newCode[index] = value
    setMfaCode(newCode)
    setMfaError("")
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backward-delete" && !mfaCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "Enter") handleMfaSubmit()
  }

  const handleMfaSubmit = async () => {
    const code = mfaCode.join("")
    if (code.length !== 6) { setMfaError(t("auth.mfa_error")); return }
    setIsMfaLoading(true)
    const error = await verifyMfa(code)
    setIsMfaLoading(false)
    if (error) { setMfaError(error); setMfaCode(["", "", "", "", "", ""]); inputRefs.current[0]?.focus(); return }
  }

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true)
    const error = await signIn(data.email, data.password)
    setIsSubmitting(false)
    if (error) { toast.error(error); return }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50/50 p-4">
      <AnimatePresence mode="wait">
        {mfaPending ? (
          <motion.div
            key="mfa"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-sm"
          >
            <Card className="border-blue-200/50 shadow-lg shadow-blue-900/5">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-sm">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{t("auth.mfa_title")}</CardTitle>
                <CardDescription>{t("auth.mfa_description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      className="w-12 h-14 text-center text-lg font-semibold"
                      aria-label={`Digito ${i + 1} del código`}
                    />
                  ))}
                </div>
                {mfaError && <p className="text-sm text-destructive text-center">{mfaError}</p>}
                <Button className="w-full" onClick={handleMfaSubmit} disabled={isMfaLoading}>
                  {isMfaLoading ? t("auth.mfa_loading") : t("auth.mfa_submit")}
                </Button>
                <p className="text-xs text-muted-foreground text-center">{t("auth.mfa_resend")}</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-sm"
          >
            <Card className="border-blue-200/50 shadow-lg shadow-blue-900/5">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-sm">
                  <Container className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{t("auth.login_title")}</CardTitle>
                <CardDescription>{t("auth.login_description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <div>
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <Input id="email" type="email" placeholder={t("auth.email_placeholder")} {...register("email")} />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="password">{t("auth.password")}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.password_placeholder")}
                        {...register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("auth.login_loading")}
                      </>
                    ) : (
                      t("auth.login_button")
                    )}
                  </Button>
                </form>

                {isDemo && (
                  <div className="flex items-center justify-center gap-2 text-xs text-amber-500 border border-amber-200 bg-amber-50 rounded-lg px-3 py-2">
                    <ShieldCheck className="h-3 w-3" />
                    {t("auth.demo_badge")}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
