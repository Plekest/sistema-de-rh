import { ref, computed } from 'vue'
import payrollService from '../services/payroll.service'
import employeeService from '@/modules/employees/services/employee.service'
import type { PayrollPeriod, PaySlip, PayrollComponent, CreatePeriodData, CreateComponentData } from '../types'
import { PERIOD_STATUS_LABELS, MONTH_LABELS, COMPONENT_TYPE_LABELS, ENTRY_CODE_LABELS } from '../types'
import type { Employee } from '@/modules/employees/types'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

/**
 * Composable para gerenciar logica de folha de pagamento
 *
 * Centraliza estado, filtros, CRUD de periodos/contracheques/componentes salariais.
 * Usado pela PayrollView e seus sub-componentes.
 */
export function usePayroll() {
  const authStore = useAuthStore()
  const { confirm: confirmDialog } = useConfirmDialog()

  // Estado principal
  const periods = ref<PayrollPeriod[]>([])
  const paySlips = ref<PaySlip[]>([])
  const myPaySlips = ref<PaySlip[]>([])
  const employees = ref<Employee[]>([])
  const components = ref<PayrollComponent[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const successMessage = ref('')

  // Tabs
  const activeTab = ref<'periods' | 'mySlips' | 'components'>('periods')

  // Periodo selecionado para ver contracheques
  const selectedPeriodId = ref<number | null>(null)
  const selectedPeriod = ref<PayrollPeriod | null>(null)

  // Detalhamento de contracheque
  const selectedSlip = ref<PaySlip | null>(null)
  const showSlipDetail = ref(false)

  // Formulario novo periodo
  const showPeriodForm = ref(false)
  const periodFormLoading = ref(false)
  const periodFormError = ref('')
  const periodFormData = ref<CreatePeriodData>({
    referenceMonth: new Date().getMonth() + 1,
    referenceYear: new Date().getFullYear(),
  })

  // Formulario componente salarial
  const showComponentForm = ref(false)
  const componentFormLoading = ref(false)
  const componentFormError = ref('')
  const componentFormData = ref<CreateComponentData>({
    employeeId: 0,
    type: 'base_salary',
    description: '',
    amount: 0,
    effectiveFrom: new Date().toISOString().split('T')[0] as string,
  })

  // Filtro de componentes por colaborador
  const componentEmployeeId = ref<number | null>(null)

  const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

  // Labels
  const periodStatusLabels = PERIOD_STATUS_LABELS
  const monthLabels = MONTH_LABELS
  const componentTypeLabels = COMPONENT_TYPE_LABELS
  const entryCodeLabels = ENTRY_CODE_LABELS

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: MONTH_LABELS[i + 1] }))
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  /**
   * Exibe mensagem de sucesso com auto-dismiss
   */
  function showSuccess(message: string) {
    successMessage.value = message
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  }

  /**
   * Carrega periodos da folha
   */
  async function loadPeriods() {
    try {
      isLoading.value = true
      error.value = ''
      const response = await payrollService.listPeriods({ limit: 50 })
      periods.value = response.data
    } catch (err: unknown) {
      error.value = 'Erro ao carregar periodos da folha.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega colaboradores (admin/manager)
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
   * Carrega contracheques de um periodo
   */
  async function loadSlips(periodId: number) {
    try {
      isLoading.value = true
      error.value = ''
      selectedPeriodId.value = periodId
      selectedPeriod.value = periods.value.find(p => p.id === periodId) || null
      paySlips.value = await payrollService.getPaySlips(periodId)
    } catch (err: unknown) {
      error.value = 'Erro ao carregar contracheques.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega contracheques do usuario logado
   */
  async function loadMyPaySlips() {
    if (!authStore.employeeId) return

    try {
      isLoading.value = true
      error.value = ''
      const response = await payrollService.getEmployeePaySlips(authStore.employeeId)
      myPaySlips.value = response.data
    } catch (err: unknown) {
      error.value = 'Erro ao carregar seus contracheques.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega componentes de um colaborador
   */
  async function loadComponents(employeeId: number) {
    try {
      isLoading.value = true
      error.value = ''
      componentEmployeeId.value = employeeId
      components.value = await payrollService.getComponents(employeeId)
    } catch (err: unknown) {
      error.value = 'Erro ao carregar componentes salariais.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Volta para lista de periodos
   */
  function backToPeriods() {
    selectedPeriodId.value = null
    selectedPeriod.value = null
    paySlips.value = []
  }

  /**
   * Mostra detalhe do contracheque
   */
  async function viewSlipDetail(slipId: number) {
    try {
      isLoading.value = true
      selectedSlip.value = await payrollService.getPaySlipDetail(slipId)
      showSlipDetail.value = true
    } catch (err: unknown) {
      error.value = 'Erro ao carregar detalhes do contracheque.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  function closeSlipDetail() {
    showSlipDetail.value = false
    selectedSlip.value = null
  }

  // --- Periodo CRUD ---

  function openPeriodForm() {
    showPeriodForm.value = true
    periodFormError.value = ''
    periodFormData.value = {
      referenceMonth: new Date().getMonth() + 1,
      referenceYear: new Date().getFullYear(),
    }
  }

  function closePeriodForm() {
    showPeriodForm.value = false
    periodFormError.value = ''
  }

  async function submitPeriodForm() {
    try {
      periodFormLoading.value = true
      periodFormError.value = ''
      await payrollService.createPeriod(periodFormData.value)
      showSuccess('Periodo criado com sucesso!')
      closePeriodForm()
      loadPeriods()
    } catch (err: any) {
      periodFormError.value = err.response?.data?.message || 'Erro ao criar periodo'
      console.error(err)
    } finally {
      periodFormLoading.value = false
    }
  }

  async function calculatePayroll(periodId: number) {
    const result = await confirmDialog({
      title: 'Calcular Folha',
      message: 'Confirma o calculo da folha para este periodo? Isso ira gerar/atualizar todos os contracheques.',
      variant: 'info',
      confirmLabel: 'Calcular',
    })

    if (!result) return

    try {
      isLoading.value = true
      error.value = ''
      await payrollService.calculatePayroll(periodId)
      showSuccess('Folha calculada com sucesso!')
      loadSlips(periodId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao calcular folha'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function closePeriod(periodId: number) {
    const result = await confirmDialog({
      title: 'Fechar Periodo',
      message: 'Confirma o fechamento deste periodo? Apos fechamento nao sera possivel recalcular.',
      variant: 'warning',
      confirmLabel: 'Fechar Periodo',
    })

    if (!result) return

    try {
      await payrollService.closePeriod(periodId)
      showSuccess('Periodo fechado com sucesso!')
      loadPeriods()
      if (selectedPeriodId.value === periodId) {
        backToPeriods()
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao fechar periodo'
      console.error(err)
    }
  }

  // --- Componente CRUD ---

  function openComponentForm() {
    showComponentForm.value = true
    componentFormError.value = ''
    componentFormData.value = {
      employeeId: componentEmployeeId.value || 0,
      type: 'base_salary',
      description: '',
      amount: 0,
      effectiveFrom: new Date().toISOString().split('T')[0] as string,
    }
  }

  function closeComponentForm() {
    showComponentForm.value = false
    componentFormError.value = ''
  }

  async function submitComponentForm() {
    try {
      componentFormLoading.value = true
      componentFormError.value = ''

      if (!componentFormData.value.employeeId) {
        componentFormError.value = 'Selecione um colaborador'
        return
      }
      if (!componentFormData.value.description) {
        componentFormError.value = 'Informe a descricao'
        return
      }
      if (componentFormData.value.amount <= 0) {
        componentFormError.value = 'Informe um valor maior que zero'
        return
      }

      await payrollService.createComponent(componentFormData.value)
      showSuccess('Componente salarial criado com sucesso!')
      closeComponentForm()
      if (componentEmployeeId.value) {
        loadComponents(componentEmployeeId.value)
      }
    } catch (err: any) {
      componentFormError.value = err.response?.data?.message || 'Erro ao criar componente'
      console.error(err)
    } finally {
      componentFormLoading.value = false
    }
  }

  /**
   * Formata valor monetario
   */
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
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
   * Retorna classe CSS para badge de status do periodo
   */
  function periodStatusClass(status: string): string {
    const classes: Record<string, string> = {
      open: 'badge-open',
      calculating: 'badge-calculating',
      closed: 'badge-closed',
    }
    return classes[status] || ''
  }

  /**
   * Inicializa dados
   */
  function init() {
    loadPeriods()
    if (isAdmin.value) {
      loadEmployees()
    }
    if (authStore.employeeId && !isAdmin.value) {
      activeTab.value = 'mySlips'
      loadMyPaySlips()
    }
  }

  return {
    // Estado
    periods,
    paySlips,
    myPaySlips,
    employees,
    components,
    isLoading,
    error,
    successMessage,

    // Tabs
    activeTab,

    // Periodo selecionado
    selectedPeriodId,
    selectedPeriod,

    // Detalhamento contracheque
    selectedSlip,
    showSlipDetail,

    // Formularios
    showPeriodForm,
    periodFormLoading,
    periodFormError,
    periodFormData,
    showComponentForm,
    componentFormLoading,
    componentFormError,
    componentFormData,

    // Filtros
    componentEmployeeId,

    // Computed
    isAdmin,

    // Labels
    periodStatusLabels,
    monthLabels,
    componentTypeLabels,
    entryCodeLabels,
    monthOptions,
    yearOptions,

    // Metodos
    loadPeriods,
    loadEmployees,
    loadSlips,
    loadMyPaySlips,
    loadComponents,
    backToPeriods,
    viewSlipDetail,
    closeSlipDetail,
    openPeriodForm,
    closePeriodForm,
    submitPeriodForm,
    calculatePayroll,
    closePeriod,
    openComponentForm,
    closeComponentForm,
    submitComponentForm,
    formatCurrency,
    formatDate,
    periodStatusClass,
    init,
  }
}
