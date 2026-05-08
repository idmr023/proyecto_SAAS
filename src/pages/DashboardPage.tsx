import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import type { Portal } from "@/types"
import {
  ExternalLink,
  RefreshCw,
  Server,
  Trash2,
  Search,
  Plus,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

const MOCK_PORTALS: Portal[] = [
  { id: "1", name: "ERP Acme Corp", category: "ERP", module: "Finanzas", status: "running", url: "https://erp.acmecorp.local", createdAt: "2026-04-28" },
  { id: "2", name: "Logística Globex", category: "Logística", module: "Inventario", status: "running", url: "https://log.globex.local", createdAt: "2026-05-01" },
  { id: "3", name: "Marketing Initech", category: "Marketing", module: "Email Marketing", status: "stopped", createdAt: "2026-04-15" },
  { id: "4", name: "Analítica Umbrella", category: "Analítica", module: "Dashboards", status: "error", createdAt: "2026-05-03" },
]

const ACTIVITY_LOG = [
  { id: "a1", action: "deploy", target: "ERP Acme Corp", detail: "Finanzas", time: "Hace 2h", success: true },
  { id: "a2", action: "deploy", target: "Logística Globex", detail: "Inventario", time: "Hace 6h", success: true },
  { id: "a3", action: "error", target: "Analítica Umbrella", detail: "Dashboards — timeout", time: "Hace 1d", success: false },
  { id: "a4", action: "stop", target: "Marketing Initech", detail: "Email Marketing", time: "Hace 3d", success: true },
  { id: "a5", action: "deploy", target: "Seguridad Umbrella", detail: "IAM", time: "Hace 5d", success: true },
]

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary"; color: string }> = {
  running: { label: "Activo", variant: "success", color: "text-emerald-500" },
  stopped: { label: "Detenido", variant: "warning", color: "text-amber-500" },
  deploying: { label: "Desplegando", variant: "secondary", color: "text-blue-500" },
  error: { label: "Error", variant: "destructive", color: "text-red-500" },
}

const actionIcons: Record<string, React.ReactNode> = {
  deploy: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  error: <XCircle className="h-3.5 w-3.5 text-red-500" />,
  stop: <Loader2 className="h-3.5 w-3.5 text-amber-500" />,
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (display === value) return
    const duration = 600
    const steps = 20
    const increment = value / steps
    let current = display
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplay(value)
        clearInterval(timer)
      } else {
        setDisplay(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display}</span>
}

function QuickDeployDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("ERP")
  const [deploying, setDeploying] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleDeploy = async () => {
    if (!name.trim()) {
      toast.error("Ingresa un nombre para el portal")
      return
    }
    setDeploying(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + Math.floor(Math.random() * 20) + 5))
    }, 400)
    await new Promise((r) => setTimeout(r, 3500))
    clearInterval(interval)
    setProgress(100)
    setTimeout(() => {
      toast.success(`"${name}" desplegado correctamente`)
      setOpen(false)
      setName("")
      setProgress(0)
      setDeploying(false)
    }, 800)
  }

  const categories = ["ERP", "Logística", "Marketing", "Analítica", "Seguridad", "Comunicación"]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Nuevo Portal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Portal</DialogTitle>
          <DialogDescription>Despliega un módulo rápidamente</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre del portal</label>
            <Input placeholder="Ej: ERP Mi Empresa" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoría</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    category === cat
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {deploying && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-center text-muted-foreground">
                {progress < 100 ? "Creando contenedor Docker..." : "¡Completado!"}
              </p>
            </div>
          )}
          <Button className="w-full" onClick={handleDeploy} disabled={deploying}>
            {deploying && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {deploying ? "Desplegando..." : "Desplegar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function DashboardPage() {
  const [portals, setPortals] = useState<Portal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await new Promise((r) => setTimeout(r, 1200))
      setPortals(MOCK_PORTALS)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(
    () =>
      portals.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase()) ||
          p.module.toLowerCase().includes(search.toLowerCase()),
      ),
    [portals, search],
  )

  const stats = useMemo(
    () => ({
      total: portals.length,
      running: portals.filter((p) => p.status === "running").length,
      stopped: portals.filter((p) => p.status === "stopped").length,
      error: portals.filter((p) => p.status === "error").length,
    }),
    [portals],
  )

  const handleDelete = (id: string) => {
    setPortals((prev) => prev.filter((p) => p.id !== id))
    toast.success("Portal eliminado")
  }

  const handleRefresh = async () => {
    toast.info("Actualizando estados...")
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setPortals([...MOCK_PORTALS])
    setLoading(false)
    toast.success("Estados actualizados")
  }

  const statCards = [
    { label: "Total", value: stats.total, icon: Server, color: "text-primary" },
    { label: "Activos", value: stats.running, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Detenidos", value: stats.stopped, icon: Clock, color: "text-amber-500" },
    { label: "Errores", value: stats.error, icon: XCircle, color: "text-red-500" },
  ]

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sala de Portales</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Servicios activos y estado en tiempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <QuickDeployDialog />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {loading ? <Skeleton className="h-8 w-12" /> : <AnimatedNumber value={stat.value} />}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search + List */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, categoría o módulo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Server className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {search ? "Sin resultados para esa búsqueda" : "No hay portales activos. Despliega uno desde el Generador."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((portal, i) => {
              const cfg = statusConfig[portal.status] ?? statusConfig.error
              return (
                <motion.div
                  key={portal.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                >
                  <Card className="transition-all hover:shadow-sm hover:border-primary/30 group">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cfg.color} bg-current/10`}>
                          <div className={`h-2.5 w-2.5 rounded-full ${portal.status === "running" ? "animate-pulse" : ""}`}
                            style={{ backgroundColor: cfg.color.replace("text-", "") }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm truncate">{portal.name}</h3>
                            <Badge variant={cfg.variant} className="shrink-0 text-[10px] h-5 px-2">
                              {cfg.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {portal.category} &rarr; {portal.module}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {portal.url && portal.status === "running" && (
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" asChild>
                            <a href={portal.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              Abrir
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(portal.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Actividad Reciente</h2>
        </div>
        <Card>
          <CardContent className="p-0">
            {ACTIVITY_LOG.map((entry, i) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                  i < ACTIVITY_LOG.length - 1 ? "border-b" : ""
                }`}
              >
                {actionIcons[entry.action] ?? <Activity className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className="flex-1 min-w-0">
                  <span className="font-medium">{entry.target}</span>
                  <span className="text-muted-foreground"> — {entry.detail}</span>
                </span>
                <span className="text-xs text-muted-foreground shrink-0">{entry.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
