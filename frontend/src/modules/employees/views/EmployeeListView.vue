<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import employeeService from '../services/employee.service'
import type { Employee, Department, EmployeeListParams } from '../types'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useApiError } from '@/composables/useApiError'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { DataTableColumn } from '@/components/common/types'

const router = useRouter()
const authStore = useAuthStore()
const { confirm: confirmDialog } = useConfirmDialog()
const { error, handleError, clearError } = useApiError()

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
      <button class="btn btn-primary" @click="goToCreate">
        Novo Colaborador
      </button>
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
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.page-subtitle {
  font-size: 0.813rem;
  color: #718096;
  margin: 0.25rem 0 0;
}

/* Botoes */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
  transform: translateY(-1px);
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

.filter-search {
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

.filter-group input,
.filter-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}

.filter-group input:focus,
.filter-group select:focus {
  border-color: #667eea;
}

/* Link button */
.link-button {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
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
  border: 1px solid #e2e8f0;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #4a5568;
  cursor: pointer;
  margin-left: 0.375rem;
  transition: all 0.15s;
}

.btn-action:hover {
  background-color: #edf2f7;
  border-color: #cbd5e0;
}

.btn-action-danger:hover {
  background-color: #fff5f5;
  border-color: #feb2b2;
  color: #c53030;
}

/* Alertas */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #c53030;
}

.alert-success {
  background: #f0fff4;
  border: 1px solid #c6f6d5;
  color: #276749;
}

/* Animacao fade */
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

/* Responsivo */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .filters-bar {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  /* Touch targets - minimo 44px para mobile */
  .btn-action {
    padding: 0.5rem 0.75rem;
    font-size: 0.813rem;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
}
</style>
