# SaaS Orchestrator

> Panel Administrativo para digitalización de MYPES — *Actualizado: 30 de mayo de 2026*

---

## ¿Qué es este proyecto?

**SaaS Orchestrator** es una plataforma SaaS diseñada para que las **MYPES** (restaurantes, bodegas, servicios textiles, etc.) puedan acceder a herramientas digitales de gestión sin necesidad de desarrollo a medida.

El proyecto cuenta con un **motor de generación automática** que crea instancias personalizadas del panel según el tipo de negocio, permitiendo:

- Registro y gestión de **transacciones**
- Control de **clientes**
- Gestión de **compras y stock**
- Dashboards y reportes

---

## El Problema que Resolvemos

Muchas MYPES en Perú:

- No registran ni gestionan correctamente sus transacciones
- No tienen control de inventario o clientes
- No pueden acceder a herramientas digitales por costos o complejidad
- Dependen de procesos manuales propensos a errores

**Nuestra solución:** Un panel admin configurable + un constructor visual que genera instancias funcionales y personalizadas sin desarrollo largo ni costoso.

---

## Stack Tecnológico

### Frontend

| Tecnología | Propósito |
|---|---|
| **React 19** | Framework UI principal |
| **TypeScript** | Tipado estático |
| **Vite** | Bundler y dev server |
| **Tailwind CSS 4** | Estilos utilitarios |
| **Radix UI** | Componentes accesibles (dialog, select, toast, etc.) |
| **Framer Motion** | Animaciones |
| **React Router 7** | Enrutamiento |
| **React Hook Form + Zod** | Formularios con validación |
| **Supabase** | Auth y base de datos |
| **Axios** | Cliente HTTP con interceptor JWT |
| **i18next** | Internacionalización (ES/EN) |
| **Lucide React** | Iconos |
| **Sonner** | Notificaciones/toasts |

### Backend

| Tecnología | Propósito |
|---|---|
| **Node.js + TypeScript** | Motor API REST |
| **Express** | Framework HTTP |
| **Prisma ORM** | Modelado y conexión a base de datos |
| **PostgreSQL (Supabase)** | Base de datos principal |
| **JWT + bcrypt** | Autenticación segura |
| **Helmet** | Seguridad HTTP (anti-clickjacking, XSS) |
| **express-rate-limit** | Protección contra fuerza bruta |
| **Zod** | Validación de schemas en endpoints |
| **Docker CLI** | Orquestación de contenedores |

### Herramientas de Desarrollo

| Herramienta | Propósito |
|---|---|
| **Storybook** | Documentación y desarrollo de componentes UI |
| **Playwright** | Tests E2E |
| **ESLint** | Linting y calidad de código |
| **PWA Plugin** | Soporte offline / instalable |

---

## Arquitectura del Proyecto

```
saas-orchestrator/
├── frontend/                    # Aplicación React (Vite + Tailwind + Shadcn)
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── contexts/           # Contextos de React (AuthContext)
│   │   ├── pages/              # Páginas de la aplicación
│   │   ├── i18n/               # Traducciones español/inglés
│   │   ├── lib/                # Configuración Axios, API calls
│   │   └── types/              # Interfaces de TypeScript
│   ├── .storybook/             # Configuración Storybook v10
│   ├── public/                 # Assets estáticos
│   ├── e2e/                    # Tests Playwright
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
├── backend/                     # API REST (Node.js + Express + TypeScript)
│   ├── prisma/
│   │   └── schema.prisma       # Esquema de base de datos
│   ├── src/
│   │   ├── config/             # Configuración (env, database)
│   │   ├── controllers/        # Controladores de rutas
│   │   ├── middleware/         # Middleware de autenticación
│   │   ├── routes/             # Definición de rutas Express
│   │   ├── services/           # Lógica de negocio (OTP, Docker)
│   │   └── types/              # Tipos compartidos
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── AGENTS.md                    # Memoria maestra del proyecto
└── README.md
```

---

## Seguridad Implementada

| Medida | Descripción |
|---|---|
| **Helmet** | Protege contra clickjacking, XSS, MIME sniffing |
| **Rate Limiting** | 10 intentos máximo por 15 min en `/api/auth/login` |
| **CORS Restringido** | Solo localhost:5173 en dev, solo `.ripnel.app` en prod |
| **JWT en Rutas Protegidas** | Todas las rutas `/api/orchestrator/*` requieren Bearer token |
| **Auto-logout en 401** | Interceptor de Axios redirige a `/login` si token expira |
| **Validación Zod** | Todos los endpoints validan schemas de entrada |
| **Códigos HTTP Semánticos** | 400, 401, 403, 404, 409, 500 según el caso |
| **Límite Payload** | 1MB máximo en body de solicitudes Express |

---

## API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Validar credenciales y generar OTP |
| POST | `/api/auth/verify-mfa` | Validar código OTP y emitir JWT |
| POST | `/api/orchestrator/deploy` | Desplegar nueva empresa en Docker |
| GET | `/api/orchestrator/status` | Estado de todas las empresas |
| POST | `/api/orchestrator/stop/:id` | Detener contenedor de empresa |
| POST | `/api/orchestrator/start/:id` | Iniciar contenedor de empresa |
| POST | `/api/orchestrator/restart/:id` | Reiniciar contenedor de empresa |
| GET | `/api/orchestrator/logs/:id` | Obtener logs del contenedor |
| GET | `/api/health` | Health check del servidor |

---

## Funcionalidades Implementadas

