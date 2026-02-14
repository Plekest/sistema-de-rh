import api from '@/services/api'
import type { Notification } from '../types'

interface ListResponse {
  data: Notification[]
  meta: {
    total: number
    page: number
    lastPage: number
  }
}

interface UnreadCountResponse {
  unreadCount: number
}

/**
 * Service para gerenciamento de notificacoes
 *
 * Endpoints:
 * - GET /notifications - Listar notificacoes com paginacao e filtro por isRead
 * - GET /notifications/unread/count - Contar notificacoes nao lidas
 * - PATCH /notifications/:id/read - Marcar notificacao como lida
 * - PATCH /notifications/mark-all-read - Marcar todas como lidas
 */
class NotificationService {
  /**
   * Lista notificacoes com paginacao e filtro opcional por isRead
   *
   * @param page Numero da pagina (default: 1)
   * @param limit Itens por pagina (default: 20)
   * @param isRead Filtrar por lidas (true), nao lidas (false), ou todas (undefined)
   * @returns Lista paginada de notificacoes
   */
  async list(
    page: number = 1,
    limit: number = 20,
    isRead?: boolean
  ): Promise<ListResponse> {
    const params: Record<string, unknown> = { page, limit }

    if (isRead !== undefined) {
      params.isRead = isRead
    }

    const response = await api.get<ListResponse>('/notifications', { params })
    return response.data
  }

  /**
   * Obtem o total de notificacoes nao lidas do usuario logado
   *
   * @returns Contador de notificacoes nao lidas
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<UnreadCountResponse>('/notifications/unread/count')
    return response.data.unreadCount
  }

  /**
   * Marca uma notificacao especifica como lida
   *
   * @param id ID da notificacao
   * @returns Notificacao atualizada
   */
  async markAsRead(id: number): Promise<Notification> {
    const response = await api.patch<Notification>(`/notifications/${id}/read`)
    return response.data
  }

  /**
   * Marca todas as notificacoes do usuario como lidas
   *
   * @returns Mensagem de confirmacao
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>('/notifications/mark-all-read')
    return response.data
  }
}

export default new NotificationService()
