<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import leaveService from '../services/leave.service'
import employeeService from '@/modules/employees/services/employee.service'
import type { Leave, CreateLeaveData, LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS } from '../types'
import type { Employee } from '@/modules/employees/types'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const authStore = useAuthStore()
const { confirm: confirmDialog } = useConfirmDialog()

// Estado
const leaves = ref<Leave[]>([])
const employees = ref<Employee[]>([])
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')

// Filtros
const selectedEmployee = ref<number | null>(null)
const filterType = ref<string>('')
const filterStatus = ref<string>('')

// Formulário de nova solicitação
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

// Labels de tipo e status
const typeLabels: Record<string, string> = {
  vacation: 'Ferias',
  medical: 'Licenca Medica',
  maternity: 'Licenca Maternidade',
  paternity: 'Licenca Paternidade',
  bereavement: 'Licenca Luto',
  wedding: 'Licenca Casamento',
  blood_donation: 'Doacao de Sangue',
  military: 'Servico Militar',
  other: 'Outros',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  cancelled: 'Cancelada',
  in_progress: 'Em Andamento',
  completed: 'Concluida',
}

const typeOptions = Object.keys(typeLabels)
const statusOptions = Object.keys(statusLabels)

/**
 * Carrega solicitações de férias/licenças
 */
async function loadLeaves() {
  try {
    isLoading.value = true
    error.value = ''

    const filters: any = { limit: 100 }

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
    error.value = 'Erro ao carregar solicitacoes de ferias/licencas.'
    console.error(err)
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
 * Abre formulário de nova solicitação
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
 * Fecha formulário
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
 * Submete nova solicitação
 */
async function submitForm() {
  try {
    formLoading.value = true
    formError.value = ''

    if (!formData.value.employeeId) {
      formError.value = 'Selecione um colaborador'
      return
    }
    if (!formData.value.type) {
      formError.value = 'Selecione o tipo de licenca'
      return
    }
    if (!formData.value.startDate || !formData.value.endDate) {
      formError.value = 'Informe as datas de inicio e fim'
      return
    }
    if (formData.value.daysCount <= 0) {
      formError.value = 'A quantidade de dias deve ser maior que zero'
      return
    }

    await leaveService.create(formData.value)

    successMessage.value = 'Solicitacao criada com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)

    closeForm()
    loadLeaves()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao criar solicitacao'
    console.error(err)
  } finally {
    formLoading.value = false
  }
}

/**
 * Aprova uma solicitação
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
    successMessage.value = 'Solicitacao aprovada com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
    loadLeaves()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao aprovar solicitacao'
    console.error(err)
  }
}

/**
 * Rejeita uma solicitação
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
    successMessage.value = 'Solicitacao rejeitada.'
    setTimeout(() => { successMessage.value = '' }, 3000)
    loadLeaves()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao rejeitar solicitacao'
    console.error(err)
  }
}

/**
 * Cancela uma solicitação
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
    successMessage.value = 'Solicitacao cancelada.'
    setTimeout(() => { successMessage.value = '' }, 3000)
    loadLeaves()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao cancelar solicitacao'
    console.error(err)
  }
}

/**
 * Retorna classe CSS para badge de status
 */
function statusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    cancelled: 'badge-cancelled',
    in_progress: 'badge-progress',
    completed: 'badge-completed',
  }
  return classes[status] || ''
}

