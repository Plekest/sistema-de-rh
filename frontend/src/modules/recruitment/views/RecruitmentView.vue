<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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

const authStore = useAuthStore()
const { confirm: confirmDialog } = useConfirmDialog()

// Estado
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

const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

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
    successMessage.value = 'Vaga criada com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Vaga aprovada com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Vaga cancelada com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Candidato criado com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Candidato movido com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Candidato contratado com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Candidato rejeitado!'
    setTimeout(() => { successMessage.value = '' }, 3000)
    loadCandidates()
  })
}

// --- Entrevistas ---

function openInterviewForm(candidateId?: number) {
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
    successMessage.value = 'Entrevista agendada com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Entrevista completada com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Entrevista cancelada!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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

onMounted(async () => {
  await loadAuxiliaryData()
  await loadStages()
  await loadRequisitions()
  await loadCandidates()
})
</script>

<template>
  <div class="recruitment-view">
    <div class="page-header">
      <h1 class="page-title">Recrutamento e Selecao</h1>
      <button v-if="isAdmin" class="btn-primary" @click="openRequisitionForm">Nova Vaga</button>
    </div>

    <!-- Mensagens -->
    <div v-if="successMessage" class="alert alert-success" role="alert">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'requisitions' }"
        @click="activeTab = 'requisitions'; loadRequisitions()"
      >
        Vagas
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'candidates' }"
        @click="activeTab = 'candidates'; loadCandidates()"
      >
        Candidatos
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'pipeline' }"
        @click="activeTab = 'pipeline'; loadCandidates()"
      >
        Pipeline
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'interviews' }"
        @click="activeTab = 'interviews'; loadCandidates(); loadInterviews()"
      >
        Entrevistas
      </button>
    </div>

    <!-- === TAB: VAGAS === -->
    <template v-if="activeTab === 'requisitions'">
      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-group">
          <label for="filter-req-status">Status</label>
          <select id="filter-req-status" v-model="filterReqStatus" @change="loadRequisitions">
            <option value="">Todos os status</option>
            <option v-for="(label, key) in REQUISITION_STATUS_LABELS" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-req-dept">Departamento</label>
          <select id="filter-req-dept" v-model="filterReqDepartment" @change="loadRequisitions">
            <option :value="null">Todos</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-req-type">Tipo</label>
          <select id="filter-req-type" v-model="filterReqType" @change="loadRequisitions">
            <option value="">Todos</option>
            <option v-for="(label, key) in EMPLOYMENT_TYPE_LABELS" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Formulario nova vaga -->
      <div v-if="showRequisitionForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Nova Vaga</h2>
          <button class="btn-close" @click="closeRequisitionForm">Fechar</button>
        </div>

        <div v-if="requisitionFormError" class="alert alert-error" role="alert">{{ requisitionFormError }}</div>

        <form @submit.prevent="submitRequisitionForm" class="form-grid">
          <div class="form-group">
            <label for="req-title">Titulo da Vaga *</label>
            <input id="req-title" type="text" v-model="requisitionFormData.title" required />
          </div>

          <div class="form-group">
            <label for="req-dept">Departamento *</label>
            <select id="req-dept" v-model="requisitionFormData.departmentId" required>
              <option :value="0">Selecione...</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="req-pos">Cargo</label>
            <select id="req-pos" v-model="requisitionFormData.positionId">
              <option :value="null">Selecione...</option>
              <option v-for="pos in positions" :key="pos.id" :value="pos.id">
                {{ pos.title }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="req-type">Tipo de Contrato *</label>
            <select id="req-type" v-model="requisitionFormData.employmentType" required>
              <option v-for="(label, key) in EMPLOYMENT_TYPE_LABELS" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="req-work">Modelo de Trabalho *</label>
            <select id="req-work" v-model="requisitionFormData.workModel" required>
              <option v-for="(label, key) in WORK_MODEL_LABELS" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="req-headcount">Numero de Vagas *</label>
            <input id="req-headcount" type="number" min="1" v-model="requisitionFormData.headcount" required />
          </div>

          <div class="form-group">
            <label for="req-salary-min">Salario Minimo (R$)</label>
            <input id="req-salary-min" type="number" step="0.01" min="0" v-model="requisitionFormData.salaryRangeMin" />
          </div>

          <div class="form-group">
            <label for="req-salary-max">Salario Maximo (R$)</label>
            <input id="req-salary-max" type="number" step="0.01" min="0" v-model="requisitionFormData.salaryRangeMax" />
          </div>

          <div class="form-group form-col-full">
            <label for="req-desc">Descricao da Vaga</label>
            <textarea id="req-desc" v-model="requisitionFormData.description" rows="3"></textarea>
          </div>

          <div class="form-group form-col-full">
            <label for="req-requirements">Requisitos</label>
            <textarea id="req-requirements" v-model="requisitionFormData.requirements" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeRequisitionForm" :disabled="requisitionFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="requisitionFormLoading">
              {{ requisitionFormLoading ? 'Criando...' : 'Criar Vaga' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de vagas -->
      <div v-if="isLoading" class="loading-state">Carregando...</div>

      <div v-else-if="requisitions.length > 0" class="requisitions-list">
        <div v-for="req in requisitions" :key="req.id" class="requisition-card">
          <div class="requisition-header" @click="toggleExpand(req.id)">
            <div class="requisition-info">
              <h3 class="requisition-title">{{ req.title }}</h3>
              <span class="requisition-meta">
                {{ req.department?.name || 'N/A' }} | {{ EMPLOYMENT_TYPE_LABELS[req.employmentType] }} | {{ WORK_MODEL_LABELS[req.workModel] }}
              </span>
            </div>
            <div class="requisition-actions-header">
              <span class="badge" :class="statusBadgeClass(req.status)">
                {{ REQUISITION_STATUS_LABELS[req.status] }}
              </span>
              <span class="expand-indicator">{{ expandedRequisitionId === req.id ? '−' : '+' }}</span>
            </div>
          </div>

          <!-- Detalhes expandidos -->
          <div v-if="expandedRequisitionId === req.id" class="requisition-details">
            <div class="detail-section">
              <div class="detail-row">
                <span class="detail-label">Vagas:</span>
                <span class="detail-value">{{ req.headcount }}</span>
              </div>
              <div v-if="req.salaryRangeMin || req.salaryRangeMax" class="detail-row">
                <span class="detail-label">Faixa Salarial:</span>
                <span class="detail-value">
                  {{ req.salaryRangeMin ? formatCurrency(req.salaryRangeMin) : 'N/A' }} -
                  {{ req.salaryRangeMax ? formatCurrency(req.salaryRangeMax) : 'N/A' }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Criada em:</span>
                <span class="detail-value">{{ formatDate(req.createdAt) }}</span>
              </div>
            </div>

            <div v-if="req.description" class="detail-section">
              <h4 class="detail-section-title">Descricao</h4>
              <p class="detail-text">{{ req.description }}</p>
            </div>

            <div v-if="req.requirements" class="detail-section">
              <h4 class="detail-section-title">Requisitos</h4>
              <p class="detail-text">{{ req.requirements }}</p>
            </div>

            <div class="requisition-admin-actions">
              <button
                v-if="isAdmin && req.status === 'pending_approval'"
                class="btn-action btn-approve"
                :disabled="actionLoading !== null"
                @click.stop="approveRequisition(req.id)"
              >
                {{ actionLoading === 'approveRequisition' ? 'Aprovando...' : 'Aprovar' }}
              </button>
              <button
                v-if="isAdmin && req.status !== 'cancelled' && req.status !== 'filled'"
                class="btn-action btn-cancel"
                :disabled="actionLoading !== null"
                @click.stop="cancelRequisition(req.id)"
              >
                {{ actionLoading === 'cancelRequisition' ? 'Cancelando...' : 'Cancelar' }}
              </button>
              <button
                v-if="isAdmin && (req.status === 'approved' || req.status === 'open')"
                class="btn-action btn-approve"
                :disabled="actionLoading !== null"
                @click.stop="openCandidateForm(req.id)"
              >
                Adicionar Candidato
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-title">Nenhuma vaga encontrada</p>
        <p class="empty-description">Nao ha vagas cadastradas no sistema.</p>
      </div>
    </template>

    <!-- === TAB: CANDIDATOS === -->
    <template v-if="activeTab === 'candidates'">
      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-group">
          <label for="filter-cand-req">Vaga</label>
          <select id="filter-cand-req" v-model="filterCandRequisition" @change="loadCandidates">
            <option :value="null">Todas</option>
            <option v-for="req in requisitions" :key="req.id" :value="req.id">
              {{ req.title }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-cand-status">Status</label>
          <select id="filter-cand-status" v-model="filterCandStatus" @change="loadCandidates">
            <option value="">Todos</option>
            <option v-for="(label, key) in CANDIDATE_STATUS_LABELS" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-cand-stage">Etapa</label>
          <select id="filter-cand-stage" v-model="filterCandStage" @change="loadCandidates">
            <option :value="null">Todas</option>
            <option v-for="stage in stages" :key="stage.id" :value="stage.id">
              {{ stage.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-cand-search">Buscar</label>
          <input
            id="filter-cand-search"
            type="text"
            v-model="filterCandSearch"
            @input="loadCandidates"
            placeholder="Nome ou email"
          />
        </div>
      </div>

      <!-- Formulario novo candidato -->
      <div v-if="showCandidateForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Novo Candidato</h2>
          <button class="btn-close" @click="closeCandidateForm">Fechar</button>
        </div>

        <div v-if="candidateFormError" class="alert alert-error" role="alert">{{ candidateFormError }}</div>

        <form @submit.prevent="submitCandidateForm" class="form-grid">
          <div class="form-group">
            <label for="cand-name">Nome *</label>
            <input id="cand-name" type="text" v-model="candidateFormData.name" required />
          </div>

          <div class="form-group">
            <label for="cand-email">Email *</label>
            <input id="cand-email" type="email" v-model="candidateFormData.email" required />
          </div>

          <div class="form-group">
            <label for="cand-phone">Telefone</label>
            <input id="cand-phone" type="text" v-model="candidateFormData.phone" />
          </div>

          <div class="form-group">
            <label for="cand-req">Vaga *</label>
            <select id="cand-req" v-model="candidateFormData.jobRequisitionId" required>
              <option :value="0">Selecione...</option>
              <option v-for="req in requisitions.filter(r => r.status === 'open' || r.status === 'approved')" :key="req.id" :value="req.id">
                {{ req.title }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="cand-source">Origem *</label>
            <select id="cand-source" v-model="candidateFormData.source" required>
              <option v-for="(label, key) in CANDIDATE_SOURCE_LABELS" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="cand-salary">Pretensao Salarial (R$)</label>
            <input id="cand-salary" type="number" step="0.01" min="0" v-model="candidateFormData.salaryExpectation" />
          </div>

          <div class="form-group form-col-full">
            <label for="cand-linkedin">LinkedIn URL</label>
            <input id="cand-linkedin" type="url" v-model="candidateFormData.linkedinUrl" />
          </div>

          <div class="form-group form-col-full">
            <label for="cand-notes">Observacoes</label>
            <textarea id="cand-notes" v-model="candidateFormData.notes" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeCandidateForm" :disabled="candidateFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="candidateFormLoading">
              {{ candidateFormLoading ? 'Criando...' : 'Criar Candidato' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Formulario mover candidato -->
      <div v-if="showMoveForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Mover Candidato de Etapa</h2>
          <button class="btn-close" @click="closeMoveForm">Fechar</button>
        </div>

        <div v-if="moveFormError" class="alert alert-error" role="alert">{{ moveFormError }}</div>

        <form @submit.prevent="submitMoveForm" class="form-grid">
          <div class="form-group">
            <label for="move-stage">Etapa de Destino *</label>
            <select id="move-stage" v-model="moveFormData.stageId" required>
              <option :value="0">Selecione...</option>
              <option v-for="stage in stages" :key="stage.id" :value="stage.id">
                {{ stage.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="move-score">Nota (0-100)</label>
            <input id="move-score" type="number" min="0" max="100" v-model="moveFormData.score" />
          </div>

          <div class="form-group form-col-full">
            <label for="move-feedback">Feedback</label>
            <textarea id="move-feedback" v-model="moveFormData.feedback" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeMoveForm" :disabled="moveFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="moveFormLoading">
              {{ moveFormLoading ? 'Movendo...' : 'Mover' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de candidatos -->
      <div v-if="!showCandidateForm && !showMoveForm" class="candidates-actions-bar">
        <button v-if="isAdmin" class="btn-primary" @click="openCandidateForm()">Novo Candidato</button>
      </div>

      <div v-if="isLoading" class="loading-state">Carregando...</div>

      <div v-else-if="candidates.length > 0" class="candidates-list">
        <div v-for="cand in candidates" :key="cand.id" class="candidate-card">
          <div class="candidate-header">
            <div class="candidate-info">
              <h3 class="candidate-name">{{ cand.name }}</h3>
              <span class="candidate-meta">
                {{ cand.email }} | {{ CANDIDATE_SOURCE_LABELS[cand.source] }}
              </span>
              <span v-if="cand.jobRequisition" class="candidate-job">
                Vaga: {{ cand.jobRequisition.title }}
              </span>
            </div>
            <div class="candidate-status-info">
              <span class="badge" :class="statusBadgeClass(cand.status)">
                {{ CANDIDATE_STATUS_LABELS[cand.status] }}
              </span>
              <span v-if="cand.currentStage" class="candidate-stage">
                Etapa: {{ cand.currentStage.name }}
              </span>
            </div>
          </div>

          <div v-if="cand.status === 'active' && isAdmin" class="candidate-actions">
            <button class="btn-action btn-approve" :disabled="actionLoading !== null" @click="openMoveForm(cand.id)">
              Mover Etapa
            </button>
            <button class="btn-action btn-approve" :disabled="actionLoading !== null" @click="openInterviewForm(cand.id)">
              Agendar Entrevista
            </button>
            <button class="btn-action btn-approve" :disabled="actionLoading !== null" @click="hireCandidate(cand.id)">
              {{ actionLoading === 'hireCandidate' ? 'Contratando...' : 'Contratar' }}
            </button>
            <button class="btn-action btn-cancel" :disabled="actionLoading !== null" @click="rejectCandidate(cand.id)">
              {{ actionLoading === 'rejectCandidate' ? 'Rejeitando...' : 'Rejeitar' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-title">Nenhum candidato encontrado</p>
        <p class="empty-description">Nao ha candidatos cadastrados.</p>
      </div>
    </template>

    <!-- === TAB: PIPELINE === -->
    <template v-if="activeTab === 'pipeline'">
      <div v-if="isLoading" class="loading-state">Carregando...</div>

      <div v-else class="pipeline-view">
        <div v-for="stage in stages" :key="stage.id" class="pipeline-stage">
          <div class="pipeline-stage-header">
            <h3 class="pipeline-stage-title">{{ stage.name }}</h3>
            <span class="pipeline-stage-count">{{ candidatesByStage.get(stage.id)?.length || 0 }}</span>
          </div>

          <div class="pipeline-cards">
            <div
              v-for="cand in candidatesByStage.get(stage.id)"
              :key="cand.id"
              class="pipeline-card"
            >
              <div class="pipeline-card-name">{{ cand.name }}</div>
              <div class="pipeline-card-job">{{ cand.jobRequisition?.title }}</div>
              <div v-if="isAdmin" class="pipeline-card-actions">
                <button class="btn-action btn-approve btn-tiny" @click="openMoveForm(cand.id)">
                  Mover
                </button>
              </div>
            </div>

            <div v-if="!candidatesByStage.get(stage.id)?.length" class="pipeline-empty">
              Nenhum candidato
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- === TAB: ENTREVISTAS === -->
    <template v-if="activeTab === 'interviews'">
      <!-- Formulario nova entrevista -->
      <div v-if="showInterviewForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Agendar Entrevista</h2>
          <button class="btn-close" @click="closeInterviewForm">Fechar</button>
        </div>

        <div v-if="interviewFormError" class="alert alert-error" role="alert">{{ interviewFormError }}</div>

        <form @submit.prevent="submitInterviewForm" class="form-grid">
          <div class="form-group">
            <label for="int-cand">Candidato *</label>
            <select id="int-cand" v-model="interviewFormData.candidateId" required>
              <option :value="0">Selecione...</option>
              <option v-for="cand in candidates.filter(c => c.status === 'active')" :key="cand.id" :value="cand.id">
                {{ cand.name }} - {{ cand.jobRequisition?.title }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="int-interviewer">Entrevistador *</label>
            <select id="int-interviewer" v-model="interviewFormData.interviewerId" required>
              <option :value="0">Selecione...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.fullName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="int-stage">Etapa</label>
            <select id="int-stage" v-model="interviewFormData.stageId">
              <option :value="null">N/A</option>
              <option v-for="stage in stages" :key="stage.id" :value="stage.id">
                {{ stage.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="int-duration">Duracao (minutos) *</label>
            <input id="int-duration" type="number" min="15" step="15" v-model="interviewFormData.durationMinutes" required />
          </div>

          <div class="form-group form-col-full">
            <label for="int-scheduled">Data e Hora *</label>
            <input id="int-scheduled" type="datetime-local" v-model="interviewFormData.scheduledAt" required />
          </div>

          <div class="form-group form-col-full">
            <label for="int-location">Local</label>
            <input id="int-location" type="text" v-model="interviewFormData.location" />
          </div>

          <div class="form-group form-col-full">
            <label for="int-link">Link da Reuniao</label>
            <input id="int-link" type="url" v-model="interviewFormData.meetingLink" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeInterviewForm" :disabled="interviewFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="interviewFormLoading">
              {{ interviewFormLoading ? 'Agendando...' : 'Agendar' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Formulario completar entrevista -->
      <div v-if="showCompleteForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Completar Entrevista</h2>
          <button class="btn-close" @click="closeCompleteForm">Fechar</button>
        </div>

        <div v-if="completeFormError" class="alert alert-error" role="alert">{{ completeFormError }}</div>

        <form @submit.prevent="submitCompleteForm" class="form-grid">
          <div class="form-group">
            <label for="comp-score">Nota (0-100) *</label>
            <input id="comp-score" type="number" min="0" max="100" v-model="completeFormData.score" required />
          </div>

          <div class="form-group form-col-full">
            <label for="comp-feedback">Feedback *</label>
            <textarea id="comp-feedback" v-model="completeFormData.feedback" rows="4" required></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeCompleteForm" :disabled="completeFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="completeFormLoading">
              {{ completeFormLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de entrevistas -->
      <div v-if="!showInterviewForm && !showCompleteForm" class="interviews-actions-bar">
        <button v-if="isAdmin" class="btn-primary" @click="openInterviewForm()">Agendar Entrevista</button>
      </div>

      <div v-if="isLoading" class="loading-state">Carregando...</div>

      <div v-else-if="interviews.length > 0" class="interviews-list">
        <div v-for="interview in interviews" :key="interview.id" class="interview-card">
          <div class="interview-header">
            <div class="interview-info">
              <h3 class="interview-candidate">{{ getCandidateName(interview.candidateId) }}</h3>
              <span class="interview-meta">
                {{ formatDateTime(interview.scheduledAt) }} | {{ interview.durationMinutes }} min
              </span>
              <span v-if="interview.interviewer" class="interview-interviewer">
                Entrevistador: {{ interview.interviewer.fullName }}
              </span>
            </div>
            <span class="badge" :class="statusBadgeClass(interview.status)">
              {{ INTERVIEW_STATUS_LABELS[interview.status] }}
            </span>
          </div>

          <div v-if="interview.location || interview.meetingLink" class="interview-details">
            <span v-if="interview.location" class="interview-location">Local: {{ interview.location }}</span>
            <a v-if="interview.meetingLink" :href="interview.meetingLink" target="_blank" class="interview-link">
              Link da Reuniao
            </a>
          </div>

          <div v-if="interview.feedback" class="interview-feedback">
            <strong>Feedback:</strong> {{ interview.feedback }}
            <span v-if="interview.score !== null" class="interview-score">Nota: {{ interview.score }}</span>
          </div>

          <div v-if="isAdmin && interview.status === 'scheduled'" class="interview-actions">
            <button class="btn-action btn-approve" :disabled="actionLoading !== null" @click="openCompleteForm(interview.id)">
              Completar
            </button>
            <button class="btn-action btn-cancel" :disabled="actionLoading !== null" @click="cancelInterview(interview.id)">
              {{ actionLoading === 'cancelInterview' ? 'Cancelando...' : 'Cancelar' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-title">Nenhuma entrevista encontrada</p>
        <p class="empty-description">Nao ha entrevistas agendadas.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.recruitment-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.tab {
  padding: 0.625rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: #4a5568;
}

.tab-active {
  color: #667eea;
  border-bottom-color: #667eea;
}

/* Botoes */
.btn-primary {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background: #fff;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-close {
  padding: 0.375rem 0.875rem;
  background: transparent;
  color: #718096;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f7fafc;
  color: #4a5568;
}

.btn-action {
  padding: 0.25rem 0.625rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 0.125rem;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-approve {
  background: #c6f6d5;
  color: #276749;
}

.btn-approve:hover:not(:disabled) {
  background: #9ae6b4;
}

.btn-cancel {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-cancel:hover:not(:disabled) {
  background: #cbd5e0;
}

.btn-tiny {
  padding: 0.125rem 0.5rem;
  font-size: 0.688rem;
}

/* Alertas */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.alert-success {
  background: #c6f6d5;
  border: 1px solid #9ae6b4;
  color: #276749;
}

.alert-error {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #c53030;
}

/* Filtros */
.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  background: #fff;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 150px;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-group select,
.filter-group input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.filter-group select:focus,
.filter-group input:focus {
  border-color: #667eea;
}

/* Formulario */
.form-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-col-full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.813rem;
  font-weight: 600;
  color: #4a5568;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Cards de vagas */
.requisitions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.requisition-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.requisition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.requisition-header:hover {
  background: #f7fafc;
}

.requisition-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.requisition-title {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.requisition-meta {
  font-size: 0.813rem;
  color: #718096;
}

.requisition-actions-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.expand-indicator {
  font-size: 1.25rem;
  color: #a0aec0;
  font-weight: 300;
  width: 24px;
  text-align: center;
}

.requisition-details {
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1.25rem;
}

.detail-section {
  margin-bottom: 1rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
  font-size: 0.813rem;
}

.detail-label {
  font-weight: 600;
  color: #4a5568;
}

.detail-value {
  color: #2d3748;
}

.detail-section-title {
  font-size: 0.813rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin: 0 0 0.5rem;
}

.detail-text {
  font-size: 0.813rem;
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

.requisition-admin-actions {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #edf2f7;
  display: flex;
  gap: 0.5rem;
}

/* Candidatos */
.candidates-actions-bar,
.interviews-actions-bar {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-end;
}

.candidates-list,
.interviews-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.candidate-card,
.interview-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem 1.25rem;
}

.candidate-header,
.interview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.candidate-info,
.interview-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.candidate-name,
.interview-candidate {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.candidate-meta,
.candidate-job,
.interview-meta,
.interview-interviewer {
  font-size: 0.813rem;
  color: #718096;
}

.candidate-status-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.candidate-stage {
  font-size: 0.75rem;
  color: #718096;
}

.candidate-actions,
.interview-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.interview-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.813rem;
  color: #718096;
}

.interview-link {
  color: #667eea;
  text-decoration: none;
}

.interview-link:hover {
  text-decoration: underline;
}

.interview-feedback {
  background: #f7fafc;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.813rem;
  color: #2d3748;
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
}

.interview-score {
  display: block;
  margin-top: 0.25rem;
  font-weight: 600;
  color: #667eea;
}

/* Pipeline */
.pipeline-view {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.pipeline-stage {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.pipeline-stage-header {
  background: #f7fafc;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.pipeline-stage-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.pipeline-stage-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: #718096;
  background: #e2e8f0;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
}

.pipeline-cards {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 100px;
}

.pipeline-card {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.625rem;
}

.pipeline-card-name {
  font-size: 0.813rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.pipeline-card-job {
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 0.375rem;
}

.pipeline-card-actions {
  display: flex;
  gap: 0.25rem;
}

.pipeline-empty {
  text-align: center;
  color: #a0aec0;
  font-size: 0.75rem;
  padding: 1rem 0;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-pending {
  background: #fef3c7;
  color: #92400e;
}

.badge-approved {
  background: #d1fae5;
  color: #065f46;
}

.badge-open {
  background: #dbeafe;
  color: #1e40af;
}

.badge-filled {
  background: #e0e7ff;
  color: #4338ca;
}

.badge-cancelled {
  background: #e2e8f0;
  color: #4a5568;
}

.badge-active {
  background: #d1fae5;
  color: #065f46;
}

.badge-hired {
  background: #c7d2fe;
  color: #4338ca;
}

.badge-rejected {
  background: #fecaca;
  color: #991b1b;
}

.badge-withdrawn {
  background: #e2e8f0;
  color: #4a5568;
}

.badge-scheduled {
  background: #dbeafe;
  color: #1e40af;
}

.badge-completed {
  background: #d1fae5;
  color: #065f46;
}

/* Estados */
.loading-state {
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #a0aec0;
  font-size: 0.875rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.empty-state p {
  margin: 0;
}

.empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 0.5rem !important;
}

.empty-description {
  font-size: 0.875rem;
  color: #a0aec0;
  margin: 0 !important;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .tabs::-webkit-scrollbar {
    display: none;
  }

  .tab {
    white-space: nowrap;
    flex-shrink: 0;
    padding: 0.625rem 0.875rem;
    font-size: 0.813rem;
  }

  .filters-bar {
    flex-direction: column;
  }

  .filter-group {
    min-width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .pipeline-view {
    grid-template-columns: 1fr;
  }

  .requisition-header,
  .candidate-header,
  .interview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .candidate-status-info {
    align-items: flex-start;
  }

  .candidate-actions,
  .interview-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .requisition-admin-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .form-card {
    padding: 1rem;
  }

  .requisition-details {
    padding: 0.75rem;
  }

  .candidate-card,
  .interview-card {
    padding: 0.75rem;
  }

  .pipeline-cards {
    padding: 0.5rem;
  }
}
</style>
