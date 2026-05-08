import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "sonner"
import "./index.css"
import "./i18n"
import LoadingScreen from "@/components/shared/LoadingScreen"
import PwaRegister from "@/components/shared/PwaRegister"
import App from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<LoadingScreen message="Cargando aplicación..." />}>
      <App />
      <Toaster richColors position="top-right" closeButton />
      <PwaRegister />
    </Suspense>
  </StrictMode>,
)
