import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Zap, BarChart3, Shield, HeadphonesIcon, CheckCircle, Send, MessageCircle, Building2, Users, Clock, TrendingUp } from "lucide-react"
import { toast } from "sonner"

const container = "max-w-6xl mx-auto px-4 lg:px-6"

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.4, ease: "easeOut" as const },
}

const benefits = [
  { key: "benefit_1", icon: Zap },
  { key: "benefit_2", icon: BarChart3 },
  { key: "benefit_3", icon: Shield },
  { key: "benefit_4", icon: HeadphonesIcon },
]

const projects = [
  { key: "project_1", tags: ["Inventarios", "Ventas"] },
  { key: "project_2", tags: ["Restaurantes", "Comandas"] },
  { key: "project_3", tags: ["Producción", "Logística"] },
]

const stats = [
  { icon: Building2, value: "50+", label: "Empresas activas" },
  { icon: Users, value: "98%", label: "Satisfacción" },
  { icon: Clock, value: "2 min", label: "Despliegue" },
  { icon: TrendingUp, value: "3x", label: "Crecimiento" },
]

export default function SistemaHomePage() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error("Completa todos los campos")
      return
    }
    setSending(true)
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
    toast.success(t("sistema.contact_success"))
    setSending(false)
  }

  return (
    <div className="overflow-hidden">

      {/* ───── Hero ───── */}
      <section className="relative bg-[#0a0e1a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className={`${container} relative pt-24 pb-20 md:pt-32 md:pb-28 text-center`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/15 rounded-sm px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-primary mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Plataforma lista para producción
            </div>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t("sistema.hero_title")}
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t("sistema.hero_desc")}
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button asChild size="lg" className="bg-white text-[#0a0e1a] hover:bg-white/90 hard-shadow-md hover:hard-shadow-lg text-base px-8 h-12">
              <Link to="/sistema/venta">
                {t("sistema.hero_cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white hover:border-white/50 text-base px-8 h-12"
              onClick={() => scrollTo("contact")}
            >
              {t("sistema.contact_title")}
            </Button>
          </motion.div>
        </div>

        {/* KPI bar */}
        <div className={`${container} relative pb-8`}>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 border border-white/10 rounded-sm overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white/5 p-5 text-center border-r border-white/10 last:border-r-0">
                <Icon className="w-5 h-5 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-white font-mono">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ───── Benefits ───── */}
      <section id="beneficios" className={`${container} py-20 md:py-28`}>
        <motion.div className="text-center mb-14" {...fadeUp}>
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Ventajas</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 tracking-tight">{t("sistema.benefits_title")}</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Todo lo que necesitas para digitalizar tu negocio en un solo lugar.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              className="group bg-card rounded-sm p-6 border border-border hover:border-primary/50 hover:hard-shadow-sm transition-all duration-200"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <div className="w-11 h-11 bg-secondary border border-border rounded-sm flex items-center justify-center mb-4 group-hover:bg-primary group-hover:border-primary transition-colors duration-200">
                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground transition-colors duration-200" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5 tracking-tight">{t(`sistema.${key}_title`)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(`sistema.${key}_desc`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── Projects ───── */}
      <section id="proyectos" className="bg-muted/40 py-20 md:py-28 border-y border-border">
        <div className={container}>
          <motion.div className="text-center mb-14" {...fadeUp}>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Portafolio</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 tracking-tight">{t("sistema.projects_title")}</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Conoce algunos de los proyectos que hemos implementado.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map(({ key, tags }, i) => (
              <motion.div
                key={key}
                className="group bg-card rounded-sm border border-border overflow-hidden hover:border-primary/50 hover:hard-shadow-sm transition-all duration-200"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className="h-44 bg-[#0a0e1a] flex items-center justify-center relative overflow-hidden border-b border-border">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_60%)]" />
                  <CheckCircle className="w-14 h-14 text-white/20 group-hover:text-white/40 transition-colors duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-1.5 tracking-tight">{t(`sistema.${key}_name`)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t(`sistema.${key}_desc`)}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {tags.map((tag) => (
                      <span key={tag} className="text-[11px] font-medium uppercase tracking-wide bg-secondary text-muted-foreground border border-border px-2.5 py-1 rounded-sm">{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Contact ───── */}
      <section id="contact" className={`${container} py-20 md:py-28`}>
        <motion.div className="text-center mb-14" {...fadeUp}>
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Contacto</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 tracking-tight">{t("sistema.contact_title")}</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{t("sistema.contact_desc")}</p>
        </motion.div>
        <div className="max-w-lg mx-auto">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-emerald-500/10 rounded-sm border border-emerald-700/30"
            >
              <div className="w-14 h-14 bg-emerald-500/15 rounded-sm flex items-center justify-center mx-auto mb-4 border border-emerald-700/30">
                <CheckCircle className="w-7 h-7 text-emerald-700" />
              </div>
              <p className="text-foreground font-semibold text-lg tracking-tight">{t("sistema.contact_success")}</p>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5 bg-card border border-border rounded-sm p-6 md:p-8 hard-shadow-sm"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block tracking-tight">{t("sistema.contact_name")}</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t("sistema.contact_name_placeholder")}
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block tracking-tight">{t("sistema.contact_email")}</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t("sistema.contact_email_placeholder")}
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block tracking-tight">{t("sistema.contact_message")}</label>
                <Textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t("sistema.contact_message_placeholder")}
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base" disabled={sending}>
                {sending ? (
                  t("sistema.contact_sending")
                ) : (
                  <><Send className="w-4 h-4 mr-2" />{t("sistema.contact_send")}</>
                )}
              </Button>

              <div className="text-center pt-2">
                <a
                  href="https://wa.me/51999000000?text=Hola!%20Quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20MultiSaas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t("sistema.contact_wsp")}
                </a>
              </div>
            </motion.form>
          )}
        </div>
      </section>
    </div>
  )
}
