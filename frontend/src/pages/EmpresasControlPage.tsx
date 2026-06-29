import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Empresa, DeployLog } from "@/types"
import {
  Search,
  ExternalLink,
  Loader2,
  Terminal,
  Square,
  Play,
  RotateCcw,
  Globe,
  Cpu,
  HardDrive,
  Building2,
  Store,
  UtensilsCrossed,
  Shirt,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { cn } from "@/lib/utils"

const MOCK_EMPRESAS: Empresa[] = [
  { id: "1", name: "Bodega Don José", rubro: "Bodega", subdomain: "bodega-don-jose", status: "running", url: "https://bodega-don-jose.saas.local", createdAt: "2026-05-01", modules: ["erp-finanzas", "log-inventario", "mkt-email"], cpu: 32, memory: 1.2, region: "Lima" },
  { id: "2", name: "Restaurante El Marino", rubro: "Restaurante", subdomain: "rest-el-marino", status: "running", url: "https://rest-el-marino.saas.local", createdAt: "2026-05-03", modules: ["erp-finanzas", "com-notif"], cpu: 28, memory: 0.9, region: "Arequipa" },
  { id: "3", name: "Textiles Los Andes", rubro: "Textil", subdomain: "textiles-andes", status: "error", createdAt: "2026-04-28", modules: ["erp-rrhh", "seg-iam"], cpu: 0, memory: 0, region: "Cusco" },
  { id: "4", name: "Bodega Doña María", rubro: "Bodega", subdomain: "bodega-dona-maria", status: "stopped", createdAt: "2026-05-10", modules: ["log-inventario"], cpu: 0, memory: 0.1, region: "Trujillo" },
  { id: "5", name: "Restaurante Sabores", rubro: "Restaurante", subdomain: "rest-sabores", status: "running", url: "https://rest-sabores.saas.local", createdAt: "2026-05-12", modules: ["erp-finanzas", "log-inventario", "mkt-social", "an-dashboards"], cpu: 45, memory: 1.8, region: "Lima" },
  { id: "6", name: "Textil Mundo", rubro: "Textil", subdomain: "textil-mundo", status: "running", url: "https://textil-mundo.saas.local", createdAt: "2026-05-15", modules: ["erp-compras", "log-transporte", "an-reportes"], cpu: 22, memory: 0.7, region: "Lima" },
]

const RUBRO_ICONS: Record<string, React.ReactNode> = {
  Bodega: <Store className="h-5 w-5" />,
  Restaurante: <UtensilsCrossed className="h-5 w-5" />,
  Textil: <Shirt className="h-5 w-5" />,
}

const MOCK_LOGS: Record<string, DeployLog[]> = {
  "1": [
    { message: "Contenedor iniciado correctamente", timestamp: "2026-05-23 10:30:00", type: "success" },
    { message: "Health check: OK (CPU 32%, Mem 1.2GB)", timestamp: "2026-05-23 10:29:00", type: "info" },
    { message: "Conexión BD establecida", timestamp: "2026-05-23 10:28:30", type: "info" },
    { message: "Servicio expuesto en puerto 3000", timestamp: "2026-05-23 10:28:00", type: "info" },
  ],
  "2": [
    { message: "Contenedor iniciado correctamente", timestamp: "2026-05-23 09:15:00", type: "success" },
    { message: "Health check: OK (CPU 28%, Mem 0.9GB)", timestamp: "2026-05-23 09:14:30", type: "info" },
  ],
  "3": [
    { message: "Error: Contenedor caído — OOM Killed", timestamp: "2026-05-23 08:00:00", type: "error" },
    { message: "Timeout de conexión a base de datos", timestamp: "2026-05-23 07:59:00", type: "warn" },
    { message: "Reintentando conexión (3/5)...", timestamp: "2026-05-23 07:58:00", type: "warn" },
  ],
}

export default function EmpresasControlPage() {
  const { t } = useTranslation()
  const { handleSuccess } = useErrorHandler("EmpresasControlPage")
  const [empresas, setEmpresas] = useState(MOCK_EMPRESAS)
  const [search, setSearch] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [logsModal, setLogsModal] = useState<Empresa | null>(null)

  const filtered = useMemo(
    () =>
      empresas.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.rubro.toLowerCase().includes(search.toLowerCase()) ||
          e.region.toLowerCase().includes(search.toLowerCase()),
      ),
    [empresas, search],
  )

  const handleAction = async (id: string, action: "stop" | "start" | "restart") => {
    setActionLoading(`${action}-${id}`)
    await new Promise((r) => setTimeout(r, 1500))
    setEmpresas((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        if (action === "stop") return { ...e, status: "stopped" as const }
        if (action === "start") return { ...e, status: "running" as const, url: e.url || `https://${e.subdomain}.saas.local` }
        return { ...e }
      }),
    )
    const key = action === "stop" ? "container_stopped" : action === "start" ? "container_started" : "container_restarted"
    handleSuccess(t(`empresas.${key}`))
    setActionLoading(null)
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("empresas.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("empresas.subtitle")}</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">{t("empresas.no_empresas")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((empresa, i) => (
            <motion.div
              key={empresa.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
            >
              <Card className={cn(
                "transition-all hover:border-primary/50",
                empresa.status === "error" && "border-destructive/40",
                empresa.status === "stopped" && "opacity-75",
              )}>
                <CardHeader className="pb-2 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-sm border",
                        empresa.rubro === "Bodega" && "bg-amber-500/10 text-amber-700 border-amber-700/20",
                        empresa.rubro === "Restaurante" && "bg-rose-500/10 text-rose-700 border-rose-700/20",
                        empresa.rubro === "Textil" && "bg-indigo-500/10 text-indigo-700 border-indigo-700/20",
                      )}>
                        {RUBRO_ICONS[empresa.rubro]}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold tracking-tight">{empresa.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{empresa.rubro}</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{empresa.region}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          empresa.status === "running" && "bg-emerald-600",
                          empresa.status === "error" && "bg-red-600",
                          empresa.status === "stopped" && "bg-amber-600",
                          empresa.status === "deploying" && "bg-primary",
                        )}
                      />
                      <span className={cn(
                        "text-[10px] font-medium uppercase tracking-wide",
                        empresa.status === "running" && "text-emerald-700",
                        empresa.status === "error" && "text-red-700",
                        empresa.status === "stopped" && "text-amber-700",
                      )}>
                        {empresa.status === "running" ? t("empresas.online") : t("empresas.offline")}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                    <div className="flex items-center gap-1">
                      <Cpu className="h-3 w-3" />
                      {t("empresas.cpu")}: {empresa.cpu}%
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {t("empresas.memoria")}: {empresa.memory}GB
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {empresa.region}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {empresa.modules.map((modId) => (
                      <Badge key={modId} variant="outline" className="text-[9px] h-4 px-1.5 font-mono">
                        {modId.split("-").pop()}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                    {empresa.url && empresa.status === "running" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="h-7 text-xs gap-1 flex-1"
                        asChild
                      >
                        <a href={empresa.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                          {t("empresas.acceso_directo")}
                        </a>
                      </Button>
                    )}
                    {empresa.status === "stopped" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="h-7 text-xs gap-1 flex-1"
                        onClick={() => handleAction(empresa.id, "start")}
                        disabled={actionLoading === `start-${empresa.id}`}
                      >
                        {actionLoading === `start-${empresa.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                        {t("empresas.iniciar")}
                      </Button>
                    )}
                    {empresa.status === "running" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => handleAction(empresa.id, "stop")}
                        disabled={actionLoading === `stop-${empresa.id}`}
                      >
                        {actionLoading === `stop-${empresa.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Square className="h-3 w-3" />
                        )}
                        {t("empresas.detener")}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleAction(empresa.id, "restart")}
                      disabled={actionLoading === `restart-${empresa.id}`}
                    >
                      {actionLoading === `restart-${empresa.id}` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3 w-3" />
                      )}
                      {t("empresas.reiniciar")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setLogsModal(empresa)}
                    >
                      <Terminal className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!logsModal} onOpenChange={(open) => !open && setLogsModal(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Terminal className="h-4 w-4" />
              {t("empresas.modal_logs_title")} {logsModal?.name}
            </DialogTitle>
            <DialogDescription className="font-mono">
              {logsModal?.subdomain}.saas.local
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-sm bg-[#0a0a0a] border border-border p-3 font-mono text-[11px] leading-relaxed max-h-[300px] overflow-y-auto space-y-1">
            {(logsModal ? MOCK_LOGS[logsModal.id] : null)?.length ? (
              (logsModal ? MOCK_LOGS[logsModal.id] : []).map((log, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2",
                    log.type === "success" && "text-emerald-400",
                    log.type === "error" && "text-red-400",
                    log.type === "warn" && "text-amber-400",
                    log.type === "info" && "text-blue-300",
                  )}
                >
                  <span className="shrink-0 text-[10px] text-gray-500">{log.timestamp}</span>
                  <span>{log.message}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {t("empresas.modal_logs_empty")}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