/**
 * Formata data para exibição
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR')
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

watch([selectedEmployee, filterType, filterStatus], () => {
  loadLeaves()
})

watch(() => formData.value.startDate, calculateDays)
watch(() => formData.value.endDate, calculateDays)

onMounted(() => {
  if (isAdmin.value) {
    loadEmployees()
  } else if (authStore.employeeId) {
    selectedEmployee.value = authStore.employeeId
  }
  loadLeaves()
})
</script>

<template>
  <div class="leave-list-view">
    <div class="page-header">
      <h1 class="page-title">Ferias e Licencas</h1>
      <button class="btn-primary" @click="openForm">Nova Solicitacao</button>
    </div>

    <!-- Mensagens -->
    <div v-if="successMessage" class="alert alert-success" role="alert">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <!-- Filtros -->
    <div class="filters-bar">
      <div v-if="isAdmin" class="filter-group filter-grow">
        <label for="filter-emp">Colaborador</label>
        <select id="filter-emp" v-model="selectedEmployee">
          <option :value="null">Todos os colaboradores</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.fullName }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-type">Tipo</label>
        <select id="filter-type" v-model="filterType">
          <option value="">Todos os tipos</option>
          <option v-for="type in typeOptions" :key="type" :value="type">
            {{ typeLabels[type] }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-status">Status</label>
        <select id="filter-status" v-model="filterStatus">
          <option value="">Todos os status</option>
          <option v-for="status in statusOptions" :key="status" :value="status">
            {{ statusLabels[status] }}
          </option>
        </select>
      </div>
    </div>

    <!-- Formulário de nova solicitação -->
    <div v-if="showForm" class="form-card">
      <div class="form-header">
        <h2 class="form-title">Nova Solicitacao</h2>
        <button class="btn-close" @click="closeForm">Fechar</button>
      </div>

      <div v-if="formError" class="alert alert-error" role="alert">{{ formError }}</div>

      <form @submit.prevent="submitForm" class="form-grid">
        <div v-if="isAdmin" class="form-group form-col-full">
          <label for="form-employee">Colaborador *</label>
          <select id="form-employee" v-model="formData.employeeId" required>
            <option :value="0">Selecione um colaborador...</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.fullName }}
            </option>
          </select>
        </div>

        <div class="form-group form-col-full">
          <label for="form-type">Tipo *</label>
          <select id="form-type" v-model="formData.type" required>
            <option value="">Selecione o tipo...</option>
            <option v-for="type in typeOptions" :key="type" :value="type">
              {{ typeLabels[type] }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="form-start">Data Inicio *</label>
          <input id="form-start" type="date" v-model="formData.startDate" required />
        </div>

        <div class="form-group">
          <label for="form-end">Data Fim *</label>
          <input id="form-end" type="date" v-model="formData.endDate" required />
        </div>

        <div class="form-group">
          <label for="form-days">Dias</label>
          <input id="form-days" type="number" v-model="formData.daysCount" readonly />
        </div>

        <div v-if="formData.type === 'vacation'" class="form-group">
          <label for="form-sell">Abono Pecuniario (dias)</label>
          <input id="form-sell" type="number" v-model="formData.sellDays" min="0" max="10" />
        </div>

        <div class="form-group form-col-full">
          <label for="form-notes">Notas</label>
          <textarea id="form-notes" v-model="formData.notes" rows="3"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="closeForm" :disabled="formLoading">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="formLoading">
            {{ formLoading ? 'Criando...' : 'Criar Solicitacao' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Tabela de solicitações -->
    <div v-if="isLoading" class="loading-state">Carregando...</div>

    <div v-else-if="leaves.length > 0" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th v-if="isAdmin">Colaborador</th>
            <th>Tipo</th>
            <th>Periodo</th>
            <th class="th-center">Dias</th>
            <th class="th-center">Status</th>
            <th class="th-center">Acoes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="leave in leaves" :key="leave.id">
            <td v-if="isAdmin" class="td-name">
              {{ leave.employee?.fullName || 'N/A' }}
            </td>
            <td>{{ typeLabels[leave.type] || leave.type }}</td>
            <td class="td-period">
              {{ formatDate(leave.startDate) }} - {{ formatDate(leave.endDate) }}
            </td>
            <td class="td-center">{{ leave.daysCount }}</td>
            <td class="td-center">
              <span class="badge" :class="statusBadgeClass(leave.status)">
                {{ statusLabels[leave.status] || leave.status }}
              </span>
            </td>
            <td class="td-center td-actions">
              <button
                v-if="canApprove(leave)"
                class="btn-action btn-approve"
                @click="approveLeave(leave.id)"
              >
                Aprovar
              </button>
              <button
                v-if="canApprove(leave)"
                class="btn-action btn-reject"
                @click="rejectLeave(leave.id)"
              >
                Rejeitar
              </button>
              <button
                v-if="canCancel(leave)"
                class="btn-action btn-cancel"
                @click="cancelLeave(leave.id)"
              >
                Cancelar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <p class="empty-title">Nenhuma solicitacao encontrada</p>
      <p class="empty-description">Nao ha solicitacoes de ferias ou licencas para exibir.</p>
    </div>
  </div>
</template>

<style scoped>
.leave-list-view {
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

.btn-approve {
  background: #c6f6d5;
  color: #276749;
}

.btn-approve:hover {
  background: #9ae6b4;
}

.btn-reject {
  background: #fed7d7;
  color: #c53030;
}

.btn-reject:hover {
  background: #fc8181;
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

.form-group input:read-only {
  background: #f7fafc;
  color: #718096;
  cursor: not-allowed;
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

.th-center {
  text-align: center;
}

.td-center {
  text-align: center;
}

.td-name {
  font-weight: 500;
}

.td-period {
  white-space: nowrap;
}

.td-actions {
  white-space: nowrap;
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

.badge-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.badge-cancelled {
  background: #e2e8f0;
  color: #4a5568;
}

.badge-progress {
  background: #dbeafe;
  color: #1e40af;
}

.badge-completed {
  background: #e0e7ff;
  color: #3730a3;
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
    min-width: 800px;
  }
}

@media (max-width: 480px) {
  .form-card {
    padding: 1rem;
  }
}
</style>
