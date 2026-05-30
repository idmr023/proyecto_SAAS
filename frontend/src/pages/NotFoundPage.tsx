import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <FileQuestion className="h-20 w-20 text-muted-foreground" />
        <h1 className="text-4xl font-bold">{t("not_found.title")}</h1>
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
