import { ArrowRight, Sparkles } from 'lucide-react'

interface HeroSectionProps {
  badge?: string
  title: string
  subtitle: string
  primaryCta?: string
  secondaryCta?: string
  onPrimaryCta?: () => void
  onSecondaryCta?: () => void
  stats?: { icon: ReactNode; value: string; label: string }[]
}

export default function HeroSection({
  badge,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  onPrimaryCta,
  onSecondaryCta,
  stats,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#0B1120] via-[#0F1F4A] to-[#0F2340] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.08),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 relative pt-32 pb-20 md:pt-40 md:pb-28 text-center">
        {badge && (
          <span className="inline-flex items-center mb-6 border border-blue-400/30 text-blue-300 bg-blue-500/10 px-4 py-1.5 text-xs font-medium rounded-full">
            <Sparkles className="w-3 h-3 mr-1.5" />
            {badge}
          </span>
        )}

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-5">
          <span className="bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-blue-200/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {primaryCta && (
            <button
              onClick={onPrimaryCta}
              className="bg-white text-[#0F1F4A] hover:bg-blue-50 shadow-xl hover:shadow-2xl text-base px-8 h-12 rounded-xl transition-all font-medium inline-flex items-center"
            >
              {primaryCta}
              <ArrowRight className="ml-2 h-4 w-4" />
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

        {stats && stats.length > 0 && (
          <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
            {stats.map((stat, i) => (
              <div key={i} className="bg-[#0B1120]/60 backdrop-blur-sm p-5 md:p-6 text-center">
                <div className="flex justify-center text-blue-400 mb-2">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-blue-300/80 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}