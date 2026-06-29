# Módulos MultiSaas

Cada módulo es un componente React reutilizable e independiente que se compone en una app SaaS al momento del despliegue.

## Módulos Disponibles

| Módulo | ID | Descripción |
|--------|----|-------------|
| Landing Page | `landing-page` | Página de aterrizaje con 4 secciones: Hero, Beneficios, Contacto, Footer |
| Navbar | `navbar` | Barra de navegación responsive con toggle de tema y menú móvil |
| Contact | `contact` | Página de contacto con formulario de envío |
| Login | `login` | Página de inicio de sesión con validación |

## Arquitectura

```
modules/
├── shared/          # Utilidades compartidas (cn, ReactNode)
├── landing-page/    # LandingPage + 4 secciones
├── navbar/          # NavbarModule
├── contact/         # ContactPage + ContactForm
└── login/           # LoginModule

templates/
└── base/            # Template Vite + React + Tailwind para ensamblar

scripts/
└── assemble.ts     # Script de ensamblaje (genera App.tsx dinámicamente)
```

## Flujo de Despliegue

1. Admin selecciona módulos en el dashboard
2. Backend recibe `POST /api/orchestrator/deploy` con los módulos
3. `dockerService.ts` ejecuta `assembleBuild()` que:
   - Copia la template base
   - Copia los módulos seleccionados
   - Genera `App.tsx` con las rutas y componentes
   - Crea `.env` con `VITE_API_URL` y `VITE_BRAND_NAME`
4. Docker construye la imagen con los módulos
5. Docker ejecuta el contenedor en el puerto asignado

## Agregar un Nuevo Módulo

1. Crear directorio en `modules/<nombre>/`
2. Crear `package.json` con `name: "@multisaas/<nombre>"`
3. Crear `src/index.ts` exportando el componente principal
4. Agregar el ID en `AVAILABLE_MODULES` en `dockerService.ts`
5. Actualizar `assemble.ts` para incluir las rutas del nuevo módulo