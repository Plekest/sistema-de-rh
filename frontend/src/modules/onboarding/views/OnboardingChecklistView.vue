<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useChecklists } from '../composables/useChecklists'
import ChecklistProgress from '../components/ChecklistProgress.vue'
import type { OnboardingChecklistItem } from '../types'

const {
  checklists,
  selectedChecklist,
  isLoading,
  error,
  successMessage,
  filterStatus,
  isAdmin,
  statusLabels,
  itemStatusLabels,
  loadChecklists,
  selectChecklist,
  completeItem,
  skipItem,
  calculateProgress,
  isOverdue,
  canCompleteItem,
  formatDate,
  init,
} = useChecklists()

const selectedItem = ref<OnboardingChecklistItem | null>(null)
const showNotesModal = ref(false)
const notesText = ref('')
const actionType = ref<'complete' | 'skip'>('complete')

function openNotesModal(item: OnboardingChecklistItem, action: 'complete' | 'skip') {
  selectedItem.value = item
  actionType.value = action
  notesText.value = ''
  showNotesModal.value = true
}

function closeNotesModal() {
  showNotesModal.value = false
  selectedItem.value = null
  notesText.value = ''
}

async function handleSaveNotes() {
  if (!selectedItem.value) return

  if (actionType.value === 'complete') {
    await completeItem(selectedItem.value, notesText.value || undefined)
  } else {
    await skipItem(selectedItem.value, notesText.value || undefined)
  }

  closeNotesModal()
}

function getItemStatusClass(item: OnboardingChecklistItem): string {
  if (item.status === 'completed') return 'status-completed'
  if (item.status === 'skipped') return 'status-skipped'
  if (isOverdue(item)) return 'status-overdue'
  return 'status-pending'
}

