<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import payrollService from '../services/payroll.service'
import employeeService from '@/modules/employees/services/employee.service'
import type { PayrollPeriod, PaySlip, PayrollComponent, CreatePeriodData, CreateComponentData } from '../types'
import { PERIOD_STATUS_LABELS, MONTH_LABELS, COMPONENT_TYPE_LABELS, ENTRY_CODE_LABELS } from '../types'
import type { Employee } from '@/modules/employees/types'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const authStore = useAuthStore()
const { confirm: confirmDialog } = useConfirmDialog()

// Estado
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

const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

// Periodo selecionado para ver contracheques
const selectedPeriodId = ref<number | null>(null)
const selectedPeriod = ref<PayrollPeriod | null>(null)

// Detalhamento de contracheque
const selectedSlip = ref<PaySlip | null>(null)
const showSlipDetail = ref(false)

// Formulário novo período
const showPeriodForm = ref(false)
const periodFormLoading = ref(false)
const periodFormError = ref('')
const periodFormData = ref<CreatePeriodData>({
  referenceMonth: new Date().getMonth() + 1,
  referenceYear: new Date().getFullYear(),
})

// Formulário componente salarial
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
 * Volta para lista de períodos
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

// --- Período CRUD ---

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
    successMessage.value = 'Periodo criado com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 5000)
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
    successMessage.value = 'Folha calculada com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 5000)
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
    successMessage.value = 'Periodo fechado com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 5000)
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
    successMessage.value = 'Componente salarial criado com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 5000)
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

const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: MONTH_LABELS[i + 1] }))
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

onMounted(() => {
  loadPeriods()
  if (isAdmin.value) {
    loadEmployees()
  }
  if (authStore.employeeId && !isAdmin.value) {
    activeTab.value = 'mySlips'
    loadMyPaySlips()
  }
})
</script>

