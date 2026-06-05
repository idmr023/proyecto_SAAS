import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import LoadingScreen from "@/components/shared/LoadingScreen"

export default function ColaboradorRoute() {
  const { session, loading, user } = useAuth()

  if (loading) return <LoadingScreen />
  if (!session || user?.role !== "colaborador") return <Navigate to="/login" replace />

  return <Outlet />
}
