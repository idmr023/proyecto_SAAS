import { Container, Loader2 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message = "Cargando..." }: LoadingScreenProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-muted/40">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary text-primary-foreground">
          <Container className="h-6 w-6" />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground uppercase tracking-wide">{message}</p>
      </div>
    </div>
  )
}
