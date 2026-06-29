import { readdir, cpSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs'
import { join, resolve } from 'path'
import { execSync } from 'child_process'

const MODULES_DIR = resolve(__dirname, '..', 'modules')
const TEMPLATES_DIR = resolve(__dirname, '..', 'templates', 'base')
const OUTPUT_DIR = resolve(__dirname, '..', 'builds')

const AVAILABLE_MODULES = ['landing-page', 'navbar', 'contact', 'login']

interface AssembleOptions {
  empresaId: string
  subdominio: string
  modulos: string[]
  brandName?: string
  apiUrl?: string
}

function validateModules(modulos: string[]): void {
  for (const m of modulos) {
    if (!AVAILABLE_MODULES.includes(m)) {
      throw new Error(`Módulo "${m}" no disponible. Módulos disponibles: ${AVAILABLE_MODULES.join(', ')}`)
    }
  }
}

function assembleApp(options: AssembleOptions): string {
  const { empresaId, subdominio, modulos, brandName = 'MultiSaas', apiUrl = 'http://localhost:8080' } = options

  validateModules(modulos)

  const buildDir = join(OUTPUT_DIR, subdominio)

  if (existsSync(buildDir)) {
    execSync(`rm -rf "${buildDir}"`)
  }

  mkdirSync(buildDir, { recursive: true })

  cpSync(TEMPLATES_DIR, buildDir, { recursive: true })

  const modulesBuildDir = join(buildDir, 'modules')
  mkdirSync(modulesBuildDir, { recursive: true })

  for (const mod of modulos) {
    const modSource = join(MODULES_DIR, mod)
    const modDest = join(modulesBuildDir, mod)
    cpSync(modSource, modDest, { recursive: true })
  }

  const appTsx = generateAppTsx(modulos, brandName, apiUrl)
  writeFileSync(join(buildDir, 'src', 'App.tsx'), appTsx, 'utf-8')

  writeFileSync(join(buildDir, '.env'), `VITE_API_URL=${apiUrl}\nVITE_BRAND_NAME=${brandName}\n`, 'utf-8')

  const pkgJson = JSON.parse(readFileSync(join(buildDir, 'package.json'), 'utf-8'))
  pkgJson.name = `mype-${subdominio}`
  writeFileSync(join(buildDir, 'package.json'), JSON.stringify(pkgJson, null, 2), 'utf-8')

  return buildDir
}

function generateAppTsx(modulos: string[], brandName: string, apiUrl: string): string {
  const imports: string[] = [
    `import { useState } from 'react'`,
    `import { BrowserRouter, Routes, Route } from 'react-router-dom'`,
  ]

  const hasNavbar = modulos.includes('navbar')
  const hasLanding = modulos.includes('landing-page')
  const hasContact = modulos.includes('contact')
  const hasLogin = modulos.includes('login')

  const heroIconImports = ['Container']
  const benefitIconImports = ['Zap', 'BarChart3', 'Shield', 'HeadphonesIcon']

  if (hasNavbar) {
    imports.push(`import { NavbarModule } from '../modules/navbar/src'`)
    imports.push(`import { Container } from 'lucide-react'`)
  }

  if (hasLanding) {
    imports.push(`import { LandingPage } from '../modules/landing-page/src'`)
    imports.push(`import { HeroSection } from '../modules/landing-page/src/sections/HeroSection'`)
    imports.push(`import { BenefitsSection } from '../modules/landing-page/src/sections/BenefitsSection'`)
    imports.push(`import { ContactSection } from '../modules/landing-page/src/sections/ContactSection'`)
    imports.push(`import { FooterSection } from '../modules/landing-page/src/sections/FooterSection'`)
    if (!hasNavbar) {
      imports.push(`import { Container } from 'lucide-react'`)
    }
    imports.push(`import { Zap, BarChart3, Shield, HeadphonesIcon } from 'lucide-react'`)
  }

  if (hasContact) {
    imports.push(`import { ContactPage } from '../modules/contact/src'`)
  }

  if (hasLogin) {
    imports.push(`import { LoginModule } from '../modules/login/src'`)
  }

  const navLinks: string[] = []
  if (hasLanding) navLinks.push(`{ label: 'Inicio', to: '/' }`)
  if (hasContact) navLinks.push(`{ label: 'Contacto', to: '/contacto' }`)

  const landingSections: string[] = []
  if (hasLanding) {
    landingSections.push(`<HeroSection
          key="hero"
          badge="Sistema a tu medida"
          title="El software que tu negocio merece"
          subtitle="Cuéntanos qué necesita tu empresa y construimos una solución personalizada para ti."
          primaryCta="Comenzar ahora"
          secondaryCta="Saber más"
          onSecondaryCta={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        />`)
    landingSections.push(`<BenefitsSection
          key="benefits"
          title="¿Por qué elegirnos?"
          subtitle="Ventajas que hacen la diferencia para tu negocio."
          benefits={[
            { icon: <Zap className="h-5 w-5" />, title: 'Rápido', description: 'Despliegue en minutos, sin configuración manual.' },
            { icon: <BarChart3 className="h-5 w-5" />, title: 'Escalable', description: 'Crece con tu negocio sin límites.' },
            { icon: <Shield className="h-5 w-5" />, title: 'Seguro', description: 'Datos protegidos y aislados por empresa.' },
            { icon: <HeadphonesIcon className="h-5 w-5" />, title: 'Soporte', description: 'Asistencia dedicada para tu negocio.' },
          ]}
        />`)
    landingSections.push(`<ContactSection
          key="contact"
          badge="Comienza hoy"
          title="¿Listo para digitalizar tu negocio?"
          subtitle="Únete a las empresas que ya confían en nosotros."
          primaryCta="Comenzar ahora"
        />`)
    landingSections.push(`<FooterSection
          key="footer"
          brandName="${brandName}"
          brandIcon={<Container className="h-4 w-4" />}
          description="Plataforma SaaS para micro y pequeñas empresas."
          columns={[
            { title: 'Producto', links: [{ label: 'Características' }, { label: 'Proyectos' }] },
            { title: 'Empresa', links: [{ label: 'Nosotros' }, { label: 'Contacto' }] },
          ]}
          onToggleTheme={toggleTheme}
          themeLabel={darkMode ? 'Modo claro' : 'Modo oscuro'}
        />`)
  }

  let routes = ''

  if (hasLanding) {
    routes += `
            <Route
              path="/"
              element={
                <>
                  ${hasNavbar ? `<NavbarModule
                    brandName="${brandName}"
                    brandIcon={<Container className="h-4 w-4" />}
                    links={[${navLinks.join(', ')}]}
                    showThemeToggle
                    isDark={darkMode}
                    onToggleTheme={toggleTheme}
                    ${hasLogin ? `actionButton={{ label: 'Iniciar sesión', to: '/login' }}` : ''}
                  />` : ''}
                  <LandingPage sections={[${landingSections.join(', ')}]} />
                </>
              }
            />`
  }

  if (hasContact) {
    routes += `
            <Route
              path="/contacto"
              element={
                <>
                  ${hasNavbar ? `<NavbarModule
                    brandName="${brandName}"
                    brandIcon={<Container className="h-4 w-4" />}
                    links={[${navLinks.join(', ')}]}
                    showThemeToggle
                    isDark={darkMode}
                    onToggleTheme={toggleTheme}
                  />` : ''}
                  <ContactPage
                    title="Contáctanos"
                    subtitle="Cuéntanos sobre tu proyecto y te asesoramos sin compromiso."
                    onSubmit={handleContactSubmit}
                  />
                </>
              }
            />`
  }

  if (hasLogin) {
    routes += `
            <Route path="/login" element={<LoginModule onLogin={handleLogin} showSignUp={false} />} />`
  }

  return `${imports.join('\n')}

const BRAND_NAME = '${brandName}'
const API_URL = import.meta.env.VITE_API_URL || '${apiUrl}'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  ${hasContact ? `const handleContactSubmit = async (data: { name: string; email: string; message: string }) => {
    await fetch(\`\${API_URL}/api/contact\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }` : ''}

  ${hasLogin ? `const handleLogin = async (email: string, password: string) => {
    const res = await fetch(\`\${API_URL}/api/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      return { success: false, error: data.error || 'Credenciales inválidas' }
    }
    return { success: true }
  }` : ''}

  return (
    <BrowserRouter>
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>${routes}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
`
}

export { assembleApp, validateModules, AVAILABLE_MODULES }