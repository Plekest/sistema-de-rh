import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

interface RateLimitEntry {
  count: number
  resetAt: number
}

/**
 * Middleware de rate limiting em memoria.
 * Limita tentativas por IP para proteger contra brute force.
 *
 * Uso nas rotas:
 *   .use(middleware.rateLimit({ maxAttempts: 5, windowSeconds: 60 }))
 */
export default class RateLimitMiddleware {
  private static store = new Map<string, RateLimitEntry>()

  /**
   * Limpa entradas expiradas periodicamente para evitar memory leak
   */
  private static cleanupInterval: ReturnType<typeof setInterval> | null = null

  private static startCleanup() {
    if (RateLimitMiddleware.cleanupInterval) return
    RateLimitMiddleware.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of RateLimitMiddleware.store) {
        if (now >= entry.resetAt) {
          RateLimitMiddleware.store.delete(key)
        }
      }
    }, 60_000)

    // Permite que o processo encerre sem aguardar o interval
    if (RateLimitMiddleware.cleanupInterval.unref) {
      RateLimitMiddleware.cleanupInterval.unref()
    }
  }

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { maxAttempts?: number; windowSeconds?: number } = {}
  ) {
    const maxAttempts = options.maxAttempts || 5
    const windowSeconds = options.windowSeconds || 60
    const windowMs = windowSeconds * 1000

    RateLimitMiddleware.startCleanup()

    const ip = ctx.request.ip()
    const path = ctx.request.url()
    const key = `${ip}:${path}`
    const now = Date.now()

    let entry = RateLimitMiddleware.store.get(key)

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs }
      RateLimitMiddleware.store.set(key, entry)
    }

    entry.count++

    // Headers informativos para o cliente
    const remaining = Math.max(0, maxAttempts - entry.count)
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)

    ctx.response.header('X-RateLimit-Limit', String(maxAttempts))
    ctx.response.header('X-RateLimit-Remaining', String(remaining))
    ctx.response.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)))

    if (entry.count > maxAttempts) {
      ctx.response.header('Retry-After', String(retryAfterSeconds))

      return ctx.response.tooManyRequests({
        message: `Muitas tentativas. Tente novamente em ${retryAfterSeconds} segundos.`,
      })
    }

    await next()
  }
}
