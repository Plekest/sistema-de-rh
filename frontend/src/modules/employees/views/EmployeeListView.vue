<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import employeeService from '../services/employee.service'
import type { Employee, Department, EmployeeListParams } from '../types'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useApiError } from '@/composables/useApiError'
import { useExport } from '@/composables/useExport'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { DataTableColumn } from '@/components/common/types'

const router = useRouter()
const authStore = useAuthStore()
const { confirm: confirmDialog } = useConfirmDialog()
const { error, handleError, clearError } = useApiError()
const { exporting, exportCSV } = useExport()

const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

// Estado
const employees = ref<Employee[]>([])
const departments = ref<Department[]>([])
const isLoading = ref(false)
const successMessage = ref('')
const totalPages = ref(1)
const currentPage = ref(1)
const total = ref(0)

// Filtros
const searchQuery = ref('')
const filterType = ref<'' | 'clt' | 'pj'>('')
const filterStatus = ref<'' | 'active' | 'inactive' | 'terminated'>('')
const filterDepartment = ref<number | undefined>(undefined)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Colunas da DataTable
 */
const columns: DataTableColumn[] = [
  { key: 'fullName', label: 'Nome' },
  { key: 'type', label: 'Tipo' },
  { key: 'department.name', label: 'Departamento' },
  { key: 'position.title', label: 'Cargo' },
  { key: 'hireDate', label: 'Admissao' },
  { key: 'salary', label: 'Salario', align: 'right' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Acoes', align: 'right' },
]

/**
 * Carrega lista de colaboradores
 */
async function loadEmployees() {
  try {
    isLoading.value = true
    clearError()

    const params: EmployeeListParams = {
      page: currentPage.value,
      limit: 15,
    }

    if (searchQuery.value) params.search = searchQuery.value
    if (filterType.value) params.type = filterType.value
    if (filterStatus.value) params.status = filterStatus.value
    if (filterDepartment.value) params.departmentId = filterDepartment.value

    const response = await employeeService.getAll(params)
    employees.value = response.data
    totalPages.value = response.meta.lastPage
    total.value = response.meta.total
  } catch (err: unknown) {
    handleError(err, 'Erro ao carregar colaboradores. Tente novamente.')
  } finally {
    isLoading.value = false
  }
}

/**
 * Carrega departamentos para filtro
 */
async function loadDepartments() {
  try {
    departments.value = await employeeService.getDepartments()
  } catch (err: unknown) {
    console.error('Erro ao carregar departamentos:', err)
  }
}

/**
 * Busca com debounce
 */
function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadEmployees()
  }, 400)
}

/**
 * Navega para pagina de criacao
 */
function goToCreate() {
  router.push('/employees/new')
}

/**
 * Navega para detalhe do colaborador
 */
function goToDetail(id: number) {
  router.push(`/employees/${id}`)
}

/**
 * Navega para edicao do colaborador
 */
function goToEdit(id: number) {
  router.push(`/employees/${id}/edit`)
}

/**
 * Exclui colaborador
 */
async function handleDelete(employee: Employee) {
  const result = await confirmDialog({
    title: 'Excluir Colaborador',
    message: `Deseja realmente excluir o colaborador "${employee.fullName}"?`,
    variant: 'danger',
    confirmLabel: 'Excluir',
  })

  if (!result) return

  try {
    await employeeService.delete(employee.id)
    successMessage.value = 'Colaborador excluido com sucesso.'
    setTimeout(() => { successMessage.value = '' }, 5000)
    await loadEmployees()
  } catch (err: unknown) {
    handleError(err, 'Erro ao excluir colaborador.')
  }
}

/**
 * Muda de pagina
 */
function onPageChange(page: number) {
  currentPage.value = page
  loadEmployees()
}

/**
 * Retorna label do tipo
 */
function typeLabel(type: string): string {
  return type === 'clt' ? 'CLT' : 'PJ'
}

/**
 * Retorna label do status
 */
function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    terminated: 'Desligado',
  }
  return map[status] || status
}

/**
 * Exporta lista de colaboradores para CSV
 */
async function handleExport() {
  try {
    const timestamp = new Date().toISOString().split('T')[0]
    await exportCSV('/employees/export', `colaboradores-${timestamp}.csv`)
  } catch (err: unknown) {
    handleError(err, 'Erro ao exportar colaboradores.')
  }
}

// Watchers para filtros
watch([filterType, filterStatus, filterDepartment], () => {
  currentPage.value = 1
  loadEmployees()
})

onMounted(() => {
  // Se nao for admin/manager e tiver employeeId, redireciona para o detalhe proprio
  if (!isAdmin.value && authStore.employeeId) {
    router.replace(`/employees/${authStore.employeeId}`)
    return
  }
  loadEmployees()
  loadDepartments()
})
</script>