<template>
  <div class="payroll-view">
    <div class="page-header">
      <h1 class="page-title">Folha de Pagamento</h1>
      <button v-if="isAdmin && activeTab === 'periods' && !selectedPeriodId" class="btn-primary" @click="openPeriodForm">
        Novo Periodo
      </button>
    </div>

    <!-- Mensagens -->
    <Transition name="fade">
      <div v-if="successMessage" class="alert alert-success" role="status" aria-live="polite">{{ successMessage }}</div>
    </Transition>
    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-if="isAdmin"
        class="tab"
        :class="{ 'tab-active': activeTab === 'periods' }"
        @click="activeTab = 'periods'; backToPeriods(); loadPeriods()"
      >
        Periodos
      </button>
      <button
        v-if="authStore.employeeId"
        class="tab"
        :class="{ 'tab-active': activeTab === 'mySlips' }"
        @click="activeTab = 'mySlips'; loadMyPaySlips()"
      >
        Meus Contracheques
      </button>
      <button
        v-if="isAdmin"
        class="tab"
        :class="{ 'tab-active': activeTab === 'components' }"
        @click="activeTab = 'components'"
      >
        Componentes Salariais
      </button>
    </div>

    <!-- === TAB: PERÍODOS === -->
    <template v-if="activeTab === 'periods' && isAdmin">
      <!-- Formulário novo período -->
      <div v-if="showPeriodForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Novo Periodo</h2>
          <button class="btn-close" @click="closePeriodForm">Fechar</button>
        </div>

        <div v-if="periodFormError" class="alert alert-error" role="alert">{{ periodFormError }}</div>

        <form @submit.prevent="submitPeriodForm" class="form-grid">
          <div class="form-group">
            <label for="period-month">Mes *</label>
            <select id="period-month" v-model="periodFormData.referenceMonth" required>
              <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="period-year">Ano *</label>
            <select id="period-year" v-model="periodFormData.referenceYear" required>
              <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closePeriodForm" :disabled="periodFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="periodFormLoading">
              {{ periodFormLoading ? 'Criando...' : 'Criar Periodo' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Se tem periodo selecionado, mostra contracheques -->
      <template v-if="selectedPeriodId">
        <div class="sub-header">
          <button class="btn-back" @click="backToPeriods">&larr; Voltar</button>
          <h2 class="sub-title">
            {{ MONTH_LABELS[selectedPeriod?.referenceMonth || 1] }} / {{ selectedPeriod?.referenceYear }}
            <span class="badge" :class="periodStatusClass(selectedPeriod?.status || '')">
              {{ PERIOD_STATUS_LABELS[selectedPeriod?.status || ''] }}
            </span>
          </h2>
          <div class="sub-actions">
            <button
              v-if="selectedPeriod?.status === 'open'"
              class="btn-primary"
              @click="calculatePayroll(selectedPeriodId!)"
            >
              Calcular Folha
            </button>
            <button
              v-if="selectedPeriod?.status === 'open' && paySlips.length > 0"
              class="btn-secondary"
              @click="closePeriod(selectedPeriodId!)"
            >
              Fechar Periodo
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando..." /></div>

        <div v-else-if="paySlips.length > 0" class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th class="th-right">Bruto</th>
                <th class="th-right">INSS</th>
                <th class="th-right">IRRF</th>
                <th class="th-right">FGTS</th>
                <th class="th-right">Descontos</th>
                <th class="th-right">Liquido</th>
                <th class="th-center">Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slip in paySlips" :key="slip.id">
                <td class="td-name">{{ slip.employee?.fullName || 'N/A' }}</td>
                <td class="td-right">{{ formatCurrency(slip.grossSalary) }}</td>
                <td class="td-right td-deduction">{{ formatCurrency(slip.inssAmount) }}</td>
                <td class="td-right td-deduction">{{ formatCurrency(slip.irrfAmount) }}</td>
                <td class="td-right td-info">{{ formatCurrency(slip.fgtsAmount) }}</td>
                <td class="td-right td-deduction">{{ formatCurrency(slip.totalDeductions) }}</td>
                <td class="td-right td-net">{{ formatCurrency(slip.netSalary) }}</td>
                <td class="td-center">
                  <button class="btn-action btn-detail" @click="viewSlipDetail(slip.id)">
                    Detalhe
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmptyState
          v-else
          title="Nenhum contracheque gerado"
          description="Clique em 'Calcular Folha' para gerar os contracheques deste periodo."
        />
      </template>

      <!-- Lista de períodos -->
      <template v-else>
        <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando..." /></div>

        <div v-else-if="periods.length > 0" class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Periodo</th>
                <th class="th-center">Status</th>
                <th class="th-center">Fechamento</th>
                <th class="th-center">Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="period in periods" :key="period.id">
                <td class="td-name">
                  {{ MONTH_LABELS[period.referenceMonth] }} / {{ period.referenceYear }}
                </td>
                <td class="td-center">
                  <span class="badge" :class="periodStatusClass(period.status)">
                    {{ PERIOD_STATUS_LABELS[period.status] }}
                  </span>
                </td>
                <td class="td-center">
                  {{ period.closedAt ? formatDate(period.closedAt) : '-' }}
                </td>
                <td class="td-center td-actions">
                  <button class="btn-action btn-detail" @click="loadSlips(period.id)">
                    Ver Contracheques
                  </button>
                  <button
                    v-if="period.status === 'open'"
                    class="btn-action btn-approve"
                    @click="calculatePayroll(period.id)"
                  >
                    Calcular
                  </button>
                  <button
                    v-if="period.status === 'open'"
                    class="btn-action btn-cancel"
                    @click="closePeriod(period.id)"
                  >
                    Fechar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmptyState
          v-else
          title="Nenhum periodo encontrado"
          description="Crie um novo periodo para iniciar a folha de pagamento."
        />
      </template>
    </template>

    <!-- === TAB: MEUS CONTRACHEQUES === -->
    <template v-if="activeTab === 'mySlips'">
      <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando..." /></div>

      <div v-else-if="myPaySlips.length > 0" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Periodo</th>
              <th class="th-right">Bruto</th>
              <th class="th-right">Descontos</th>
              <th class="th-right">Liquido</th>
              <th class="th-center">Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slip in myPaySlips" :key="slip.id">
              <td class="td-name">{{ formatDate(slip.createdAt) }}</td>
              <td class="td-right">{{ formatCurrency(slip.grossSalary) }}</td>
              <td class="td-right td-deduction">{{ formatCurrency(slip.totalDeductions) }}</td>
              <td class="td-right td-net">{{ formatCurrency(slip.netSalary) }}</td>
              <td class="td-center">
                <button class="btn-action btn-detail" @click="viewSlipDetail(slip.id)">
                  Detalhe
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState
        v-else
        title="Nenhum contracheque encontrado"
        description="Seus contracheques aparecerao aqui apos o calculo da folha."
      />
    </template>

    <!-- === TAB: COMPONENTES SALARIAIS === -->
    <template v-if="activeTab === 'components' && isAdmin">
      <div class="filters-bar">
        <div class="filter-group filter-grow">
          <label for="comp-employee">Colaborador</label>
          <select id="comp-employee" v-model="componentEmployeeId" @change="componentEmployeeId && loadComponents(componentEmployeeId)">
            <option :value="null">Selecione um colaborador...</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.fullName }}
            </option>
          </select>
        </div>
        <div class="filter-group filter-action">
          <label>&nbsp;</label>
          <button class="btn-primary" @click="openComponentForm" :disabled="!componentEmployeeId">
            Novo Componente
          </button>
        </div>
      </div>

      <!-- Formulário componente -->
      <div v-if="showComponentForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Novo Componente Salarial</h2>
          <button class="btn-close" @click="closeComponentForm">Fechar</button>
        </div>

        <div v-if="componentFormError" class="alert alert-error" role="alert">{{ componentFormError }}</div>

        <form @submit.prevent="submitComponentForm" class="form-grid">
          <div class="form-group">
            <label for="comp-type">Tipo *</label>
            <select id="comp-type" v-model="componentFormData.type" required>
              <option v-for="(label, key) in COMPONENT_TYPE_LABELS" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="comp-amount">Valor (R$) *</label>
            <input id="comp-amount" type="number" step="0.01" min="0" v-model="componentFormData.amount" required />
          </div>

          <div class="form-group form-col-full">
            <label for="comp-desc">Descricao *</label>
            <input id="comp-desc" type="text" v-model="componentFormData.description" required />
          </div>

          <div class="form-group">
            <label for="comp-from">Vigencia De *</label>
            <input id="comp-from" type="date" v-model="componentFormData.effectiveFrom" required />
          </div>

          <div class="form-group">
            <label for="comp-until">Vigencia Ate</label>
            <input id="comp-until" type="date" v-model="componentFormData.effectiveUntil" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeComponentForm" :disabled="componentFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="componentFormLoading">
              {{ componentFormLoading ? 'Criando...' : 'Criar Componente' }}
            </button>
          </div>
        </form>
      </div>

      <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando..." /></div>

      <div v-else-if="componentEmployeeId && components.length > 0" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descricao</th>
              <th class="th-right">Valor</th>
              <th class="th-center">Status</th>
              <th>Vigencia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comp in components" :key="comp.id">
              <td>{{ COMPONENT_TYPE_LABELS[comp.type] || comp.type }}</td>
              <td>{{ comp.description }}</td>
              <td class="td-right">{{ formatCurrency(comp.amount) }}</td>
              <td class="td-center">
                <span class="badge" :class="comp.isActive ? 'badge-active' : 'badge-inactive'">
                  {{ comp.isActive ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="td-period">
                {{ formatDate(comp.effectiveFrom) }}
                {{ comp.effectiveUntil ? ' - ' + formatDate(comp.effectiveUntil) : ' em diante' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState
        v-else-if="componentEmployeeId && components.length === 0"
        title="Nenhum componente salarial"
        description="Este colaborador nao possui componentes salariais cadastrados."
      />

      <EmptyState
        v-else-if="!componentEmployeeId"
        title="Selecione um colaborador"
        description="Escolha um colaborador para ver e gerenciar seus componentes salariais."
      />
    </template>

    <!-- Modal detalhamento do contracheque -->
    <div v-if="showSlipDetail && selectedSlip" class="modal-overlay" @click.self="closeSlipDetail" @keydown.escape="closeSlipDetail">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-header">
          <h2 class="modal-title" id="modal-title">Contracheque</h2>
          <button class="btn-close" @click="closeSlipDetail">Fechar</button>
        </div>

        <div class="slip-header-info">
          <div class="slip-employee">{{ selectedSlip.employee?.fullName || 'N/A' }}</div>
          <div v-if="selectedSlip.employee?.position" class="slip-position">{{ selectedSlip.employee.position.name }}</div>
        </div>

        <div class="slip-summary">
          <div class="summary-item">
            <span class="summary-label">Salario Bruto</span>
            <span class="summary-value">{{ formatCurrency(selectedSlip.grossSalary) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Proventos</span>
            <span class="summary-value summary-earning">{{ formatCurrency(selectedSlip.totalEarnings) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Descontos</span>
            <span class="summary-value summary-deduction">{{ formatCurrency(selectedSlip.totalDeductions) }}</span>
          </div>
          <div class="summary-item summary-highlight">
            <span class="summary-label">Salario Liquido</span>
            <span class="summary-value">{{ formatCurrency(selectedSlip.netSalary) }}</span>
          </div>
        </div>

        <div class="slip-taxes">
          <div class="tax-item">
            <span class="tax-label">INSS</span>
            <span class="tax-value">{{ formatCurrency(selectedSlip.inssAmount) }}</span>
          </div>
          <div class="tax-item">
            <span class="tax-label">IRRF</span>
            <span class="tax-value">{{ formatCurrency(selectedSlip.irrfAmount) }}</span>
          </div>
          <div class="tax-item">
            <span class="tax-label">FGTS (informativo)</span>
            <span class="tax-value">{{ formatCurrency(selectedSlip.fgtsAmount) }}</span>
          </div>
        </div>

        <!-- Detalhamento de entradas -->
        <div v-if="selectedSlip.entries && selectedSlip.entries.length > 0" class="slip-entries">
          <h3 class="entries-title">Proventos</h3>
          <div
            v-for="entry in selectedSlip.entries.filter(e => e.componentType === 'earning')"
            :key="entry.id"
            class="entry-row"
          >
            <span class="entry-desc">{{ ENTRY_CODE_LABELS[entry.code] || entry.description }}</span>
            <span class="entry-amount entry-earning">{{ formatCurrency(entry.amount) }}</span>
          </div>

          <h3 class="entries-title">Descontos</h3>
          <div
            v-for="entry in selectedSlip.entries.filter(e => e.componentType === 'deduction')"
            :key="entry.id"
            class="entry-row"
          >
            <span class="entry-desc">{{ ENTRY_CODE_LABELS[entry.code] || entry.description }}</span>
            <span class="entry-amount entry-deduction">{{ formatCurrency(entry.amount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payroll-view {
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

/* Sub-header para contracheques do período */
.sub-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.sub-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sub-actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}

.btn-back {
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: #667eea;
  border: 1px solid #bee3f8;
  border-radius: 5px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #ebf8ff;
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
  align-items: flex-end;
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

.filter-action {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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

/* Formulário */
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
.form-group select {
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
.form-group select:focus {
  border-color: #667eea;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
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
.th-right { text-align: right; }
.td-center { text-align: center; }
.td-right { text-align: right; font-variant-numeric: tabular-nums; }
.td-name { font-weight: 500; }
.td-period { white-space: nowrap; }
.td-actions { white-space: nowrap; }

.td-deduction { color: #c53030; }
.td-info { color: #718096; }
.td-net { font-weight: 600; color: #276749; }

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-open { background: #fef3c7; color: #92400e; }
.badge-calculating { background: #dbeafe; color: #1e40af; }
.badge-closed { background: #d1fae5; color: #065f46; }
.badge-active { background: #d1fae5; color: #065f46; }
.badge-inactive { background: #e2e8f0; color: #4a5568; }

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.modal-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.slip-header-info {
  margin-bottom: 1rem;
}

.slip-employee {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
}

.slip-position {
  font-size: 0.813rem;
  color: #718096;
}

.slip-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
}

.summary-highlight {
  grid-column: 1 / -1;
  background: #ebf8ff;
}

.summary-label {
  font-size: 0.688rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a202c;
}

.summary-earning { color: #276749; }
.summary-deduction { color: #c53030; }

.slip-taxes {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #fffbeb;
  border-radius: 6px;
}

.tax-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.tax-label {
  font-size: 0.688rem;
  font-weight: 600;
  color: #92400e;
  text-transform: uppercase;
}

.tax-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #78350f;
}

.slip-entries {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.entries-title {
  font-size: 0.813rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin: 0 0 0.5rem;
}

.entries-title + .entries-title {
  margin-top: 1rem;
}

.entry-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.entry-desc {
  font-size: 0.875rem;
  color: #2d3748;
}

.entry-amount {
  font-size: 0.875rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.entry-earning { color: #276749; }
.entry-deduction { color: #c53030; }

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
  color: var(--color-text-muted, #718096);
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
  color: var(--color-text-muted, #718096);
  margin: 0 !important;
}

/* Fade transition */
.fade-enter-active {
  transition: opacity 0.3s ease;
}

.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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

  .sub-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .sub-actions {
    margin-left: 0;
    width: 100%;
  }

  .sub-actions .btn-primary,
  .sub-actions .btn-secondary {
    flex: 1;
  }

  .filters-bar {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .table-container {
    overflow-x: scroll;
  }

  .data-table {
    min-width: 700px;
  }

  .slip-summary {
    grid-template-columns: 1fr;
  }

  .slip-taxes {
    flex-direction: column;
  }

  .modal-card {
    max-width: 100%;
  }

  .td-actions {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  /* Touch targets - minimo 44px para mobile */
  .btn-action {
    padding: 0.5rem 0.75rem;
    font-size: 0.813rem;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .form-card {
    padding: 1rem;
  }

  .modal-card {
    padding: 1rem;
  }

  .summary-value {
    font-size: 1rem;
  }
}
</style>
