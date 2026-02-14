import { ref, computed } from 'vue'
import performanceService from '../services/performance.service'
import employeeService from '@/modules/employees/services/employee.service'
import type {
  PerformanceCycle,
  Competency,
  IndividualGoal,
  Evaluation,
  DevelopmentPlan,
  CreateCycleData,
  CreateCompetencyData,
  CreateGoalData,
  SubmitEvaluationData,
  CreateDevelopmentPlanData,
  UpdateDevelopmentPlanData,
} from '../types'
import {
  CYCLE_STATUS_LABELS,
  CYCLE_TYPE_LABELS,
  COMPETENCY_CATEGORY_LABELS,
  GOAL_STATUS_LABELS,
  EVALUATION_TYPE_LABELS,
  EVALUATION_STATUS_LABELS,
  PDI_STATUS_LABELS,
} from '../types'
import type { Employee } from '@/modules/employees/types'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

/**
 * Composable para gerenciar logica de avaliacao de desempenho
 *
 * Centraliza estado, filtros, CRUD de ciclos/competencias/metas/avaliacoes/PDI.
 * Usado pela PerformanceView e seus sub-componentes.
 */
export function usePerformance() {
  const authStore = useAuthStore()
  const { confirm: confirmDialog } = useConfirmDialog()

  // Estado principal
  const cycles = ref<PerformanceCycle[]>([])
  const competencies = ref<Competency[]>([])
  const goals = ref<IndividualGoal[]>([])
  const evaluations = ref<Evaluation[]>([])
  const developmentPlans = ref<DevelopmentPlan[]>([])
  const employees = ref<Employee[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const successMessage = ref('')

  // Tabs
  const activeTab = ref<'cycles' | 'competencies' | 'goals' | 'evaluations' | 'pdi'>('cycles')

  // Filtros
  const filterStatus = ref<string>('')
  const filterYear = ref<number>(new Date().getFullYear())
  const selectedCycleId = ref<number | null>(null)
  const selectedEmployeeIdGoals = ref<number | null>(null)
  const selectedEmployeeIdPDI = ref<number | null>(null)

  // Ciclo expandido
  const expandedCycleId = ref<number | null>(null)

  // Formularios
  const showCycleForm = ref(false)
  const cycleFormLoading = ref(false)
  const cycleFormError = ref('')
  const cycleFormData = ref<CreateCycleData>({
    name: '',
    type: 'semestral',
    startDate: '',
    endDate: '',
    selfEvalDeadline: '',
    managerEvalDeadline: '',
  })

  const showCompetencyForm = ref(false)
  const competencyFormLoading = ref(false)
  const competencyFormError = ref('')
  const competencyFormData = ref<CreateCompetencyData>({
    name: '',
    description: '',
    category: 'behavioral',
  })

  const showAddCompCycleForm = ref(false)
  const addCompCycleLoading = ref(false)
  const addCompCycleError = ref('')
  const addCompCycleData = ref({ cycleId: 0, competencyId: 0, weight: 1 })

  const showGoalForm = ref(false)
  const goalFormLoading = ref(false)
  const goalFormError = ref('')
  const goalFormData = ref<CreateGoalData>({
    cycleId: 0,
    employeeId: 0,
    title: '',
    description: '',
    weight: 1,
    targetValue: null,
  })

  const showEvaluationForm = ref(false)
  const evaluationFormLoading = ref(false)
  const evaluationFormError = ref('')
  const selectedEvaluation = ref<Evaluation | null>(null)
  const evaluationScores = ref<Array<{ competencyId: number; score: number; comments: string }>>([])
  const evaluationComments = ref('')

  const showPDIForm = ref(false)
  const pdiFormLoading = ref(false)
  const pdiFormError = ref('')
  const pdiFormData = ref<CreateDevelopmentPlanData>({
    employeeId: 0,
    cycleId: undefined,
    action: '',
    description: '',
    responsibleId: 0,
    deadline: '',
  })

  const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)
  const canManagePerformance = computed(() => isAdmin.value && authStore.permissions?.performance)

  // Labels
  const cycleStatusLabels = CYCLE_STATUS_LABELS
  const cycleTypeLabels = CYCLE_TYPE_LABELS
  const competencyCategoryLabels = COMPETENCY_CATEGORY_LABELS
  const goalStatusLabels = GOAL_STATUS_LABELS
  const evaluationTypeLabels = EVALUATION_TYPE_LABELS
  const evaluationStatusLabels = EVALUATION_STATUS_LABELS
  const pdiStatusLabels = PDI_STATUS_LABELS

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
   * Carrega ciclos
   */
  async function loadCycles() {
    try {
      isLoading.value = true
      error.value = ''
      const filters: any = { limit: 50 }
      if (filterStatus.value) filters.status = filterStatus.value
      if (filterYear.value) filters.year = filterYear.value

      const response = await performanceService.listCycles(filters)
      cycles.value = response.data
    } catch (err: unknown) {
      error.value = 'Erro ao carregar ciclos.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega competencias
   */
  async function loadCompetencies() {
    try {
      isLoading.value = true
      error.value = ''
      competencies.value = await performanceService.listCompetencies()
    } catch (err: unknown) {
      error.value = 'Erro ao carregar competencias.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega metas de um ciclo
   */
  async function loadGoals() {
    if (!selectedCycleId.value) return

    try {
      isLoading.value = true
      error.value = ''
      goals.value = await performanceService.listGoals(
        selectedCycleId.value,
        selectedEmployeeIdGoals.value || undefined
      )
    } catch (err: unknown) {
      error.value = 'Erro ao carregar metas.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega avaliacoes de um ciclo
   */
  async function loadEvaluations() {
    if (!selectedCycleId.value) return

    try {
      isLoading.value = true
      error.value = ''
      evaluations.value = await performanceService.listEvaluations(selectedCycleId.value)
    } catch (err: unknown) {
      error.value = 'Erro ao carregar avaliacoes.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega PDIs
   */
  async function loadDevelopmentPlans() {
    try {
      isLoading.value = true
      error.value = ''
      developmentPlans.value = await performanceService.listDevelopmentPlans(
        selectedEmployeeIdPDI.value || undefined
      )
    } catch (err: unknown) {
      error.value = 'Erro ao carregar planos de desenvolvimento.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega colaboradores
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
   * Expande/colapsa ciclo
   */
  function toggleExpandCycle(cycleId: number) {
    expandedCycleId.value = expandedCycleId.value === cycleId ? null : cycleId
  }

  // --- CICLO CRUD ---

  function openCycleForm() {
    showCycleForm.value = true
    cycleFormError.value = ''
    cycleFormData.value = {
      name: '',
      type: 'semestral',
      startDate: '',
      endDate: '',
      selfEvalDeadline: '',
      managerEvalDeadline: '',
    }
  }

  function closeCycleForm() {
    showCycleForm.value = false
    cycleFormError.value = ''
  }

  async function submitCycleForm() {
    try {
      cycleFormLoading.value = true
      cycleFormError.value = ''

      if (!cycleFormData.value.name) {
        cycleFormError.value = 'Informe o nome do ciclo'
        return
      }

      await performanceService.createCycle(cycleFormData.value)
      showSuccess('Ciclo criado com sucesso!')
      closeCycleForm()
      loadCycles()
    } catch (err: any) {
      cycleFormError.value = err.response?.data?.message || 'Erro ao criar ciclo'
      console.error(err)
    } finally {
      cycleFormLoading.value = false
    }
  }

  async function advanceCycle(cycleId: number) {
    const result = await confirmDialog({
      title: 'Avancar Ciclo',
      message: 'Confirma avancar o status deste ciclo?',
      variant: 'info',
      confirmLabel: 'Avancar',
    })

    if (!result) return

    try {
      await performanceService.advanceCycleStatus(cycleId)
      showSuccess('Status do ciclo avancado com sucesso!')
      loadCycles()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao avancar ciclo'
      console.error(err)
    }
  }

  // --- COMPETENCIA CRUD ---

  function openCompetencyForm() {
    showCompetencyForm.value = true
    competencyFormError.value = ''
    competencyFormData.value = { name: '', description: '', category: 'behavioral' }
  }

  function closeCompetencyForm() {
    showCompetencyForm.value = false
    competencyFormError.value = ''
  }

  async function submitCompetencyForm() {
    try {
      competencyFormLoading.value = true
      competencyFormError.value = ''

      if (!competencyFormData.value.name) {
        competencyFormError.value = 'Informe o nome da competencia'
        return
      }

      await performanceService.createCompetency(competencyFormData.value)
      showSuccess('Competencia criada com sucesso!')
      closeCompetencyForm()
      loadCompetencies()
    } catch (err: any) {
      competencyFormError.value = err.response?.data?.message || 'Erro ao criar competencia'
      console.error(err)
    } finally {
      competencyFormLoading.value = false
    }
  }

  // --- ADICIONAR COMPETENCIA AO CICLO ---

  function openAddCompCycleForm(cycleId: number) {
    addCompCycleData.value = { cycleId, competencyId: 0, weight: 1 }
    showAddCompCycleForm.value = true
    addCompCycleError.value = ''
  }

  function closeAddCompCycleForm() {
    showAddCompCycleForm.value = false
    addCompCycleError.value = ''
  }

  async function submitAddCompCycleForm() {
    try {
      addCompCycleLoading.value = true
      addCompCycleError.value = ''

      if (!addCompCycleData.value.competencyId) {
        addCompCycleError.value = 'Selecione uma competencia'
        return
      }

      await performanceService.addCompetencyToCycle(
        addCompCycleData.value.cycleId,
        addCompCycleData.value.competencyId,
        addCompCycleData.value.weight
      )
      showSuccess('Competencia adicionada ao ciclo!')
      closeAddCompCycleForm()
      loadCycles()
    } catch (err: any) {
      addCompCycleError.value = err.response?.data?.message || 'Erro ao adicionar competencia'
      console.error(err)
    } finally {
      addCompCycleLoading.value = false
    }
  }

  async function removeCompetencyFromCycle(cycleId: number, competencyId: number) {
    const result = await confirmDialog({
      title: 'Remover Competencia',
      message: 'Confirma remover esta competencia do ciclo?',
      variant: 'warning',
      confirmLabel: 'Remover',
    })

    if (!result) return

    try {
      await performanceService.removeCompetencyFromCycle(cycleId, competencyId)
      showSuccess('Competencia removida do ciclo!')
      loadCycles()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao remover competencia'
      console.error(err)
    }
  }

  // --- META CRUD ---

  function openGoalForm() {
    showGoalForm.value = true
    goalFormError.value = ''
    goalFormData.value = {
      cycleId: selectedCycleId.value || 0,
      employeeId: 0,
      title: '',
      description: '',
      weight: 1,
      targetValue: null,
    }
  }

  function closeGoalForm() {
    showGoalForm.value = false
    goalFormError.value = ''
  }

  async function submitGoalForm() {
    try {
      goalFormLoading.value = true
      goalFormError.value = ''

      if (!goalFormData.value.title) {
        goalFormError.value = 'Informe o titulo da meta'
        return
      }
      if (!goalFormData.value.employeeId) {
        goalFormError.value = 'Selecione um colaborador'
        return
      }

      await performanceService.createGoal(goalFormData.value)
      showSuccess('Meta criada com sucesso!')
      closeGoalForm()
      loadGoals()
    } catch (err: any) {
      goalFormError.value = err.response?.data?.message || 'Erro ao criar meta'
      console.error(err)
    } finally {
      goalFormLoading.value = false
    }
  }

  // --- AVALIACAO ---

  async function openEvaluationForm(evaluationId: number) {
    try {
      isLoading.value = true
      selectedEvaluation.value = await performanceService.getEvaluation(evaluationId)

      const cycle = cycles.value.find(c => c.id === selectedEvaluation.value!.cycleId)
      if (cycle && cycle.cycleCompetencies) {
        evaluationScores.value = cycle.cycleCompetencies.map(cc => ({
          competencyId: cc.competencyId,
          score: 0,
          comments: '',
        }))
      }

      evaluationComments.value = ''
      showEvaluationForm.value = true
      evaluationFormError.value = ''
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar avaliacao'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  function closeEvaluationForm() {
    showEvaluationForm.value = false
    selectedEvaluation.value = null
    evaluationScores.value = []
    evaluationComments.value = ''
    evaluationFormError.value = ''
  }

  async function submitEvaluationForm() {
    try {
      evaluationFormLoading.value = true
      evaluationFormError.value = ''

      const allScored = evaluationScores.value.every(s => s.score > 0)
      if (!allScored) {
        evaluationFormError.value = 'Informe todas as notas'
        return
      }

      const totalScore = evaluationScores.value.reduce((sum, s) => sum + s.score, 0)
      const overallScore = totalScore / evaluationScores.value.length

      const data: SubmitEvaluationData = {
        scores: evaluationScores.value.map(s => ({
          competencyId: s.competencyId,
          score: s.score,
          comments: s.comments,
        })),
        overallScore,
        comments: evaluationComments.value,
      }

      await performanceService.submitEvaluation(selectedEvaluation.value!.id, data)
      showSuccess('Avaliacao submetida com sucesso!')
      closeEvaluationForm()
      loadEvaluations()
    } catch (err: any) {
      evaluationFormError.value = err.response?.data?.message || 'Erro ao submeter avaliacao'
      console.error(err)
    } finally {
      evaluationFormLoading.value = false
    }
  }

  // --- PDI ---

  function openPDIForm() {
    showPDIForm.value = true
    pdiFormError.value = ''
    pdiFormData.value = {
      employeeId: selectedEmployeeIdPDI.value || 0,
      cycleId: undefined,
      action: '',
      description: '',
      responsibleId: 0,
      deadline: '',
    }
  }

  function closePDIForm() {
    showPDIForm.value = false
    pdiFormError.value = ''
  }

  async function submitPDIForm() {
    try {
      pdiFormLoading.value = true
      pdiFormError.value = ''

      if (!pdiFormData.value.action) {
        pdiFormError.value = 'Informe a acao'
        return
      }
      if (!pdiFormData.value.employeeId) {
        pdiFormError.value = 'Selecione um colaborador'
        return
      }
      if (!pdiFormData.value.responsibleId) {
        pdiFormError.value = 'Selecione um responsavel'
        return
      }

      await performanceService.createDevelopmentPlan(pdiFormData.value)
      showSuccess('Plano de desenvolvimento criado com sucesso!')
      closePDIForm()
      loadDevelopmentPlans()
    } catch (err: any) {
      pdiFormError.value = err.response?.data?.message || 'Erro ao criar PDI'
      console.error(err)
    } finally {
      pdiFormLoading.value = false
    }
  }

  async function updatePDIStatus(id: number, status: string) {
    try {
      const data: UpdateDevelopmentPlanData = { status: status as any }
      await performanceService.updateDevelopmentPlan(id, data)
      showSuccess('Status do PDI atualizado!')
      loadDevelopmentPlans()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar PDI'
      console.error(err)
    }
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
   * Retorna classe CSS para badge de status do ciclo
   */
  function cycleStatusClass(status: string): string {
    const classes: Record<string, string> = {
      draft: 'badge-draft',
      self_eval: 'badge-self-eval',
      manager_eval: 'badge-manager-eval',
      calibration: 'badge-calibration',
      closed: 'badge-closed',
    }
    return classes[status] || ''
  }

  /**
   * Retorna classe CSS para badge de status de meta
   */
  function goalStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'badge-pending',
      in_progress: 'badge-in-progress',
      achieved: 'badge-achieved',
      not_achieved: 'badge-not-achieved',
    }
    return classes[status] || ''
  }

  /**
   * Retorna classe CSS para badge de status de avaliacao
   */
  function evaluationStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'badge-pending',
      in_progress: 'badge-in-progress',
      completed: 'badge-completed',
    }
    return classes[status] || ''
  }

  /**
   * Retorna classe CSS para badge de status de PDI
   */
  function pdiStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'badge-pending',
      in_progress: 'badge-in-progress',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled',
    }
    return classes[status] || ''
  }

  /**
   * Inicializa dados
   */
  async function init() {
    if (isAdmin.value) {
      loadEmployees()
    }
    loadCycles()
    loadCompetencies()
  }

  return {
    // Estado
    cycles,
    competencies,
    goals,
    evaluations,
    developmentPlans,
    employees,
    isLoading,
    error,
    successMessage,

    // Tabs
    activeTab,

    // Filtros
    filterStatus,
    filterYear,
    selectedCycleId,
    selectedEmployeeIdGoals,
    selectedEmployeeIdPDI,

    // Ciclo expandido
    expandedCycleId,

    // Formularios
    showCycleForm,
    cycleFormLoading,
    cycleFormError,
    cycleFormData,
    showCompetencyForm,
    competencyFormLoading,
    competencyFormError,
    competencyFormData,
    showAddCompCycleForm,
    addCompCycleLoading,
    addCompCycleError,
    addCompCycleData,
    showGoalForm,
    goalFormLoading,
    goalFormError,
    goalFormData,
    showEvaluationForm,
    evaluationFormLoading,
    evaluationFormError,
    selectedEvaluation,
    evaluationScores,
    evaluationComments,
    showPDIForm,
    pdiFormLoading,
    pdiFormError,
    pdiFormData,

    // Computed
    isAdmin,
    canManagePerformance,

    // Labels
    cycleStatusLabels,
    cycleTypeLabels,
    competencyCategoryLabels,
    goalStatusLabels,
    evaluationTypeLabels,
    evaluationStatusLabels,
    pdiStatusLabels,

    // Metodos
    loadCycles,
    loadCompetencies,
    loadGoals,
    loadEvaluations,
    loadDevelopmentPlans,
    loadEmployees,
    toggleExpandCycle,
    openCycleForm,
    closeCycleForm,
    submitCycleForm,
    advanceCycle,
    openCompetencyForm,
    closeCompetencyForm,
    submitCompetencyForm,
    openAddCompCycleForm,
    closeAddCompCycleForm,
    submitAddCompCycleForm,
    removeCompetencyFromCycle,
    openGoalForm,
    closeGoalForm,
    submitGoalForm,
    openEvaluationForm,
    closeEvaluationForm,
    submitEvaluationForm,
    openPDIForm,
    closePDIForm,
    submitPDIForm,
    updatePDIStatus,
    formatDate,
    cycleStatusClass,
    goalStatusClass,
    evaluationStatusClass,
    pdiStatusClass,
    init,
  }
}
