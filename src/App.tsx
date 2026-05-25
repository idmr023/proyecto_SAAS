import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import ErrorBoundary from "@/components/shared/ErrorBoundary"
import ProtectedRoute from "@/components/shared/ProtectedRoute"
import Navbar from "@/components/shared/Navbar"
import LoadingScreen from "@/components/shared/LoadingScreen"
import { motion, AnimatePresence } from "framer-motion"

const LoginPage = lazy(() => import("@/pages/LoginPage"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const GeneratorPage = lazy(() => import("@/pages/GeneratorPage"))
const EmpresasControlPage = lazy(() => import("@/pages/EmpresasControlPage"))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"))

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route
                path="/login"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <LoginPage />
                  </Suspense>
                }
              />
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route
                    path="/dashboard"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <DashboardPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/empresas/nuevo"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <GeneratorPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/empresas/control"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <EmpresasControlPage />
                      </Suspense>
                    }
                  />
                </Route>
              </Route>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="*"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <NotFoundPage />
                  </Suspense>
                }
              />
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
                <Route path="/empresas/nuevo" element={<GeneratorPage />} />
                <Route path="/empresas/control" element={<EmpresasControlPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
    </div>
  )
}
