import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Send, CheckCircle2 } from "lucide-react"
import { dockerOrchestrator, IS_DEMO } from "@/lib/config"
import { useTranslation } from "react-i18next"

interface TicketForm {
  cliente: string
  email: string
  telefono: string
  descripcion: string
}

export default function SistemaVentaPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState<TicketForm>({
    cliente: "",
    email: "",
    telefono: "",
    descripcion: "",
  })
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.cliente || !form.descripcion) {
      toast.error(t("sistema.error_campos"))
      return
    }
    if (form.descripcion.length < 10) {
      toast.error(t("sistema.error_descripcion"))
      return
    }

    setEnviando(true)
    if (IS_DEMO) {
      await new Promise((r) => setTimeout(r, 500))
      setEnviado(true)
      toast.success(t("sistema.ticket_creado"))
      setEnviando(false)
      return
    }
    try {
      await dockerOrchestrator.post("/api/tickets", form)
      setEnviado(true)
      toast.success(t("sistema.ticket_creado"))
    } catch (err: any) {
      const msg = err?.response?.data?.error || t("sistema.error_servidor")
      setError(msg)
      toast.error(msg)
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-16"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{t("sistema.ticket_exito")}</h2>
        <p className="text-muted-foreground mb-8">{t("sistema.ticket_exito_desc")}</p>
        <Button onClick={() => { setEnviado(false); setForm({ cliente: "", email: "", telefono: "", descripcion: "" }); setError("") }}>
          {t("sistema.nuevo_pedido")}
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t("sistema.form_title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("sistema.form_desc")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="cliente">{t("sistema.cliente")} *</Label>
          <Input
            id="cliente"
            value={form.cliente}
            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
            placeholder={t("sistema.cliente_placeholder")}
          />
        </div>

        <div>
          <Label htmlFor="email">{t("sistema.email")}</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div>
          <Label htmlFor="telefono">{t("sistema.telefono")}</Label>
          <Input
            id="telefono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            placeholder="999 888 777"
          />
        </div>

        <div>
          <Label htmlFor="descripcion">{t("sistema.descripcion")} *</Label>
          <Textarea
            id="descripcion"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder={t("sistema.descripcion_placeholder")}
            rows={5}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? t("sistema.enviando") : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {t("sistema.enviar")}
            </>
          )}
        </Button>
      </form>
    </motion.div>
  )
}
