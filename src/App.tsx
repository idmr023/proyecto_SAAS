import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import ErrorBoundary from "@/components/shared/ErrorBoundary"
import ProtectedRoute from "@/components/shared/ProtectedRoute"
import Navbar from "@/components/shared/Navbar"
import LoginPage from "@/pages/LoginPage"
import DashboardPage from "@/pages/DashboardPage"
import GeneratorPage from "@/pages/GeneratorPage"
import NotFoundPage from "@/pages/NotFoundPage"
import { motion, AnimatePresence } from "framer-motion"

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/generator" element={<GeneratorPage />} />
                </Route>
              </Route>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

function Layout() {
  const location = useLocation()
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Routes location={location}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/generator" element={<GeneratorPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
    </div>
  )
}