### Frontend
- [x] **Autenticación 2-step** — Login con email/password + MFA (OTP 6 dígitos)
- [x] **Dashboard** — KPI cards, gráfico PieChart (Recharts), mapa regional SVG
- [x] **Constructor visual** — Stepper 3 pasos con selección de módulos y deploy simulado
- [x] **Sala de monitoreo** — Grid de empresas con ping, acciones (stop/start/restart) y logs
- [x] **Design System + Storybook** — Componentes documentados (Button, Card, Badge)
- [x] **Internacionalización** — Soporte español/inglés
- [x] **Validación con Zod** — Schemas para formularios
- [x] **Responsive** — MobileNav animado, breakpoints mejorados
- [x] **Modo demo** — Funciona sin Supabase ni backend

### Backend
- [x] **API REST completa** — 9 endpoints con Express + TypeScript
- [x] **Autenticación segura** — bcrypt + JWT + OTP con expiración
- [x] **Prisma ORM** — 4 modelos (Admin, MypeEmpresa, ConfiguracionModulos, ContenedorLog)
- [x] **Orquestación Docker** — Deploy, stop, start, restart, logs via Docker CLI
- [x] **Seguridad** — Helmet, rate limiting, CORS, Zod, límite payload

### En Progreso
- [ ] Conectar páginas a API real (actualmente usan datos mock)
- [ ] Seed de base de datos para pruebas
- [ ] Webhooks / WebSockets para logs en tiempo real
- [ ] Tests E2E completos

---

## Cómo Empezar

### Requisitos

- **Node.js** >= 20
- **npm** >= 10
- **Docker** (para orquestación de contenedores)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd saas-orchestrator

# 2. Instalar dependencias del frontend
cd frontend
npm install
cp .env.example .env

# 3. Instalar dependencias del backend
cd ../backend
npm install
cp .env.example .env
# Editar .env con credenciales reales de Supabase y JWT_SECRET

# 4. Generar Prisma Client
npx prisma generate
```

### Scripts Disponibles

#### Frontend (desde `frontend/`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Ejecutar linter |
| `npm run storybook` | Iniciar Storybook (localhost:6006) |
| `npm run test:e2e` | Ejecutar tests E2E |

#### Backend (desde `backend/`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Iniciar servidor con hot-reload |
| `npm run build` | Compilar TypeScript a JS |
| `npm start` | Iniciar servidor en producción |
| `npm run prisma:push` | Sincronizar schema con base de datos |
| `npm run prisma:studio` | Abrir Prisma Studio (GUI de BD) |

---

## Convenciones de Desarrollo

### Git Flow

- **main** — Código estable en producción
- **develop** — Rama de integración
- **feature/nombre** — Ramas para nuevas funcionalidades
- **fix/nombre** — Ramas para correcciones

### Commits

Usar commits semánticos:

```
feat: agregar validación de RUC en formularios
fix: corregir responsive en Navbar
docs: actualizar README con instrucciones
style: ajustar colores del design system
test: agregar tests E2E para login
```

### Pull Requests

- Todo PR debe apuntar a `develop`
- Requiere al menos **1 review** antes de merge
- Debe pasar **lint** y **build** antes de revisar
- Incluir screenshots o videos si hay cambios UI

---

## Roadmap

### Fase 1 — Base (completada)
- [x] Setup del proyecto con Vite + React + TypeScript
- [x] Design System básico con Storybook
- [x] Autenticación UI con MFA simulado
- [x] Constructor visual (GeneratorPage)
- [x] Dashboard con gráficos Recharts
- [x] Sala de monitoreo de empresas

### Fase 2 — Backend (completada)
- [x] API REST con Node.js + Express + TypeScript
- [x] Autenticación real con JWT + bcrypt + OTP
- [x] Prisma ORM con modelos Admin, Empresa, Módulos, Logs
- [x] Orquestación Docker CLI
- [x] Seguridad: Helmet, rate limit, CORS, Zod

### Fase 3 — Integración
- [ ] Conectar frontend a API real (reemplazar datos mock)
- [ ] Seed de base de datos para desarrollo
- [ ] WebSockets para logs en tiempo real
- [ ] Tests E2E para flujo completo

### Fase 4 — Producción
- [ ] Deploy a Ripnel
- [ ] Monitoreo y observabilidad (Sentry)
- [ ] PWA funcional con modo offline
- [ ] Documentación para usuarios finales

---

## Cómo Contribuir

1. **Revisa los issues** abiertos antes de empezar algo nuevo
2. **Crea una rama** siguiendo la convención `feature/nombre` o `fix/nombre`
3. **Desarrolla** siguiendo las convenciones del proyecto
4. **Escribe tests** si es aplicable
5. **Abre un PR** con descripción clara de los cambios

### Reglas

- No pushear directamente a `main` o `develop`
- No incluir secretos o credenciales en el código
- Usar `.env` para variables locales (ya está en `.gitignore`)
- Mantener los componentes documentados en Storybook

---

## Recursos Útiles

- **Documentación de React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Radix UI**: https://www.radix-ui.com
- **Supabase**: https://supabase.com/docs
- **Prisma**: https://prisma.io/docs
- **Zod**: https://zod.dev

---

## Equipo

| Rol | Responsabilidad |
|---|---|
| Frontend | React, UI/UX, componentes |
| Backend | Motor de generación, API, seguridad |
| DevOps | Docker, deploy, CI/CD |
| QA | Tests, validación |

---

> *"Digitalizar MYPES es democratizar la tecnología"*
