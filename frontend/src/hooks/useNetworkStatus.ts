import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    toast.success("Conexión restablecida")
  }, [])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
    toast.error("Sin conexión", {
      description: "Algunas funciones pueden no estar disponibles",
    })
  }, [])

  useEffect(() => {
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [handleOnline, handleOffline])

  return { isOnline }
}
