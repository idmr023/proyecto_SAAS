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
  X,
  Menu,
  Sparkles,
} from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/generator", label: "Generador", icon: Box },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const { signOut, user, isDemo } = useAuth()
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate("/login")
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 sm:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 sm:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 z-50 h-full w-64 border-l bg-background sm:hidden"
            >
              <div className="flex items-center justify-between border-b px-4 h-14">
                <div className="flex items-center gap-2 font-semibold">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Container className="h-4 w-4" />
                  </div>
                  <span>SaaS</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <nav className="flex flex-col p-3 gap-1">
                {navItems.map(({ to, label, icon: Icon }) => {
                  const isActive = location.pathname === to
                  return (
                    <Button
                      key={to}
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      asChild
                      className="justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <Link to={to}>
                        <Icon className="h-4 w-4" />
                        {label}
                      </Link>
                    </Button>
                  )
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 border-t p-3 space-y-2">
                {isDemo && (
                  <div className="flex items-center justify-center gap-1 text-xs text-amber-500">
                    <Sparkles className="h-3 w-3" />
                    Demo
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {user?.email}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggle}>
                      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
