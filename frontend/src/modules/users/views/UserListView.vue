<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import userService from '../services/user.service'
import type { SystemUser } from '../types'
import { formatDate } from '@/utils/formatters'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()
const { confirm: confirmDialog } = useConfirmDialog()

// Estado
const users = ref<SystemUser[]>([])
const isLoading = ref(false)
const error = ref('')
const totalPages = ref(1)
const currentPage = ref(1)
const total = ref(0)

// Filtros
const searchQuery = ref('')
const filterRole = ref<'' | 'admin' | 'manager' | 'employee'>('')
const filterStatus = ref<'' | 'active' | 'inactive'>('')

let searchTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Carrega lista de usuarios
 */
async function loadUsers() {
  try {
    isLoading.value = true
    error.value = ''

    const params: Record<string, unknown> = {
      page: currentPage.value,
      limit: 15,
    }

    if (searchQuery.value) params.search = searchQuery.value
    if (filterRole.value) params.role = filterRole.value
    if (filterStatus.value) params.isActive = filterStatus.value === 'active'

    const response = await userService.getAll(params)
    users.value = response.data
    totalPages.value = response.meta.lastPage
    total.value = response.meta.total
  } catch (err: unknown) {
    error.value = 'Erro ao carregar usuarios.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

/**
 * Busca com debounce
 */
function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadUsers()
  }, 400)
}

/**
 * Navega para criacao
 */
function goToCreate() {
  router.push('/users/new')
}

/**
 * Navega para edicao
 */
function goToEdit(id: number) {
  router.push(`/users/${id}/edit`)
}

/**
 * Alterna status ativo/inativo
 */
async function toggleStatus(user: SystemUser) {
  const action = user.isActive ? 'desativar' : 'ativar'

  const result = await confirmDialog({
    title: action === 'desativar' ? 'Desativar Usuario' : 'Ativar Usuario',
    message: `Deseja ${action} o usuario "${user.fullName}"?`,
    variant: action === 'desativar' ? 'warning' : 'info',
    confirmLabel: action === 'desativar' ? 'Desativar' : 'Ativar',
  })

  if (!result) return

  try {
    await userService.update(user.id, { isActive: !user.isActive })
    await loadUsers()
  } catch (err: unknown) {
    error.value = `Erro ao ${action} usuario.`
    console.error(err)
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadUsers()
  }
}

/**
 * Retorna label do perfil
 */
function roleLabel(role: string): string {
  const map: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gestor',
    employee: 'Colaborador',
  }
  return map[role] || role
}

