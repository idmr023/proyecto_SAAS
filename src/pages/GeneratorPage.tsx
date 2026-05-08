import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { categories } from "@/lib/modules-data"
import * as LucideIcons from "lucide-react"
import type { Module } from "@/types"
import { toast } from "sonner"
import {
  Loader2,
  Search,
  Plus,
  X,
  ShoppingCart,
  Package,
  FlaskConical,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BuildItem {
  module: Module
  categoryId: string
  categoryName: string
}

export default function GeneratorPage() {
  const { isDemo } = useAuth()
  const [search, setSearch] = useState("")
  const [buildList, setBuildList] = useState<BuildItem[]>([])
  const [clientName, setClientName] = useState("")
  const [clientNameError, setClientNameError] = useState("")
  const [deploying, setDeploying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showDeployDialog, setShowDeployDialog] = useState(false)
  const [expanded, setExpanded] = useState<string[]>(categories.map((c) => c.id))

  const toggleCategory = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
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

  const isInBuild = (moduleId: string) => buildList.some((b) => b.module.id === moduleId)

  const addToBuild = (module: Module, catId: string, catName: string) => {
    if (isInBuild(module.id)) {
      toast.info(`${module.name} ya está en la lista`)
      return
    }
    setBuildList((prev) => [...prev, { module, categoryId: catId, categoryName: catName }])
    toast.success(`${module.name} agregado`)
  }

  const removeFromBuild = (moduleId: string) => {
    setBuildList((prev) => prev.filter((b) => b.module.id !== moduleId))
  }

  const getIcon = (iconName: string, className = "h-5 w-5") => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
    return Icon ? <Icon className={className} /> : null
  }

  const validate = (): boolean => {
    if (buildList.length === 0) {
      toast.error("Agrega al menos un módulo a la lista")
      return false
    }
    if (!clientName.trim()) {
      setClientNameError("El nombre del cliente es obligatorio")
      return false
    }
    setClientNameError("")
    return true
  }

  const handleDeploy = async () => {
    if (!validate()) return

    setDeploying(true)
    setShowDeployDialog(true)
    setProgress(0)

    const totalSteps = buildList.length * 2
    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      setProgress(Math.min(Math.round((currentStep / totalSteps) * 100), 99))
      if (currentStep >= totalSteps) {
        clearInterval(interval)
        setProgress(100)
      }
    }, 600)

    try {
      await new Promise((r) => setTimeout(r, buildList.length * 2000 + 2000))
      clearInterval(interval)
      setProgress(100)

      const names = buildList.map((b) => b.module.name).join(", ")
      toast.success("Sistema desplegado", {
        description: `${buildList.length} módulo${buildList.length > 1 ? "s" : ""} para ${clientName}: ${names}`,
      })

      setTimeout(() => {
        setShowDeployDialog(false)
        setBuildList([])
        setClientName("")
        setProgress(0)
      }, 1500)
    } catch {
      clearInterval(interval)
      toast.error("Error al desplegar")
      setShowDeployDialog(false)
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Generador de Sistemas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Arma tu sistema combinando módulos de distintas categorías
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* === CATALOG === */}
        <div className="flex-1 min-w-0">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar módulos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No se encontraron módulos</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((cat) => (
                <Card key={cat.id} className="overflow-hidden">
                  {/* Category header */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                        {getIcon(cat.icon, "h-4 w-4")}
                      </div>
                      <span className="text-sm font-medium">{cat.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {cat.modules.length} módulo{cat.modules.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {expanded.includes(cat.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expanded.includes(cat.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t divide-y">
                          {cat.modules.map((mod) => {
                            const added = isInBuild(mod.id)
                            return (
                              <div
                                key={mod.id}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                                  added && "bg-primary/5",
                                )}
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                  {getIcon(mod.icon, "h-4 w-4")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm">{mod.name}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {mod.description}
                                  </div>
                                </div>
                                <Button
                                  variant={added ? "secondary" : "outline"}
                                  size="sm"
                                  className="h-7 shrink-0 text-xs gap-1"
                                  onClick={() =>
                                    added
                                      ? removeFromBuild(mod.id)
                                      : addToBuild(mod, cat.id, cat.name)
                                  }
                                >
                                  {added ? (
                                    <>
                                      <X className="h-3 w-3" />
                                      Quitar
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-3 w-3" />
                                      Agregar
                                    </>
                                  )}
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* === BUILD LIST SIDEBAR === */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-20">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">Tu Lista</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {buildList.length} módulo{buildList.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {buildList.length === 0 ? (
                  <div className="py-6 text-center">
                    <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">
                      Agrega módulos desde el catálogo
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
                      {buildList.map((item) => (
                        <motion.div
                          key={item.module.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs group"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                            {getIcon(item.module.icon, "h-3.5 w-3.5")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.module.name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {item.categoryName}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromBuild(item.module.id)}
                            className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Cliente</Label>
                        <Input
                          placeholder="Nombre del cliente"
                          value={clientName}
                          onChange={(e) => {
                            setClientName(e.target.value)
                            setClientNameError("")
                          }}
                          aria-invalid={!!clientNameError}
                          className="h-8 text-xs"
                        />
                        {clientNameError && (
                          <p className="text-[10px] text-destructive">{clientNameError}</p>
                        )}
                      </div>

                      <div className="rounded-md bg-muted/50 px-2.5 py-2 text-xs space-y-1">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Módulos</span>
                          <span className="font-medium text-foreground">{buildList.length}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Categorías</span>
                          <span className="font-medium text-foreground">
                            {new Set(buildList.map((b) => b.categoryId)).size}
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full h-8 text-xs"
                        onClick={handleDeploy}
                        disabled={deploying || buildList.length === 0}
                      >
                        {deploying ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            Desplegando...
                          </>
                        ) : (
                          <>
                            <Package className="h-3.5 w-3.5 mr-1" />
                            Crear Sistema
                          </>
                        )}
                      </Button>

                      {isDemo && (
                        <div className="flex items-center justify-center gap-1 text-[10px] text-amber-500">
                          <FlaskConical className="h-3 w-3" />
                          Demo — sin backend real
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Deploy dialog */}
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Desplegando Sistema</DialogTitle>
            <DialogDescription className="text-xs">
              {buildList.length} módulo{buildList.length !== 1 ? "s" : ""} para {clientName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Progress value={progress} />
            <div className="space-y-1">
              {buildList.map((item, i) => {
                const moduleProgress = Math.min(
                  Math.max((progress - (i / buildList.length) * 100) * buildList.length, 0),
                  100,
                )
                return (
                  <div key={item.module.id} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-1.5 flex-1 rounded-full bg-muted overflow-hidden",
                      )}
                    >
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          moduleProgress >= 100 ? "bg-emerald-500" : "bg-primary",
                        )}
                        style={{ width: `${moduleProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-20 truncate text-right">
                      {item.module.name}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {progress < 100
                ? `Desplegando contenedores Docker...`
                : "¡Sistema creado exitosamente!"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
