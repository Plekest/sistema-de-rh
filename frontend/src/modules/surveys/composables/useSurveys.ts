import { ref, computed } from 'vue'
import surveyService from '../services/surveyService'
import type { Survey, CreateSurveyData } from '../types'
import { SURVEY_TYPE_LABELS, SURVEY_STATUS_LABELS } from '../types'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useApiError } from '@/composables/useApiError'

export function useSurveys() {
  const authStore = useAuthStore()
  const { confirm: confirmDialog } = useConfirmDialog()
  const { error, handleError, clearError } = useApiError()

  const surveys = ref<Survey[]>([])
  const isLoading = ref(false)
  const successMessage = ref('')
  const filterStatus = ref<string>('')
  const filterType = ref<string>('')

  const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)
  const typeLabels = SURVEY_TYPE_LABELS
  const statusLabels = SURVEY_STATUS_LABELS

  function showSuccess(message: string) {
    successMessage.value = message
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  }

  async function loadSurveys() {
    try {
      isLoading.value = true
      clearError()
      surveys.value = await surveyService.list()

      if (filterStatus.value) {
        surveys.value = surveys.value.filter((s) => s.status === filterStatus.value)
      }
      if (filterType.value) {
        surveys.value = surveys.value.filter((s) => s.type === filterType.value)
      }
    } catch (err: unknown) {
      handleError(err, 'Erro ao carregar pesquisas.')
    } finally {
      isLoading.value = false
    }
  }

  async function activateSurvey(id: number) {
    try {
      await surveyService.activate(id)
      showSuccess('Pesquisa ativada com sucesso!')
      loadSurveys()
    } catch (err: unknown) {
      handleError(err, 'Erro ao ativar pesquisa.')
    }
  }

  async function closeSurvey(id: number) {
    const result = await confirmDialog({
      title: 'Encerrar Pesquisa',
      message: 'Tem certeza que deseja encerrar esta pesquisa?',
      variant: 'warning',
      confirmLabel: 'Encerrar',
    })
    if (!result) return

    try {
      await surveyService.close(id)
      showSuccess('Pesquisa encerrada.')
      loadSurveys()
    } catch (err: unknown) {
      handleError(err, 'Erro ao encerrar pesquisa.')
    }
  }

  async function deleteSurvey(id: number) {
    const result = await confirmDialog({
      title: 'Excluir Pesquisa',
      message: 'Tem certeza que deseja excluir esta pesquisa?',
      variant: 'danger',
      confirmLabel: 'Excluir',
    })
    if (!result) return

    try {
      await surveyService.delete(id)
      showSuccess('Pesquisa excluída.')
      loadSurveys()
    } catch (err: unknown) {
      handleError(err, 'Erro ao excluir pesquisa.')
    }
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR')
  }

  function init() {
    loadSurveys()
  }

  return {
    surveys,
    isLoading,
    error,
    successMessage,
    filterStatus,
    filterType,
    isAdmin,
    typeLabels,
    statusLabels,
    loadSurveys,
    activateSurvey,
    closeSurvey,
    deleteSurvey,
    formatDate,
    init,
  }
}
