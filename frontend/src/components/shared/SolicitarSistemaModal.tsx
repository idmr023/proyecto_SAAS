import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Loader2, Send, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const rubros = ["Bodega", "Restaurante", "Textil", "Ventas", "Otro"]

const modulosDisponibles = [
  { id: "inventarios", label: "Inventarios" },
  { id: "ventas", label: "Ventas" },
  { id: "restaurantes", label: "Restaurantes" },
  { id: "produccion", label: "Producción" },
  { id: "logistica", label: "Logística" },
]

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function SolicitarSistemaModal({ open, onOpenChange }: Props) {
  const { user } = useAuth()
  const [negocio, setNegocio] = useState("")
  const [rubro, setRubro] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [modulos, setModulos] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const toggleModulo = (id: string) => {
    setModulos((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id])
  }

  const handleSubmit = async () => {
    if (!negocio.trim() || !rubro || !descripcion.trim()) {
      toast.error("Completa todos los campos obligatorios")
      return
    }
    setSubmitting(true)

    try {
      const { dockerOrchestrator } = await import("@/lib/config")
      await dockerOrchestrator.post("/api/tickets", {
        cliente: user?.name || user?.email || "Anónimo",
        email: user?.email,
        descripcion: `Solicitud de sistema - ${negocio}\nRubro: ${rubro}\nMódulos: ${modulos.join(", ") || "Ninguno"}\n\n${descripcion}`,
      })
    } catch {
      toast.error("Error al enviar la solicitud")
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setSent(true)
  }

  const reset = () => {
    setNegocio("")
    setRubro("")
    setDescripcion("")
    setModulos([])
    setSent(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!submitting) { onOpenChange(v); if (!v) reset() } }}>
      <DialogContent className="sm:max-w-lg">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8 text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-sm bg-emerald-500/15 border border-emerald-700/30">
                <CheckCircle2 className="h-8 w-8 text-emerald-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2 tracking-tight">Solicitud Enviada</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Solicitud Enviada correctamente. Uno de nuestros colaboradores se pondrá en contacto contigo tan pronto.
              </p>
              <Button className="mt-6" onClick={() => { onOpenChange(false); reset() }}>
                Entendido
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="tracking-tight">Solicitar Sistema</DialogTitle>
                <DialogDescription>
                  Cuéntanos qué necesita tu empresa y te prepararemos una solución a medida.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="negocio">Nombre del negocio *</Label>
                  <Input
                    id="negocio"
                    placeholder="Ej: Bodega Don José"
                    value={negocio}
                    onChange={(e) => setNegocio(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Rubro *</Label>
                  <Select value={rubro} onValueChange={setRubro}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un rubro" />
                    </SelectTrigger>
                    <SelectContent>
                      {rubros.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Módulos de interés</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {modulosDisponibles.map((m) => {
                      const selected = modulos.includes(m.id)
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleModulo(m.id)}
                          className={cn(
                            "flex items-center gap-2 rounded-sm border px-3 py-2 text-sm transition-colors",
                            selected
                              ? "border-primary bg-accent text-accent-foreground"
                              : "border-border hover:bg-accent/50"
                          )}
                        >
                          <div className={cn(
                            "h-4 w-4 rounded-sm border flex items-center justify-center transition-colors",
                            selected ? "bg-primary border-primary" : "border-border"
                          )}>
                            {selected && <span className="text-primary-foreground text-[10px]">✓</span>}
                          </div>
                          {m.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="descripcion">Describe tu sistema *</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Cuéntanos qué necesitas, qué problemas quieres resolver, qué módulos te interesan..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar solicitud
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
