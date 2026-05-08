import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Container, Eye, EyeOff, Loader2, FlaskConical } from "lucide-react"
import { toast } from "sonner"
import { loginSchema, type LoginInput } from "@/lib/validations"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { useTranslation } from "react-i18next"

export default function LoginPage() {
  const { t } = useTranslation()
  const { signIn, session, isDemo } = useAuth()
  const navigate = useNavigate()
  const { handleSuccess, handleError } = useErrorHandler("LoginPage")
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  if (session) {
    navigate("/dashboard", { replace: true })
    return null
  }

  const onSubmit = async (data: LoginInput) => {
    const error = await signIn(data.email, data.password)
    if (error) {
      handleError(error, t("auth.error_login"))
    } else {
      handleSuccess(t("auth.success_login"))
      navigate("/dashboard", { replace: true })
    }
  }

  const enterDemoMode = async () => {
    setValue("email", "demo@saas.local")
    setValue("password", "demo123")
    const error = await signIn("demo@saas.local", "demo123")
    if (!error) {
      toast.success(t("auth.success_demo"))
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
              {t("auth.demo_badge")}
            </div>
          )}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Container className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">{t("app.name")}</CardTitle>
          <CardDescription>{t("auth.login_description")}</CardDescription>
        </CardHeader>
        <CardContent>
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? t("auth.login_loading") : t("auth.login_button")}
            </Button>

            {isDemo && (
              <Button type="button" variant="outline" className="w-full" onClick={enterDemoMode} disabled={isSubmitting}>
                <FlaskConical className="h-4 w-4 mr-1" />
                {t("auth.demo_button")}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
