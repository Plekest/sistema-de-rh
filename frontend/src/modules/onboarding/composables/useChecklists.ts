import { ref, computed } from 'vue'
import onboardingService from '../services/onboardingService'
import type { OnboardingChecklist, OnboardingChecklistItem, ChecklistFilters } from '../types'
import { CHECKLIST_STATUS_LABELS, ITEM_STATUS_LABELS } from '../types'
import { useAuthStore } from '@/stores/auth'
import { useApiError } from '@/composables/useApiError'

/**
 * Composable para gerenciar checklists de onboarding
 */
export function useChecklists() {
  const authStore = useAuthStore()
  const { error, handleError, clearError } = useApiError()

  // Estado
  const checklists = ref<OnboardingChecklist[]>([])
  const selectedChecklist = ref<OnboardingChecklist | null>(null)
  const isLoading = ref(false)
  const successMessage = ref('')

  // Filtros
  const selectedEmployee = ref<number | null>(null)
  const filterStatus = ref<string>('')

  const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)
  const statusLabels = CHECKLIST_STATUS_LABELS
  const itemStatusLabels = ITEM_STATUS_LABELS

  /**
   * Exibe mensagem de sucesso
   */
  function showSuccess(message: string) {
    successMessage.value = message
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  }

  /**
   * Calcula progresso da checklist
   */
  function calculateProgress(checklist: OnboardingChecklist): number {
    if (!checklist.items || checklist.items.length === 0) return 0
    const completed = checklist.items.filter((item) => item.status === 'completed').length
    return Math.round((completed / checklist.items.length) * 100)
  }

  /**
   * Carrega checklists
   */
  async function loadChecklists() {
    try {
      isLoading.value = true
      clearError()

      const filters: ChecklistFilters = { limit: 100 }

      if (!isAdmin.value && authStore.employeeId) {
        filters.employeeId = authStore.employeeId
      } else if (selectedEmployee.value) {
        filters.employeeId = selectedEmployee.value
      }

      if (filterStatus.value) {
        filters.status = filterStatus.value
      }

      const response = await onboardingService.listChecklists(filters)
      checklists.value = response.data
    } catch (err: unknown) {
      handleError(err, 'Erro ao carregar checklists.')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Seleciona checklist
   */
  async function selectChecklist(checklist: OnboardingChecklist) {
    try {
      isLoading.value = true
      selectedChecklist.value = await onboardingService.getChecklist(checklist.id)
    } catch (err: unknown) {
      handleError(err, 'Erro ao carregar detalhes da checklist.')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Marca item como completo
   */
  async function completeItem(item: OnboardingChecklistItem, notes?: string) {
    if (!selectedChecklist.value) return

    try {
      await onboardingService.completeChecklistItem(selectedChecklist.value.id, item.id, notes)
      showSuccess('Item marcado como concluído!')
      await selectChecklist(selectedChecklist.value)
      loadChecklists()
    } catch (err: unknown) {
      handleError(err, 'Erro ao completar item.')
    }
  }

  /**
   * Pula item
   */
  async function skipItem(item: OnboardingChecklistItem, notes?: string) {
    if (!selectedChecklist.value) return

    try {
      await onboardingService.skipChecklistItem(selectedChecklist.value.id, item.id, notes)
      showSuccess('Item pulado.')
      await selectChecklist(selectedChecklist.value)
      loadChecklists()
    } catch (err: unknown) {
      handleError(err, 'Erro ao pular item.')
    }
  }

  /**
   * Verifica se item está atrasado
   */
  function isOverdue(item: OnboardingChecklistItem): boolean {
    if (item.status === 'completed' || item.status === 'skipped') return false
    const dueDate = new Date(item.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dueDate < today
  }

  /**
   * Verifica se usuário pode completar item
   */
  function canCompleteItem(item: OnboardingChecklistItem): boolean {
    if (item.status !== 'pending' && item.status !== 'overdue') return false
    if (authStore.isAdmin) return true
    if (item.responsible === 'employee' && authStore.employeeId === selectedChecklist.value?.employeeId) {
      return true
    }
    if (item.responsible === 'manager' && authStore.isManager) return true
    if (item.responsible === 'hr' && (authStore.isAdmin || authStore.isManager)) return true
    if (item.responsible === 'it') return authStore.isAdmin
    return false
  }

  /**
   * Formata data
   */
  function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR')
  }

  /**
   * Inicializa dados
   */
  function init() {
    loadChecklists()
  }

  return {
    // Estado
    checklists,
    selectedChecklist,
    isLoading,
    error,
    successMessage,

    // Filtros
    selectedEmployee,
    filterStatus,

    // Computed
    isAdmin,
    statusLabels,
    itemStatusLabels,

    // Metodos
    loadChecklists,
    selectChecklist,
    completeItem,
    skipItem,
    calculateProgress,
    isOverdue,
    canCompleteItem,
    formatDate,
    init,
  }
}
