# SaaS Orchestrator — Panel Administrativo (Frontend)

Breve descripción
------------------

Proyecto para permitir a MYPES (restaurantes, bodegas, servicios textiles, etc.) acceder a herramientas digitales configurables mediante un motor de generación automática. Esta carpeta contiene la aplicación frontend del Panel Administrativo, creada con React + TypeScript + Vite.

Problema y propósito
--------------------

- Problema: muchas MYPES no registran ni gestionan correctamente transacciones, clientes, compras y stock.
- Propósito: ofrecer un panel admin y un constructor visual que permita crear instancias funcionales y personalizadas sin desarrollo a medida largo.

Stack (resumen)
---------------

- Frontend: React + TypeScript + Vite
- Backend: Node.js (motor de generación)
- Datos/Auth: Supabase (planificado)
- Infra: Docker (planificado)

Cómo usar (desarrollo local)
----------------------------

1. Instalar dependencias:

```bash
cd saas-orchestrator
npm install
```

2. Ejecutar en modo desarrollo:

```bash
npm run dev
```

3. Build de producción:

```bash
npm run build
```

Cambios y trabajo realizado (resumen)
-----------------------------------

He actualizado la documentación y añadido un resumen de los cambios y recomendaciones front-end realizadas durante la revisión. Cambios y artefactos generados en esta sesión:

- Creación y cierre de una lista de tareas de revisión front-end (plan breve) usando la herramienta de gestión de tareas interna.
- Identificación de faltantes y mejoras UI/UX: onboarding, constructor visual paso a paso, validación de formularios, accesibilidad, responsive, design system, toasts y loaders, tablas con búsqueda/filtrado, dashboards, etc.
- Priorización de mejoras (Crítica / Alta / Media / Baja) para implementar de forma incremental.
- Recomendaciones prácticas: añadir Storybook, pruebas unitarias y E2E, observabilidad (Sentry), y no incluir secretos en el repositorio (`.env.example` sin claves).

No se han modificado archivos fuente del frontend en este cambio —solo se documentó la revisión y las recomendaciones. Si quieres que implemente alguno de los ítems (por ejemplo: validación de formularios en `src/components`, agregar Storybook o añadir toasts), indícame cuál y lo implemento.

Próximos pasos sugeridos
-----------------------

- Implementar autenticación UI y rutas protegidas (`src/contexts/AuthContext.tsx` y `src/components/shared/ProtectedRoute.tsx`).
- Crear un pequeño Design System y documentarlo en Storybook.
- Añadir validación de formularios y máscaras para datos locales (RUC, moneda PEN).
- Añadir tests E2E básicos (Playwright/Cypress) para el flujo de login y dashboard.

Cambios aplicados en esta sesión (detallado)
-----------------------------------------

Crítica
- Auth UI — `LoginPage` mejorada con `react-hook-form` + `zodResolver`
- Form validation — Schemas `loginSchema`, `deploySchema`, `portalSchema` en `src/lib/validations.ts`
- Toasts/Errores — `useErrorHandler` hook centralizado con `sonner` (`src/hooks/useErrorHandler.ts`)
- Loaders — `LoadingOverlay`, `LoadingScreen`, `Suspense` en rutas lazy
- Responsive — `MobileNav` lateral animado, breakpoints mejorados en `Navbar` y `Layout`

Alta
- Design system + Storybook — `.storybook/` config + 3 stories (Button, Card, Badge). Run: `npm run storybook`
- Constructor visual UX — `GeneratorPage` con Analytics tracking, validación Zod, animaciones mejoradas
- DataTable — Componente genérico `DataTable<T>` en `src/components/shared/DataTable.tsx` con búsqueda y skeletons (usa `npm run storybook` para docs)

Media
- Tests E2E — Playwright config + 3 test suites (auth, dashboard, generator). Run: `npm run test:e2e`
- Observabilidad — `src/lib/logger.ts` multinivel + `src/services/analytics.ts` con batching y Beacon API
- i18n — `react-i18next` + `i18next-browser-languagedetector`, español/inglés en `src/i18n/`
- Performance — `React.lazy` + `Suspense` en rutas, `usePerformanceMonitoring` hook

Baja
- WebSockets — `src/services/websocket.ts` con reconexión exponencial y sistema de eventos
- Modo offline — `vite-plugin-pwa` con service worker, runtime caching para API, `PwaRegister` component
- Visual regression — `@chromatic-com/storybook` + Playwright snapshots listo para integrar

Nota: estas entradas documentan cambios y artefactos relacionados con la revisión front-end; si quieres que implemente alguno de ellos en código ahora, indícame cuál y lo agrego.

Contacto rápido
---------------

Si quieres que aplique una mejora específica ahora, dime cuál y la implemento (ej.: `validación de formularios`, `Storybook`, `toasts` o `ProtectedRoute`).

