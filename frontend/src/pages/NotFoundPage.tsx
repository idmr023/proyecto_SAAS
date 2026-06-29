import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-muted/40">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-sm border border-border bg-card">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight font-mono">{t("not_found.title")}</h1>
        <p className="text-muted-foreground max-w-sm">
          {t("not_found.description")}
        </p>
        <Button asChild>
          <Link to="/dashboard">{t("not_found.back")}</Link>
        </Button>
      </div>
    </div>
  )
}
