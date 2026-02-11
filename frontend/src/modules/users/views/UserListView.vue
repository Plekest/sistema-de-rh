<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import userService from '../services/user.service'
import type { SystemUser } from '../types'
import { formatDate } from '@/utils/formatters'

const router = useRouter()

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
  if (!confirm(`Deseja ${action} o usuario "${user.fullName}"?`)) return

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
    <div v-if="isLoading" class="loading-state">Carregando...</div>

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
    <div v-else class="empty-state">
      <p class="empty-title">Nenhum usuario encontrado</p>
      <p class="empty-description">Cadastre o primeiro usuario ou ajuste os filtros.</p>
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
.user-list {
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
  background-color: #2b6cb0;
  color: #fff;
}

.btn-primary:hover {
  background-color: #2c5282;
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
  border-color: #2b6cb0;
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

.td-email {
  color: #718096;
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

.btn-action-success:hover {
  background-color: #f0fff4;
  border-color: #9ae6b4;
  color: #276749;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-role-admin {
  background-color: #faf5ff;
  color: #6b46c1;
}

.badge-role-manager {
  background-color: #ebf4ff;
  color: #2b6cb0;
}

.badge-role-employee {
  background-color: #edf2f7;
  color: #4a5568;
}

.badge-active {
  background-color: #f0fff4;
  color: #276749;
}

.badge-inactive {
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
