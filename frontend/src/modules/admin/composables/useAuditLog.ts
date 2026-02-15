import { ref, computed } from 'vue'
import auditLogService from '../services/auditLogService'
import type { AuditLog, AuditLogFilters } from '../types/auditLog'
import type { PaginatedResponse } from '@/modules/employees/types'

export function useAuditLog() {
  const logs = ref<AuditLog[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const pagination = ref<PaginatedResponse<AuditLog>['meta'] | null>(null)
  const expandedLogId = ref<number | null>(null)

  // Filtros
  const filters = ref<AuditLogFilters>({
    page: 1,
    limit: 20,
    action: undefined,
    resource: undefined,
    userId: undefined,
    from: undefined,
    to: undefined,
  })

  const hasFilters = computed(() => {
    return !!(
      filters.value.action ||
      filters.value.resource ||
      filters.value.userId ||
      filters.value.from ||
      filters.value.to
    )
  })

  /**
   * Carrega logs com filtros
   */
  async function loadLogs() {
    isLoading.value = true
    error.value = ''

    try {
      const response = await auditLogService.getAll(filters.value)
      logs.value = response.data
      pagination.value = response.meta
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Erro ao carregar logs de auditoria'
      logs.value = []
      pagination.value = null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Muda para uma pagina especifica
   */
  function goToPage(page: number) {
    filters.value.page = page
    loadLogs()
  }

  /**
   * Limpa todos os filtros
   */
  function clearFilters() {
    filters.value = {
      page: 1,
      limit: 20,
      action: undefined,
      resource: undefined,
      userId: undefined,
      from: undefined,
      to: undefined,
    }
    loadLogs()
  }

  /**
   * Aplica filtros e recarrega
   */
  function applyFilters() {
    filters.value.page = 1
    loadLogs()
  }

  /**
   * Expande/colapsa um log para ver detalhes
   */
  function toggleExpand(logId: number) {
    expandedLogId.value = expandedLogId.value === logId ? null : logId
  }

  /**
   * Verifica se um log esta expandido
   */
  function isExpanded(logId: number): boolean {
    return expandedLogId.value === logId
  }

  return {
    logs,
    isLoading,
    error,
    pagination,
    filters,
    hasFilters,
    expandedLogId,
    loadLogs,
    goToPage,
    clearFilters,
    applyFilters,
    toggleExpand,
    isExpanded,
  }
}
