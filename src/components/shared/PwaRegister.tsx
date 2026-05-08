import { useEffect } from "react"
import { toast } from "sonner"

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault()
        const promptEvent = e as BeforeInstallPromptEvent
        setTimeout(() => {
          toast("Instala la aplicación", {
            description: "Añade SaaS Orchestrator a tu pantalla de inicio",
            action: {
              label: "Instalar",
              onClick: () => promptEvent.prompt(),
            },
            duration: 10000,
          })
        }, 30000)
      })
    }
  }, [])

  return null
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}
