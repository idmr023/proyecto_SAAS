import { useEffect } from "react"
import { logger } from "@/lib/logger"

export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    if (!import.meta.env.DEV) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "measure" && entry.name === componentName) {
          logger.debug(`[Perf] ${componentName} montado en ${Math.round(entry.duration)}ms`)
        }
      }
    })

    observer.observe({ entryTypes: ["measure"] })

    performance.mark(`${componentName}-start`)

    return () => {
      performance.mark(`${componentName}-end`)
      performance.measure(componentName, `${componentName}-start`, `${componentName}-end`)
      observer.disconnect()
    }
  }, [componentName])
}
