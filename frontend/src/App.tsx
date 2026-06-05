import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import ErrorBoundary from "@/components/shared/ErrorBoundary"
import Navbar from "@/components/shared/Navbar"
import AdminRoute from "@/components/shared/AdminRoute"
import ColaboradorRoute from "@/components/shared/ColaboradorRoute"
import ProtectedRoute from "@/components/shared/ProtectedRoute"
import LoadingScreen from "@/components/shared/LoadingScreen"
import { motion, AnimatePresence } from "framer-motion"
import { useLocation } from "react-router-dom"

const LandingPage = lazy(() => import("@/pages/LandingPage"))
const LoginPage = lazy(() => import("@/pages/LoginPage"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const GeneratorPage = lazy(() => import("@/pages/GeneratorPage"))
const EmpresasControlPage = lazy(() => import("@/pages/EmpresasControlPage"))
const TicketsPage = lazy(() => import("@/pages/TicketsPage"))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"))
const SolicitarProyectoPage = lazy(() => import("@/pages/SolicitarProyectoPage"))
const ColaboradorTicketsPage = lazy(() => import("@/pages/ColaboradorTicketsPage"))

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={
                <Suspense fallback={<LoadingScreen />}>
                  <LandingPage />
                </Suspense>
              } />
              <Route path="/login" element={
                <Suspense fallback={<LoadingScreen />}>
                  <LoginPage />
                </Suspense>
              } />

              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/dashboard" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <DashboardPage />
                    </Suspense>
                  } />
                  <Route path="/empresas/nuevo" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <GeneratorPage />
                    </Suspense>
                  } />
                  <Route path="/empresas/control" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <EmpresasControlPage />
                    </Suspense>
                  } />
                  <Route path="/tickets" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <TicketsPage />
                    </Suspense>
                  } />
                </Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/solicitar-proyecto" element={
                  <Suspense fallback={<LoadingScreen />}>
                    <SolicitarProyectoPage />
                  </Suspense>
                } />
              </Route>

              <Route element={<ColaboradorRoute />}>
                <Route path="/colaborador/tickets" element={
                  <Suspense fallback={<LoadingScreen />}>
                    <ColaboradorTicketsPage />
                  </Suspense>
                } />
              </Route>

              <Route path="*" element={
                <Suspense fallback={<LoadingScreen />}>
                  <NotFoundPage />
                </Suspense>
              } />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

function AdminLayout() {
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
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
    </div>
  )
}