<template>
  <div class="employee-list">
    <div class="page-header">
      <div>
        <h1 class="page-title">Colaboradores</h1>
        <p class="page-subtitle" v-if="total > 0">{{ total }} registro(s) encontrado(s)</p>
      </div>
      <div class="page-header-actions">
        <button
          v-if="isAdmin"
          class="btn btn-outline"
          :disabled="exporting || isLoading"
          @click="handleExport"
        >
          {{ exporting ? 'Exportando...' : 'Exportar CSV' }}
        </button>
        <button class="btn btn-primary" @click="goToCreate">
          Novo Colaborador
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <div class="filter-group filter-search">
        <label for="search">Buscar</label>
        <input
          id="search"
          v-model="searchQuery"
          type="text"
          placeholder="Nome do colaborador..."
          @input="onSearchInput"
        />
      </div>

      <div class="filter-group">
        <label for="filter-type">Tipo</label>
        <select id="filter-type" v-model="filterType">
          <option value="">Todos</option>
          <option value="clt">CLT</option>
          <option value="pj">PJ</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-status">Status</label>
        <select id="filter-status" v-model="filterStatus">
          <option value="">Todos</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="terminated">Desligado</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-dept">Departamento</label>
        <select id="filter-dept" v-model="filterDepartment">
          <option :value="undefined">Todos</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Mensagens -->
    <Transition name="fade">
      <div v-if="successMessage" class="alert alert-success" role="status" aria-live="polite">{{ successMessage }}</div>
    </Transition>
    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <!-- Tabela com DataTable reutilizavel -->
    <DataTable
      :columns="columns"
      :data="(employees as unknown as Record<string, unknown>[])"
      :loading="isLoading"
      :currentPage="currentPage"
      :totalPages="totalPages"
      emptyMessage="Nenhum colaborador encontrado"
      emptyDescription="Cadastre o primeiro colaborador ou ajuste os filtros de busca."
      @page-change="onPageChange"
    >
      <!-- Coluna: Nome (link clicavel) -->
      <template #cell-fullName="{ row }">
        <button class="link-button" @click="goToDetail((row as any).id)">
          {{ (row as any).fullName }}
        </button>
      </template>

      <!-- Coluna: Tipo (badge) -->
      <template #cell-type="{ row }">
        <StatusBadge :status="typeLabel((row as any).type)" :variant="(row as any).type === 'clt' ? 'info' : 'neutral'" />
      </template>

      <!-- Coluna: Admissao (formatada) -->
      <template #cell-hireDate="{ row }">
        {{ formatDate((row as any).hireDate) }}
      </template>

      <!-- Coluna: Salario (formatado) -->
      <template #cell-salary="{ row }">
        {{ (row as any).salary ? formatCurrency((row as any).salary) : '-' }}
      </template>

      <!-- Coluna: Status (badge com mapeamento automatico) -->
      <template #cell-status="{ row }">
        <StatusBadge :status="statusLabel((row as any).status)" />
      </template>

      <!-- Coluna: Acoes -->
      <template #cell-actions="{ row }">
        <div class="td-actions">
          <button class="btn-action" @click="goToDetail((row as any).id)" title="Ver detalhes">
            Ver
          </button>
          <button class="btn-action" @click="goToEdit((row as any).id)" title="Editar">
            Editar
          </button>
          <button class="btn-action btn-action-danger" @click="handleDelete(row as unknown as Employee)" title="Excluir">
            Excluir
          </button>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.employee-list {
  max-width: var(--max-width-2xl);
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-12);
}

.page-header-actions {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.page-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: var(--space-2) 0 0;
}

/* Botoes */
.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border: none;
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: #fff;
}

.btn-primary:hover {
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover:not(:disabled) {
  background: var(--color-primary-light);
  border-color: var(--color-primary-dark);
}

.btn-outline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Filtros */
.filters-bar {
  display: flex;
  gap: var(--space-8);
  margin-bottom: var(--space-12);
  flex-wrap: wrap;
  background: var(--color-bg-card);
  padding: var(--filter-bar-padding);
  border-radius: var(--filter-bar-border-radius);
  border: var(--border-width) solid var(--color-border);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-search {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  font-size: var(--filter-label-font-size);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-group input,
.filter-group select {
  padding: var(--space-4) var(--space-6);
  border: var(--border-width) solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  outline: none;
  transition: var(--transition-fast);
}

.filter-group input:focus,
.filter-group select:focus {
  border-color: var(--color-border-focus);
}

/* Link button */
.link-button {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
  padding: 0;
  text-align: left;
}

.link-button:hover {
  text-decoration: underline;
}

/* Acoes */
.td-actions {
  text-align: right;
  white-space: nowrap;
}

.btn-action {
  background: none;
  border: var(--border-width) solid var(--color-border);
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  cursor: pointer;
  margin-left: var(--space-3);
  transition: var(--transition-fast);
}

.btn-action:hover {
  background-color: var(--color-bg-muted);
  border-color: var(--color-border-hover);
}

.btn-action-danger:hover {
  background-color: var(--color-danger-light);
  border-color: var(--color-danger-lighter);
  color: var(--color-danger-dark);
}

/* Alertas */
.alert {
  padding: var(--alert-padding-y) var(--alert-padding-x);
  border-radius: var(--alert-border-radius);
  font-size: var(--alert-font-size);
  margin-bottom: var(--space-8);
}

.alert-error {
  background: var(--color-danger-light);
  border: var(--border-width) solid var(--color-danger-lighter);
  color: var(--color-danger-dark);
}

.alert-success {
  background: var(--color-success-light);
  border: var(--border-width) solid var(--color-success-lighter);
  color: var(--color-success-darker);
}

/* Animacao fade */
.fade-enter-active {
  transition: var(--transition-slow);
}

.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsivo */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--space-8);
  }

  .page-header-actions {
    width: 100%;
    flex-direction: column;
  }

  .page-header-actions .btn {
    width: 100%;
  }

  .filters-bar {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  /* Touch targets - minimo 44px para mobile */
  .btn-action {
    padding: var(--space-4) var(--space-6);
    font-size: var(--font-size-sm);
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
}
</style>
