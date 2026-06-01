import type { Category } from "@/types"

export const categories: Category[] = [
  {
    id: "erp",
    name: "ERP",
    description: "Gestión empresarial integral",
    icon: "Building2",
    modules: [
      { id: "erp-finanzas", name: "Finanzas", description: "Contabilidad, facturación y tesorería", icon: "DollarSign" },
      { id: "erp-rrhh", name: "RR.HH.", description: "Gestión de empleados y nóminas", icon: "Users" },
      { id: "erp-compras", name: "Compras", description: "Órdenes de compra y proveedores", icon: "ShoppingCart" },
    ],
  },
  {
    id: "logistica",
    name: "Logística",
    description: "Gestión de cadena de suministro",
    icon: "Truck",
    modules: [
      { id: "log-inventario", name: "Inventario", description: "Control de stock y almacenes", icon: "Warehouse" },
      { id: "log-transporte", name: "Transporte", description: "Rutas y seguimiento de flota", icon: "MapPin" },
      { id: "log-picking", name: "Picking", description: "Preparación de pedidos", icon: "Package" },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Automatización de campañas",
    icon: "Megaphone",
    modules: [
      { id: "mkt-email", name: "Email Marketing", description: "Campañas de correo automatizadas", icon: "Mail" },
      { id: "mkt-seo", name: "SEO", description: "Optimización en buscadores", icon: "Search" },
      { id: "mkt-social", name: "Redes Sociales", description: "Gestión de publicaciones", icon: "Share2" },
    ],
  },
  {
    id: "analitica",
    name: "Analítica",
    description: "Business intelligence y reportes",
    icon: "BarChart3",
    modules: [
      { id: "an-dashboards", name: "Dashboards", description: "Visualización de KPIs", icon: "LayoutDashboard" },
      { id: "an-reportes", name: "Reportes", description: "Informes personalizados", icon: "FileText" },
      { id: "an-datalake", name: "Data Lake", description: "Almacenamiento de datos masivos", icon: "Database" },
    ],
  },
  {
    id: "seguridad",
    name: "Seguridad",
    description: "Protección y cumplimiento",
    icon: "Shield",
    modules: [
      { id: "seg-iam", name: "IAM", description: "Gestión de identidades y accesos", icon: "KeyRound" },
      { id: "seg-audit", name: "Auditoría", description: "Logs y trazabilidad", icon: "ScrollText" },
      { id: "seg-waf", name: "WAF", description: "Firewall de aplicaciones", icon: "ShieldAlert" },
    ],
  },
  {
    id: "comunicacion",
    name: "Comunicación",
    description: "Colaboración y mensajería",
    icon: "MessageCircle",
    modules: [
      { id: "com-chat", name: "Chat", description: "Mensajería en tiempo real", icon: "MessageSquare" },
      { id: "com-video", name: "Videoconferencia", description: "Salas de reuniones virtuales", icon: "Video" },
      { id: "com-notif", name: "Notificaciones", description: "Alertas multicanal", icon: "Bell" },
    ],
  },
]
