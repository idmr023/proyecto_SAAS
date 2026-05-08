import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import {
  Container,
  LayoutDashboard,
  Box,
  LogOut,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react"
import MobileNav from "@/components/shared/MobileNav"
import { useTranslation } from "react-i18next"

const navItems = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/generator", labelKey: "nav.generator", icon: Box },
]

export default function Navbar() {
  const { t } = useTranslation()
  const { signOut, user, isDemo } = useAuth()
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center px-4 lg:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold mr-4 lg:mr-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
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
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </Link>
              </Button>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <MobileNav />

          {isDemo && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-amber-500 mr-2">
              <Sparkles className="h-3 w-3" />
              {t("nav.demo")}
            </span>
          )}

          <Button variant="ghost" size="icon" className="hidden sm:inline-flex h-8 w-8" onClick={toggle}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <span className="hidden md:inline text-sm text-muted-foreground truncate max-w-[120px] mx-1">
            {user?.email}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
