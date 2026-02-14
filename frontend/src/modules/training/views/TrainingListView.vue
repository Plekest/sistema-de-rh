<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useTraining } from '../composables/useTraining'
import TrainingFilters from '../components/TrainingFilters.vue'
import TrainingCard from '../components/TrainingCard.vue'
import TrainingForm from '../components/TrainingForm.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { Training } from '../types'

/**
 * View principal de treinamentos.
 *
 * Exibe:
 * - Stats cards (total, em andamento, concluidos, taxa de conclusao)
 * - Filtros (status, tipo, categoria, busca)
 * - Cards de treinamentos com acoes
 * - Modal de detalhes
 * - Modal de formulario (criar/editar)
 * - Modal de inscricao de colaboradores
 * - Paginacao
 *
 * Toda logica esta centralizada no composable useTraining.
 */

const {
  // Estado
  trainings,
  training,
  stats,
  employees,
  isLoading,
  error,
  successMessage,
  // Filtros
  filters,
  pagination,
  // Formulario
  showForm,
  formLoading,
  formError,
  formData,
  isEditing,
  // Modal detalhes
  showDetails,
  // Modal inscricao
  showEnrollModal,
  selectedEmployees,
  enrollLoading,
  // Computed
  isAdmin,
  // Labels
  typeLabels,
  statusLabels,
  enrollmentStatusLabels,
  // Export
  exporting,
  // Metodos
  fetchTrainings,
  openForm,
  openEditForm,
  closeForm,
  submitForm,
  deleteTraining,
  openDetails,
  closeDetails,
  openEnrollModal,
  closeEnrollModal,
  enrollEmployees,
  formatDate,
  formatStatus,
  init,
  handleExport,
} = useTraining()

// Computed properties para garantir valores não-undefined
const filterStatus = computed({
  get: () => filters.value.status ?? '',
  set: (val) => { filters.value.status = val }
})

const filterType = computed({
  get: () => filters.value.type ?? '',
  set: (val) => { filters.value.type = val }
})

const filterCategory = computed({
  get: () => filters.value.category ?? '',
  set: (val) => { filters.value.category = val }
})

const filterSearch = computed({
  get: () => filters.value.search ?? '',
  set: (val) => { filters.value.search = val }
})

// Recarrega ao mudar filtros
watch(
  () => [filters.value.status, filters.value.type, filters.value.category, filters.value.search],
  () => {
    fetchTrainings()
  }
)

onMounted(() => {
  init()
})

/**
 * Formata taxa de conclusao
 */
function formatCompletionRate(rate: number): string {
  return `${Math.round(rate)}%`
}

/**
 * Toggle selecao de colaborador para inscricao
 */
function toggleEmployee(employeeId: number) {
  const index = selectedEmployees.value.indexOf(employeeId)
  if (index > -1) {
    selectedEmployees.value.splice(index, 1)
  } else {
    selectedEmployees.value.push(employeeId)
  }
}

/**
 * Verifica se colaborador esta selecionado
 */
function isEmployeeSelected(employeeId: number): boolean {
  return selectedEmployees.value.includes(employeeId)
}
</script>

