import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import {
  Container,
  LayoutDashboard,
  Building2,
  Plus,
  LogOut,
  Moon,
  Sun,
  TicketCheck,
  Eye,
} from "lucide-react"
import MobileNav from "@/components/shared/MobileNav"
import { useTranslation } from "react-i18next"

const navItems = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/empresas/control", labelKey: "nav.empresas", icon: Building2 },
  { to: "/empresas/nuevo", labelKey: "nav.nueva_empresa", icon: Plus },
  { to: "/tickets", labelKey: "nav.tickets", icon: TicketCheck },
]

export default function Navbar() {
  const { t } = useTranslation()
  const { signOut, user } = useAuth()
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex h-14 items-center px-4 lg:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold mr-4 lg:mr-8 tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <Container className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">{t("app.name")}</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-0.5">
          {navItems.map(({ to, labelKey, icon: Icon }) => {
            const isActive = location.pathname === to
            return (
              <Button
                key={to}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                asChild
                className="relative"
              >
                <Link to={to}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t(labelKey)}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 bg-primary" />
                  )}
                </Link>
              </Button>
            )
          })}
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/">
              <Eye className="h-4 w-4" />
              <span className="hidden lg:inline">{t("nav.cliente")}</span>
            </Link>
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <MobileNav />

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex h-8 w-8"
            onClick={toggle}
            aria-label={theme === "light" ? t("nav.toggle_dark") : t("nav.toggle_light")}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <span className="hidden md:inline text-sm text-muted-foreground font-mono truncate max-w-[120px] mx-1">
            {user?.email}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
            aria-label={t("nav.logout")}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
