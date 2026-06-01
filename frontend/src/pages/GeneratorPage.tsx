import { useMemo, useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { categories } from "@/lib/modules-data"
import * as LucideIcons from "lucide-react"
import type { DeployLog } from "@/types"
import { useTranslation } from "react-i18next"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import {
  Search,
  Check,
  Building2,
  Package,
  ChevronRight,
  ChevronLeft,
  Server,
  Box,
  Terminal,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { analytics } from "@/services/analytics"

const RUBROS = [
  { id: "bodega", nameKey: "generator.rubro_bodega", icon: "Store" },
  { id: "restaurante", nameKey: "generator.rubro_restaurante", icon: "UtensilsCrossed" },
  { id: "textil", nameKey: "generator.rubro_textil", icon: "Shirt" },
]

const DEPLOY_LOGS: DeployLog[] = [
  { message: "Inicializando contenedor Docker...", timestamp: "", type: "info" },
  { message: "Puliendo imagen base node:20-alpine...", timestamp: "", type: "info" },
  { message: "Configurando variables de entorno...", timestamp: "", type: "info" },
  { message: "Montando volúmenes de datos...", timestamp: "", type: "info" },
  { message: "Compilando módulos seleccionados...", timestamp: "", type: "info" },
  { message: "Ejecutando migraciones de base de datos...", timestamp: "", type: "info" },
  { message: "Configurando proxy reverso...", timestamp: "", type: "info" },
  { message: "¡Contenedor desplegado exitosamente!", timestamp: "", type: "success" },
  { message: "Sistema disponible en https://{subdomain}.saas.local", timestamp: "", type: "success" },
]

const stepIcons = [Building2, Box, Server]
const stepLabels = ["generator.step_1", "generator.step_2", "generator.step_3"]

export default function GeneratorPage() {
  const { t } = useTranslation()
  const { handleSuccess } = useErrorHandler("GeneratorPage")
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [rubro, setRubro] = useState("")
  const [subdomain, setSubdomain] = useState("")
  const [search, setSearch] = useState("")
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [deploying, setDeploying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<DeployLog[]>([])
  const [deployComplete, setDeployComplete] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const getIcon = (iconName: string, className = "h-5 w-5") => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
    return Icon ? <Icon className={className} /> : null
  }

  const getRubroIcon = (iconName: string) => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
    return Icon ? <Icon className="h-5 w-5" /> : null
  }

  const filteredCategories = useMemo(
    () =>
      search
        ? categories
            .map((cat) => ({
              ...cat,
              modules: cat.modules.filter(
                (m) =>
                  m.name.toLowerCase().includes(search.toLowerCase()) ||
                  m.description.toLowerCase().includes(search.toLowerCase()),
              ),
            }))
            .filter((cat) => cat.modules.length > 0)
        : categories,
    [search],
  )

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId],
    )
  }

  const selectAllModules = () => {
    const allIds = categories.flatMap((c) => c.modules.map((m) => m.id))
    setSelectedModules(allIds)
  }

  const deselectAllModules = () => {
    setSelectedModules([])
  }

  const handleNameChange = (value: string) => {
    setName(value)
    setSubdomain(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "")
  }

  const canProceedStep0 = name.length > 0 && rubro.length > 0
  const canProceedStep1 = selectedModules.length > 0

  const handleDeploy = async () => {
    analytics.track("deploy_start", { moduleCount: selectedModules.length, rubro })
    setDeploying(true)
    setDeployComplete(false)
    setProgress(0)
    setLogs([])

    const totalSteps = DEPLOY_LOGS.length
    let currentStep = 0

    const logInterval = setInterval(() => {
      if (currentStep < totalSteps) {
        const log = { ...DEPLOY_LOGS[currentStep], timestamp: new Date().toLocaleTimeString() }
        setLogs((prev) => [...prev, log])
        setProgress(Math.round(((currentStep + 1) / totalSteps) * 100))
        currentStep++
      } else {
        clearInterval(logInterval)
        setProgress(100)
        setDeployComplete(true)
        analytics.track("deploy_success", { modules: selectedModules.join(", ") })
        setTimeout(() => {
          handleSuccess(`${t("generator.deploy_success")}: ${name}`)
          setDeploying(false)
          setName("")
          setRubro("")
          setSubdomain("")
          setSelectedModules([])
          setStep(0)
          setLogs([])
          setProgress(0)
          setDeployComplete(false)
        }, 3000)
      }
    }, 700)
  }

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 max-w-lg mx-auto py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="company-name">{t("generator.company_name")}</Label>
              <Input
                id="company-name"
                placeholder={t("generator.company_placeholder")}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("generator.rubro")}</Label>
              <div className="grid grid-cols-3 gap-3">
                {RUBROS.map((r) => {
                  const selected = rubro === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRubro(r.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                        selected
                          ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-500/10"
                          : "border-border hover:border-blue-200 hover:bg-blue-50/50",
                      )}
                    >
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", selected ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground")}>
                        {getRubroIcon(r.icon)}
                      </div>
                      <span className={cn("text-xs font-medium", selected ? "text-blue-700" : "text-muted-foreground")}>
                        {t(r.nameKey)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">{t("generator.subdomain")}</Label>
              <Input
                id="subdomain"
                placeholder={t("generator.subdomain_placeholder")}
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="h-10 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">{t("generator.subdomain_hint")}</p>
            </div>
          </motion.div>
        )

      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 py-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("generator.search_placeholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={selectAllModules}>
                  {t("generator.select_all")}
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={deselectAllModules}>
                  {t("generator.deselect_all")}
                </Button>
                <Badge variant="secondary" className="text-xs">
                  {selectedModules.length} {t("generator.modules_selected")}
                </Badge>
              </div>
            </div>

            {filteredCategories.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{t("generator.no_modules")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[420px] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <Card key={cat.id} className="overflow-hidden border-0 shadow-sm">
                    <CardHeader className="pb-2 pt-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                          {getIcon(cat.icon, "h-3.5 w-3.5")}
                        </div>
                        <CardTitle className="text-xs font-medium">{cat.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 space-y-1">
                      {cat.modules.map((mod) => {
                        const isSelected = selectedModules.includes(mod.id)
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => toggleModule(mod.id)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition-all",
                              isSelected
                                ? "border-blue-300 bg-blue-50 text-blue-700"
                                : "border-transparent bg-muted/50 hover:bg-muted text-muted-foreground",
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                                isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-muted-foreground/30",
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium">{mod.name}</span>
                            </div>
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted-foreground/10">
                              {getIcon(mod.icon, "h-3 w-3")}
                            </div>
                          </button>
                        )
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 max-w-2xl mx-auto py-4"
          >
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {rubro && `generator.rubro_${rubro}` ? t(`generator.rubro_${rubro}` as unknown as TemplateStringsArray) : rubro}
                      </Badge>
                      <span>{subdomain}.saas.local</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedModules.map((modId) => {
                    const found = categories.flatMap((c) => c.modules).find((m) => m.id === modId)
                    return found ? (
                      <Badge key={modId} variant="secondary" className="text-[10px] gap-1 h-5">
                        {getIcon(found.icon, "h-3 w-3")}
                        {found.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              </CardContent>
            </Card>

            {!deploying && !deployComplete && (
              <Button
                className="w-full h-11 text-base gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={handleDeploy}
              >
                <Server className="h-5 w-5" />
                {t("generator.create_system")}
              </Button>
            )}

            {(deploying || deployComplete) && (
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{t("generator.deploy_title")}</span>
                      <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                      <Terminal className="h-3.5 w-3.5" />
                      {t("generator.deploy_log")}
                    </div>
                    <div className="rounded-lg bg-black/90 p-3 font-mono text-[11px] leading-relaxed max-h-[200px] overflow-y-auto space-y-0.5">
                      {logs.map((log, i) => (
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
                          <span className="shrink-0 text-[10px] text-gray-500">
                            {log.timestamp || "--:--:--"}
                          </span>
                          {log.type === "success" ? (
                            <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5 text-emerald-400" />
                          ) : log.type === "error" ? (
                            <XCircle className="h-3 w-3 shrink-0 mt-0.5 text-red-400" />
                          ) : log.type === "warn" ? (
                            <AlertCircle className="h-3 w-3 shrink-0 mt-0.5 text-amber-400" />
                          ) : (
                            <span className="text-gray-500">$</span>
                          )}
                          <span>{log.message.replace("{subdomain}", subdomain)}</span>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  </div>

                  {deployComplete && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      {t("generator.deploy_success")}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t("generator.title")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("generator.subtitle")}</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {stepLabels.map((label, i) => {
            const StepIcon = stepIcons[i]
            const isActive = step === i
            const isCompleted = step > i
            return (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold border-2 transition-all",
                      isActive && "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/20",
                      isCompleted && "border-emerald-500 bg-emerald-500 text-white",
                      !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground bg-background",
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium whitespace-nowrap",
                      isActive || isCompleted ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {t(label)}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-3 mt-[-20px]",
                      step > i ? "bg-emerald-400" : "bg-muted-foreground/20",
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>

      {step < 2 && !deploying && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("generator.back")}
          </Button>
          <Button
            onClick={() => {
              if (step === 0 && canProceedStep0) setStep(1)
              else if (step === 1 && canProceedStep1) setStep(2)
            }}
            disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
          >
            {step === 1 ? t("generator.create_system") : t("generator.next")}
            {step === 0 && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      )}
    </div>
  )
}