watch([filterRole, filterStatus], () => {
  currentPage.value = 1
  loadUsers()
})

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="user-list">
    <div class="page-header">
      <div>
        <h1 class="page-title">Usuarios</h1>
        <p class="page-subtitle" v-if="total > 0">{{ total }} registro(s) encontrado(s)</p>
      </div>
      <button class="btn btn-primary" @click="goToCreate">
        Novo Usuario
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
          placeholder="Nome ou email..."
          @input="onSearchInput"
        />
      </div>

      <div class="filter-group">
        <label for="filter-role">Perfil</label>
        <select id="filter-role" v-model="filterRole">
          <option value="">Todos</option>
          <option value="admin">Administrador</option>
          <option value="manager">Gestor</option>
          <option value="employee">Colaborador</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-status">Status</label>
        <select id="filter-status" v-model="filterStatus">
          <option value="">Todos</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>
    </div>

    <!-- Erro -->
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner text="Carregando usuarios..." />
    </div>

    <!-- Tabela -->
    <div v-else-if="users.length > 0" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Perfil</th>
            <th>Status</th>
            <th>Data Criacao</th>
            <th class="th-actions">Acoes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="td-name">{{ user.fullName }}</td>
            <td class="td-email">{{ user.email }}</td>
            <td>
              <span class="badge" :class="'badge-role-' + user.role">
                {{ roleLabel(user.role) }}
              </span>
            </td>
            <td>
              <span class="badge" :class="user.isActive ? 'badge-active' : 'badge-inactive'">
                {{ user.isActive ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td class="td-actions">
              <button class="btn-action" @click="goToEdit(user.id)" title="Editar">
                Editar
              </button>
              <button
                class="btn-action"
                :class="user.isActive ? 'btn-action-danger' : 'btn-action-success'"
                @click="toggleStatus(user)"
                :title="user.isActive ? 'Desativar' : 'Ativar'"
              >
                {{ user.isActive ? 'Desativar' : 'Ativar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Estado vazio -->
    <EmptyState
      v-else
      title="Nenhum usuario encontrado"
      description="Cadastre o primeiro usuario ou ajuste os filtros."
    />

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
.user-list {
  max-width: var(--max-width-2xl, 1200px);
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-12, 1.5rem);
}

.page-title {
  font-size: var(--font-size-3xl, 1.5rem);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text-primary, #1a202c);
  margin: 0;
}

.page-subtitle {
  font-size: var(--font-size-sm, 0.813rem);
  color: var(--color-text-muted, #718096);
  margin: var(--space-2, 0.25rem) 0 0;
}

/* Botoes */
.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--btn-padding-y, 0.625rem) var(--btn-padding-x, 1.25rem);
  border: none;
  border-radius: var(--btn-border-radius, 6px);
  font-size: var(--btn-font-size, 0.875rem);
  font-weight: var(--btn-font-weight, 600);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: var(--color-bg-card, #fff);
}

.btn-primary:hover {
  box-shadow: var(--shadow-primary, 0 4px 12px rgba(102, 126, 234, 0.35));
  transform: translateY(-1px);
}

/* Filtros */
.filters-bar {
  display: flex;
  gap: var(--space-8, 1rem);
  margin-bottom: var(--space-12, 1.5rem);
  flex-wrap: wrap;
  background: var(--color-bg-card, #fff);
  padding: var(--filter-bar-padding, 1rem 1.25rem);
  border-radius: var(--filter-bar-border-radius, 8px);
  border: var(--border-width, 1px) solid var(--color-border, #e2e8f0);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 0.25rem);
}

.filter-search {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  font-size: var(--filter-label-font-size, 0.75rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-text-tertiary, #4a5568);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-group input,
.filter-group select {
  padding: var(--input-padding-y, 0.5rem) var(--input-padding-x, 0.75rem);
  border: var(--border-width, 1px) solid var(--color-border, #e2e8f0);
  border-radius: var(--input-border-radius, 5px);
  font-size: var(--font-size-base, 0.875rem);
  color: var(--color-text-secondary, #2d3748);
  background: var(--color-bg-input, #fff);
  outline: none;
  transition: border-color var(--transition-fast, 0.15s);
}

.filter-group input:focus,
.filter-group select:focus {
  border-color: var(--color-border-focus, #667eea);
}

/* Tabela */
.table-container {
  background: var(--color-bg-card, #fff);
  border-radius: var(--card-border-radius, 8px);
  border: var(--border-width, 1px) solid var(--color-border, #e2e8f0);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: var(--table-cell-padding-y, 0.75rem) var(--table-cell-padding-x, 1rem);
  font-size: var(--table-header-font-size, 0.75rem);
  font-weight: var(--table-header-font-weight, 600);
  color: var(--table-header-color, #4a5568);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: var(--border-width-thick, 2px) solid var(--color-border, #e2e8f0);
  white-space: nowrap;
}

.data-table td {
  padding: var(--table-cell-padding-y, 0.75rem) var(--table-cell-padding-x, 1rem);
  font-size: var(--font-size-base, 0.875rem);
  color: var(--color-text-secondary, #2d3748);
  border-bottom: var(--border-width, 1px) solid var(--color-border-light, #f0f0f0);
}

.data-table tbody tr:hover {
  background-color: var(--table-row-hover-bg, #f7fafc);
}

.th-actions {
  text-align: right;
}

.td-actions {
  text-align: right;
  white-space: nowrap;
}

.td-name {
  font-weight: var(--font-weight-medium, 500);
}

.td-email {
  color: var(--color-text-muted, #718096);
}

.btn-action {
  background: none;
  border: var(--border-width, 1px) solid var(--color-border, #e2e8f0);
  padding: var(--space-2, 0.25rem) var(--space-5, 0.625rem);
  border-radius: var(--radius-xs, 4px);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-tertiary, #4a5568);
  cursor: pointer;
  margin-left: var(--space-3, 0.375rem);
  transition: all var(--transition-fast, 0.15s);
}

.btn-action:hover {
  background-color: var(--color-bg-muted, #edf2f7);
  border-color: var(--color-border-hover, #cbd5e0);
}

.btn-action-danger:hover {
  background-color: var(--color-danger-light, #fff5f5);
  border-color: var(--color-danger-lighter, #feb2b2);
  color: var(--color-danger-dark, #c53030);
}

.btn-action-success:hover {
  background-color: var(--color-success-light, #f0fff4);
  border-color: var(--color-success-lighter, #9ae6b4);
  color: var(--color-success-dark, #276749);
}

/* Badges */
.badge {
  display: inline-block;
  padding: var(--badge-padding-y, 0.125rem) var(--badge-padding-x, 0.5rem);
  border-radius: var(--badge-border-radius, 10px);
  font-size: var(--badge-font-size, 0.75rem);
  font-weight: var(--badge-font-weight, 600);
}

.badge-role-admin {
  background-color: var(--color-secondary-light, #faf5ff);
  color: var(--color-secondary-dark, #6b46c1);
}

.badge-role-manager {
  background-color: var(--color-primary-light, #ebf4ff);
  color: var(--color-primary, #667eea);
}

.badge-role-employee {
  background-color: var(--color-bg-muted, #edf2f7);
  color: var(--color-text-tertiary, #4a5568);
}

.badge-active {
  background-color: var(--color-success-light, #f0fff4);
  color: var(--color-success-dark, #276749);
}

.badge-inactive {
  background-color: var(--color-danger-light, #fff5f5);
  color: var(--color-danger-dark, #c53030);
}

/* Paginacao */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-8, 1rem);
  margin-top: var(--space-12, 1.5rem);
}

.pagination-btn {
  padding: var(--pagination-btn-padding-y, 0.5rem) var(--pagination-btn-padding-x, 1rem);
  border: var(--border-width, 1px) solid var(--color-border, #e2e8f0);
  border-radius: var(--input-border-radius, 5px);
  background: var(--color-bg-card, #fff);
  color: var(--color-text-tertiary, #4a5568);
  font-size: var(--font-size-base, 0.875rem);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s);
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--color-bg-muted, #edf2f7);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: var(--font-size-base, 0.875rem);
  color: var(--color-text-muted, #718096);
}

/* Estados */
.loading-state {
  text-align: center;
  padding: var(--space-24, 3rem) var(--space-8, 1rem);
  color: var(--color-text-muted, #718096);
  font-size: var(--font-size-base, 0.875rem);
}

.empty-state {
  text-align: center;
  padding: var(--space-24, 3rem) var(--space-8, 1rem);
  background: var(--color-bg-card, #fff);
  border-radius: var(--card-border-radius, 8px);
  border: var(--border-width, 1px) solid var(--color-border, #e2e8f0);
}

.empty-title {
  font-size: var(--font-size-lg, 1rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-text-tertiary, #4a5568);
  margin: 0 0 var(--space-4, 0.5rem);
}

.empty-description {
  font-size: var(--font-size-base, 0.875rem);
  color: var(--color-text-muted, #718096);
  margin: 0;
}

.alert {
  padding: var(--alert-padding-y, 0.75rem) var(--alert-padding-x, 1rem);
  border-radius: var(--alert-border-radius, 6px);
  font-size: var(--alert-font-size, 0.875rem);
  margin-bottom: var(--space-8, 1rem);
}

.alert-error {
  background: var(--color-danger-light, #fff5f5);
  border: var(--border-width, 1px) solid var(--color-danger-lighter, #fed7d7);
  color: var(--color-danger-dark, #c53030);
}

/* Responsivo */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--space-8, 1rem);
  }

  .filters-bar {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .data-table th,
  .data-table td {
    padding: var(--space-4, 0.5rem) var(--space-5, 0.625rem);
    font-size: var(--font-size-xs, 0.75rem);
  }

  /* Touch targets - minimo 44px para mobile */
  .btn-action {
    padding: var(--space-4, 0.5rem) var(--space-6, 0.75rem);
    font-size: var(--font-size-sm, 0.813rem);
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
}
</style>
