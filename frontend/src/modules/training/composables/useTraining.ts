import { ref, computed } from 'vue'
import trainingService from '../services/training.service'
import employeeService from '@/modules/employees/services/employee.service'
import type {
  Training,
  TrainingStats,
  TrainingFilters,
  CreateTrainingData,
  UpdateTrainingData,
  TrainingEnrollment,
  BulkEnrollData,
  UpdateEnrollmentData,
} from '../types'
import { TRAINING_TYPE_LABELS, TRAINING_STATUS_LABELS, ENROLLMENT_STATUS_LABELS } from '../types'
import type { Employee } from '@/modules/employees/types'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useApiError } from '@/composables/useApiError'
import { useExport } from '@/composables/useExport'

/**
 * Composable para gerenciar logica de treinamentos
 *
 * Centraliza estado, filtros, CRUD e acoes de inscricao.
 * Usado pela TrainingListView e seus sub-componentes.
 */
export function useTraining() {
  const authStore = useAuthStore()
  const { confirm: confirmDialog } = useConfirmDialog()
  const { error, handleError, clearError } = useApiError()
  const { exporting, exportCSV } = useExport()

  // Estado principal
  const trainings = ref<Training[]>([])
  const training = ref<Training | null>(null)
  const stats = ref<TrainingStats>({
    total: 0,
    inProgress: 0,
    completed: 0,
    completionRate: 0,
  })
  const employees = ref<Employee[]>([])
  const isLoading = ref(false)
  const successMessage = ref('')

  // Filtros
  const filters = ref<TrainingFilters>({
    page: 1,
    limit: 50,
    status: '',
    type: '',
    category: '',
    search: '',
  })

  // Paginacao
  const pagination = ref({
    total: 0,
    page: 1,
    lastPage: 1,
  })

  // Formulario
  const showForm = ref(false)
  const formLoading = ref(false)
  const formError = ref('')
  const formData = ref<CreateTrainingData>({
    title: '',
    description: '',
    type: 'online',
    category: '',
    instructor: '',
    provider: '',
    startDate: '',
    endDate: '',
    durationHours: 0,
    maxParticipants: null,
    location: '',
    status: 'planned',
    isMandatory: false,
    notes: '',
  })
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  // Modal de detalhes
  const showDetails = ref(false)

  // Modal de inscricao
  const showEnrollModal = ref(false)
  const enrollTrainingId = ref<number | null>(null)
  const selectedEmployees = ref<number[]>([])
  const enrollLoading = ref(false)

  const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

  // Labels
  const typeLabels = TRAINING_TYPE_LABELS
  const statusLabels = TRAINING_STATUS_LABELS
  const enrollmentStatusLabels = ENROLLMENT_STATUS_LABELS

  /**
   * Exibe mensagem de sucesso com auto-dismiss apos 5 segundos
   */
  function showSuccess(message: string) {
    successMessage.value = message
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  }

  /**
   * Carrega treinamentos com filtros
   */
  async function fetchTrainings() {
    try {
      isLoading.value = true
      clearError()

      const currentFilters: TrainingFilters = { ...filters.value }

      // Remove filtros vazios
      Object.keys(currentFilters).forEach((key) => {
        const value = currentFilters[key as keyof TrainingFilters]
        if (value === '' || value === null || value === undefined) {
          delete currentFilters[key as keyof TrainingFilters]
        }
      })

      const response = await trainingService.list(currentFilters)
      trainings.value = response.data
      pagination.value = {
        total: response.meta?.total || 0,
        page: response.meta?.page || 1,
        lastPage: response.meta?.lastPage || 1,
      }
    } catch (err: unknown) {
      handleError(err, 'Erro ao carregar treinamentos.')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega um treinamento especifico por ID
   */
  async function fetchTraining(id: number) {
    try {
      isLoading.value = true
      clearError()
      training.value = await trainingService.getById(id)
    } catch (err: unknown) {
      handleError(err, 'Erro ao carregar detalhes do treinamento.')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega estatisticas
   */
  async function fetchStats() {
    try {
      stats.value = await trainingService.getStats()
    } catch (err: unknown) {
      console.error('Erro ao carregar estatisticas:', err)
    }
  }

  /**
   * Carrega colaboradores (apenas admin/manager)
   */
  async function loadEmployees() {
    try {
      const response = await employeeService.getAll({ limit: 200, status: 'active' })
      employees.value = response.data
    } catch (err: unknown) {
      console.error('Erro ao carregar colaboradores:', err)
    }
  }

  /**
   * Abre formulario de novo treinamento
   */
  function openForm() {
    showForm.value = true
    isEditing.value = false
    editingId.value = null
    formError.value = ''
    formData.value = {
      title: '',
      description: '',
      type: 'online',
      category: '',
      instructor: '',
      provider: '',
      startDate: '',
      endDate: '',
      durationHours: 0,
      maxParticipants: null,
      location: '',
      status: 'planned',
      isMandatory: false,
      notes: '',
    }
  }

  /**
   * Abre formulario de edicao
   */
  function openEditForm(trainingData: Training) {
    showForm.value = true
    isEditing.value = true
    editingId.value = trainingData.id
    formError.value = ''
    formData.value = {
      title: trainingData.title,
      description: trainingData.description,
      type: trainingData.type,
      category: trainingData.category,
      instructor: trainingData.instructor,
      provider: trainingData.provider,
      startDate: trainingData.startDate.split('T')[0],
      endDate: trainingData.endDate.split('T')[0],
      durationHours: trainingData.durationHours,
      maxParticipants: trainingData.maxParticipants,
      location: trainingData.location,
      status: trainingData.status,
      isMandatory: trainingData.isMandatory,
      notes: trainingData.notes,
    }
  }

  /**
   * Fecha formulario
   */
  function closeForm() {
    showForm.value = false
    formError.value = ''
  }

  /**
   * Submete formulario (criar ou editar)
   */
  async function submitForm(): Promise<boolean> {
    try {
      formLoading.value = true
      formError.value = ''

      if (!formData.value.title) {
        formError.value = 'Informe o titulo do treinamento'
        return false
      }
      if (!formData.value.startDate || !formData.value.endDate) {
        formError.value = 'Informe as datas de inicio e fim'
        return false
      }
      if (formData.value.durationHours <= 0) {
        formError.value = 'A duracao deve ser maior que zero'
        return false
      }

      if (isEditing.value && editingId.value) {
        await trainingService.update(editingId.value, formData.value)
        showSuccess('Treinamento atualizado com sucesso!')
      } else {
        await trainingService.create(formData.value)
        showSuccess('Treinamento criado com sucesso!')
      }

      closeForm()
      fetchTrainings()
      fetchStats()
      return true
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      formError.value = axiosErr.response?.data?.message || 'Erro ao salvar treinamento'
      return false
    } finally {
      formLoading.value = false
    }
  }

  /**
   * Deleta um treinamento
   */
  async function deleteTraining(id: number) {
    const result = await confirmDialog({
      title: 'Deletar Treinamento',
      message: 'Tem certeza que deseja deletar este treinamento? Esta acao nao pode ser desfeita.',
      variant: 'danger',
      confirmLabel: 'Deletar',
    })

    if (!result) return

    try {
      await trainingService.delete(id)
      showSuccess('Treinamento deletado com sucesso!')
      fetchTrainings()
      fetchStats()
    } catch (err: unknown) {
      handleError(err, 'Erro ao deletar treinamento')
    }
  }

  /**
   * Abre modal de detalhes
   */
  async function openDetails(id: number) {
    await fetchTraining(id)
    showDetails.value = true
  }

  /**
   * Fecha modal de detalhes
   */
  function closeDetails() {
    showDetails.value = false
    training.value = null
  }

  /**
   * Abre modal de inscricao
   */
  function openEnrollModal(trainingId: number) {
    enrollTrainingId.value = trainingId
    selectedEmployees.value = []
    showEnrollModal.value = true
  }

  /**
   * Fecha modal de inscricao
   */
  function closeEnrollModal() {
    showEnrollModal.value = false
    enrollTrainingId.value = null
    selectedEmployees.value = []
  }

  /**
   * Inscreve colaboradores selecionados
   */
  async function enrollEmployees() {
    if (!enrollTrainingId.value || selectedEmployees.value.length === 0) {
      return
    }

    try {
      enrollLoading.value = true

      const data: BulkEnrollData = {
        employeeIds: selectedEmployees.value,
      }

      await trainingService.bulkEnroll(enrollTrainingId.value, data)
      showSuccess(
        `${selectedEmployees.value.length} colaborador(es) inscrito(s) com sucesso!`
      )
      closeEnrollModal()
      fetchTrainings()
    } catch (err: unknown) {
      handleError(err, 'Erro ao inscrever colaboradores')
    } finally {
      enrollLoading.value = false
    }
  }

  /**
   * Atualiza status de inscricao
   */
  async function updateEnrollment(
    enrollmentId: number,
    data: UpdateEnrollmentData
  ): Promise<void> {
    try {
      await trainingService.updateEnrollment(enrollmentId, data)
      showSuccess('Inscricao atualizada com sucesso!')
      if (training.value) {
        await fetchTraining(training.value.id)
      }
    } catch (err: unknown) {
      handleError(err, 'Erro ao atualizar inscricao')
    }
  }

  /**
   * Formata data para exibicao
   */
  function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR')
  }

  /**
   * Formata status
   */
  function formatStatus(status: string): string {
    return statusLabels[status] || status
  }

  /**
   * Formata tipo
   */
  function formatType(type: string): string {
    return typeLabels[type] || type
  }

  /**
   * Inicializa dados
   */
  function init() {
    if (isAdmin.value) {
      loadEmployees()
    }
    fetchTrainings()
    fetchStats()
  }

  return {
    // Estado
    trainings,
    training,
    stats,
    employees,
    isLoading,
    error,
    successMessage,

    // Filtros
    filters,
    pagination,

    // Formulario
    showForm,
    formLoading,
    formError,
    formData,
    isEditing,

    // Modal detalhes
    showDetails,

    // Modal inscricao
    showEnrollModal,
    selectedEmployees,
    enrollLoading,

    // Computed
    isAdmin,

    // Labels
    typeLabels,
    statusLabels,
    enrollmentStatusLabels,

    // Export
    exporting,

    // Metodos
    fetchTrainings,
    fetchTraining,
    fetchStats,
    loadEmployees,
    openForm,
    openEditForm,
    closeForm,
    submitForm,
    deleteTraining,
    openDetails,
    closeDetails,
    openEnrollModal,
    closeEnrollModal,
    enrollEmployees,
    updateEnrollment,
    formatDate,
    formatStatus,
    formatType,
    init,
    handleExport: async () => {
      try {
        const timestamp = new Date().toISOString().split('T')[0]
        await exportCSV('/trainings/export', `treinamentos-${timestamp}.csv`)
      } catch (err: unknown) {
        handleError(err, 'Erro ao exportar dados.')
      }
    },
  }
}
