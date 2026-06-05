import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  Container,
  ArrowRight,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Zap,
  BarChart3,
  Shield,
  HeadphonesIcon,
  Building2,
  Users,
  Clock,
  TrendingUp,
  Layers,
  Settings,
  Rocket,
  Sparkles,
  Quote,
  LogOut,
  User,
  FileText,
} from "lucide-react"
import SolicitarSistemaModal from "@/components/shared/SolicitarSistemaModal"

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

const steps = [
  { icon: Layers, key: "step_1" },
  { icon: Settings, key: "step_2" },
  { icon: Rocket, key: "step_3" },
]

const projects = [
  { key: "project_1", tags: ["Inventarios", "Ventas"] },
  { key: "project_2", tags: ["Restaurantes", "Comandas"] },
  { key: "project_3", tags: ["Producción", "Logística"] },
]

const stats = [
  { icon: Building2, value: "50+", labelKey: "landing.stats_companies" },
  { icon: Users, value: "98%", labelKey: "landing.stats_satisfaction" },
  { icon: Clock, value: "2 min", labelKey: "landing.stats_deploy" },
  { icon: TrendingUp, value: "3x", labelKey: "landing.stats_growth" },
]

export default function LandingPage() {
  const { t } = useTranslation()
  const { theme, toggle } = useTheme()
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [solicitarOpen, setSolicitarOpen] = useState(false)
  const isCliente = user && user.role !== "admin"

  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollTo = (id: string) => {
    setMobileOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const navLinks = [
    { label: t("landing.nav_features"), href: "#features" },
    { label: t("landing.nav_projects"), href: "#projects" },
    { label: t("landing.nav_contact"), href: "#contact" },
  ]

  return (
    <div className="overflow-hidden">
      {/* ───── Fixed Nav ───── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="flex h-16 items-center px-4 lg:px-6 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 font-semibold shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-sm">
              <Container className="h-4 w-4" />
            </div>
            <span className={scrolled ? "" : "text-white"}>{t("app.name")}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-10">
            {navLinks.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => scrollTo(href.slice(1))}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  scrolled
                    ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                    : "text-white hover:bg-white/20"
                }`}
              >
                {label}
              </button>
            ))}
            {isCliente && (
              <>
                <span className={`w-px h-5 mx-1 ${scrolled ? "bg-border" : "bg-white/20"}`} />
                <button
                  onClick={() => setSolicitarOpen(true)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
                    scrolled
                      ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  {t("nav.solicitar_sistema")}
                </button>
                <button
                  onClick={() => scrollTo("cuenta")}
                  className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
                    scrolled
                      ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  {t("nav.cuenta")}
                </button>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggle}
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                scrolled
                  ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                  : "text-white hover:bg-white/20"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {isCliente ? (
              <Button
                variant="default"
                size="sm"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">{t("nav.logout")}</span>
              </Button>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/login">
                  {t("landing.nav_login")}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              className={`md:hidden h-9 w-9 rounded-lg flex items-center justify-center ${
                scrolled ? "text-foreground" : "text-white"
              }`}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ───── Mobile Drawer ───── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="absolute right-0 top-0 h-full w-64 bg-background border-l shadow-xl"
          >
            <div className="flex items-center justify-between px-4 h-16 border-b">
              <div className="flex items-center gap-2 font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                  <Container className="h-4 w-4" />
                </div>
                <span>{t("app.name")}</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
              <nav className="flex flex-col p-4 gap-1">
                {navLinks.map(({ label, href }) => (
                  <button
                    key={href}
                    onClick={() => scrollTo(href.slice(1))}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-md hover:bg-accent text-foreground text-left"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    {label}
                  </button>
                ))}
                {isCliente && (
                  <>
                    <div className="border-t my-1" />
                    <button
                      onClick={() => { setSolicitarOpen(true); setMobileOpen(false) }}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-md hover:bg-accent text-foreground text-left"
                    >
                      <FileText className="h-4 w-4" />
                      {t("nav.solicitar_sistema")}
                    </button>
                    <button
                      onClick={() => { scrollTo("cuenta"); setMobileOpen(false) }}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-md hover:bg-accent text-foreground text-left"
                    >
                      <User className="h-4 w-4" />
                      {t("nav.cuenta")}
                    </button>
                  </>
                )}
                <div className="border-t my-3" />
                {isCliente ? (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground text-center">{user?.email}</div>
                    <Button variant="outline" className="w-full" onClick={() => { signOut(); setMobileOpen(false) }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("nav.logout")}
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full" onClick={() => setMobileOpen(false)}>
                    <Link to="/login">
                      {t("landing.nav_login")}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </nav>
          </motion.div>
        </div>
      )}

      {/* ───── Hero ───── */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative min-h-screen flex items-center bg-gradient-to-br from-[#0B1120] via-[#0F1F4A] to-[#0F2340] text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.08),transparent_50%)]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className={`${container} relative pt-32 pb-20 md:pt-40 md:pb-28`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge variant="outline" className="mb-6 border-blue-400/30 text-blue-300 bg-blue-500/10 px-4 py-1.5 text-xs font-medium rounded-full">
              <Sparkles className="w-3 h-3 mr-1.5" />
              {t("landing.hero_badge")}
            </Badge>
          </motion.div>

          <motion.h1
            className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
              {t("landing.hero_title")}
            </span>
          </motion.h1>

          <motion.p
            className="text-center text-lg md:text-xl text-blue-200/80 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("landing.hero_desc")}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button size="lg" className="bg-white text-[#0F1F4A] hover:bg-blue-50 shadow-xl hover:shadow-2xl text-base px-8 h-12 rounded-xl transition-all" onClick={() => setSolicitarOpen(true)}>
              {t("landing.hero_cta_primary")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 text-base px-8 h-12 rounded-xl shadow-lg transition-all"
              onClick={() => scrollTo("features")}
            >
              {t("landing.hero_cta_secondary")}
            </Button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            {stats.map(({ icon: Icon, value, labelKey }, i) => (
              <motion.div
                key={labelKey}
                className="bg-[#0B1120]/60 backdrop-blur-sm p-5 md:p-6 text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.55 + i * 0.08 }}
              >
                <Icon className="w-5 h-5 mx-auto text-blue-400 mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">{value}</div>
                <div className="text-xs text-blue-300/80 mt-0.5">{t(labelKey)}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ───── Features ───── */}
      <section id="features" className={`${container} py-20 md:py-28`}>
        <motion.div className="text-center mb-14" {...fadeUp}>
          <Badge variant="secondary" className="mb-3">{t("landing.features_badge")}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{t("landing.features_title")}</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{t("landing.features_subtitle")}</p>
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
              <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{t(`sistema.${key}_title`)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(`sistema.${key}_desc`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="bg-muted/40 py-20 md:py-28">
        <div className={container}>
          <motion.div className="text-center mb-14" {...fadeUp}>
            <Badge variant="secondary" className="mb-3">{t("landing.how_badge")}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{t("landing.how_title")}</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{t("landing.how_subtitle")}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-20 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300" />
            {steps.map(({ icon: Icon, key }, i) => (
              <motion.div
                key={key}
                className="relative text-center"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
              >
                <div className="relative z-10 w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center">
                  <Icon className="w-7 h-7" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-card border text-xs font-bold text-blue-700 flex items-center justify-center shadow-sm">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{t(`landing.${key}_title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{t(`landing.${key}_desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Projects ───── */}
      <section id="projects" className={`${container} py-20 md:py-28`}>
        <motion.div className="text-center mb-14" {...fadeUp}>
          <Badge variant="secondary" className="mb-3">{t("landing.projects_badge")}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{t("sistema.projects_title")}</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{t("landing.projects_subtitle")}</p>
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
              <div className="h-44 bg-gradient-to-br from-[#0F1F4A] to-[#0B1120] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.2),transparent_60%)]" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
                <Quote className="w-14 h-14 text-white/20 group-hover:text-white/40 group-hover:scale-110 transition-all duration-500" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-1.5">{t(`sistema.${key}_name`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t(`sistema.${key}_desc`)}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {tags.map((tag) => (
                    <span key={tag} className="text-[11px] font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full border border-blue-200/50 dark:border-blue-800/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── Testimonials ───── */}
      <section className="bg-muted/40 py-20 md:py-28">
        <div className={container}>
          <motion.div className="text-center mb-14" {...fadeUp}>
            <Badge variant="secondary" className="mb-3">{t("landing.testimonials_badge")}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{t("landing.testimonials_title")}</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t(`landing.testimonial_${i}_text`)}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                    {t(`landing.testimonial_${i}_name`).charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t(`landing.testimonial_${i}_name`)}</p>
                    <p className="text-xs text-muted-foreground">{t(`landing.testimonial_${i}_role`)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section id="contact" className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0F1F4A] to-[#0F2340]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        <div className={`${container} relative text-center`}>
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4 border-blue-400/30 text-blue-300 bg-blue-500/10 px-4 py-1.5 rounded-full">
              {t("landing.cta_badge")}
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {t("landing.cta_title")}
            </h2>
            <p className="text-lg text-blue-200/80 max-w-xl mx-auto mb-8">
              {t("landing.cta_desc")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-[#0F1F4A] hover:bg-blue-50 shadow-xl hover:shadow-2xl text-base px-8 h-12 rounded-xl transition-all" onClick={() => setSolicitarOpen(true)}>
                {t("landing.cta_primary")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 text-base px-8 h-12 rounded-xl shadow-lg"
                onClick={() => scrollTo("features")}
              >
                {t("landing.cta_secondary")}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t bg-background">
        <div className={`${container} py-12 md:py-16`}>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="sm:col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 font-semibold mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                  <Container className="h-4 w-4" />
                </div>
                <span>{t("app.name")}</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {t("landing.footer_desc")}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">{t("landing.footer_product")}</h4>
              <ul className="space-y-2">
                {["features", "projects", "pricing"].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollTo(item === "pricing" ? "contact" : item === "features" ? "features" : "projects")}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t(`landing.footer_${item}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">{t("landing.footer_company")}</h4>
              <ul className="space-y-2">
                {["about", "blog", "contact"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-muted-foreground cursor-default">{t(`landing.footer_${item}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">{t("landing.footer_legal")}</h4>
              <ul className="space-y-2">
                {["privacy", "terms"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-muted-foreground cursor-default">{t(`landing.footer_${item}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">{t("landing.footer_copyright")}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <button onClick={toggle} className="hover:text-foreground transition-colors flex items-center gap-1">
                {theme === "light" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                {theme === "light" ? t("nav.toggle_dark") : t("nav.toggle_light")}
              </button>
            </div>
          </div>
        </div>
      </footer>
      <SolicitarSistemaModal open={solicitarOpen} onOpenChange={setSolicitarOpen} />
    </div>
  )
}
