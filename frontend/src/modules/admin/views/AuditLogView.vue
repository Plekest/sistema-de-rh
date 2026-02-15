<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuditLog } from '../composables/useAuditLog'

const {
  logs,
  isLoading,
  error,
  pagination,
  filters,
  hasFilters,
  loadLogs,
  goToPage,
  clearFilters,
  applyFilters,
  toggleExpand,
  isExpanded,
} = useAuditLog()

const actionConfig: Record<string, { label: string; color: string; bg: string }> = {
  create: { label: 'Criar', color: 'var(--color-success-dark)', bg: 'var(--color-success-light)' },
  update: { label: 'Atualizar', color: 'var(--color-info-dark)', bg: 'var(--color-info-light)' },
  delete: { label: 'Excluir', color: 'var(--color-danger-dark)', bg: 'var(--color-danger-light)' },
  login: { label: 'Login', color: 'var(--color-primary-dark)', bg: 'var(--color-primary-light)' },
  logout: { label: 'Logout', color: 'var(--color-text-muted)', bg: 'var(--color-bg-subtle)' },
  export: { label: 'Exportar', color: 'var(--color-warning-dark)', bg: 'var(--color-warning-light)' },
  import: { label: 'Importar', color: 'var(--color-secondary-dark)', bg: 'var(--color-secondary-light)' },
  other: { label: 'Outro', color: 'var(--color-text-muted)', bg: 'var(--color-bg-subtle)' },
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatJSON(obj: Record<string, any> | undefined | null): string {
  if (!obj) return ''
  return JSON.stringify(obj, null, 2)
}

onMounted(() => {
  loadLogs()
})
</script>

<template>
  <div class="audit-log-view">
    <!-- Header -->
    <div class="view-header">
      <div>
        <h1 class="view-title">Audit Log</h1>
        <p class="view-subtitle">Registro de todas as ações do sistema</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-card">
      <div class="filters-grid">
        <div class="filter-group">
          <label for="filter-action" class="filter-label">Ação</label>
          <select v-model="filters.action" id="filter-action" class="filter-select">
            <option :value="undefined">Todas</option>
            <option value="create">Criar</option>
            <option value="update">Atualizar</option>
            <option value="delete">Excluir</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="export">Exportar</option>
            <option value="import">Importar</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-resource" class="filter-label">Recurso</label>
          <input
            v-model="filters.resource"
            type="text"
            id="filter-resource"
            class="filter-input"
            placeholder="employees, users, etc."
          />
        </div>

        <div class="filter-group">
          <label for="filter-from" class="filter-label">De</label>
          <input v-model="filters.from" type="date" id="filter-from" class="filter-input" />
        </div>

        <div class="filter-group">
          <label for="filter-to" class="filter-label">Até</label>
          <input v-model="filters.to" type="date" id="filter-to" class="filter-input" />
        </div>
      </div>

      <div class="filters-actions">
        <button class="btn-primary" @click="applyFilters" :disabled="isLoading">
          Aplicar Filtros
        </button>
        <button
          v-if="hasFilters"
          class="btn-secondary"
          @click="clearFilters"
          :disabled="isLoading"
        >
          Limpar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando logs...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn-primary" @click="loadLogs">Tentar novamente</button>
    </div>

    <!-- Lista de Logs -->
    <div v-else-if="logs.length > 0" class="logs-container">
      <div class="table-wrapper">
        <table class="logs-table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Recurso</th>
              <th>Descrição</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="log in logs" :key="log.id">
              <tr class="log-row" :class="{ expanded: isExpanded(log.id) }">
                <td class="log-date">{{ formatDateTime(log.createdAt) }}</td>
                <td class="log-user">{{ log.userName }}</td>
                <td>
                  <span
                    class="action-badge"
                    :style="{
                      color: actionConfig[log.action]?.color,
                      backgroundColor: actionConfig[log.action]?.bg,
                    }"
                  >
                    {{ actionConfig[log.action]?.label || log.action }}
                  </span>
                </td>
                <td class="log-resource">{{ log.resource }}</td>
                <td class="log-description">{{ log.description }}</td>
                <td>
                  <button
                    v-if="log.oldValues || log.newValues"
                    class="expand-btn"
                    @click="toggleExpand(log.id)"
                    :aria-label="isExpanded(log.id) ? 'Recolher' : 'Expandir'"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      :class="{ rotated: isExpanded(log.id) }"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </td>
              </tr>

              <!-- Expanded Details -->
              <tr v-if="isExpanded(log.id)" class="log-details-row">
                <td colspan="6">
                  <div class="log-details">
                    <div v-if="log.oldValues" class="detail-section">
                      <h4>Valores Antigos</h4>
                      <pre class="json-pre">{{ formatJSON(log.oldValues) }}</pre>
                    </div>
                    <div v-if="log.newValues" class="detail-section">
                      <h4>Valores Novos</h4>
                      <pre class="json-pre">{{ formatJSON(log.newValues) }}</pre>
                    </div>
                    <div v-if="log.ipAddress || log.userAgent" class="detail-section">
                      <h4>Informações Técnicas</h4>
                      <p v-if="log.ipAddress"><strong>IP:</strong> {{ log.ipAddress }}</p>
                      <p v-if="log.userAgent"><strong>User Agent:</strong> {{ log.userAgent }}</p>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Paginação -->
      <div v-if="pagination && pagination.lastPage > 1" class="pagination">
        <button
          class="pagination-btn"
          :disabled="pagination.page === 1"
          @click="goToPage(pagination.page - 1)"
        >
          Anterior
        </button>
        <span class="pagination-info">
          Página {{ pagination.page }} de {{ pagination.lastPage }}
        </span>
        <button
          class="pagination-btn"
          :disabled="pagination.page === pagination.lastPage"
          @click="goToPage(pagination.page + 1)"
        >
          Próxima
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>Nenhum log encontrado</p>
    </div>
  </div>
