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
import { dockerOrchestrator, IS_DEMO } from "@/lib/config"
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
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400",
  en_proceso: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
  resuelto: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400",
  cerrado: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400",
}

const statusTransitions: Record<string, string[]> = {
  pendiente: ["en_proceso"],
  en_proceso: ["resuelto"],
  resuelto: ["cerrado"],
  cerrado: [],
}

const MOCK_TICKETS: Ticket[] = [
  { id: "1", cliente: "Juan Pérez", email: "juan@example.com", telefono: null, descripcion: "Error al cargar el inventario de productos", estado: "pendiente", createdAt: new Date().toISOString(), asignadoA: null, empresa: { nombre: "TecnoMype SAC", subdominio: "tecno-mype" } },
  { id: "2", cliente: "María García", email: "maria@example.com", telefono: null, descripcion: "La comanda no imprime en cocina", estado: "en_proceso", createdAt: new Date().toISOString(), asignadoA: { id: "colab-1", nombre: "Colaborador Demo", email: "colab@demo.com" }, empresa: { nombre: "Restobar 34", subdominio: "restobar-34" } },
  { id: "3", cliente: "Carlos López", email: null, telefono: "999888777", descripcion: "Quiero agregar el módulo de restaurantes a mi plan", estado: "resuelto", createdAt: new Date().toISOString(), asignadoA: { id: "colab-1", nombre: "Colaborador Demo", email: "colab@demo.com" }, empresa: { nombre: "Moda Express", subdominio: "modaexpress" } },
  { id: "4", cliente: "Ana Torres", email: "ana@example.com", telefono: null, descripcion: "Los precios no se actualizan en el catálogo online", estado: "pendiente", createdAt: new Date().toISOString(), asignadoA: null, empresa: { nombre: "TecnoMype SAC", subdominio: "tecno-mype" } },
]

const MOCK_COLABORADORES: Colaborador[] = [
  { id: "colab-1", nombre: "Colaborador Demo", email: "colab@demo.com" },
]

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
    if (IS_DEMO) {
      setTimeout(() => {
        setTickets(MOCK_TICKETS)
        setColaboradores(MOCK_COLABORADORES)
        setLoading(false)
      }, 400)
      return
    }
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
    if (IS_DEMO) {
      await new Promise((r) => setTimeout(r, 300))
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, estado } : t)))
      toast.success(t("tickets.estado_actualizado"))
      setUpdating(null)
      return
    }
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
    if (IS_DEMO) {
      await new Promise((r) => setTimeout(r, 300))
      const colab = MOCK_COLABORADORES.find((c) => c.id === colaboradorId)
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, asignadoA: colab || null } : t)))
      toast.success(t("tickets.asignado_exito"))
      setAssigning(null)
      return
    }
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">{t("tickets.title")}</h1>
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
        <Badge variant="outline" className="text-xs px-2 py-0">{t("tickets.total")}: {filtered.length}</Badge>
        <Badge variant="outline" className="text-xs px-2 py-0 border-yellow-200">{t("tickets.estado_pendiente")}: {filtered.filter(t => t.estado === "pendiente").length}</Badge>
        <Badge variant="outline" className="text-xs px-2 py-0 border-blue-200">{t("tickets.estado_en_proceso")}: {filtered.filter(t => t.estado === "en_proceso").length}</Badge>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="h-4 bg-muted rounded animate-pulse w-1/3 mb-1" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
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
            <Card key={ticket.id} className="shadow-sm">
              <CardHeader className="p-3 pb-1.5 flex flex-row items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <CardTitle className="text-sm font-semibold truncate">{ticket.cliente}</CardTitle>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {ticket.email && <span className="truncate">{ticket.email}</span>}
                    {ticket.telefono && <span>{ticket.telefono}</span>}
                    {ticket.empresa && <span className="truncate">{ticket.empresa.nombre}</span>}
                  </div>
                </div>
                <Badge className={`${statusColors[ticket.estado] || ""} text-xs px-2 py-0 shrink-0`}>
                  {t(`tickets.estado_${ticket.estado}`)}
                </Badge>
              </CardHeader>
              <CardContent className="px-3 pb-3">
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

                <p className="text-[11px] text-muted-foreground mt-2">
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
