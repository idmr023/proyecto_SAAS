import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Moon, Sun, LogOut, Container } from 'lucide-react'

export interface NavLink {
  label: string
  to: string
  icon?: ReactNode
}

export interface NavbarModuleProps {
  brandName?: string
  brandIcon?: ReactNode
  links: NavLink[]
  showThemeToggle?: boolean
  isDark?: boolean
  onToggleTheme?: () => void
  showLogout?: boolean
  onLogout?: () => void
  userName?: string
  actionButton?: {
    label: string
    to: string
  }
}

export default function NavbarModule({
  brandName = 'MultiSaas',
  brandIcon,
  links,
  showThemeToggle = true,
  isDark = false,
  onToggleTheme,
  showLogout = false,
  onLogout,
  userName,
  actionButton,
}: NavbarModuleProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="flex h-16 items-center px-4 lg:px-6 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 font-semibold shrink-0">
          {brandIcon ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-sm">
              {brandIcon}
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-sm">
              <Container className="h-4 w-4" />
            </div>
          )}
          <span className={scrolled ? '' : 'text-white'}>{brandName}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-10">
          {links.map(({ label, to, icon }) => {
            const isActive = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? 'text-foreground bg-accent'
                    : scrolled
                      ? 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      : 'text-white hover:bg-white/20'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {icon}
                  {label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {showThemeToggle && onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                scrolled
                  ? 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  : 'text-white hover:bg-white/20'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {userName && (
            <span className="hidden md:inline text-sm text-muted-foreground truncate max-w-[120px] mx-1">
              {userName}
            </span>
          )}

          {showLogout && onLogout && (
            <button
              onClick={onLogout}
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                scrolled
                  ? 'text-muted-foreground hover:text-destructive hover:bg-accent'
                  : 'text-white hover:bg-white/20'
              }`}
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}

          {actionButton && (
            <Link
              to={actionButton.to}
              className="bg-white text-[#0F1F4A] hover:bg-blue-50 shadow-sm text-sm px-4 h-9 rounded-lg font-medium inline-flex items-center"
            >
              {actionButton.label}
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(true)}
            className={`md:hidden h-9 w-9 rounded-lg flex items-center justify-center ${
              scrolled ? 'text-foreground' : 'text-white'
            }`}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 bg-background border-l shadow-xl">
            <div className="flex items-center justify-between px-4 h-16 border-b">
              <div className="flex items-center gap-2 font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                  <Container className="h-4 w-4" />
                </div>
                <span>{brandName}</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1">
              {links.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-md hover:bg-accent text-foreground text-left"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}