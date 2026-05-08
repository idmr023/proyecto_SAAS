import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <FileQuestion className="h-20 w-20 text-muted-foreground" />
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground max-w-sm">
          La página que buscas no existe o ha sido movida.
        </p>
        <Button asChild>
          <Link to="/dashboard">Volver al Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
