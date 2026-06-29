import { useState, useRef, useEffect, useCallback } from "react"
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
import { cn } from "@/lib/utils"

const CODE_LENGTH = 6

export default function LoginPage() {
  const { t } = useTranslation()
  const { signIn, verifyMfa, session, user, mfaPending, loading, qrCode } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [mfaCode, setMfaCode] = useState<string[]>(Array(CODE_LENGTH).fill(""))
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
    if (!loading && session && user && !mfaPending) {
      const routes: Record<string, string> = {
        admin: "/dashboard",
        colaborador: "/",
      }
      navigate(routes[user.role] || "/", { replace: true })
    }
  }, [loading, session, user, mfaPending, navigate])

  useEffect(() => {
    if (mfaPending && inputRefs.current[0]) inputRefs.current[0].focus()
  }, [mfaPending])

  const focusInput = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, CODE_LENGTH - 1))
    inputRefs.current[clamped]?.focus()
    requestAnimationFrame(() => {
      const el = inputRefs.current[clamped]
      if (el) el.select()
    })
  }, [])

  const handleMfaChange = (index: number, rawValue: string) => {
    const digit = rawValue.replace(/\D/g, "").slice(-1)
    setMfaCode((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    setMfaError("")
    if (digit && index < CODE_LENGTH - 1) focusInput(index + 1)
  }

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      setMfaCode((prev) => {
        const next = [...prev]
        if (next[index]) {
          next[index] = ""
        } else if (index > 0) {
          next[index - 1] = ""
          focusInput(index - 1)
        }
        return next
      })
      setMfaError("")
      return
    }
    if (e.key === "Delete") {
      e.preventDefault()
      setMfaCode((prev) => {
        const next = [...prev]
        next[index] = ""
        return next
      })
      setMfaError("")
      return
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      if (index > 0) focusInput(index - 1)
      return
    }
    if (e.key === "ArrowRight") {
      e.preventDefault()
      if (index < CODE_LENGTH - 1) focusInput(index + 1)
      return
    }
    if (e.key === "Enter") {
      e.preventDefault()
      handleMfaSubmit()
      return
    }
    if (e.key === "Tab") return
  }

  const handleMfaPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH)
    if (!pasted) return
    setMfaCode((prev) => {
      const next = [...prev]
      for (let i = 0; i < CODE_LENGTH; i++) {
        next[i] = pasted[i] || ""
      }
      return next
    })
    setMfaError("")
    const lastFilled = Math.min(pasted.length, CODE_LENGTH) - 1
    focusInput(lastFilled === CODE_LENGTH - 1 ? CODE_LENGTH - 1 : lastFilled + 1)
  }

  const handleMfaFocus = (index: number) => {
    const el = inputRefs.current[index]
    if (el) el.select()
  }

  const handleMfaSubmit = async () => {
    const code = mfaCode.join("")
    if (code.length !== CODE_LENGTH) {
      setMfaError(t("auth.mfa_error"))
      return
    }
    setIsMfaLoading(true)
    const error = await verifyMfa(code)
    setIsMfaLoading(false)
    if (error) {
      setMfaError(error)
      setMfaCode(Array(CODE_LENGTH).fill(""))
      focusInput(0)
    }
  }

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true)
    const error = await signIn(data.email, data.password)
    setIsSubmitting(false)
    if (error) toast.error(error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <AnimatePresence mode="wait">
        {mfaPending ? (
          <motion.div
            key="mfa"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-sm"
          >
            <Card className="hard-shadow-md">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{t("auth.mfa_title")}</CardTitle>
                <CardDescription>{t("auth.mfa_description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {qrCode && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-sm border border-border bg-white p-3">
                      <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {t("auth.mfa_qr_hint")}
                    </p>
                  </div>
                )}

                <div className="flex justify-center gap-1.5" onPaste={handleMfaPaste}>
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
                      onFocus={() => handleMfaFocus(i)}
                      className={cn(
                        "w-11 h-13 text-center text-lg font-mono font-semibold",
                        digit && "border-primary",
                        mfaError && "border-destructive"
                      )}
                      aria-label={`Digito ${i + 1} del código`}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>
                {mfaError && <p className="text-sm text-destructive text-center">{mfaError}</p>}
                <Button className="w-full" onClick={handleMfaSubmit} disabled={isMfaLoading}>
                  {isMfaLoading ? t("auth.mfa_loading") : t("auth.mfa_submit")}
                </Button>
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
            <Card className="hard-shadow-md">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-sm bg-primary text-primary-foreground">
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

              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
