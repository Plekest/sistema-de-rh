import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class HealthController {
  /**
   * GET /api/v1/health
   * Retorna o status do servidor e conexao com o banco de dados
   */
  async check({ response }: HttpContext) {
    const health: {
      status: string
      timestamp: string
      uptime: number
      database: { status: string; latencyMs?: number; error?: string }
    } = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: { status: 'ok' },
    }

    try {
      const start = Date.now()
      await db.rawQuery('SELECT 1')
      health.database.latencyMs = Date.now() - start
      health.database.status = 'connected'
    } catch (error) {
      health.status = 'degraded'
      health.database.status = 'disconnected'
      health.database.error = 'Falha na conexao com o banco de dados'

      return response.serviceUnavailable(health)
    }

    return response.ok(health)
  }
}