function getResponsibleBadge(responsible: string): string {
  const badges: Record<string, string> = {
    hr: 'RH',
    manager: 'Gestor',
    it: 'TI',
    employee: 'Colaborador',
  }
  return badges[responsible] || responsible
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="checklist-view">
    <!-- Cabecalho -->
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">Checklists de Onboarding</h1>
        <p class="page-subtitle">Acompanhe os processos de integração e desligamento</p>
      </div>
    </div>

    <!-- Mensagens -->
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- Filtros -->
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select v-model="filterStatus" @change="loadChecklists" class="filter-select">
          <option value="">Todos</option>
          <option value="in_progress">Em Andamento</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && !selectedChecklist" class="loading">Carregando...</div>

    <!-- Layout principal -->
    <div v-else class="main-layout">
      <!-- Lista de checklists -->
      <div class="checklists-list">
        <div v-if="checklists.length === 0" class="empty-state">
          <p>Nenhuma checklist encontrada</p>
        </div>

        <div
          v-for="checklist in checklists"
          :key="checklist.id"
          class="checklist-card"
          :class="{ active: selectedChecklist?.id === checklist.id }"
          @click="selectChecklist(checklist)"
        >
          <div class="checklist-header">
            <div class="checklist-title-row">
              <h3 class="checklist-name">{{ checklist.employee?.fullName || 'Colaborador' }}</h3>
              <span class="badge" :class="`badge-${checklist.type}`">
                {{ checklist.type === 'onboarding' ? 'Integração' : 'Desligamento' }}
              </span>
            </div>
            <span class="badge badge-status" :class="`badge-status-${checklist.status}`">
              {{ statusLabels[checklist.status] }}
            </span>
          </div>

          <div v-if="checklist.employee?.department" class="checklist-department">
            {{ checklist.employee.department.name }}
          </div>

          <ChecklistProgress
            :completed="checklist.items?.filter(i => i.status === 'completed').length || 0"
            :total="checklist.items?.length || 0"
            size="small"
          />

          <div class="checklist-meta">
            <span class="meta-item">Início: {{ formatDate(checklist.startDate) }}</span>
          </div>
        </div>
      </div>

      <!-- Detalhe da checklist -->
      <div v-if="selectedChecklist" class="checklist-detail">
        <div class="detail-header">
          <div>
            <h2 class="detail-title">{{ selectedChecklist.employee?.fullName }}</h2>
            <p class="detail-subtitle">
              {{ selectedChecklist.template?.name }} - {{ formatDate(selectedChecklist.startDate) }}
            </p>
          </div>
          <span class="badge badge-large" :class="`badge-status-${selectedChecklist.status}`">
            {{ statusLabels[selectedChecklist.status] }}
          </span>
        </div>

        <ChecklistProgress
          v-if="selectedChecklist.items"
          :completed="selectedChecklist.items.filter(i => i.status === 'completed').length"
          :total="selectedChecklist.items.length"
          size="large"
        />

        <div v-if="isLoading" class="loading">Carregando items...</div>

        <div v-else-if="!selectedChecklist.items || selectedChecklist.items.length === 0" class="empty-state">
          <p>Nenhum item nesta checklist</p>
        </div>

        <div v-else class="items-list">
          <div
            v-for="item in selectedChecklist.items"
            :key="item.id"
            class="item-card"
            :class="getItemStatusClass(item)"
          >
            <div class="item-header">
              <div class="item-checkbox">
                <input
                  type="checkbox"
                  :checked="item.status === 'completed'"
                  :disabled="!canCompleteItem(item)"
                  @change="openNotesModal(item, 'complete')"
                />
              </div>
              <div class="item-content">
                <h4 class="item-title">{{ item.title }}</h4>
                <p v-if="item.description" class="item-description">{{ item.description }}</p>
              </div>
              <div class="item-badges">
                <span class="badge badge-responsible">{{ getResponsibleBadge(item.responsible) }}</span>
                <span class="badge badge-status-item" :class="`badge-${item.status}`">
                  {{ itemStatusLabels[item.status] }}
                </span>
              </div>
            </div>

            <div class="item-meta">
              <span class="meta-item">Prazo: {{ formatDate(item.dueDate) }}</span>
              <span v-if="item.completedAt" class="meta-item">
                Concluído: {{ formatDate(item.completedAt) }}
              </span>
            </div>

            <div v-if="item.notes" class="item-notes">
              <strong>Observações:</strong> {{ item.notes }}
            </div>

            <div v-if="canCompleteItem(item) && item.status === 'pending'" class="item-actions">
              <button class="btn btn-sm btn-success" @click="openNotesModal(item, 'complete')">
                Concluir
              </button>
              <button class="btn btn-sm btn-secondary" @click="openNotesModal(item, 'skip')">
                Pular
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-selection">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 11 12 14 22 4"></polyline>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        <p>Selecione uma checklist para ver os detalhes</p>
      </div>
    </div>

    <!-- Modal: Notas -->
    <div v-if="showNotesModal" class="modal-overlay" @click.self="closeNotesModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ actionType === 'complete' ? 'Concluir Item' : 'Pular Item' }}
          </h3>
          <button class="modal-close" @click="closeNotesModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-description">{{ selectedItem?.title }}</p>
          <div class="form-group">
            <label class="form-label">Observações (opcional)</label>
            <textarea
              v-model="notesText"
              class="form-textarea"
              rows="4"
              placeholder="Adicione observações sobre este item..."
            ></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="closeNotesModal">Cancelar</button>
            <button
              class="btn"
              :class="actionType === 'complete' ? 'btn-success' : 'btn-warning'"
              @click="handleSaveNotes"
            >
              {{ actionType === 'complete' ? 'Concluir' : 'Pular' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checklist-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-8);
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
}

/* Alertas */
.alert {
  padding: var(--alert-padding-y) var(--alert-padding-x);
  border-radius: var(--alert-border-radius);
  font-size: var(--alert-font-size);
}

.alert-success {
  background-color: var(--color-success-light);
  color: var(--color-success-darker);
  border: var(--border-width) solid var(--color-success);
}

.alert-error {
  background-color: var(--color-danger-light);
  color: var(--color-danger-darker);
  border: var(--border-width) solid var(--color-danger);
}

/* Filtros */
.filter-bar {
  display: flex;
  gap: var(--space-8);
  padding: var(--filter-bar-padding);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--filter-bar-border-radius);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 150px;
}

.filter-label {
  font-size: var(--filter-label-font-size);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-select {
  padding: var(--space-3) var(--space-6);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast), background-color var(--transition-slow), color var(--transition-slow);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-border-focus);
}

/* Layout principal */
.main-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: var(--space-12);
  min-height: 500px;
}

