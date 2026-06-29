import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react'
import ContactForm from './ContactForm'

interface ContactInfo {
  icon: ReactNode
  label: string
  value: string
}

interface ContactPageProps {
  title: string
  subtitle: string
  info?: ContactInfo[]
  onSubmit: (data: { name: string; email: string; message: string }) => Promise<void> | void
}

export default function ContactPage({
  title,
  subtitle,
  info = [],
  onSubmit,
}: ContactPageProps) {
  const defaultInfo: ContactInfo[] = info.length > 0 ? info : [
    { icon: <Mail className="h-5 w-5" />, label: 'Correo', value: 'contacto@multisaas.com' },
    { icon: <Phone className="h-5 w-5" />, label: 'Teléfono', value: '+51 999 888 777' },
    { icon: <MapPin className="h-5 w-5" />, label: 'Dirección', value: 'Lima, Perú' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-20 md:py-28">
        <div className="text-center mb-14">
          <span className="inline-block mb-3 bg-muted text-muted-foreground px-3 py-1 text-xs font-medium rounded-full">
            Contacto
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{title}</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            {defaultInfo.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-card rounded-xl border p-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-3">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <ContactForm onSubmit={onSubmit} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}