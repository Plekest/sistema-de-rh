import type { HttpContext } from '@adonisjs/core/http'
import AuditLogService from '#services/audit_log_service'
import vine from '@vinejs/vine'

const listAuditLogsValidator = vine.compile(
  vine.object({
    page: vine.number().positive().min(1).optional(),
    limit: vine.number().positive().max(500).optional(),
    action: vine.string().trim().optional(),
    resource_type: vine.string().trim().optional(),
    user_id: vine.number().positive().optional(),
    from: vine.string().trim().optional(),
    to: vine.string().trim().optional(),
  })
)

export default class AuditLogsController {
  private service: AuditLogService

  constructor() {
    this.service = new AuditLogService()
  }

  async index({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listAuditLogsValidator)
      const result = await this.service.list(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar logs de auditoria' })
    }
  }
}
