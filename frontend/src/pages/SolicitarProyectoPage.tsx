import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Container, Rocket, Package } from "lucide-react"
import { motion } from "framer-motion"

export default function SolicitarProyectoPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <Container className="w-5 h-5" />
            SaaS Orchestrator
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{user?.name || user?.email}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 lg:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Solicitar Proyecto</h1>
            <p className="text-muted-foreground mt-1">Complete los datos para solicitar un nuevo proyecto o módulo.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">Nuevo Proyecto</CardTitle>
                </div>
                <CardDescription>Solicite la creación de un nuevo proyecto SaaS.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre del proyecto</Label>
                  <Input id="nombre" placeholder="Ej: Restaurante Los Olivos" />
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input id="descripcion" placeholder="Describa brevemente el proyecto" />
                </div>
                <Button className="w-full">Enviar solicitud</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg">Solicitar Módulo</CardTitle>
                </div>
                <CardDescription>Solicite la adición de un módulo a un proyecto existente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="proyecto">Proyecto existente</Label>
                  <Input id="proyecto" placeholder="Nombre del proyecto" />
                </div>
                <div>
                  <Label htmlFor="modulo">Módulo deseado</Label>
                  <Input id="modulo" placeholder="Ej: Inventarios, Ventas, Restaurante" />
                </div>
                <Button className="w-full" variant="outline">Solicitar módulo</Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
