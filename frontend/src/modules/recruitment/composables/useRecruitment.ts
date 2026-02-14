import { ref, computed } from 'vue'
import recruitmentService from '../services/recruitment.service'
import employeeService from '@/modules/employees/services/employee.service'
import type {
  JobRequisition,
  RecruitmentStage,
  Candidate,
  Interview,
  CreateJobRequisitionData,
  CreateCandidateData,
  CreateInterviewData,
  MoveCandidateData,
} from '../types'
import {
  REQUISITION_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODEL_LABELS,
  CANDIDATE_STATUS_LABELS,
  CANDIDATE_SOURCE_LABELS,
  INTERVIEW_STATUS_LABELS,
} from '../types'
import type { Department, Position, Employee } from '@/modules/employees/types'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

/**
 * Composable para gerenciar logica de recrutamento e selecao
 *
 * Centraliza estado, filtros, CRUD de vagas/candidatos/entrevistas.
 * Usado pela RecruitmentView e seus sub-componentes.
 */
export function useRecruitment() {
  const authStore = useAuthStore()
  const { confirm: confirmDialog } = useConfirmDialog()

  // Estado principal
  const requisitions = ref<JobRequisition[]>([])
  const candidates = ref<Candidate[]>([])
  const stages = ref<RecruitmentStage[]>([])
  const interviews = ref<Interview[]>([])
  const departments = ref<Department[]>([])
  const positions = ref<Position[]>([])
  const employees = ref<Employee[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const successMessage = ref('')
  const actionLoading = ref<string | null>(null)

  // Tabs
  const activeTab = ref<'requisitions' | 'candidates' | 'pipeline' | 'interviews'>('requisitions')

  // Filtros de vagas
  const filterReqStatus = ref<string>('')
  const filterReqDepartment = ref<number | null>(null)
  const filterReqType = ref<string>('')

  // Filtros de candidatos
  const filterCandRequisition = ref<number | null>(null)
  const filterCandStatus = ref<string>('')
  const filterCandStage = ref<number | null>(null)
  const filterCandSearch = ref<string>('')

  // Vaga expandida
  const expandedRequisitionId = ref<number | null>(null)

  // Formulario de vaga
  const showRequisitionForm = ref(false)
  const requisitionFormLoading = ref(false)
  const requisitionFormError = ref('')
  const requisitionFormData = ref<CreateJobRequisitionData>({
    title: '',
    departmentId: 0,
    positionId: null,
    salaryRangeMin: null,
    salaryRangeMax: null,
    employmentType: 'clt',
    workModel: 'onsite',
    headcount: 1,
    description: null,
    requirements: null,
  })

  // Formulario de candidato
  const showCandidateForm = ref(false)
  const candidateFormLoading = ref(false)
  const candidateFormError = ref('')
  const candidateFormData = ref<CreateCandidateData>({
    jobRequisitionId: 0,
    name: '',
    email: '',
    phone: null,
    linkedinUrl: null,
    salaryExpectation: null,
    resumePath: null,
    source: 'website',
    notes: null,
  })

  // Formulario de entrevista
  const showInterviewForm = ref(false)
  const interviewFormLoading = ref(false)
  const interviewFormError = ref('')
  const interviewFormData = ref<CreateInterviewData>({
    candidateId: 0,
    interviewerId: 0,
    stageId: null,
    scheduledAt: '',
    durationMinutes: 60,
    location: null,
    meetingLink: null,
  })

  // Formulario de mover candidato
  const showMoveForm = ref(false)
  const moveFormLoading = ref(false)
  const moveFormError = ref('')
  const selectedCandidateId = ref<number | null>(null)
  const moveFormData = ref<MoveCandidateData>({
    stageId: 0,
    feedback: '',
    score: undefined,
  })

  // Formulario de completar entrevista
  const showCompleteForm = ref(false)
  const completeFormLoading = ref(false)
  const completeFormError = ref('')
  const selectedInterviewId = ref<number | null>(null)
  const completeFormData = ref({
    feedback: '',
    score: 0,
  })

  const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

  // Labels
  const requisitionStatusLabels = REQUISITION_STATUS_LABELS
  const employmentTypeLabels = EMPLOYMENT_TYPE_LABELS
  const workModelLabels = WORK_MODEL_LABELS
  const candidateStatusLabels = CANDIDATE_STATUS_LABELS
  const candidateSourceLabels = CANDIDATE_SOURCE_LABELS
  const interviewStatusLabels = INTERVIEW_STATUS_LABELS

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
   * Carrega vagas
   */
  async function loadRequisitions() {
    try {
      isLoading.value = true
      error.value = ''

      const filters: any = { limit: 100 }
      if (filterReqStatus.value) filters.status = filterReqStatus.value
      if (filterReqDepartment.value) filters.departmentId = filterReqDepartment.value
      if (filterReqType.value) filters.employmentType = filterReqType.value

      const response = await recruitmentService.listRequisitions(filters)
      requisitions.value = response.data
    } catch (err: unknown) {
      error.value = 'Erro ao carregar vagas.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega candidatos
   */
  async function loadCandidates() {
    try {
      isLoading.value = true
      error.value = ''

      const filters: any = { limit: 100 }
      if (filterCandRequisition.value) filters.jobRequisitionId = filterCandRequisition.value
      if (filterCandStatus.value) filters.status = filterCandStatus.value
      if (filterCandStage.value) filters.stageId = filterCandStage.value
      if (filterCandSearch.value) filters.search = filterCandSearch.value

      const response = await recruitmentService.listCandidates(filters)
      candidates.value = response.data
    } catch (err: unknown) {
      error.value = 'Erro ao carregar candidatos.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega etapas do pipeline
   */
  async function loadStages() {
    try {
      stages.value = await recruitmentService.listStages()
    } catch (err: unknown) {
      console.error('Erro ao carregar etapas:', err)
    }
  }

  /**
   * Carrega entrevistas
   */
  async function loadInterviews() {
    try {
      isLoading.value = true
      error.value = ''
      interviews.value = await recruitmentService.listAllInterviews()
    } catch (err: unknown) {
      error.value = 'Erro ao carregar entrevistas.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega dados auxiliares
   */
  async function loadAuxiliaryData() {
    try {
      departments.value = await employeeService.getDepartments()
      positions.value = await employeeService.getPositions()

      if (isAdmin.value) {
        const response = await employeeService.getAll({ limit: 200, status: 'active' })
        employees.value = response.data
      }
    } catch (err: unknown) {
      console.error('Erro ao carregar dados auxiliares:', err)
    }
  }

  /**
   * Expande/colapsa detalhes de uma vaga
   */
  function toggleExpand(requisitionId: number) {
    expandedRequisitionId.value = expandedRequisitionId.value === requisitionId ? null : requisitionId
  }

  /**
   * Helper para executar acoes com loading state
   */
  async function handleAction(actionName: string, callback: () => Promise<void>) {
    if (actionLoading.value) return
    actionLoading.value = actionName
    try {
      await callback()
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message
    } finally {
      actionLoading.value = null
    }
  }

  // --- Vagas CRUD ---

  function openRequisitionForm() {
    showRequisitionForm.value = true
    requisitionFormError.value = ''
    requisitionFormData.value = {
      title: '',
      departmentId: 0,
      positionId: null,
      salaryRangeMin: null,
      salaryRangeMax: null,
      employmentType: 'clt',
      workModel: 'onsite',
      headcount: 1,
      description: null,
      requirements: null,
    }
  }

  function closeRequisitionForm() {
    showRequisitionForm.value = false
    requisitionFormError.value = ''
  }

  async function submitRequisitionForm() {
    try {
      requisitionFormLoading.value = true
      requisitionFormError.value = ''

      if (!requisitionFormData.value.title) {
        requisitionFormError.value = 'Informe o titulo da vaga'
        return
      }
      if (!requisitionFormData.value.departmentId) {
        requisitionFormError.value = 'Selecione o departamento'
        return
      }

      await recruitmentService.createRequisition(requisitionFormData.value)
      showSuccess('Vaga criada com sucesso!')
      closeRequisitionForm()
      loadRequisitions()
    } catch (err: any) {
      requisitionFormError.value = err.response?.data?.message || 'Erro ao criar vaga'
      console.error(err)
    } finally {
      requisitionFormLoading.value = false
    }
  }

  async function approveRequisition(id: number) {
    const result = await confirmDialog({
      title: 'Aprovar Vaga',
      message: 'Confirma a aprovacao desta vaga?',
      variant: 'info',
      confirmLabel: 'Aprovar',
    })

    if (!result) return

    await handleAction('approveRequisition', async () => {
      await recruitmentService.approveRequisition(id)
      showSuccess('Vaga aprovada com sucesso!')
      loadRequisitions()
    })
  }

  async function cancelRequisition(id: number) {
    const result = await confirmDialog({
      title: 'Cancelar Vaga',
      message: 'Confirma o cancelamento desta vaga?',
      variant: 'warning',
      confirmLabel: 'Cancelar Vaga',
    })

    if (!result) return

    await handleAction('cancelRequisition', async () => {
      await recruitmentService.cancelRequisition(id)
      showSuccess('Vaga cancelada com sucesso!')
      loadRequisitions()
    })
  }

  // --- Candidatos CRUD ---

  function openCandidateForm(jobRequisitionId?: number) {
    activeTab.value = 'candidates'
    showCandidateForm.value = true
    candidateFormError.value = ''
    candidateFormData.value = {
      jobRequisitionId: jobRequisitionId || 0,
      name: '',
      email: '',
      phone: null,
      linkedinUrl: null,
      salaryExpectation: null,
      resumePath: null,
      source: 'website',
      notes: null,
    }
  }

  function closeCandidateForm() {
    showCandidateForm.value = false
    candidateFormError.value = ''
  }

  async function submitCandidateForm() {
    try {
      candidateFormLoading.value = true
      candidateFormError.value = ''

      if (!candidateFormData.value.name) {
        candidateFormError.value = 'Informe o nome do candidato'
        return
      }
      if (!candidateFormData.value.email) {
        candidateFormError.value = 'Informe o email do candidato'
        return
      }
      if (!candidateFormData.value.jobRequisitionId) {
        candidateFormError.value = 'Selecione a vaga'
        return
      }

      await recruitmentService.createCandidate(candidateFormData.value)
      showSuccess('Candidato criado com sucesso!')
      closeCandidateForm()
      loadCandidates()
    } catch (err: any) {
      candidateFormError.value = err.response?.data?.message || 'Erro ao criar candidato'
      console.error(err)
    } finally {
      candidateFormLoading.value = false
    }
  }

  function openMoveForm(candidateId: number) {
    selectedCandidateId.value = candidateId
    showMoveForm.value = true
    moveFormError.value = ''
    moveFormData.value = {
      stageId: 0,
      feedback: '',
      score: undefined,
    }
  }

  function closeMoveForm() {
    showMoveForm.value = false
    moveFormError.value = ''
  }

  async function submitMoveForm() {
    try {
      moveFormLoading.value = true
      moveFormError.value = ''

      if (!moveFormData.value.stageId) {
        moveFormError.value = 'Selecione a etapa de destino'
        return
      }

      await recruitmentService.moveCandidate(selectedCandidateId.value!, moveFormData.value)
      showSuccess('Candidato movido com sucesso!')
      closeMoveForm()
      loadCandidates()
    } catch (err: any) {
      moveFormError.value = err.response?.data?.message || 'Erro ao mover candidato'
      console.error(err)
    } finally {
      moveFormLoading.value = false
    }
  }

  async function hireCandidate(id: number) {
    const result = await confirmDialog({
      title: 'Contratar Candidato',
      message: 'Confirma a contratacao deste candidato?',
      variant: 'info',
      confirmLabel: 'Contratar',
    })

    if (!result) return

    await handleAction('hireCandidate', async () => {
      await recruitmentService.hireCandidate(id)
      showSuccess('Candidato contratado com sucesso!')
      loadCandidates()
    })
  }

  async function rejectCandidate(id: number) {
    const result = await confirmDialog({
      title: 'Rejeitar Candidato',
      message: 'Informe o motivo da rejeicao deste candidato:',
      variant: 'danger',
      confirmLabel: 'Rejeitar',
      showInput: true,
      inputPlaceholder: 'Motivo da rejeicao (opcional)...',
      inputRequired: false,
    })

    if (!result) return

    await handleAction('rejectCandidate', async () => {
      const feedback = result !== true ? (result as string) : undefined
      await recruitmentService.rejectCandidate(id, { feedback })
      showSuccess('Candidato rejeitado!')
      loadCandidates()
    })
  }

  // --- Entrevistas ---

  function openInterviewForm(candidateId?: number) {
    activeTab.value = 'interviews'
    showInterviewForm.value = true
    interviewFormError.value = ''
    const now = new Date()
    now.setHours(now.getHours() + 1)
    const scheduledAt = now.toISOString().slice(0, 16)

    interviewFormData.value = {
      candidateId: candidateId || 0,
      interviewerId: 0,
      stageId: null,
      scheduledAt,
      durationMinutes: 60,
      location: null,
      meetingLink: null,
    }
  }

  function closeInterviewForm() {
    showInterviewForm.value = false
    interviewFormError.value = ''
  }

  async function submitInterviewForm() {
    try {
      interviewFormLoading.value = true
      interviewFormError.value = ''

      if (!interviewFormData.value.candidateId) {
        interviewFormError.value = 'Selecione o candidato'
        return
      }
      if (!interviewFormData.value.interviewerId) {
        interviewFormError.value = 'Selecione o entrevistador'
        return
      }

      await recruitmentService.createInterview(interviewFormData.value)
      showSuccess('Entrevista agendada com sucesso!')
      closeInterviewForm()
      await loadCandidates()
      await loadInterviews()
    } catch (err: any) {
      interviewFormError.value = err.response?.data?.message || 'Erro ao agendar entrevista'
      console.error(err)
    } finally {
      interviewFormLoading.value = false
    }
  }

  function openCompleteForm(interviewId: number) {
    selectedInterviewId.value = interviewId
    showCompleteForm.value = true
    completeFormError.value = ''
    completeFormData.value = {
      feedback: '',
      score: 0,
    }
  }

  function closeCompleteForm() {
    showCompleteForm.value = false
    completeFormError.value = ''
  }

  async function submitCompleteForm() {
    try {
      completeFormLoading.value = true
      completeFormError.value = ''

      if (!completeFormData.value.feedback) {
        completeFormError.value = 'Informe o feedback'
        return
      }

      await recruitmentService.completeInterview(selectedInterviewId.value!, completeFormData.value)
      showSuccess('Entrevista completada com sucesso!')
      closeCompleteForm()
      await loadCandidates()
      await loadInterviews()
    } catch (err: any) {
      completeFormError.value = err.response?.data?.message || 'Erro ao completar entrevista'
      console.error(err)
    } finally {
      completeFormLoading.value = false
    }
  }

  async function cancelInterview(id: number) {
    const result = await confirmDialog({
      title: 'Cancelar Entrevista',
      message: 'Confirma o cancelamento desta entrevista?',
      variant: 'warning',
      confirmLabel: 'Cancelar Entrevista',
    })

    if (!result) return

    await handleAction('cancelInterview', async () => {
      await recruitmentService.cancelInterview(id)
      showSuccess('Entrevista cancelada!')
      await loadCandidates()
      await loadInterviews()
    })
  }

  /**
   * Candidatos agrupados por etapa (para pipeline)
   */
  const candidatesByStage = computed(() => {
    const grouped = new Map<number | null, Candidate[]>()

    stages.value.forEach(stage => {
      grouped.set(stage.id, [])
    })

    candidates.value.forEach(candidate => {
      if (candidate.status === 'active') {
        const stageId = candidate.currentStageId
        if (!grouped.has(stageId)) {
          grouped.set(stageId, [])
        }
        grouped.get(stageId)!.push(candidate)
      }
    })

    return grouped
  })

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
   * Formata data e hora para exibicao
   */
  function formatDateTime(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Retorna classe CSS para badge de status
   */
  function statusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      pending_approval: 'badge-pending',
      approved: 'badge-approved',
      open: 'badge-open',
      filled: 'badge-filled',
      cancelled: 'badge-cancelled',
      active: 'badge-active',
      hired: 'badge-hired',
      rejected: 'badge-rejected',
      withdrawn: 'badge-withdrawn',
      scheduled: 'badge-scheduled',
      completed: 'badge-completed',
      no_show: 'badge-cancelled',
    }
    return classes[status] || ''
  }

  /**
   * Busca nome do candidato por ID
   */
  function getCandidateName(candidateId: number): string {
    const candidate = candidates.value.find(c => c.id === candidateId)
    return candidate?.name || `Candidato #${candidateId}`
  }

  /**
   * Inicializa dados
   */
  async function init() {
    await loadAuxiliaryData()
    await loadStages()
    await loadRequisitions()
    await loadCandidates()
  }

  return {
    // Estado
    requisitions,
    candidates,
    stages,
    interviews,
    departments,
    positions,
    employees,
    isLoading,
    error,
    successMessage,
    actionLoading,

    // Tabs
    activeTab,

    // Filtros
    filterReqStatus,
    filterReqDepartment,
    filterReqType,
    filterCandRequisition,
    filterCandStatus,
    filterCandStage,
    filterCandSearch,

    // Vaga expandida
    expandedRequisitionId,

    // Formularios
    showRequisitionForm,
    requisitionFormLoading,
    requisitionFormError,
    requisitionFormData,
    showCandidateForm,
    candidateFormLoading,
    candidateFormError,
    candidateFormData,
    showInterviewForm,
    interviewFormLoading,
    interviewFormError,
    interviewFormData,
    showMoveForm,
    moveFormLoading,
    moveFormError,
    selectedCandidateId,
    moveFormData,
    showCompleteForm,
    completeFormLoading,
    completeFormError,
    selectedInterviewId,
    completeFormData,

    // Computed
    isAdmin,
    candidatesByStage,

    // Labels
    requisitionStatusLabels,
    employmentTypeLabels,
    workModelLabels,
    candidateStatusLabels,
    candidateSourceLabels,
    interviewStatusLabels,

    // Metodos
    loadRequisitions,
    loadCandidates,
    loadStages,
    loadInterviews,
    loadAuxiliaryData,
    toggleExpand,
    openRequisitionForm,
    closeRequisitionForm,
    submitRequisitionForm,
    approveRequisition,
    cancelRequisition,
    openCandidateForm,
    closeCandidateForm,
    submitCandidateForm,
    openMoveForm,
    closeMoveForm,
    submitMoveForm,
    hireCandidate,
    rejectCandidate,
    openInterviewForm,
    closeInterviewForm,
    submitInterviewForm,
    openCompleteForm,
    closeCompleteForm,
    submitCompleteForm,
    cancelInterview,
    formatCurrency,
    formatDate,
    formatDateTime,
    statusBadgeClass,
    getCandidateName,
    init,
  }
}
