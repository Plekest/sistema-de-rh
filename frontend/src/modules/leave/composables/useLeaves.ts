import { ref, computed, watch } from 'vue'
import leaveService from '../services/leave.service'
import employeeService from '@/modules/employees/services/employee.service'
import type { Leave, CreateLeaveData, LeaveFilters } from '../types'
import { LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS } from '../types'
import type { Employee } from '@/modules/employees/types'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useApiError } from '@/composables/useApiError'

/**
 * Composable para gerenciar logica de ferias e licencas
 *
 * Centraliza estado, filtros, CRUD e acoes de aprovacao/rejeicao/cancelamento.
 * Usado pela LeaveListView e seus sub-componentes.
 */
export function useLeaves() {
  const authStore = useAuthStore()
  const { confirm: confirmDialog } = useConfirmDialog()
  const { error, handleError, clearError } = useApiError()

  // Estado principal
  const leaves = ref<Leave[]>([])
  const employees = ref<Employee[]>([])
  const isLoading = ref(false)
  const successMessage = ref('')

  // Filtros
  const selectedEmployee = ref<number | null>(null)
  const filterType = ref<string>('')
  const filterStatus = ref<string>('')

  // Formulario
  const showForm = ref(false)
  const formLoading = ref(false)
  const formError = ref('')
  const formData = ref<CreateLeaveData>({
    employeeId: 0,
    type: '',
    startDate: '',
    endDate: '',
    daysCount: 0,
    isPaid: true,
    sellDays: 0,
    notes: '',
  })

  const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

  // Labels
  const typeLabels = LEAVE_TYPE_LABELS
  const statusLabels = LEAVE_STATUS_LABELS
  const typeOptions = Object.keys(typeLabels)
  const statusOptions = Object.keys(statusLabels)

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
   * Carrega solicitacoes de ferias/licencas
   */
  async function loadLeaves() {
    try {
      isLoading.value = true
      clearError()

      const filters: LeaveFilters = { limit: 100 }

      if (!isAdmin.value && authStore.employeeId) {
        filters.employeeId = authStore.employeeId
      } else if (selectedEmployee.value) {
        filters.employeeId = selectedEmployee.value
      }

      if (filterType.value) filters.type = filterType.value
      if (filterStatus.value) filters.status = filterStatus.value

      const response = await leaveService.list(filters)
      leaves.value = response.data
    } catch (err: unknown) {
      handleError(err, 'Erro ao carregar solicitacoes de ferias/licencas.')
    } finally {
      isLoading.value = false
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
   * Abre formulario de nova solicitacao
   */
  function openForm() {
    showForm.value = true
    formError.value = ''
    formData.value = {
      employeeId: isAdmin.value ? 0 : (authStore.employeeId || 0),
      type: '',
      startDate: '',
      endDate: '',
      daysCount: 0,
      isPaid: true,
      sellDays: 0,
      notes: '',
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
   * Calcula dias entre as datas
   */
  function calculateDays() {
    if (!formData.value.startDate || !formData.value.endDate) {
      formData.value.daysCount = 0
      return
    }

    const start = new Date(formData.value.startDate)
    const end = new Date(formData.value.endDate)

    if (start > end) {
      formData.value.daysCount = 0
      return
    }

    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    formData.value.daysCount = diffDays
  }

  /**
   * Submete nova solicitacao
   */
  async function submitForm(): Promise<boolean> {
    try {
      formLoading.value = true
      formError.value = ''

      if (!formData.value.employeeId) {
        formError.value = 'Selecione um colaborador'
        return false
      }
      if (!formData.value.type) {
        formError.value = 'Selecione o tipo de licenca'
        return false
      }
      if (!formData.value.startDate || !formData.value.endDate) {
        formError.value = 'Informe as datas de inicio e fim'
        return false
      }
      if (formData.value.daysCount <= 0) {
        formError.value = 'A quantidade de dias deve ser maior que zero'
        return false
      }

      await leaveService.create(formData.value)
      showSuccess('Solicitacao criada com sucesso!')
      closeForm()
      loadLeaves()
      return true
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      formError.value = axiosErr.response?.data?.message || 'Erro ao criar solicitacao'
      return false
    } finally {
      formLoading.value = false
    }
  }

  /**
   * Aprova uma solicitacao
   */
  async function approveLeave(id: number) {
    const result = await confirmDialog({
      title: 'Aprovar Solicitacao',
      message: 'Confirma a aprovacao desta solicitacao?',
      variant: 'info',
      confirmLabel: 'Aprovar',
    })

    if (!result) return

    try {
      await leaveService.approve(id)
      showSuccess('Solicitacao aprovada com sucesso!')
      loadLeaves()
    } catch (err: unknown) {
      handleError(err, 'Erro ao aprovar solicitacao')
    }
  }

  /**
   * Rejeita uma solicitacao
   */
  async function rejectLeave(id: number) {
    const result = await confirmDialog({
      title: 'Rejeitar Solicitacao',
      message: 'Informe o motivo da rejeicao desta solicitacao:',
      variant: 'danger',
      confirmLabel: 'Rejeitar',
      showInput: true,
      inputPlaceholder: 'Motivo da rejeicao (opcional)...',
      inputRequired: false,
    })

    if (!result) return

    try {
      await leaveService.reject(id, result !== true ? (result as string) : undefined)
      showSuccess('Solicitacao rejeitada.')
      loadLeaves()
    } catch (err: unknown) {
      handleError(err, 'Erro ao rejeitar solicitacao')
    }
  }

  /**
   * Cancela uma solicitacao
   */
  async function cancelLeave(id: number) {
    const result = await confirmDialog({
      title: 'Cancelar Solicitacao',
      message: 'Confirma o cancelamento desta solicitacao?',
      variant: 'warning',
      confirmLabel: 'Cancelar Solicitacao',
    })

    if (!result) return

    try {
      await leaveService.cancel(id)
      showSuccess('Solicitacao cancelada.')
      loadLeaves()
    } catch (err: unknown) {
      handleError(err, 'Erro ao cancelar solicitacao')
    }
  }

  /**
   * Verifica se pode aprovar/rejeitar
   */
  function canApprove(leave: Leave): boolean {
    return isAdmin.value && leave.status === 'pending'
  }

  /**
   * Verifica se pode cancelar
   */
  function canCancel(leave: Leave): boolean {
    return (
      leave.status === 'pending' &&
      (isAdmin.value || leave.employeeId === authStore.employeeId)
    )
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
   * Inicializa dados
   */
  function init() {
    if (isAdmin.value) {
      loadEmployees()
    } else if (authStore.employeeId) {
      selectedEmployee.value = authStore.employeeId
    }
    loadLeaves()
  }

  // Watchers
  watch(() => formData.value.startDate, calculateDays)
  watch(() => formData.value.endDate, calculateDays)

  return {
    // Estado
    leaves,
    employees,
    isLoading,
    error,
    successMessage,

    // Filtros
    selectedEmployee,
    filterType,
    filterStatus,

    // Formulario
    showForm,
    formLoading,
    formError,
    formData,

    // Computed
    isAdmin,

    // Labels
    typeLabels,
    statusLabels,
    typeOptions,
    statusOptions,

    // Metodos
    loadLeaves,
    loadEmployees,
    openForm,
    closeForm,
    submitForm,
    approveLeave,
    rejectLeave,
    cancelLeave,
    canApprove,
    canCancel,
    formatDate,
    init,
  }
}
