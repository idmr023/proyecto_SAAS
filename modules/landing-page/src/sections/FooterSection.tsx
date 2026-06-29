interface FooterSectionProps {
  brandName: string
  brandIcon?: ReactNode
  description: string
  columns?: {
    title: string
    links: { label: string; href?: string; onClick?: () => void }[]
  }[]
  copyright?: string
  onToggleTheme?: () => void
  themeLabel?: string
}

export default function FooterSection({
  brandName,
  brandIcon,
  description,
  columns = [],
  copyright,
  onToggleTheme,
  themeLabel,
}: FooterSectionProps) {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-semibold mb-3">
              {brandIcon && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                  {brandIcon}
                </div>
              )}
              <span>{brandName}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {description}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.onClick ? (
                      <button
                        onClick={link.onClick}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <span className="text-sm text-muted-foreground cursor-default">
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {copyright || `© ${new Date().getFullYear()} ${brandName}. Todos los derechos reservados.`}
          </p>
          {onToggleTheme && themeLabel && (
            <button
              onClick={onToggleTheme}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {themeLabel}
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}