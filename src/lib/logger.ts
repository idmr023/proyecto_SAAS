type LogLevel = "info" | "warn" | "error" | "debug"

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const CURRENT_LEVEL: LogLevel =
  (import.meta.env.VITE_LOG_LEVEL as LogLevel) ?? "info"

interface LogPayload {
  message: string
  level: LogLevel
  source?: string
  [key: string]: unknown
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL]
}

function sendToAnalytics(payload: LogPayload) {
  if (import.meta.env.PROD && import.meta.env.VITE_ANALYTICS_ENABLED === "true") {
    try {
      const body = JSON.stringify(payload)
      if (navigator.sendBeacon) {
        const url = import.meta.env.VITE_ANALYTICS_URL ?? "/api/logs"
        navigator.sendBeacon(url, body)
      }
    } catch {
      // silent fail for analytics
    }
  }
}

function formatMessage(payload: LogPayload): string {
  const parts = [`[${payload.level.toUpperCase()}]`, payload.message]
  if (payload.source) parts.unshift(`[${payload.source}]`)
  return parts.join(" ")
}

export const logger = {
  info(message: string, meta?: Partial<LogPayload>) {
    if (!shouldLog("info")) return
    const payload: LogPayload = { message, level: "info", ...meta }
    console.info(formatMessage(payload))
    sendToAnalytics(payload)
  },

  warn(message: string, meta?: Partial<LogPayload>) {
    if (!shouldLog("warn")) return
    const payload: LogPayload = { message, level: "warn", ...meta }
    console.warn(formatMessage(payload))
    sendToAnalytics(payload)
  },

  error(message: string, meta?: Partial<LogPayload>) {
    if (!shouldLog("error")) return
    const payload: LogPayload = { message, level: "error", ...meta }
    console.error(formatMessage(payload))
    sendToAnalytics(payload)
  },

  debug(message: string, meta?: Partial<LogPayload>) {
    if (!shouldLog("debug")) return
    const payload: LogPayload = { message, level: "debug", ...meta }
    console.debug(formatMessage(payload))
  },
}
