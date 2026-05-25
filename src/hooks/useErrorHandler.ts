import { useCallback } from "react"
import { toast } from "sonner"
import { logger } from "@/lib/logger"

export function useErrorHandler(source?: string) {
  const handleError = useCallback(
    (error: unknown, fallbackMessage = "Ocurrió un error inesperado") => {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : fallbackMessage

      logger.error(message, { source, error })
      toast.error("Error", { description: message })
    },
    [source],
  )

  const handleSuccess = useCallback((message: string, description?: string) => {
    toast.success(message, { description })
  }, [])

  const handleInfo = useCallback((message: string) => {
    toast.info(message)
  }, [])

  return { handleError, handleSuccess, handleInfo }
}