<template>
  <div class="training-list-view">
    <div class="page-header">
      <h1 class="page-title">Treinamentos</h1>
      <div class="page-header-actions">
        <button
          v-if="isAdmin"
          class="btn-outline"
          :disabled="exporting || isLoading"
          @click="handleExport"
        >
          {{ exporting ? 'Exportando...' : 'Exportar CSV' }}
        </button>
        <button v-if="isAdmin" class="btn-primary" @click="openForm">
          Novo Treinamento
        </button>
      </div>
    </div>

    <!-- Mensagens -->
    <Transition name="fade">
      <div v-if="successMessage" class="alert alert-success" role="status" aria-live="polite">
        {{ successMessage }}
      </div>
    </Transition>
    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total de Treinamentos</div>
        <div class="stat-value">{{ stats.total }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Em Andamento</div>
        <div class="stat-value stat-info">{{ stats.inProgress }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Concluidos</div>
        <div class="stat-value stat-success">{{ stats.completed }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Taxa de Conclusao</div>
        <div class="stat-value stat-primary">{{ formatCompletionRate(stats.completionRate) }}</div>
      </div>
    </div>

    <!-- Filtros -->
    <TrainingFilters
      v-model:status="filterStatus"
      v-model:type="filterType"
      v-model:category="filterCategory"
      v-model:search="filterSearch"
      :typeLabels="typeLabels"
      :statusLabels="statusLabels"
    />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando treinamentos...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="trainings.length === 0" class="empty-state">
      <p class="empty-title">Nenhum treinamento encontrado</p>
      <p class="empty-description">
        Nao ha treinamentos cadastrados ou que correspondam aos filtros selecionados.
      </p>
      <button v-if="isAdmin" class="btn-primary" @click="openForm">
        Criar Primeiro Treinamento
      </button>
    </div>

    <!-- Lista de Treinamentos (Cards) -->
    <div v-else class="trainings-grid">
      <TrainingCard
        v-for="item in trainings"
        :key="item.id"
        :training="item"
        :isAdmin="isAdmin"
        :typeLabels="typeLabels"
        :statusLabels="statusLabels"
        @view="openDetails"
        @edit="openEditForm"
        @enroll="openEnrollModal"
        @delete="deleteTraining"
      />
    </div>

    <!-- Paginacao -->
    <div v-if="pagination.lastPage > 1" class="pagination">
      <button
        class="pagination-btn"
        :disabled="filters.page === 1"
        @click="filters.page = (filters.page || 1) - 1"
      >
        Anterior
      </button>
      <span class="pagination-info">
        Pagina {{ filters.page }} de {{ pagination.lastPage }}
      </span>
      <button
        class="pagination-btn"
        :disabled="filters.page === pagination.lastPage"
        @click="filters.page = (filters.page || 1) + 1"
      >
        Proxima
      </button>
    </div>

    <!-- Modal de Formulario -->
    <TrainingForm
      :show="showForm"
      :formData="formData"
      :formLoading="formLoading"
      :formError="formError"
      :isEditing="isEditing"
      :typeLabels="typeLabels"
      :statusLabels="statusLabels"
      @close="closeForm"
      @submit="submitForm"
      @update:formData="formData = $event"
    />

    <!-- Modal de Detalhes -->
    <BaseModal
      :show="showDetails"
      title="Detalhes do Treinamento"
      size="large"
      @close="closeDetails"
    >
      <div v-if="training" class="details-content">
        <div class="details-section">
          <h3 class="section-title">Informacoes Gerais</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Titulo:</span>
              <span class="detail-value">{{ training.title }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tipo:</span>
              <span class="detail-value">{{ typeLabels[training.type] }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="detail-value">{{ statusLabels[training.status] }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Categoria:</span>
              <span class="detail-value">{{ training.category || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Instrutor:</span>
              <span class="detail-value">{{ training.instructor || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Fornecedor:</span>
              <span class="detail-value">{{ training.provider || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Periodo:</span>
              <span class="detail-value">
                {{ formatDate(training.startDate) }} - {{ formatDate(training.endDate) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Duracao:</span>
              <span class="detail-value">{{ training.durationHours }} horas</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Local:</span>
              <span class="detail-value">{{ training.location || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Maximo de Participantes:</span>
              <span class="detail-value">{{ training.maxParticipants || 'Ilimitado' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Obrigatorio:</span>
              <span class="detail-value">{{ training.isMandatory ? 'Sim' : 'Nao' }}</span>
            </div>
            <div v-if="training.description" class="detail-item detail-full">
              <span class="detail-label">Descricao:</span>
              <span class="detail-value">{{ training.description }}</span>
            </div>
            <div v-if="training.notes" class="detail-item detail-full">
              <span class="detail-label">Observacoes:</span>
              <span class="detail-value">{{ training.notes }}</span>
            </div>
          </div>
        </div>

        <div v-if="training.enrollments && training.enrollments.length > 0" class="details-section">
          <h3 class="section-title">Inscritos ({{ training.enrollments.length }})</h3>
          <div class="enrollments-table">
            <table>
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Inscrito em</th>
                  <th>Concluido em</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="enrollment in training.enrollments" :key="enrollment.id">
                  <td>{{ enrollment.employee?.fullName || 'N/A' }}</td>
                  <td>{{ enrollment.employee?.email || 'N/A' }}</td>
                  <td>{{ enrollmentStatusLabels[enrollment.status] }}</td>
                  <td>{{ formatDate(enrollment.enrolledAt) }}</td>
                  <td>{{ enrollment.completedAt ? formatDate(enrollment.completedAt) : '-' }}</td>
                  <td>{{ enrollment.score !== null ? enrollment.score : '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- Modal de Inscricao -->
    <BaseModal
      :show="showEnrollModal"
      title="Inscrever Colaboradores"
      size="medium"
      @close="closeEnrollModal"
    >
      <div class="enroll-content">
        <p class="enroll-description">
          Selecione os colaboradores que deseja inscrever neste treinamento:
        </p>
        <div class="employees-list">
          <label
            v-for="employee in employees"
            :key="employee.id"
            class="employee-checkbox"
          >
            <input
              type="checkbox"
              :checked="isEmployeeSelected(employee.id)"
              @change="toggleEmployee(employee.id)"
            />
            <span>{{ employee.fullName }}</span>
          </label>
        </div>
        <div class="enroll-actions">
          <button class="btn-secondary" @click="closeEnrollModal">Cancelar</button>
          <button
            class="btn-primary"
            :disabled="selectedEmployees.length === 0 || enrollLoading"
            @click="enrollEmployees"
          >
            {{ enrollLoading ? 'Inscrevendo...' : `Inscrever (${selectedEmployees.length})` }}
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.training-list-view {
  max-width: var(--max-width-2xl);
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.btn-primary {
  padding: var(--btn-padding-y) var(--btn-padding-x);
  background: var(--color-primary-gradient);
  color: #fff;
  border: none;
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 44px;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  padding: var(--btn-padding-y) var(--btn-padding-x);
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 44px;
}

.btn-outline:hover:not(:disabled) {
  background: var(--color-primary-light);
  border-color: var(--color-primary-dark);
}

.btn-outline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Alertas */
.alert {
  padding: var(--alert-padding-y) var(--alert-padding-x);
  border-radius: var(--alert-border-radius);
  font-size: var(--alert-font-size);
  margin-bottom: var(--space-8);
}

.alert-success {
  background: var(--color-success-lighter);
  border: var(--border-width) solid var(--color-success-bg);
  color: var(--color-success-dark);
}

.alert-error {
  background: var(--color-danger-light);
  border: var(--border-width) solid var(--color-danger-lighter);
  color: var(--color-danger-dark);
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

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-8);
  margin-bottom: var(--space-12);
}

.stat-card {
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  padding: var(--card-padding);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.stat-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.stat-info {
  color: var(--color-info);
}

.stat-success {
  color: var(--color-success);
}

.stat-primary {
  color: var(--color-primary);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-24);
  gap: var(--space-8);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-24);
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
}

.empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-4) 0;
}

.empty-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-10) 0;
}

/* Grid de Treinamentos */
.trainings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--space-10);
  margin-bottom: var(--space-12);
}

/* Paginacao */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-10) 0;
}

.pagination-btn {
  padding: var(--pagination-btn-padding-y) var(--pagination-btn-padding-x);
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--btn-border-radius);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 44px;
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
}

/* Modal de Detalhes */
.details-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
}

.details-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  padding-bottom: var(--space-4);
  border-bottom: var(--border-width) solid var(--color-border);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.detail-full {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.enrollments-table {
  overflow-x: auto;
}

.enrollments-table table {
  width: 100%;
  border-collapse: collapse;
}

.enrollments-table th,
.enrollments-table td {
  padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
  text-align: left;
  border-bottom: var(--border-width) solid var(--table-row-border-color);
  font-size: var(--font-size-sm);
}

.enrollments-table th {
  background: var(--table-header-bg);
  color: var(--table-header-color);
  font-size: var(--table-header-font-size);
  font-weight: var(--table-header-font-weight);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.enrollments-table td {
  color: var(--color-text-secondary);
}

/* Modal de Inscricao */
.enroll-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.enroll-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.employees-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-height: 400px;
  overflow-y: auto;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
}

.employee-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.employee-checkbox:hover {
  background: var(--color-bg-hover);
}

.employee-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.enroll-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-4);
  padding-top: var(--space-8);
  border-top: var(--border-width) solid var(--color-border);
}

.btn-secondary {
  padding: var(--btn-padding-y) var(--btn-padding-x);
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 44px;
}

.btn-secondary:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-8);
  }

  .page-header-actions {
    width: 100%;
    flex-direction: column;
  }

  .page-header-actions .btn-primary,
  .page-header-actions .btn-outline {
    width: 100%;
  }

  .trainings-grid {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-direction: column;
  }
}
</style>
