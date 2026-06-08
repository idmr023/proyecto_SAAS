# MEMORIA CONTEXTUAL DEL PROYECTO: MULTISAAS ORCHESTRATOR

## Visión General del Sistema
Este proyecto es un Orquestador SaaS diseñado para micro y pequeñas empresas (Mypes). Su función principal es permitir que un administrador elija módulos de software (Inventarios, Ventas, Restaurantes) desde un panel en React y, mediante un motor backend, compile y despliegue instancias de software independientes ejecutadas en contenedores Docker de fondo.

## Stack Tecnológico Integrado
- **Frontend:** React (Vite) + Tailwind CSS + Shadcn/ui.
- **Backend API:** Node.js + TypeScript + Express.
- **ORM & Base de Datos Principal:** Prisma ORM conectado a Supabase (PostgreSQL).
- **Plataforma de Despliegue Main:** Ripnel.
- **Orquestación de Infraestructura:** Docker Daemon a nivel de servidor.

## Protocolo de Seguridad Requerido (Definition of Done - DoD)
Para que cualquier tarea se considere finalizada y aprobada, debe cumplir con las siguientes directrices establecidas por el equipo:
1. **Aislamiento Estricto:** Las bases de datos de cada cliente Mype deben estar completamente separadas de la base de datos principal del sistema de administración.
2. **Cero Credenciales Expuestas:** Queda estrictamente prohibido escribir contraseñas, tokens JWT o llaves de API en código duro. Todo debe consumirse desde variables de entorno (`process.env`). Los archivos `.env.example` solo deben contener las etiquetas de configuración vacías.
3. **Revisión y Optimización:** El código debe ser revisado por pares, optimizado en rendimiento y presentar un manejo de errores elegante mediante códigos de estado HTTP correctos (401 para credenciales inválidas, 403 para MFA fallido, 500 para errores del servidor).

## Medidas de Seguridad Implementadas
- **Helmet:** Middleware de seguridad HTTP (protege contra clickjacking, XSS, MIME sniffing, etc.).
- **Rate Limiting:** 10 intentos máximo por 15 minutos en `/api/auth/login`.
- **CORS Restringido:** Solo localhost:5173 en desarrollo, solo dominios `.ripnel.app` en producción.
- **JWT en Rutas Protegidas:** Todas las rutas `/api/orchestrator/*` requieren token Bearer JWT.
- **Auto-logout en 401:** Interceptor de Axios redirige a `/login` si el token expira o es inválido.
- **Zod Validation:** Todos los endpoints validan schemas de entrada.
- **Límite Payload JSON:** 1MB máximo en body de solicitudes Express.
- **Códigos HTTP Semánticos:** 400, 401, 403, 404, 409, 500 según el caso.

## Estructura de Endpoints de la API Core
- `POST /api/auth/login` -> Valida credenciales iniciales y dispara la generación del código OTP/MFA de 6 dígitos.
- `POST /api/auth/verify-mfa` -> Compara el código OTP ingresado, valida expiración y emite el token JWT de sesión.
- `POST /api/orchestrator/deploy` -> Recibe los parámetros de la Mype y los módulos seleccionados para iniciar el proceso de despliegue en Docker.
- `GET /api/orchestrator/status` -> Devuelve un mapa de salud de los contenedores activos (Mype Online / Offline) para alimentar los gráficos de pastel del dashboard del Frontend.
- `POST /api/orchestrator/stop/:id` -> Detiene el contenedor Docker de una empresa específica.
- `POST /api/orchestrator/start/:id` -> Inicia el contenedor Docker de una empresa detenida.
- `POST /api/orchestrator/restart/:id` -> Reinicia el contenedor Docker de una empresa.
- `GET /api/orchestrator/logs/:id` -> Obtiene los logs en tiempo real del contenedor de una empresa.

## Estructura del Proyecto
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
├── AGENTS.md                    # Este archivo — memoria maestra del proyecto
└── README.md
```

## Modelos de Base de Datos (Prisma)
- **Admin:** Administradores del sistema con email único y contraseña encriptada (bcrypt).
- **MypeEmpresa:** Empresas registradas, cada una vinculada a un Admin, con estado (activa/detenida/error).
- **ConfiguracionModulos:** Módulos seleccionados por empresa (inventarios, ventas, restaurantes, etc.).
- **ContenedorLog:** Historial de contenedores Docker por empresa (logs de despliegue, estado, puerto).

## Flujo de Autenticación
1. `POST /api/auth/login` — Valida email + contraseña contra bcrypt. Si ok, genera OTP de 6 dígitos y lo simula enviar por correo.
2. `POST /api/auth/verify-mfa` — Recibe el código OTP, valida expiración (5 min). Si ok, emite JWT firmado.
3. Todas las rutas `/api/orchestrator/*` están protegidas por `authMiddleware` que verifica el JWT en header `Authorization: Bearer <token>`.

## Convenciones de Código
- TypeScript estricto con imports ESM (usar `.js` extension en imports locales).
- Validación con Zod en todos los endpoints.
- Errores con códigos HTTP semánticos (400, 401, 403, 404, 409, 500).
- Variables de entorno siempre via `process.env` (backend) o `import.meta.env` (frontend), nunca hardcodeadas.
- Prisma Client singleton en `backend/src/config/database.ts`.
- Frontend usa Axios interceptor para adjuntar JWT automáticamente y manejar 401 global.