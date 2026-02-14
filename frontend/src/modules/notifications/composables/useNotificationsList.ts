import { ref, computed } from 'vue'
import notificationService from '../services/notification.service'
import type { Notification } from '../types'

/**
 * Composable para gerenciar a lista completa de notificacoes
 *
 * Responsabilidades:
 * - Carregar notificacoes com paginacao
 * - Filtrar por status (todas/nao lidas)
 * - Marcar individual ou todas como lidas
 * - Formatar datas relativas
 *
 * Diferenca do useNotifications global:
 * - useNotifications: badge no header + polling
 * - useNotificationsList: tela completa com lista + filtros
 */
export function useNotificationsList() {
  const notifications = ref<Notification[]>([])
  const loading = ref<boolean>(false)
  const filter = ref<'all' | 'unread'>('all')

  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    lastPage: 1
  })

  /**
   * Lista de notificacoes filtrada
   */
  const filteredNotifications = computed(() => {
    if (filter.value === 'unread') {
      return notifications.value.filter(n => !n.isRead)
    }
    return notifications.value
  })

  /**
   * Total de notificacoes nao lidas
   */
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length
  })

  /**
   * Carrega lista de notificacoes
   *
   * @param page Numero da pagina
   */
  async function fetchNotifications(page: number = 1) {
    try {
      loading.value = true

      const isReadFilter = filter.value === 'unread' ? false : undefined
      const response = await notificationService.list(page, pagination.value.limit, isReadFilter)

      notifications.value = response.data
      pagination.value = {
        page: response.meta.page,
        limit: pagination.value.limit,
        total: response.meta.total,
        lastPage: response.meta.lastPage
      }
    } catch (error) {
      console.error('Erro ao carregar notificacoes:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Marca uma notificacao como lida
   *
   * @param id ID da notificacao
   */
  async function markAsRead(id: number) {
    try {
      await notificationService.markAsRead(id)

      // Atualiza localmente
      const notification = notifications.value.find(n => n.id === id)
      if (notification) {
        notification.isRead = true
        notification.readAt = new Date().toISOString()
      }
    } catch (error) {
      console.error('Erro ao marcar notificacao como lida:', error)
      throw error
    }
  }

  /**
   * Marca todas as notificacoes como lidas
   */
  async function markAllAsRead() {
    try {
      await notificationService.markAllAsRead()

      // Atualiza todas localmente
      notifications.value.forEach(n => {
        n.isRead = true
        n.readAt = new Date().toISOString()
      })
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      throw error
    }
  }

  /**
   * Altera o filtro e recarrega a primeira pagina
   *
   * @param newFilter Novo filtro
   */
  async function changeFilter(newFilter: 'all' | 'unread') {
    filter.value = newFilter
    await fetchNotifications(1)
  }

  /**
   * Formata data como relativa (ex: "há 2 horas", "ontem")
   *
   * @param date Data ISO string
   * @returns String formatada
   */
  function formatRelativeTime(date: string): string {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffMs = now.getTime() - notificationDate.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) {
      return 'agora'
    } else if (diffMinutes < 60) {
      return diffMinutes === 1 ? 'há 1 minuto' : `há ${diffMinutes} minutos`
    } else if (diffHours < 24) {
      return diffHours === 1 ? 'há 1 hora' : `há ${diffHours} horas`
    } else if (diffDays === 1) {
      return 'ontem'
    } else if (diffDays < 7) {
      return `há ${diffDays} dias`
    } else {
      // Formatacao padrao para datas antigas
      const day = String(notificationDate.getDate()).padStart(2, '0')
      const month = String(notificationDate.getMonth() + 1).padStart(2, '0')
      const year = notificationDate.getFullYear()
      return `${day}/${month}/${year}`
    }
  }

  /**
   * Verifica se ha proxima pagina
   */
  const hasNextPage = computed(() => {
    return pagination.value.page < pagination.value.lastPage
  })

  /**
   * Verifica se ha pagina anterior
   */
  const hasPrevPage = computed(() => {
    return pagination.value.page > 1
  })

  /**
   * Carrega proxima pagina
   */
  async function nextPage() {
    if (hasNextPage.value) {
      await fetchNotifications(pagination.value.page + 1)
    }
  }

  /**
   * Carrega pagina anterior
   */
  async function prevPage() {
    if (hasPrevPage.value) {
      await fetchNotifications(pagination.value.page - 1)
    }
  }

  return {
    notifications: filteredNotifications,
    loading,
    filter,
    pagination,
    unreadCount,
    hasNextPage,
    hasPrevPage,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    changeFilter,
    formatRelativeTime,
    nextPage,
    prevPage
  }
}
