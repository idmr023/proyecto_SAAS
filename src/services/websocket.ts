import { logger } from "@/lib/logger"

type EventHandler = (data: unknown) => void

class WebSocketService {
  private ws: WebSocket | null = null
  private handlers = new Map<string, Set<EventHandler>>()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000
  private url = ""

  connect(url: string) {
    this.url = url
    this.reconnectAttempts = 0
    this.createConnection()
  }

  private createConnection() {
    if (!this.url) return
    try {
      this.ws = new WebSocket(this.url)
      this.ws.onopen = () => {
        logger.info("WebSocket conectado")
        this.reconnectAttempts = 0
      }
      this.ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data)
          const typeHandlers = this.handlers.get(type)
          if (typeHandlers) {
            typeHandlers.forEach((handler) => handler(data))
          }
        } catch {
          logger.warn("WebSocket: mensaje inválido recibido")
        }
      }
      this.ws.onclose = () => {
        logger.info("WebSocket desconectado")
        this.reconnect()
      }
      this.ws.onerror = () => {
        logger.error("WebSocket error")
        this.ws?.close()
      }
    } catch (error) {
      logger.error("WebSocket: error de conexión", { error: String(error) })
      this.reconnect()
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.warn("WebSocket: máximo de reintentos alcanzado")
      return
    }
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1)
    logger.info(`WebSocket: reintentando en ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    setTimeout(() => this.createConnection(), delay)
  }

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
    return () => this.off(event, handler)
  }

  off(event: string, handler: EventHandler) {
    this.handlers.get(event)?.delete(handler)
  }

  send(type: string, data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
    }
  }

  disconnect() {
    this.reconnectAttempts = this.maxReconnectAttempts
    this.ws?.close()
    this.ws = null
  }
}

export const wsService = new WebSocketService()
