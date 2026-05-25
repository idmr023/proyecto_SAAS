import { logger } from "@/lib/logger"

type EventName =
  | "page_view"
  | "login"
  | "logout"
  | "deploy_start"
  | "deploy_success"
  | "deploy_error"
  | "portal_delete"
  | "search"
  | "theme_toggle"
  | "error"

interface AnalyticsEvent {
  name: EventName
  properties?: Record<string, string | number | boolean>
}

class AnalyticsService {
  private enabled = import.meta.env.VITE_ANALYTICS_ENABLED === "true"
  private queue: AnalyticsEvent[] = []
  private flushing = false

  track(name: EventName, properties?: Record<string, string | number | boolean>) {
    const event: AnalyticsEvent = { name, properties }
    logger.debug(`Analytics: ${name}`, properties as Record<string, string>)
    this.queue.push(event)
    this.flush()
  }

  private async flush() {
    if (this.flushing || !this.enabled || this.queue.length === 0) return
    this.flushing = true
    const batch = this.queue.splice(0)
    try {
      const url = import.meta.env.VITE_ANALYTICS_URL ?? "/api/analytics"
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      })
    } catch {
      this.queue.unshift(...batch)
    } finally {
      this.flushing = false
    }
  }
}

export const analytics = new AnalyticsService()
