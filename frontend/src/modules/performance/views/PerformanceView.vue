<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
  CreateEvaluationData,
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

const authStore = useAuthStore()
const { confirm: confirmDialog } = useConfirmDialog()

// Estado
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

const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

const canManagePerformance = computed(() =>
  (authStore.isAdmin || authStore.isManager) &&
  authStore.permissions?.performance
)

// Ciclo selecionado para expandir detalhes
const expandedCycleId = ref<number | null>(null)

// Filtros
const filterStatus = ref<string>('')
const filterYear = ref<number>(new Date().getFullYear())
const selectedCycleId = ref<number | null>(null)
const selectedEmployeeIdGoals = ref<number | null>(null)
const selectedEmployeeIdPDI = ref<number | null>(null)

// Formulario novo ciclo
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

// Formulario nova competencia
const showCompetencyForm = ref(false)
const competencyFormLoading = ref(false)
const competencyFormError = ref('')
const competencyFormData = ref<CreateCompetencyData>({
  name: '',
  description: '',
  category: 'behavioral',
})

// Formulario adicionar competencia ao ciclo
const showAddCompCycleForm = ref(false)
const addCompCycleLoading = ref(false)
const addCompCycleError = ref('')
const addCompCycleData = ref({ cycleId: 0, competencyId: 0, weight: 1 })

// Formulario nova meta
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

// Formulario avaliacao
const showEvaluationForm = ref(false)
const evaluationFormLoading = ref(false)
const evaluationFormError = ref('')
const selectedEvaluation = ref<Evaluation | null>(null)
const evaluationScores = ref<Array<{ competencyId: number; score: number; comments: string }>>([])
const evaluationComments = ref('')

// Formulario PDI
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
    successMessage.value = 'Ciclo criado com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Status do ciclo avancado com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Competencia criada com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Competencia adicionada ao ciclo!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Competencia removida do ciclo!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Meta criada com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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

    // Busca competencias do ciclo para montar formulario
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

    // Valida notas
    const allScored = evaluationScores.value.every(s => s.score > 0)
    if (!allScored) {
      evaluationFormError.value = 'Informe todas as notas'
      return
    }

    // Calcula nota geral (media simples)
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
    successMessage.value = 'Avaliacao submetida com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Plano de desenvolvimento criado com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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
    successMessage.value = 'Status do PDI atualizado!'
    setTimeout(() => { successMessage.value = '' }, 3000)
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

const cycleYearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

onMounted(() => {
  if (isAdmin.value) {
    loadEmployees()
  }
  loadCycles()
  loadCompetencies()
})
</script>

