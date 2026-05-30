import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Building2, Cpu, CreditCard, Activity, Globe } from "lucide-react"

const MOCK_EMPRESAS = [
  { id: "1", name: "Bodega Don José", rubro: "Bodega", status: "running", region: "Lima", cpu: 32, memory: 1.2 },
  { id: "2", name: "Restaurante El Marino", rubro: "Restaurante", status: "running", region: "Arequipa", cpu: 28, memory: 0.9 },
  { id: "3", name: "Textiles Los Andes", rubro: "Textil", status: "error", region: "Cusco", cpu: 0, memory: 0 },
  { id: "4", name: "Bodega Doña María", rubro: "Bodega", status: "stopped", region: "Trujillo", cpu: 0, memory: 0.1 },
  { id: "5", name: "Restaurante Sabores", rubro: "Restaurante", status: "running", region: "Lima", cpu: 45, memory: 1.8 },
  { id: "6", name: "Textil Mundo", rubro: "Textil", status: "running", region: "Lima", cpu: 22, memory: 0.7 },
]

const PIE_COLORS = ["#22c55e", "#eab308", "#ef4444"]

const regions = [
  { name: "Lima", empresas: 3, x: 45, y: 55 },
  { name: "Arequipa", empresas: 1, x: 58, y: 70 },
  { name: "Cusco", empresas: 1, x: 62, y: 62 },
  { name: "Trujillo", empresas: 1, x: 38, y: 40 },
]

export default function DashboardPage() {
  const { t } = useTranslation()

  const stats = useMemo(() => ({
    total: MOCK_EMPRESAS.length,
    running: MOCK_EMPRESAS.filter((e) => e.status === "running").length,
    stopped: MOCK_EMPRESAS.filter((e) => e.status === "stopped").length,
    errors: MOCK_EMPRESAS.filter((e) => e.status === "error").length,
    totalCpu: Math.round(MOCK_EMPRESAS.reduce((a, e) => a + e.cpu, 0) / MOCK_EMPRESAS.length),
    totalMemory: MOCK_EMPRESAS.reduce((a, e) => a + e.memory, 0).toFixed(1),
  }), [])

  const pieData = [
    { name: t("dashboard.activas"), value: stats.running, color: PIE_COLORS[0] },
    { name: t("dashboard.detenidas"), value: stats.stopped, color: PIE_COLORS[1] },
    { name: t("dashboard.con_errores"), value: stats.errors, color: PIE_COLORS[2] },
  ]

  const kpiCards = [
    { label: t("dashboard.total_empresas"), value: stats.total, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
    { label: t("dashboard.cpu_memoria"), value: `${stats.totalCpu}% / ${stats.totalMemory}GB`, icon: Cpu, color: "text-violet-600", bg: "bg-violet-50" },
    { label: t("dashboard.planes_activos"), value: stats.running, icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: t("dashboard.total"), value: `${stats.running + stats.stopped}/${stats.total}`, icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
  ]

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
          >
            <Card className="overflow-hidden border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {kpi.label}
                </CardTitle>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">{t("dashboard.distribucion")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      animationBegin={400}
                      animationDuration={800}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      formatter={(value) => [value] as unknown as string}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                    <span className="font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">{t("dashboard.mapa")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-[260px] rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 overflow-hidden">
                <svg viewBox="0 0 200 130" className="w-full h-full">
                  <path
                    d="M20 30 Q50 10 100 15 Q150 20 180 35 L190 100 Q150 115 100 120 Q50 125 15 105 Z"
                    fill="none"
                    stroke="#93c5fd"
                    strokeWidth="0.5"
                    className="opacity-40"
                  />
                  {regions.map((r) => (
                    <g key={r.name}>
                      <circle cx={r.x} cy={r.y} r={8 + r.empresas * 2} fill="#3B82F6" fillOpacity="0.15" />
                      <circle cx={r.x} cy={r.y} r={4 + r.empresas} fill="#3B82F6" fillOpacity="0.35" />
                      <circle cx={r.x} cy={r.y} r={2} fill="#1E3A8A" />
                      <text x={r.x} y={r.y - 12} textAnchor="middle" fontSize="3.5" fill="#1E40AF" fontWeight="600">
                        {r.name}
                      </text>
                      <text x={r.x} y={r.y + 4} textAnchor="middle" fontSize="3" fill="#64748b">
                        {r.empresas} emp.
                      </text>
                    </g>
                  ))}
                  <text x={100} y={122} textAnchor="middle" fontSize="3.5" fill="#94a3b8">
                    Distribución de servidores por región
                  </text>
                </svg>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
