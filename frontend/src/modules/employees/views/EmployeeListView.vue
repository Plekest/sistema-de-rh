<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import employeeService from '../services/employee.service'
import type { Employee, Department, EmployeeListParams } from '../types'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const router = useRouter()
const authStore = useAuthStore()
const { confirm: confirmDialog } = useConfirmDialog()

const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

// Estado
const employees = ref<Employee[]>([])
const departments = ref<Department[]>([])
const isLoading = ref(false)
const error = ref('')
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
 * Carrega lista de colaboradores
 */
async function loadEmployees() {
  try {
    isLoading.value = true
    error.value = ''

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
    error.value = 'Erro ao carregar colaboradores. Tente novamente.'
    console.error('Erro ao carregar colaboradores:', err)
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
    await loadEmployees()
  } catch (err: unknown) {
    error.value = 'Erro ao excluir colaborador.'
    console.error('Erro ao excluir:', err)
  }
}

/**
 * Navega para pagina
 */
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadEmployees()
  }
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

    <!-- Erro -->
    <div v-if="error" class="alert alert-error" role="alert">
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      Carregando...
    </div>

    <!-- Tabela -->
    <div v-else-if="employees.length > 0" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Departamento</th>
            <th>Cargo</th>
            <th>Admissao</th>
            <th>Salario</th>
            <th>Status</th>
            <th class="th-actions">Acoes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in employees" :key="emp.id">
            <td class="td-name">
              <button class="link-button" @click="goToDetail(emp.id)">
                {{ emp.fullName }}
              </button>
            </td>
            <td>
              <span class="badge" :class="'badge-' + emp.type">
                {{ typeLabel(emp.type) }}
              </span>
            </td>
            <td>{{ emp.department?.name || '-' }}</td>
            <td>{{ emp.position?.title || '-' }}</td>
            <td>{{ formatDate(emp.hireDate) }}</td>
            <td>{{ emp.salary ? formatCurrency(emp.salary) : '-' }}</td>
            <td>
              <span class="badge" :class="'badge-' + emp.status">
                {{ statusLabel(emp.status) }}
              </span>
            </td>
            <td class="td-actions">
              <button class="btn-action" @click="goToDetail(emp.id)" title="Ver detalhes">
                Ver
              </button>
              <button class="btn-action" @click="goToEdit(emp.id)" title="Editar">
                Editar
              </button>
              <button class="btn-action btn-action-danger" @click="handleDelete(emp)" title="Excluir">
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Estado vazio -->
    <div v-else class="empty-state">
      <p class="empty-title">Nenhum colaborador encontrado</p>
      <p class="empty-description">Cadastre o primeiro colaborador ou ajuste os filtros de busca.</p>
    </div>

    <!-- Paginacao -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        class="pagination-btn"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
      >
        Anterior
      </button>
      <span class="pagination-info">
        Pagina {{ currentPage }} de {{ totalPages }}
      </span>
      <button
        class="pagination-btn"
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
      >
        Proxima
      </button>
    </div>
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

.data-table tbody tr:nth-child(even) {
  background-color: #fafbfc;
}

.data-table tbody tr:nth-child(even):hover {
  background-color: #f0f4f8;
}

.th-actions {
  text-align: right;
}

.td-actions {
  text-align: right;
  white-space: nowrap;
}

.td-name {
  font-weight: 500;
}

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

/* Badges */
.badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-clt {
  background-color: #ebf4ff;
  color: #667eea;
}

.badge-pj {
  background-color: #faf5ff;
  color: #6b46c1;
}

.badge-active {
  background-color: #f0fff4;
  color: #276749;
}

.badge-inactive {
  background-color: #fffff0;
  color: #975a16;
}

.badge-terminated {
  background-color: #fff5f5;
  color: #c53030;
}

/* Paginacao */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  background: #fff;
  color: #4a5568;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #edf2f7;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: #718096;
}

/* Estados */
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 0.5rem;
}

.empty-description {
  font-size: 0.875rem;
  color: #a0aec0;
  margin: 0;
}

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

  .data-table th,
  .data-table td {
    padding: 0.5rem 0.625rem;
    font-size: 0.75rem;
  }
}
</style>
