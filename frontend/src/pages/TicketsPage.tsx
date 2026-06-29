import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, RefreshCw, TicketCheck, UserCheck } from "lucide-react"
import { dockerOrchestrator } from "@/lib/config"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

interface Colaborador {
  id: string
  nombre: string
  email: string
}

interface Ticket {
  id: string
  cliente: string
  email: string | null
  telefono: string | null
  descripcion: string
  estado: string
  createdAt: string
  asignadoA: Colaborador | null
  empresa: { nombre: string; subdominio: string } | null
}

const statusColors: Record<string, string> = {
  pendiente: "bg-amber-500/15 text-amber-700 border-amber-700/30 dark:text-amber-400",
  en_proceso: "bg-primary/15 text-primary border-primary/30",
  resuelto: "bg-emerald-500/15 text-emerald-700 border-emerald-700/30 dark:text-emerald-400",
  cerrado: "bg-secondary text-muted-foreground border-border",
}

const statusTransitions: Record<string, string[]> = {
  pendiente: ["en_proceso"],
  en_proceso: ["resuelto"],
  resuelto: ["cerrado"],
  cerrado: [],
}

export default function TicketsPage() {
  const { t } = useTranslation()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)
  const [assigning, setAssigning] = useState<string | null>(null)

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await dockerOrchestrator.get("/api/tickets")
      setTickets(res.data.tickets)
      if (res.data.colaboradores) setColaboradores(res.data.colaboradores)
    } catch {
      toast.error(t("tickets.error_cargar"))
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, estado: string) => {
    setUpdating(id)
    try {
      await dockerOrchestrator.patch(`/api/tickets/${id}/status`, { estado })
      toast.success(t("tickets.estado_actualizado"))
      fetchTickets()
    } catch {
      toast.error(t("tickets.error_estado"))
    } finally {
      setUpdating(null)
    }
  }

  const handleAssign = async (ticketId: string, colaboradorId: string) => {
    if (!colaboradorId) return
    setAssigning(ticketId)
    try {
      await dockerOrchestrator.patch(`/api/tickets/${ticketId}/assign`, { colaboradorId })
      toast.success(t("tickets.asignado_exito"))
      fetchTickets()
    } catch {
      toast.error(t("tickets.error_asignar"))
    } finally {
      setAssigning(null)
    }
  }

  useEffect(() => { fetchTickets() }, [])

  const filtered = tickets.filter((t) =>
    !search ||
    t.cliente.toLowerCase().includes(search.toLowerCase()) ||
    t.descripcion.toLowerCase().includes(search.toLowerCase()) ||
    t.asignadoA?.nombre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-6 space-y-3 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground tracking-tight">{t("tickets.title")}</h1>
        <Button variant="outline" size="sm" onClick={fetchTickets} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder={t("tickets.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      <div className="flex gap-1.5 flex-wrap text-xs text-muted-foreground">
        <Badge variant="outline" className="text-xs px-2 py-0 font-mono">{t("tickets.total")}: {filtered.length}</Badge>
        <Badge variant="outline" className="text-xs px-2 py-0 border-amber-700/30 text-amber-700 font-mono">{t("tickets.estado_pendiente")}: {filtered.filter(t => t.estado === "pendiente").length}</Badge>
        <Badge variant="outline" className="text-xs px-2 py-0 border-primary/30 text-primary font-mono">{t("tickets.estado_en_proceso")}: {filtered.filter(t => t.estado === "en_proceso").length}</Badge>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="h-4 bg-muted rounded-sm animate-pulse w-1/3 mb-1" />
                <div className="h-3 bg-muted rounded-sm animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TicketCheck className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">{t("tickets.empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader className="p-3 pb-1.5 flex flex-row items-start justify-between gap-3 border-b border-border">
                <div className="space-y-0.5 min-w-0">
                  <CardTitle className="text-sm font-semibold truncate tracking-tight">{ticket.cliente}</CardTitle>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground font-mono">
                    {ticket.email && <span className="truncate">{ticket.email}</span>}
                    {ticket.telefono && <span>{ticket.telefono}</span>}
                    {ticket.empresa && <span className="truncate">{ticket.empresa.nombre}</span>}
                  </div>
                </div>
                <Badge variant="outline" className={`${statusColors[ticket.estado] || ""} text-xs px-2 py-0 shrink-0 uppercase tracking-wide`}>
                  {t(`tickets.estado_${ticket.estado}`)}
                </Badge>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-2">
                <p className="text-xs text-muted-foreground whitespace-pre-wrap mb-2 leading-relaxed">
                  {ticket.descripcion}
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  {ticket.estado === "pendiente" && colaboradores.length > 0 && (
                    <Select
                      onValueChange={(val) => handleAssign(ticket.id, val)}
                      disabled={assigning === ticket.id}
                    >
                      <SelectTrigger className="h-7 w-36 text-xs">
                        <SelectValue placeholder={t("tickets.asignar")} />
                      </SelectTrigger>
                      <SelectContent>
                        {colaboradores.map((col) => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {ticket.asignadoA && (
                    <Badge variant="secondary" className="gap-1 text-xs px-2 py-0">
                      <UserCheck className="w-3 h-3" />
                      {ticket.asignadoA.nombre}
                    </Badge>
                  )}

                  {statusTransitions[ticket.estado]?.map((nextEstado) => (
                    <Button
                      key={nextEstado}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2"
                      onClick={() => updateStatus(ticket.id, nextEstado)}
                      disabled={updating === ticket.id}
                    >
                      {t(`tickets.${nextEstado === "en_proceso" ? "tomar" : nextEstado === "resuelto" ? "resolver" : "cerrar"}`)}
                    </Button>
                  ))}

                  {ticket.estado !== "cerrado" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs px-2 text-muted-foreground"
                      onClick={() => updateStatus(ticket.id, "cerrado")}
                      disabled={updating === ticket.id}
                    >
                      {t("tickets.cerrar")}
                    </Button>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground mt-2 font-mono">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}
