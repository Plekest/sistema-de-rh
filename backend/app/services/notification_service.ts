import Notification, { type NotificationType } from '#models/notification'
import { DateTime } from 'luxon'

interface ListFilters {
  page?: number
  limit?: number
  isRead?: boolean
  type?: NotificationType
}

interface CreateNotificationData {
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, unknown>
}

export default class NotificationService {
  /**
   * Lista notificacoes do usuario com filtros e paginacao
   */
  async list(userId: number, filters: ListFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = Notification.query().where('userId', userId).orderBy('createdAt', 'desc')

    if (filters.isRead !== undefined) {
      query.where('isRead', filters.isRead)
    }

    if (filters.type) {
      query.where('type', filters.type)
    }

    const result = await query.paginate(page, limit)
    return result
  }

  /**
   * Marca uma notificacao como lida
   */
  async markAsRead(notificationId: number, userId: number) {
    const notification = await Notification.query()
      .where('id', notificationId)
      .where('userId', userId)
      .firstOrFail()

    if (notification.isRead) {
      return notification
    }

    notification.isRead = true
    notification.readAt = DateTime.now()
    await notification.save()

    return notification
  }

  /**
   * Marca todas as notificacoes do usuario como lidas
   */
  async markAllAsRead(userId: number) {
    const now = DateTime.now()
    const affected = await Notification.query()
      .where('userId', userId)
      .where('isRead', false)
      .update({
        isRead: true,
        readAt: now,
      })

    return { affected }
  }

  /**
   * Retorna a contagem de notificacoes nao lidas
   */
  async getUnreadCount(userId: number): Promise<number> {
    const count = await Notification.query()
      .where('userId', userId)
      .where('isRead', false)
      .count('* as total')

    return Number(count[0].$extras.total)
  }

  /**
   * Cria uma nova notificacao para um usuario.
   * Metodo interno para ser chamado por outros services.
   */
  async create(userId: number, data: CreateNotificationData) {
    const notification = await Notification.create({
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || null,
      isRead: false,
      readAt: null,
    })

    return notification
  }

  /**
   * Busca uma notificacao por ID
   */
  async findById(id: number, userId: number) {
    const notification = await Notification.query()
      .where('id', id)
      .where('userId', userId)
      .firstOrFail()

    return notification
  }
}
