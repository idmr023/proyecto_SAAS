import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TicketCheck, ArrowLeft, RefreshCw } from "lucide-react"
import { dockerOrchestrator, IS_DEMO } from "@/lib/config"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

interface Ticket {
  id: string
  cliente: string
  descripcion: string
  estado: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  en_proceso: "bg-blue-100 text-blue-800 border-blue-200",
  resuelto: "bg-green-100 text-green-800 border-green-200",
  cerrado: "bg-slate-100 text-slate-500 border-slate-200",
}

export default function ColaboradorTicketsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    if (IS_DEMO) {
      setTimeout(() => {
        setTickets([
          { id: "2", cliente: "María García", descripcion: "La comanda no imprime en cocina", estado: "en_proceso", createdAt: new Date().toISOString() },
          { id: "3", cliente: "Carlos López", descripcion: "Quiero agregar el módulo de restaurantes", estado: "resuelto", createdAt: new Date(Date.now() - 86400000).toISOString() },
        ])
        setLoading(false)
      }, 400)
      return
    }
    try {
      const res = await dockerOrchestrator.get("/api/tickets")
      setTickets(res.data.tickets)
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("tickets.colab_title")}</h1>
          <p className="text-muted-foreground text-sm">{t("tickets.colab_subtitle")}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/solicitar-proyecto")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("sistema.inicio")}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{t("tickets.total")}: {tickets.length}</Badge>
          <Badge variant="outline" className="border-blue-200">
            {t("tickets.estado_en_proceso")}: {tickets.filter(t => t.estado === "en_proceso").length}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTickets} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <Card key={i}><CardContent className="p-4"><div className="h-5 bg-muted rounded animate-pulse w-1/3" /></CardContent></Card>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <TicketCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("tickets.colab_empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <CardTitle className="text-base">{ticket.cliente}</CardTitle>
                <Badge className={statusColors[ticket.estado] || ""}>
                  {t(`tickets.estado_${ticket.estado}`)}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">{ticket.descripcion}</p>
                <div className="flex items-center gap-2">
                  {ticket.estado === "en_proceso" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(ticket.id, "resuelto")} disabled={updating === ticket.id}>
                      {t("tickets.resolver")}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">{new Date(ticket.createdAt).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}
