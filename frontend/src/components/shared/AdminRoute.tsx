import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import LoadingScreen from "@/components/shared/LoadingScreen"

export default function AdminRoute() {
  const { session, loading, user } = useAuth()

  if (loading) return <LoadingScreen />
  if (!session || user?.role !== "admin") return <Navigate to="/login" replace />

  return <Outlet />
}
