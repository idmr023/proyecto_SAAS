interface Benefit {
  icon: ReactNode
  title: string
  description: string
}

interface BenefitsSectionProps {
  badge?: string
  title: string
  subtitle?: string
  benefits: Benefit[]
}

export default function BenefitsSection({
  badge,
  title,
  subtitle,
  benefits,
}: BenefitsSectionProps) {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 lg:px-6 py-20 md:py-28">
      <div className="text-center mb-14">
        {badge && (
          <span className="inline-block mb-3 bg-muted text-muted-foreground px-3 py-1 text-xs font-medium rounded-full">
            {badge}
          </span>
        )}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{subtitle}</p>
        )}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, i) => (
          <div
            key={i}
            className="group bg-card rounded-xl p-6 border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
              <div className="text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300">
                {benefit.icon}
              </div>
            </div>
            <h3 className="font-semibold text-foreground mb-1.5">{benefit.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}