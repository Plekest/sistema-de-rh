import { ref, onMounted, onUnmounted } from 'vue'
import notificationService from '@/modules/notifications/services/notification.service'

/**
 * Composable global para gerenciamento de notificacoes
 *
 * Responsabilidades:
 * - Manter contador de notificacoes nao lidas (badge no header)
 * - Fazer polling a cada 60 segundos para atualizar o contador
 * - Fornecer metodos para marcar como lida e atualizar contador
 *
 * Uso:
 * ```ts
 * const { unreadCount, loadUnreadCount, markAsRead, markAllAsRead } = useNotifications()
 * ```
 */
export function useNotifications() {
  const unreadCount = ref<number>(0)
  const isLoading = ref<boolean>(false)
  let pollingInterval: number | undefined = undefined

  /**
   * Carrega o contador de notificacoes nao lidas
   */
  const loadUnreadCount = async () => {
    try {
      isLoading.value = true
      unreadCount.value = await notificationService.getUnreadCount()
    } catch (error) {
      console.error('Erro ao carregar contador de notificacoes:', error)
      // Em caso de erro, mantem o contador atual sem zerar
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Marca uma notificacao especifica como lida e atualiza o contador
   *
   * @param id ID da notificacao
   */
  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id)
      // Decrementa o contador local imediatamente para melhor UX
      if (unreadCount.value > 0) {
        unreadCount.value--
      }
      // Recarrega o contador real do backend para garantir sincronia
      await loadUnreadCount()
    } catch (error) {
      console.error('Erro ao marcar notificacao como lida:', error)
      throw error
    }
  }

  /**
   * Marca todas as notificacoes como lidas e zera o contador
   */
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      // Zera o contador local imediatamente
      unreadCount.value = 0
      // Recarrega para garantir sincronia
      await loadUnreadCount()
    } catch (error) {
      console.error('Erro ao marcar todas as notificacoes como lidas:', error)
      throw error
    }
  }

  /**
   * Inicia o polling automatico a cada 60 segundos
   */
  const startPolling = () => {
    // Carrega imediatamente ao iniciar
    loadUnreadCount()

    // Configura polling a cada 60 segundos
    pollingInterval = window.setInterval(() => {
      loadUnreadCount()
    }, 60000) // 60 segundos
  }

  /**
   * Para o polling automatico
   */
  const stopPolling = () => {
    if (pollingInterval !== undefined) {
      window.clearInterval(pollingInterval)
      pollingInterval = undefined
    }
  }

  // Lifecycle hooks para iniciar/parar polling automaticamente
  onMounted(() => {
    startPolling()
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    unreadCount,
    isLoading,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling
  }
}
