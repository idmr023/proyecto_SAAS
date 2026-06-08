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
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.5, ease: "easeOut" as const },
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
      <section className="relative bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1E40AF] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
        <div className={`${container} relative pt-24 pb-20 md:pt-32 md:pb-28 text-center`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium text-blue-200 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Plataforma lista para producción
            </div>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t("sistema.hero_title")}
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-blue-200/90 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("sistema.hero_desc")}
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button asChild size="lg" className="bg-white text-[#1E3A8A] hover:bg-blue-50 shadow-xl hover:shadow-2xl text-base px-8 h-12 rounded-xl transition-all">
              <Link to="/sistema/venta">
                {t("sistema.hero_cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 text-base px-8 h-12 rounded-xl shadow-lg transition-all"
              onClick={() => scrollTo("contact")}
            >
              {t("sistema.contact_title")}
            </Button>
          </motion.div>
        </div>

        {/* KPI bar */}
        <div className={`${container} relative pb-8`}>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-[#0F172A]/60 backdrop-blur-sm p-5 text-center">
                <Icon className="w-5 h-5 mx-auto text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-blue-300/80 mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ───── Benefits ───── */}
      <section id="beneficios" className={`${container} py-20 md:py-28`}>
        <motion.div className="text-center mb-14" {...fadeUp}>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Ventajas</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{t("sistema.benefits_title")}</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Todo lo que necesitas para digitalizar tu negocio en un solo lugar.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              className="group bg-card rounded-xl p-6 border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                <Icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{t(`sistema.${key}_title`)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(`sistema.${key}_desc`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── Projects ───── */}
      <section id="proyectos" className="bg-muted/40 py-20 md:py-28">
        <div className={container}>
          <motion.div className="text-center mb-14" {...fadeUp}>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Portafolio</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{t("sistema.projects_title")}</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Conoce algunos de los proyectos que hemos implementado.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map(({ key, tags }, i) => (
              <motion.div
                key={key}
                className="group bg-card rounded-2xl border shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="h-44 bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.2),transparent_60%)]" />
                  <CheckCircle className="w-14 h-14 text-white/30 group-hover:text-white/60 group-hover:scale-110 transition-all duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-1.5">{t(`sistema.${key}_name`)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t(`sistema.${key}_desc`)}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {tags.map((tag) => (
                      <span key={tag} className="text-[11px] font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200/50">{tag}</span>
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
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Contacto</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{t("sistema.contact_title")}</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{t("sistema.contact_desc")}</p>
        </motion.div>
        <div className="max-w-lg mx-auto">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-green-50 rounded-2xl border border-green-200"
            >
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-foreground font-semibold text-lg">{t("sistema.contact_success")}</p>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5 bg-card border rounded-2xl p-6 md:p-8 shadow-sm"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t("sistema.contact_name")}</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t("sistema.contact_name_placeholder")}
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t("sistema.contact_email")}</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t("sistema.contact_email_placeholder")}
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t("sistema.contact_message")}</label>
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
                  className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
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