</template>

<style scoped>
.audit-log-view {
  max-width: var(--max-width-2xl);
  margin: 0 auto;
}

/* Header */
.view-header {
  margin-bottom: var(--space-12);
}

.view-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.view-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
}

/* Filtros */
.filters-card {
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-10);
  margin-bottom: var(--space-12);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-input,
.filter-select {
  padding: var(--space-4) var(--space-6);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  transition: all var(--transition-fast);
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--input-focus-ring);
}

.filters-actions {
  display: flex;
  gap: var(--space-4);
}

.btn-primary,
.btn-secondary {
  padding: var(--space-4) var(--space-12);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-bg-hover);
}

/* Loading & Error & Empty */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: var(--space-24);
  color: var(--color-text-muted);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
  margin: 0 auto var(--space-8);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  color: var(--color-danger);
}

/* Table */
.logs-container {
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table thead {
  background: var(--table-header-bg);
  border-bottom: var(--border-width) solid var(--color-border);
}

.logs-table th {
  text-align: left;
  padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
  font-size: var(--table-header-font-size);
  font-weight: var(--table-header-font-weight);
  color: var(--table-header-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.logs-table tbody tr.log-row {
  border-bottom: var(--border-width) solid var(--table-row-border-color);
  transition: background var(--transition-fast);
}

.logs-table tbody tr.log-row:hover {
  background: var(--table-row-hover-bg);
}

.logs-table tbody tr.log-row.expanded {
  background: var(--color-primary-light);
}

.logs-table td {
  padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.log-date {
  font-family: monospace;
  white-space: nowrap;
  font-size: var(--font-size-xs);
}

.log-user {
  font-weight: var(--font-weight-medium);
}

.action-badge {
  display: inline-block;
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  white-space: nowrap;
}

.log-resource {
  font-family: monospace;
  font-size: var(--font-size-xs);
}

.log-description {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.expand-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.expand-btn svg {
  transition: transform var(--transition-fast);
}

.expand-btn svg.rotated {
  transform: rotate(180deg);
}

/* Details Row */
.log-details-row {
  background: var(--color-bg-subtle);
}

.log-details {
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.detail-section h4 {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-tertiary);
  margin: 0 0 var(--space-4) 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.json-pre {
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-6);
  font-size: var(--font-size-xs);
  font-family: monospace;
  color: var(--color-text-secondary);
  overflow-x: auto;
  margin: 0;
}

.detail-section p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--space-2) 0;
}

.detail-section strong {
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-semibold);
}

/* Paginação */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-8);
  padding: var(--space-10);
  border-top: var(--border-width) solid var(--color-border);
}

.pagination-btn {
  padding: var(--pagination-btn-padding-y) var(--pagination-btn-padding-x);
  background: var(--color-bg-subtle);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

/* Responsive */
@media (max-width: 1024px) {
  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .view-title {
    font-size: var(--font-size-2xl);
  }

  .table-wrapper {
    overflow-x: scroll;
  }

  .logs-table {
    min-width: 800px;
  }
}
</style>
