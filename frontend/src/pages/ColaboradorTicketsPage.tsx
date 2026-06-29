import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TicketCheck, ArrowLeft, RefreshCw } from "lucide-react"
import { dockerOrchestrator } from "@/lib/config"
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
  pendiente: "bg-amber-500/15 text-amber-700 border-amber-700/30",
  en_proceso: "bg-primary/15 text-primary border-primary/30",
  resuelto: "bg-emerald-500/15 text-emerald-700 border-emerald-700/30",
  cerrado: "bg-secondary text-muted-foreground border-border",
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t("tickets.colab_title")}</h1>
          <p className="text-muted-foreground text-sm">{t("tickets.colab_subtitle")}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/solicitar-proyecto")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("sistema.inicio")}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="font-mono">{t("tickets.total")}: {tickets.length}</Badge>
          <Badge variant="outline" className="border-primary/30 text-primary font-mono">
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
            <Card key={i}><CardContent className="p-4"><div className="h-5 bg-muted rounded-sm animate-pulse w-1/3" /></CardContent></Card>
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
              <CardHeader className="pb-2 flex flex-row items-start justify-between border-b border-border">
                <CardTitle className="text-base tracking-tight">{ticket.cliente}</CardTitle>
                <Badge variant="outline" className={`${statusColors[ticket.estado] || ""} uppercase tracking-wide`}>
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
                <p className="text-xs text-muted-foreground mt-3 font-mono">{new Date(ticket.createdAt).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}
