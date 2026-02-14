import type { HttpContext } from '@adonisjs/core/http'
import NotificationService from '#services/notification_service'
import { listNotificationValidator } from '#validators/notification_validator'

export default class NotificationsController {
  private service: NotificationService

  constructor() {
    this.service = new NotificationService()
  }

  /**
   * Lista notificacoes do usuario logado
   * GET /api/v1/notifications
   */
  async index({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const filters = await request.validateUsing(listNotificationValidator)
      const result = await this.service.list(user.id, filters)

      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar notificacoes' })
    }
  }

  /**
   * Retorna contagem de notificacoes nao lidas
   * GET /api/v1/notifications/unread-count
   */
  async unreadCount({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const count = await this.service.getUnreadCount(user.id)

      return response.ok({ count })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao buscar contagem de notificacoes',
      })
    }
  }

  /**
   * Marca uma notificacao como lida
   * PATCH /api/v1/notifications/:id/read
   */
  async markAsRead({ params, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const notification = await this.service.markAsRead(params.id, user.id)

      return response.ok({ data: notification })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Notificacao nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao marcar como lida' })
    }
  }

  /**
   * Marca todas as notificacoes como lidas
   * PATCH /api/v1/notifications/read-all
   */
  async markAllAsRead({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const result = await this.service.markAllAsRead(user.id)

      return response.ok({ message: 'Todas notificacoes marcadas como lidas', data: result })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao marcar como lidas' })
    }
  }
}
