# SaaS Orchestrator

> Panel Administrativo para digitalización de MYPES

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

### Frontend (este repositorio)

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
| **Axios** | Cliente HTTP |
| **i18next** | Internacionalización (ES/EN) |
| **Lucide React** | Iconos |
| **Sonner** | Notificaciones/toasts |

### Herramientas de Desarrollo

| Herramienta | Propósito |
|---|---|
| **Storybook** | Documentación y desarrollo de componentes UI |
| **Playwright** | Tests E2E |
| **ESLint** | Linting y calidad de código |
| **PWA Plugin** | Soporte offline / instalable |

### Backend e Infraestructura (planificado)

- **Node.js** — Motor de generación de instancias
- **Supabase** — Auth, base de datos, storage
- **Docker** — Containerización y despliegue

---

## Arquitectura del Proyecto

```
saas-orchestrator/
├── src/
│   ├── components/
│   │   ├── shared/      # Componentes reutilizables (Navbar, DataTable, Loaders...)
│   │   └── ui/          # Componentes base del Design System (Button, Card, Input...)
│   ├── contexts/        # Contextos globales (Auth, Theme)
│   ├── hooks/           # Hooks personalizados (ErrorHandler, Performance, Network)
│   ├── i18n/            # Traducciones (es.json, en.json)
│   ├── lib/             # Utilidades (API, validaciones, logger, config)
│   ├── pages/           # Páginas de la app (Login, Dashboard, Generator)
│   ├── services/        # Servicios externos (Analytics, WebSocket)
│   ├── stories/         # Stories de Storybook
│   ├── types/           # Tipos TypeScript
│   ├── App.tsx          # Configuración de rutas
│   └── main.tsx         # Entry point
├── e2e/                 # Tests E2E con Playwright
├── .storybook/          # Configuración de Storybook
└── public/              # Assets estáticos
```

---

## Funcionalidades Implementadas

### Críticas
- [x] **Autenticación UI** — LoginPage con validación de formularios
- [x] **Validación con Zod** — Schemas para login, deploy y portal
- [x] **Manejo de errores** — Hook centralizado con toasts (sonner)
- [x] **Loaders** — LoadingOverlay, LoadingScreen, Suspense en rutas lazy
- [x] **Responsive** — MobileNav animado, breakpoints mejorados

### Alta Prioridad
- [x] **Design System + Storybook** — Componentes documentados (Button, Card, Badge)
- [x] **Constructor visual** — GeneratorPage con analytics y validación
- [x] **DataTable genérico** — Búsqueda, filtrado y skeletons

### Media Prioridad
- [x] **Tests E2E** — Playwright configurado con suites de prueba
- [x] **Observabilidad** — Logger multinivel + Analytics con batching
- [x] **Internacionalización** — Soporte español/inglés
- [x] **Performance** — Lazy loading + Suspense en rutas

### Baja Prioridad (en progreso)
- [ ] **WebSockets** — Reconexión exponencial y sistema de eventos
- [ ] **Modo offline** — PWA con service worker
- [ ] **Visual regression** — Chromatic + Playwright snapshots

---

## Cómo Empezar

### Requisitos

- **Node.js** >= 20
- **npm** >= 10

### Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd saas-orchestrator

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales reales de Supabase y API
```

### Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Ejecutar linter |
| `npm run storybook` | Iniciar Storybook (localhost:6006) |
| `npm run test:e2e` | Ejecutar tests E2E |
| `npm run test:e2e:ui` | Tests E2E con interfaz visual |

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

### Fase 1 — Base (actual)
- [x] Setup del proyecto con Vite + React + TypeScript
- [x] Design System básico con Storybook
- [x] Autenticación UI
- [x] Constructor visual (GeneratorPage)
- [x] DataTable genérico

### Fase 2 — Consolidación
- [ ] Auth funcional con Supabase
- [ ] Rutas protegidas implementadas
- [ ] Dashboard con métricas reales
- [ ] Formularios con validación completa (RUC, moneda PEN)
- [ ] Tests E2E para flujos principales

### Fase 3 — Backend
- [ ] Motor de generación en Node.js
- [ ] API REST para gestión de instancias
- [ ] Integración completa con Supabase
- [ ] Dockerización del proyecto

### Fase 4 — Producción
- [ ] Deploy a producción
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
- **Zod**: https://zod.dev

---

## Equipo

| Rol | Responsabilidad |
|---|---|
| Frontend | React, UI/UX, componentes |
| Backend | Motor de generación, API |
| DevOps | Docker, deploy, CI/CD |
| QA | Tests, validación |

---

## Contacto

Para dudas, sugerencias o para asignarte una tarea, contactar al equipo por Discord.

---

> *"Digitalizar MYPES es democratizar la tecnología"*
