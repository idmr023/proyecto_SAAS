interface ContactSectionProps {
  badge?: string
  title: string
  subtitle: string
  primaryCta?: string
  secondaryCta?: string
  onPrimaryCta?: () => void
  onSecondaryCta?: () => void
}

export default function ContactSection({
  badge,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  onPrimaryCta,
  onSecondaryCta,
}: ContactSectionProps) {
  return (
    <section id="contact" className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0F1F4A] to-[#0F2340]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_60%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 lg:px-6 relative text-center">
        {badge && (
          <span className="inline-flex items-center mb-4 border border-blue-400/30 text-blue-300 bg-blue-500/10 px-4 py-1.5 text-xs font-medium rounded-full">
            {badge}
          </span>
        )}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          {title}
        </h2>
        <p className="text-lg text-blue-200/80 max-w-xl mx-auto mb-8">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {primaryCta && (
            <button
              onClick={onPrimaryCta}
              className="bg-white text-[#0F1F4A] hover:bg-blue-50 shadow-xl hover:shadow-2xl text-base px-8 h-12 rounded-xl transition-all font-medium"
            >
              {primaryCta}
            </button>
          )}
          {secondaryCta && (
            <button
              onClick={onSecondaryCta}
              className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 text-base px-8 h-12 rounded-xl shadow-lg transition-all font-medium"
            >
              {secondaryCta}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}