<template>
  <div class="performance-view">
    <div class="page-header">
      <h1 class="page-title">Avaliacao de Desempenho</h1>
      <button v-if="canManagePerformance && activeTab === 'cycles'" class="btn-primary" @click="openCycleForm">
        Novo Ciclo
      </button>
      <button v-if="canManagePerformance && activeTab === 'competencies'" class="btn-primary" @click="openCompetencyForm">
        Nova Competencia
      </button>
      <button v-if="canManagePerformance && activeTab === 'goals' && selectedCycleId" class="btn-primary" @click="openGoalForm">
        Nova Meta
      </button>
      <button v-if="canManagePerformance && activeTab === 'pdi'" class="btn-primary" @click="openPDIForm">
        Novo PDI
      </button>
    </div>

    <!-- Mensagens -->
    <div v-if="successMessage" class="alert alert-success" role="alert">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'cycles' }"
        @click="activeTab = 'cycles'; loadCycles()"
      >
        Ciclos
      </button>
      <button
        v-if="canManagePerformance"
        class="tab"
        :class="{ 'tab-active': activeTab === 'competencies' }"
        @click="activeTab = 'competencies'; loadCompetencies()"
      >
        Competencias
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'goals' }"
        @click="activeTab = 'goals'"
      >
        Metas
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'evaluations' }"
        @click="activeTab = 'evaluations'"
      >
        Avaliacoes
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'pdi' }"
        @click="activeTab = 'pdi'; loadDevelopmentPlans()"
      >
        PDI
      </button>
    </div>

    <!-- === TAB: CICLOS === -->
    <template v-if="activeTab === 'cycles'">
      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-group">
          <label for="filter-status">Status</label>
          <select id="filter-status" v-model="filterStatus" @change="loadCycles">
            <option value="">Todos</option>
            <option v-for="(label, key) in CYCLE_STATUS_LABELS" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-year">Ano</label>
          <select id="filter-year" v-model="filterYear" @change="loadCycles">
            <option v-for="year in cycleYearOptions" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>

      <!-- Formulario novo ciclo -->
      <div v-if="showCycleForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Novo Ciclo</h2>
          <button class="btn-close" @click="closeCycleForm">Fechar</button>
        </div>

        <div v-if="cycleFormError" class="alert alert-error" role="alert">{{ cycleFormError }}</div>

        <form @submit.prevent="submitCycleForm" class="form-grid">
          <div class="form-group form-col-full">
            <label for="cycle-name">Nome *</label>
            <input id="cycle-name" type="text" v-model="cycleFormData.name" required />
          </div>

          <div class="form-group">
            <label for="cycle-type">Tipo *</label>
            <select id="cycle-type" v-model="cycleFormData.type" required>
              <option v-for="(label, key) in CYCLE_TYPE_LABELS" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="cycle-start">Data Inicio *</label>
            <input id="cycle-start" type="date" v-model="cycleFormData.startDate" required />
          </div>

          <div class="form-group">
            <label for="cycle-end">Data Fim *</label>
            <input id="cycle-end" type="date" v-model="cycleFormData.endDate" required />
          </div>

          <div class="form-group">
            <label for="cycle-self-deadline">Prazo Autoavaliacao *</label>
            <input id="cycle-self-deadline" type="date" v-model="cycleFormData.selfEvalDeadline" required />
          </div>

          <div class="form-group">
            <label for="cycle-manager-deadline">Prazo Avaliacao Gestor *</label>
            <input id="cycle-manager-deadline" type="date" v-model="cycleFormData.managerEvalDeadline" required />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeCycleForm" :disabled="cycleFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="cycleFormLoading">
              {{ cycleFormLoading ? 'Criando...' : 'Criar Ciclo' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Formulario adicionar competencia ao ciclo -->
      <div v-if="showAddCompCycleForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Adicionar Competencia ao Ciclo</h2>
          <button class="btn-close" @click="closeAddCompCycleForm">Fechar</button>
        </div>

        <div v-if="addCompCycleError" class="alert alert-error" role="alert">{{ addCompCycleError }}</div>

        <form @submit.prevent="submitAddCompCycleForm" class="form-grid">
          <div class="form-group">
            <label for="comp-select">Competencia *</label>
            <select id="comp-select" v-model="addCompCycleData.competencyId" required>
              <option :value="0">Selecione...</option>
              <option v-for="comp in competencies.filter(c => c.isActive)" :key="comp.id" :value="comp.id">
                {{ comp.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="comp-weight">Peso *</label>
            <input id="comp-weight" type="number" step="0.1" min="0" v-model="addCompCycleData.weight" required />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeAddCompCycleForm" :disabled="addCompCycleLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="addCompCycleLoading">
              {{ addCompCycleLoading ? 'Adicionando...' : 'Adicionar' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de ciclos -->
      <div v-if="isLoading" class="loading-state">Carregando...</div>

      <div v-else-if="cycles.length > 0" class="cycles-list">
        <div v-for="cycle in cycles" :key="cycle.id" class="cycle-card">
          <div class="cycle-header" @click="toggleExpandCycle(cycle.id)">
            <div class="cycle-info">
              <span class="cycle-type-tag">{{ CYCLE_TYPE_LABELS[cycle.type] }}</span>
              <h3 class="cycle-name">{{ cycle.name }}</h3>
              <span class="badge" :class="cycleStatusClass(cycle.status)">
                {{ CYCLE_STATUS_LABELS[cycle.status] }}
              </span>
            </div>
            <div class="cycle-actions-header">
              <span class="cycle-dates">
                {{ formatDate(cycle.startDate) }} - {{ formatDate(cycle.endDate) }}
              </span>
              <span class="expand-indicator">{{ expandedCycleId === cycle.id ? '−' : '+' }}</span>
            </div>
          </div>

          <!-- Detalhes expandidos -->
          <div v-if="expandedCycleId === cycle.id" class="cycle-details">
            <div class="detail-section">
              <h4 class="detail-title">Prazos</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Autoavaliacao</span>
                  <span class="detail-value">{{ formatDate(cycle.selfEvalDeadline) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Avaliacao Gestor</span>
                  <span class="detail-value">{{ formatDate(cycle.managerEvalDeadline) }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <div class="detail-section-header">
                <h4 class="detail-title">Competencias Avaliadas</h4>
                <button
                  v-if="canManagePerformance && cycle.status === 'draft'"
                  class="btn-small"
                  @click.stop="openAddCompCycleForm(cycle.id)"
                >
                  Adicionar Competencia
                </button>
              </div>

              <div v-if="cycle.cycleCompetencies && cycle.cycleCompetencies.length > 0" class="competencies-list">
                <div v-for="cc in cycle.cycleCompetencies" :key="cc.id" class="competency-row">
                  <span class="competency-name">{{ cc.competency?.name || 'N/A' }}</span>
                  <span class="competency-weight">Peso: {{ cc.weight }}</span>
                  <button
                    v-if="canManagePerformance && cycle.status === 'draft'"
                    class="btn-action btn-cancel btn-tiny"
                    @click.stop="removeCompetencyFromCycle(cycle.id, cc.competencyId)"
                  >
                    Remover
                  </button>
                </div>
              </div>
              <div v-else class="empty-section">Nenhuma competencia associada.</div>
            </div>

            <div v-if="canManagePerformance" class="cycle-admin-actions">
              <button
                v-if="cycle.status !== 'closed'"
                class="btn-action btn-approve"
                @click.stop="advanceCycle(cycle.id)"
              >
                Avancar Status
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-title">Nenhum ciclo encontrado</p>
        <p class="empty-description">Nao ha ciclos de avaliacao cadastrados.</p>
      </div>
    </template>

    <!-- === TAB: COMPETENCIAS === -->
    <template v-if="activeTab === 'competencies' && canManagePerformance">
      <!-- Formulario nova competencia -->
      <div v-if="showCompetencyForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Nova Competencia</h2>
          <button class="btn-close" @click="closeCompetencyForm">Fechar</button>
        </div>

        <div v-if="competencyFormError" class="alert alert-error" role="alert">{{ competencyFormError }}</div>

        <form @submit.prevent="submitCompetencyForm" class="form-grid">
          <div class="form-group">
            <label for="comp-name">Nome *</label>
            <input id="comp-name" type="text" v-model="competencyFormData.name" required />
          </div>

          <div class="form-group">
            <label for="comp-category">Categoria *</label>
            <select id="comp-category" v-model="competencyFormData.category" required>
              <option v-for="(label, key) in COMPETENCY_CATEGORY_LABELS" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <div class="form-group form-col-full">
            <label for="comp-desc">Descricao *</label>
            <textarea id="comp-desc" v-model="competencyFormData.description" rows="3" required></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeCompetencyForm" :disabled="competencyFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="competencyFormLoading">
              {{ competencyFormLoading ? 'Criando...' : 'Criar Competencia' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de competencias -->
      <div v-if="isLoading" class="loading-state">Carregando...</div>

      <div v-else-if="competencies.length > 0" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Descricao</th>
              <th class="th-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comp in competencies" :key="comp.id">
              <td class="td-name">{{ comp.name }}</td>
              <td>{{ COMPETENCY_CATEGORY_LABELS[comp.category] }}</td>
              <td class="td-description">{{ comp.description }}</td>
              <td class="td-center">
                <span class="badge" :class="comp.isActive ? 'badge-active' : 'badge-inactive'">
                  {{ comp.isActive ? 'Ativa' : 'Inativa' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <p class="empty-title">Nenhuma competencia encontrada</p>
        <p class="empty-description">Nao ha competencias cadastradas no sistema.</p>
      </div>
    </template>

    <!-- === TAB: METAS === -->
    <template v-if="activeTab === 'goals'">
      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-group filter-grow">
          <label for="goal-cycle">Ciclo</label>
          <select id="goal-cycle" v-model="selectedCycleId" @change="loadGoals">
            <option :value="null">Selecione um ciclo...</option>
            <option v-for="cycle in cycles" :key="cycle.id" :value="cycle.id">
              {{ cycle.name }}
            </option>
          </select>
        </div>
        <div v-if="canManagePerformance" class="filter-group filter-grow">
          <label for="goal-employee">Colaborador</label>
          <select id="goal-employee" v-model="selectedEmployeeIdGoals" @change="loadGoals">
            <option :value="null">Todos</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.fullName }}
            </option>
          </select>
        </div>
      </div>

      <!-- Formulario nova meta -->
      <div v-if="showGoalForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Nova Meta</h2>
          <button class="btn-close" @click="closeGoalForm">Fechar</button>
        </div>

        <div v-if="goalFormError" class="alert alert-error" role="alert">{{ goalFormError }}</div>

        <form @submit.prevent="submitGoalForm" class="form-grid">
          <div class="form-group">
            <label for="goal-emp">Colaborador *</label>
            <select id="goal-emp" v-model="goalFormData.employeeId" required>
              <option :value="0">Selecione...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.fullName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="goal-weight">Peso *</label>
            <input id="goal-weight" type="number" step="0.1" min="0" v-model="goalFormData.weight" required />
          </div>

          <div class="form-group form-col-full">
            <label for="goal-title">Titulo *</label>
            <input id="goal-title" type="text" v-model="goalFormData.title" required />
          </div>

          <div class="form-group form-col-full">
            <label for="goal-desc">Descricao *</label>
            <textarea id="goal-desc" v-model="goalFormData.description" rows="3" required></textarea>
          </div>

          <div class="form-group">
            <label for="goal-target">Valor Alvo</label>
            <input id="goal-target" type="text" v-model="goalFormData.targetValue" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeGoalForm" :disabled="goalFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="goalFormLoading">
              {{ goalFormLoading ? 'Criando...' : 'Criar Meta' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de metas -->
      <div v-if="!selectedCycleId" class="empty-state">
        <p class="empty-title">Selecione um ciclo</p>
        <p class="empty-description">Escolha um ciclo para ver as metas cadastradas.</p>
      </div>

      <div v-else-if="isLoading" class="loading-state">Carregando...</div>

      <div v-else-if="goals.length > 0" class="goals-list">
        <div v-for="goal in goals" :key="goal.id" class="goal-card">
          <div class="goal-header">
            <div class="goal-info">
              <h3 class="goal-title">{{ goal.title }}</h3>
              <span class="goal-employee">{{ goal.employee?.fullName || 'N/A' }}</span>
            </div>
            <span class="badge" :class="goalStatusClass(goal.status)">
              {{ GOAL_STATUS_LABELS[goal.status] }}
            </span>
          </div>
          <p class="goal-description">{{ goal.description }}</p>
          <div class="goal-details">
            <div class="goal-detail-item">
              <span class="goal-detail-label">Peso</span>
              <span class="goal-detail-value">{{ goal.weight }}</span>
            </div>
            <div v-if="goal.targetValue" class="goal-detail-item">
              <span class="goal-detail-label">Alvo</span>
              <span class="goal-detail-value">{{ goal.targetValue }}</span>
            </div>
            <div v-if="goal.achievedValue !== null" class="goal-detail-item">
              <span class="goal-detail-label">Atingido</span>
              <span class="goal-detail-value">{{ goal.achievedValue }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-title">Nenhuma meta encontrada</p>
        <p class="empty-description">Nao ha metas cadastradas para este ciclo.</p>
      </div>
    </template>

    <!-- === TAB: AVALIACOES === -->
    <template v-if="activeTab === 'evaluations'">
      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-group filter-grow">
          <label for="eval-cycle">Ciclo</label>
          <select id="eval-cycle" v-model="selectedCycleId" @change="loadEvaluations">
            <option :value="null">Selecione um ciclo...</option>
            <option v-for="cycle in cycles" :key="cycle.id" :value="cycle.id">
              {{ cycle.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Formulario avaliacao -->
      <div v-if="showEvaluationForm && selectedEvaluation" class="form-card">
        <div class="form-header">
          <h2 class="form-title">
            {{ EVALUATION_TYPE_LABELS[selectedEvaluation.type] }} - {{ selectedEvaluation.employee?.fullName }}
          </h2>
          <button class="btn-close" @click="closeEvaluationForm">Fechar</button>
        </div>

        <div v-if="evaluationFormError" class="alert alert-error" role="alert">{{ evaluationFormError }}</div>

        <form @submit.prevent="submitEvaluationForm" class="evaluation-form">
          <div v-for="(score, index) in evaluationScores" :key="index" class="evaluation-score-group">
            <div class="score-header">
              <span class="score-competency">
                {{ competencies.find(c => c.id === score.competencyId)?.name || 'N/A' }}
              </span>
            </div>
            <div class="score-input-group">
              <label :for="`score-${index}`">Nota (1-5) *</label>
              <input
                :id="`score-${index}`"
                type="number"
                min="1"
                max="5"
                step="1"
                v-model="score.score"
                required
              />
            </div>
            <div class="score-comment-group">
              <label :for="`score-comment-${index}`">Comentario</label>
              <textarea :id="`score-comment-${index}`" v-model="score.comments" rows="2"></textarea>
            </div>
          </div>

          <div class="form-group form-col-full">
            <label for="eval-comments">Comentarios Gerais</label>
            <textarea id="eval-comments" v-model="evaluationComments" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeEvaluationForm" :disabled="evaluationFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="evaluationFormLoading">
              {{ evaluationFormLoading ? 'Submetendo...' : 'Submeter Avaliacao' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de avaliacoes -->
      <div v-if="!selectedCycleId" class="empty-state">
        <p class="empty-title">Selecione um ciclo</p>
        <p class="empty-description">Escolha um ciclo para ver as avaliacoes.</p>
      </div>

      <div v-else-if="isLoading" class="loading-state">Carregando...</div>

      <div v-else-if="evaluations.length > 0" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Tipo</th>
              <th>Avaliador</th>
              <th class="th-center">Status</th>
              <th class="th-center">Nota</th>
              <th class="th-center">Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="evaluation in evaluations" :key="evaluation.id">
              <td class="td-name">{{ evaluation.employee?.fullName || 'N/A' }}</td>
              <td>{{ EVALUATION_TYPE_LABELS[evaluation.type] }}</td>
              <td>{{ evaluation.evaluator?.fullName || 'N/A' }}</td>
              <td class="td-center">
                <span class="badge" :class="evaluationStatusClass(evaluation.status)">
                  {{ EVALUATION_STATUS_LABELS[evaluation.status] }}
                </span>
              </td>
              <td class="td-center">{{ evaluation.overallScore?.toFixed(1) || '-' }}</td>
              <td class="td-center">
                <button
                  v-if="evaluation.status !== 'completed'"
                  class="btn-action btn-detail"
                  @click="openEvaluationForm(evaluation.id)"
                >
                  Avaliar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <p class="empty-title">Nenhuma avaliacao encontrada</p>
        <p class="empty-description">Nao ha avaliacoes cadastradas para este ciclo.</p>
      </div>
    </template>

    <!-- === TAB: PDI === -->
    <template v-if="activeTab === 'pdi'">
      <!-- Filtros -->
      <div v-if="canManagePerformance" class="filters-bar">
        <div class="filter-group filter-grow">
          <label for="pdi-employee">Colaborador</label>
          <select id="pdi-employee" v-model="selectedEmployeeIdPDI" @change="loadDevelopmentPlans">
            <option :value="null">Todos</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.fullName }}
            </option>
          </select>
        </div>
      </div>

      <!-- Formulario PDI -->
      <div v-if="showPDIForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Novo Plano de Desenvolvimento</h2>
          <button class="btn-close" @click="closePDIForm">Fechar</button>
        </div>

        <div v-if="pdiFormError" class="alert alert-error" role="alert">{{ pdiFormError }}</div>

        <form @submit.prevent="submitPDIForm" class="form-grid">
          <div class="form-group">
            <label for="pdi-emp">Colaborador *</label>
            <select id="pdi-emp" v-model="pdiFormData.employeeId" required>
              <option :value="0">Selecione...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.fullName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="pdi-responsible">Responsavel *</label>
            <select id="pdi-responsible" v-model="pdiFormData.responsibleId" required>
              <option :value="0">Selecione...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.fullName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="pdi-cycle">Ciclo (Opcional)</label>
            <select id="pdi-cycle" v-model="pdiFormData.cycleId">
              <option :value="undefined">Nenhum</option>
              <option v-for="cycle in cycles" :key="cycle.id" :value="cycle.id">
                {{ cycle.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="pdi-deadline">Prazo *</label>
            <input id="pdi-deadline" type="date" v-model="pdiFormData.deadline" required />
          </div>

          <div class="form-group form-col-full">
            <label for="pdi-action">Acao *</label>
            <input id="pdi-action" type="text" v-model="pdiFormData.action" required />
          </div>

          <div class="form-group form-col-full">
            <label for="pdi-desc">Descricao *</label>
            <textarea id="pdi-desc" v-model="pdiFormData.description" rows="3" required></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closePDIForm" :disabled="pdiFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="pdiFormLoading">
              {{ pdiFormLoading ? 'Criando...' : 'Criar PDI' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de PDIs -->
      <div v-if="isLoading" class="loading-state">Carregando...</div>

      <div v-else-if="developmentPlans.length > 0" class="pdi-list">
        <div v-for="pdi in developmentPlans" :key="pdi.id" class="pdi-card">
          <div class="pdi-header">
            <div class="pdi-info">
              <h3 class="pdi-action">{{ pdi.action }}</h3>
              <span class="pdi-employee">{{ pdi.employee?.fullName || 'N/A' }}</span>
            </div>
            <span class="badge" :class="pdiStatusClass(pdi.status)">
              {{ PDI_STATUS_LABELS[pdi.status] }}
            </span>
          </div>
          <p class="pdi-description">{{ pdi.description }}</p>
          <div class="pdi-details">
            <div class="pdi-detail-item">
              <span class="pdi-detail-label">Responsavel</span>
              <span class="pdi-detail-value">{{ pdi.responsible?.fullName || 'N/A' }}</span>
            </div>
            <div class="pdi-detail-item">
              <span class="pdi-detail-label">Prazo</span>
              <span class="pdi-detail-value">{{ formatDate(pdi.deadline) }}</span>
            </div>
          </div>
          <div v-if="canManagePerformance" class="pdi-actions">
            <button
              v-if="pdi.status === 'pending'"
              class="btn-action btn-approve"
              @click="updatePDIStatus(pdi.id, 'in_progress')"
            >
              Iniciar
            </button>
            <button
              v-if="pdi.status === 'in_progress'"
              class="btn-action btn-approve"
              @click="updatePDIStatus(pdi.id, 'completed')"
            >
              Concluir
            </button>
            <button
              v-if="pdi.status !== 'cancelled' && pdi.status !== 'completed'"
              class="btn-action btn-cancel"
              @click="updatePDIStatus(pdi.id, 'cancelled')"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-title">Nenhum PDI encontrado</p>
        <p class="empty-description">Nao ha planos de desenvolvimento cadastrados.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.performance-view {
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

.btn-small {
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
  transform: translateY(-1px);
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

.btn-detail {
  background: #ebf4ff;
  color: #667eea;
}

.btn-detail:hover {
  background: #bee3f8;
}

.btn-approve {
  background: #c6f6d5;
  color: #276749;
}

.btn-approve:hover {
  background: #9ae6b4;
}

.btn-cancel {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-cancel:hover {
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
}

.filter-grow {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.filter-group select:focus {
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

/* Cards de ciclos */
.cycles-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cycle-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.cycle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.cycle-header:hover {
  background: #f7fafc;
}

.cycle-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.cycle-type-tag {
  display: inline-block;
  padding: 0.188rem 0.5rem;
  background: #ebf4ff;
  color: #667eea;
  border-radius: 4px;
  font-size: 0.688rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.cycle-name {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.cycle-actions-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cycle-dates {
  font-size: 0.813rem;
  color: #718096;
}

.expand-indicator {
  font-size: 1.25rem;
  color: #a0aec0;
  font-weight: 300;
  width: 24px;
  text-align: center;
}

/* Detalhes do ciclo */
.cycle-details {
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1.25rem;
}

.detail-section {
  margin-bottom: 1rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.detail-title {
  font-size: 0.813rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin: 0 0 0.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.detail-label {
  font-size: 0.688rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-value {
  font-size: 0.875rem;
  color: #2d3748;
  font-weight: 500;
}

.competencies-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.competency-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
}

.competency-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2d3748;
  flex: 1;
}

.competency-weight {
  font-size: 0.75rem;
  color: #718096;
}

.empty-section {
  font-size: 0.813rem;
  color: #a0aec0;
  text-align: center;
  padding: 0.75rem;
}

.cycle-admin-actions {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #edf2f7;
  display: flex;
  justify-content: flex-end;
}

/* Tabela */
.table-container {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.data-table td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #2d3748;
  border-bottom: 1px solid #f0f0f0;
}

.data-table tbody tr:hover {
  background-color: #f7fafc;
}

.th-center { text-align: center; }
.td-center { text-align: center; }
.td-name { font-weight: 500; }
.td-description { font-size: 0.813rem; color: #718096; }

/* Metas */
.goals-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.goal-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.goal-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.goal-title {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.goal-employee {
  font-size: 0.813rem;
  color: #718096;
}

.goal-description {
  font-size: 0.875rem;
  color: #4a5568;
  margin: 0 0 0.75rem;
}

.goal-details {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.goal-detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.goal-detail-label {
  font-size: 0.688rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.goal-detail-value {
  font-size: 0.875rem;
  color: #2d3748;
  font-weight: 500;
}

/* Avaliacao */
.evaluation-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.evaluation-score-group {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.score-header {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.score-competency {
  font-size: 0.938rem;
  font-weight: 600;
  color: #2d3748;
}

.score-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.score-input-group label {
  font-size: 0.813rem;
  font-weight: 600;
  color: #4a5568;
}

.score-input-group input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.score-input-group input:focus {
  border-color: #667eea;
}

.score-comment-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.score-comment-group label {
  font-size: 0.813rem;
  font-weight: 600;
  color: #4a5568;
}

.score-comment-group textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
  font-family: inherit;
}

.score-comment-group textarea:focus {
  border-color: #667eea;
}

/* PDI */
.pdi-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pdi-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.pdi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.pdi-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.pdi-action {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.pdi-employee {
  font-size: 0.813rem;
  color: #718096;
}

.pdi-description {
  font-size: 0.875rem;
  color: #4a5568;
  margin: 0 0 0.75rem;
}

.pdi-details {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.pdi-detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.pdi-detail-label {
  font-size: 0.688rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.pdi-detail-value {
  font-size: 0.875rem;
  color: #2d3748;
  font-weight: 500;
}

.pdi-actions {
  display: flex;
  gap: 0.5rem;
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

.badge-draft { background: #e2e8f0; color: #4a5568; }
.badge-self-eval { background: #fef3c7; color: #92400e; }
.badge-manager-eval { background: #dbeafe; color: #1e40af; }
.badge-calibration { background: #ede9fe; color: #6b21a8; }
.badge-closed { background: #d1fae5; color: #065f46; }

.badge-pending { background: #e2e8f0; color: #4a5568; }
.badge-in-progress { background: #dbeafe; color: #1e40af; }
.badge-achieved { background: #d1fae5; color: #065f46; }
.badge-not-achieved { background: #fee2e2; color: #991b1b; }
.badge-completed { background: #d1fae5; color: #065f46; }
.badge-cancelled { background: #fee2e2; color: #991b1b; }

.badge-active { background: #d1fae5; color: #065f46; }
.badge-inactive { background: #e2e8f0; color: #4a5568; }

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

  .form-grid {
    grid-template-columns: 1fr;
  }

  .cycle-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .goal-header,
  .pdi-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .goal-details,
  .pdi-details {
    flex-direction: column;
    gap: 0.75rem;
  }

  .pdi-actions {
    flex-wrap: wrap;
  }

  .table-container {
    overflow-x: scroll;
  }

  .data-table {
    min-width: 700px;
  }

  .cycle-admin-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .form-card {
    padding: 1rem;
  }

  .cycle-details {
    padding: 0.75rem;
  }

  .goal-card,
  .pdi-card {
    padding: 0.75rem;
  }

  .competency-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
