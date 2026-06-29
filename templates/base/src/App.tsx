import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { NavbarModule } from '@multisaas/navbar/src'
import { LandingPage } from '@multisaas/landing-page/src'
import { HeroSection } from '@multisaas/landing-page/src/sections/HeroSection'
import { BenefitsSection } from '@multisaas/landing-page/src/sections/BenefitsSection'
import { ContactSection } from '@multisaas/landing-page/src/sections/ContactSection'
import { FooterSection } from '@multisaas/landing-page/src/sections/FooterSection'
import { ContactPage } from '@multisaas/contact/src'
import { LoginModule } from '@multisaas/login/src'
import { Container, Zap, BarChart3, Shield, HeadphonesIcon } from 'lucide-react'

const BRAND_NAME = 'MultiSaas'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleContactSubmit = async (data: { name: string; email: string; message: string }) => {
    await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  const handleLogin = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      return { success: false, error: data.error || 'Credenciales inválidas' }
    }
    const data = await res.json()
    localStorage.setItem('token', data.token)
    return { success: true }
  }

  const navLinks = [
    { label: 'Inicio', to: '/' },
    { label: 'Contacto', to: '/contacto' },
  ]

  const benefits = [
    { icon: <Zap className="h-5 w-5" />, title: 'Rápido', description: 'Despliegue en minutos, sin configuración manual.' },
    { icon: <BarChart3 className="h-5 w-5" />, title: 'Escalable', description: 'Crece con tu negocio sin límites.' },
    { icon: <Shield className="h-5 w-5" />, title: 'Seguro', description: 'Datos protegidos y aislados por empresa.' },
    { icon: <HeadphonesIcon className="h-5 w-5" />, title: 'Soporte', description: 'Asistencia dedicada para tu negocio.' },
  ]

  return (
    <BrowserRouter>
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <NavbarModule
                    brandName={BRAND_NAME}
                    brandIcon={<Container className="h-4 w-4" />}
                    links={navLinks}
                    showThemeToggle
                    isDark={darkMode}
                    onToggleTheme={toggleTheme}
                    actionButton={{ label: 'Iniciar sesión', to: '/login' }}
                  />
                  <LandingPage
                    sections={[
                      <HeroSection
                        key="hero"
                        badge="Sistema a tu medida"
                        title="El software que tu negocio merece"
                        subtitle="Cuéntanos qué necesita tu empresa y construimos una solución personalizada para ti."
                        primaryCta="Comenzar ahora"
                        secondaryCta="Saber más"
                        onSecondaryCta={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                      />,
                      <BenefitsSection
                        key="benefits"
                        title="¿Por qué elegirnos?"
                        subtitle="Ventajas que hacen la diferencia para tu negocio."
                        benefits={benefits}
                      />,
                      <ContactSection
                        key="contact"
                        badge="Comienza hoy"
                        title="¿Listo para digitalizar tu negocio?"
                        subtitle="Únete a las empresas que ya confían en nosotros."
                        primaryCta="Comenzar ahora"
                      />,
                      <FooterSection
                        key="footer"
                        brandName={BRAND_NAME}
                        brandIcon={<Container className="h-4 w-4" />}
                        description="Plataforma SaaS para micro y pequeñas empresas."
                        columns={[
                          { title: 'Producto', links: [{ label: 'Características' }, { label: 'Proyectos' }] },
                          { title: 'Empresa', links: [{ label: 'Nosotros' }, { label: 'Contacto' }] },
                        ]}
                        onToggleTheme={toggleTheme}
                        themeLabel={darkMode ? 'Modo claro' : 'Modo oscuro'}
                      />,
                    ]}
                  />
                </>
              }
            />
            <Route
              path="/contacto"
              element={
                <>
                  <NavbarModule
                    brandName={BRAND_NAME}
                    brandIcon={<Container className="h-4 w-4" />}
                    links={navLinks}
                    showThemeToggle
                    isDark={darkMode}
                    onToggleTheme={toggleTheme}
                  />
                  <ContactPage
                    title="Contáctanos"
                    subtitle="Cuéntanos sobre tu proyecto y te asesoramos sin compromiso."
                    onSubmit={handleContactSubmit}
                  />
                </>
              }
            />
            <Route path="/login" element={<LoginModule onLogin={handleLogin} showSignUp={false} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}