/* Lista de checklists */
.checklists-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.checklist-card {
  padding: var(--space-8);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.checklist-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.checklist-card.active {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.checklist-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.checklist-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.checklist-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.checklist-department {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.checklist-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  padding-top: var(--space-4);
  border-top: var(--border-width) solid var(--color-border-light);
  margin-top: var(--space-4);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Detalhe da checklist */
.checklist-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-8);
  padding-bottom: var(--space-8);
  border-bottom: var(--border-width) solid var(--color-border);
}

.detail-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.detail-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Items */
.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.item-card {
  padding: var(--space-8);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-left-width: 4px;
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.item-card.status-pending {
  border-left-color: var(--color-text-muted);
}

.item-card.status-completed {
  border-left-color: var(--color-success);
  background-color: var(--color-success-light);
}

.item-card.status-skipped {
  border-left-color: var(--color-warning);
  background-color: var(--color-warning-light);
}

.item-card.status-overdue {
  border-left-color: var(--color-danger);
  background-color: var(--color-danger-light);
}

.item-header {
  display: flex;
  gap: var(--space-6);
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.item-checkbox {
  flex-shrink: 0;
  padding-top: var(--space-1);
}

.item-checkbox input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.item-checkbox input[type='checkbox']:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.item-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.item-badges {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.item-meta {
  display: flex;
  gap: var(--space-8);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}

.item-notes {
  padding: var(--space-6);
  background-color: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-4);
}

.item-actions {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: var(--border-width) solid var(--color-border-light);
}

/* Badges */
.badge {
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  white-space: nowrap;
}

.badge-large {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-sm);
}

.badge-onboarding {
  background-color: var(--color-success-bg);
  color: var(--color-success-darker);
}

.badge-offboarding {
  background-color: var(--color-warning-bg);
  color: var(--color-warning-darker);
}

.badge-status-in_progress {
  background-color: var(--color-info-bg);
  color: var(--color-info-dark);
}

.badge-status-completed {
  background-color: var(--color-success-bg);
  color: var(--color-success-darker);
}

.badge-status-cancelled {
  background-color: var(--color-bg-muted);
  color: var(--color-text-muted);
}

.badge-responsible {
  background-color: var(--color-bg-muted);
  color: var(--color-text-secondary);
}

.badge-pending {
  background-color: var(--color-bg-muted);
  color: var(--color-text-muted);
}

.badge-completed {
  background-color: var(--color-success-bg);
  color: var(--color-success-darker);
}

.badge-skipped {
  background-color: var(--color-warning-bg);
  color: var(--color-warning-darker);
}

.badge-overdue {
  background-color: var(--color-danger-bg);
  color: var(--color-danger-dark);
}

/* Botoes */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  white-space: nowrap;
}

.btn-sm {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-sm);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-success {
  background-color: var(--color-success);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: var(--color-success-dark);
}

.btn-warning {
  background-color: var(--color-warning);
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background-color: var(--color-warning-dark);
}

.btn-secondary {
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  border: var(--border-width) solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

/* Estados */
.loading,
.empty-state,
.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
}

.no-selection {
  flex-direction: column;
  gap: var(--space-8);
}

.no-selection svg {
  color: var(--color-text-placeholder);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--palette-overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-12);
}

.modal {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-10) var(--space-12);
  border-bottom: var(--border-width) solid var(--color-border);
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--space-12);
  overflow-y: auto;
}

.modal-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-8);
}

.modal-actions {
  display: flex;
  gap: var(--space-6);
  justify-content: flex-end;
  margin-top: var(--space-8);
  padding-top: var(--space-8);
  border-top: var(--border-width) solid var(--color-border);
}

/* Formularios */
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.form-textarea {
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  border: var(--border-width) solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: var(--color-bg-input);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-slow), color var(--transition-slow);
  resize: vertical;
  font-family: var(--font-family);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: var(--input-focus-ring);
}

/* Responsividade */
@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .checklist-detail {
    border-top: var(--border-width) solid var(--color-border);
    padding-top: var(--space-12);
  }
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-bar {
    flex-direction: column;
  }

  .item-header {
    flex-direction: column;
    gap: var(--space-4);
  }

  .item-badges {
    width: 100%;
  }
}
</style>
