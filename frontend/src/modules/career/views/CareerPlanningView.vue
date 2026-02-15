<script setup lang="ts">
import { ref, onMounted } from 'vue'
import careerService from '../services/careerService'
import type { CareerPath, SuccessionPlan } from '../types'
import { READINESS_LABELS, PRIORITY_LABELS } from '../types'

const activeTab = ref<'paths' | 'employee' | 'succession' | 'critical'>('paths')
const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const paths = ref<CareerPath[]>([])
const successionPlans = ref<SuccessionPlan[]>([])
const expandedPaths = ref<Set<number>>(new Set())

const showPathModal = ref(false)
const pathForm = ref({ id: null as number | null, name: '', description: '', departmentId: null as number | null })

const showSuccessionModal = ref(false)
const successionForm = ref({
  id: null as number | null,
  positionId: 0,
  currentHolderId: null as number | null,
  successorId: null as number | null,
  readiness: 'development_needed' as SuccessionPlan['readiness'],
  priority: 'medium' as SuccessionPlan['priority'],
  developmentActions: '',
  notes: '',
})

function togglePath(id: number) {
  if (expandedPaths.value.has(id)) {
    expandedPaths.value.delete(id)
  } else {
    expandedPaths.value.add(id)
  }
}

function getReadinessBadgeClass(readiness: SuccessionPlan['readiness']): string {
  const classes = {
    ready_now: 'badge-success',
    ready_1_year: 'badge-info',
    ready_2_years: 'badge-warning',
    development_needed: 'badge-muted',
  }
  return classes[readiness]
}

function getPriorityBadgeClass(priority: SuccessionPlan['priority']): string {
  const classes = {
    critical: 'badge-danger',
    high: 'badge-warning',
    medium: 'badge-info',
    low: 'badge-muted',
  }
  return classes[priority]
}

async function loadPaths() {
  try {
    isLoading.value = true
    error.value = null
    paths.value = await careerService.getPaths()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar planos de carreira'
  } finally {
    isLoading.value = false
  }
}

async function loadSuccessionPlans() {
  try {
    isLoading.value = true
    error.value = null
    successionPlans.value = await careerService.getSuccessionPlans()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar planos de sucessão'
  } finally {
    isLoading.value = false
  }
}

function openPathModal(path?: CareerPath) {
  if (path) {
    pathForm.value = {
      id: path.id,
      name: path.name,
      description: path.description || '',
      departmentId: path.departmentId,
    }
  } else {
    pathForm.value = { id: null, name: '', description: '', departmentId: null }
  }
  showPathModal.value = true
}

function openSuccessionModal(plan?: SuccessionPlan) {
  if (plan) {
    successionForm.value = {
      id: plan.id,
      positionId: plan.positionId,
      currentHolderId: plan.currentHolderId,
      successorId: plan.successorId,
      readiness: plan.readiness,
      priority: plan.priority,
      developmentActions: plan.developmentActions || '',
      notes: plan.notes || '',
    }
  } else {
    successionForm.value = {
      id: null,
      positionId: 0,
      currentHolderId: null,
      successorId: null,
      readiness: 'development_needed',
      priority: 'medium',
      developmentActions: '',
      notes: '',
    }
  }
  showSuccessionModal.value = true
}

async function savePath() {
  try {
    error.value = null
    if (pathForm.value.id) {
      await careerService.updatePath(pathForm.value.id, pathForm.value)
      successMessage.value = 'Plano atualizado com sucesso'
    } else {
      await careerService.createPath(pathForm.value)
      successMessage.value = 'Plano criado com sucesso'
    }
    setTimeout(() => { successMessage.value = null }, 3000)
    showPathModal.value = false
    await loadPaths()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao salvar plano'
  }
}

async function saveSuccessionPlan() {
  try {
    error.value = null
    if (successionForm.value.id) {
      await careerService.updateSuccessionPlan(successionForm.value.id, successionForm.value)
      successMessage.value = 'Plano de sucessão atualizado'
    } else {
      await careerService.createSuccessionPlan(successionForm.value)
      successMessage.value = 'Plano de sucessão criado'
    }
    setTimeout(() => { successMessage.value = null }, 3000)
    showSuccessionModal.value = false
    await loadSuccessionPlans()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao salvar plano de sucessão'
  }
}

onMounted(() => {
  loadPaths()
  loadSuccessionPlans()
})
</script>

<template>
  <div class="career-view">
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">Planejamento de Carreira</h1>
        <p class="page-subtitle">Gerencie trilhas de carreira e planeje sucessões</p>
      </div>
    </div>

    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="tabs">
      <button class="tab" :class="{ 'tab-active': activeTab === 'paths' }" @click="activeTab = 'paths'">
        Planos de Carreira
      </button>
      <button class="tab" :class="{ 'tab-active': activeTab === 'succession' }" @click="activeTab = 'succession'">
        Sucessão
      </button>
    </div>

    <!-- Tab: Planos de Carreira -->
    <div v-if="activeTab === 'paths'" class="tab-content">
      <div class="tab-actions">
        <button class="btn btn-primary" @click="openPathModal()">
          Novo Plano de Carreira
        </button>
      </div>

      <div v-if="isLoading" class="loading">Carregando...</div>

      <div v-else-if="paths.length === 0" class="empty-state">
        <p>Nenhum plano de carreira criado</p>
      </div>

      <div v-else class="paths-grid">
        <div v-for="path in paths" :key="path.id" class="path-card">
          <div class="card-header" @click="togglePath(path.id)">
            <div>
              <h3 class="card-title">{{ path.name }}</h3>
              <p v-if="path.description" class="card-desc">{{ path.description }}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="expand-icon" :class="{ 'expanded': expandedPaths.has(path.id) }">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <div v-if="expandedPaths.has(path.id)" class="card-timeline">
            <div v-if="!path.levels || path.levels.length === 0" class="empty-levels">
              Nenhum nível definido neste plano
            </div>
            <div v-else class="timeline">
              <div v-for="level in path.levels" :key="level.id" class="timeline-item">
                <div class="timeline-marker">{{ level.levelOrder }}</div>
                <div class="timeline-content">
                  <h4 class="timeline-title">{{ level.title }}</h4>
                  <p v-if="level.description" class="timeline-desc">{{ level.description }}</p>
                  <div v-if="level.minExperienceMonths" class="timeline-meta">
                    Experiência mínima: {{ level.minExperienceMonths }} meses
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Sucessão -->
    <div v-if="activeTab === 'succession'" class="tab-content">
      <div class="tab-actions">
        <button class="btn btn-primary" @click="openSuccessionModal()">
          Novo Plano de Sucessão
        </button>
      </div>

      <div v-if="isLoading" class="loading">Carregando...</div>

      <div v-else-if="successionPlans.length === 0" class="empty-state">
        <p>Nenhum plano de sucessão criado</p>
      </div>

      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Titular Atual</th>
              <th>Sucessor</th>
              <th>Prontidão</th>
              <th>Prioridade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plan in successionPlans" :key="plan.id">
              <td>{{ plan.position?.title || plan.positionId }}</td>
              <td>{{ plan.currentHolder?.fullName || '-' }}</td>
              <td>{{ plan.successor?.fullName || '-' }}</td>
              <td>
                <span class="badge" :class="getReadinessBadgeClass(plan.readiness)">
                  {{ READINESS_LABELS[plan.readiness] }}
                </span>
              </td>
              <td>
                <span class="badge" :class="getPriorityBadgeClass(plan.priority)">
                  {{ PRIORITY_LABELS[plan.priority] }}
                </span>
              </td>
              <td>
                <button class="btn-icon" @click="openSuccessionModal(plan)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Plano de Carreira -->
    <div v-if="showPathModal" class="modal-overlay" @click.self="showPathModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ pathForm.id ? 'Editar Plano' : 'Novo Plano de Carreira' }}</h3>
          <button class="modal-close" @click="showPathModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="savePath" class="form-grid">
            <div class="form-group form-col-full">
              <label class="form-label">Nome *</label>
              <input v-model="pathForm.name" type="text" class="form-input" required />
            </div>
            <div class="form-group form-col-full">
              <label class="form-label">Descrição</label>
              <textarea v-model="pathForm.description" class="form-textarea" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showPathModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal: Sucessão -->
    <div v-if="showSuccessionModal" class="modal-overlay" @click.self="showSuccessionModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ successionForm.id ? 'Editar' : 'Novo' }} Plano de Sucessão</h3>
          <button class="modal-close" @click="showSuccessionModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveSuccessionPlan" class="form-grid">
            <div class="form-group">
              <label class="form-label">ID da Posição *</label>
              <input v-model.number="successionForm.positionId" type="number" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">ID do Titular</label>
              <input v-model.number="successionForm.currentHolderId" type="number" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">ID do Sucessor</label>
              <input v-model.number="successionForm.successorId" type="number" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Prontidão</label>
              <select v-model="successionForm.readiness" class="form-select">
                <option value="ready_now">Pronto Agora</option>
                <option value="ready_1_year">Pronto em 1 Ano</option>
                <option value="ready_2_years">Pronto em 2 Anos</option>
                <option value="development_needed">Precisa Desenvolvimento</option>
              </select>
            </div>
            <div class="form-group form-col-full">
              <label class="form-label">Prioridade</label>
              <select v-model="successionForm.priority" class="form-select">
                <option value="critical">Crítica</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
            <div class="form-group form-col-full">
              <label class="form-label">Ações de Desenvolvimento</label>
              <textarea v-model="successionForm.developmentActions" class="form-textarea" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showSuccessionModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.career-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.tabs {
  display: flex;
  gap: var(--space-2);
  border-bottom: var(--border-width) solid var(--color-border);
}

.tab {
  padding: var(--space-4) var(--space-8);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab:hover {
  color: var(--color-text-primary);
}

.tab-active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.tab-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: flex-end;
}

.loading,
.empty-state,
.empty-levels {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  color: var(--color-text-muted);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
}

.empty-levels {
  padding: var(--space-8);
  font-size: var(--font-size-sm);
}

.paths-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.path-card {
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-8) var(--space-10);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.card-header:hover {
  background-color: var(--color-bg-hover);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.card-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.expand-icon {
  transition: transform var(--transition-fast);
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.card-timeline {
  border-top: var(--border-width) solid var(--color-border);
  padding: var(--space-10);
  background-color: var(--color-bg-subtle);
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.timeline-item {
  display: flex;
  gap: var(--space-6);
  position: relative;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 40px;
  bottom: -32px;
  width: 2px;
  background-color: var(--color-border);
}

.timeline-marker {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-primary-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
  z-index: 1;
}

.timeline-content {
  flex: 1;
  padding: var(--space-2) 0;
}

.timeline-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.timeline-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-3);
}

.timeline-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.table-container {
  overflow-x: auto;
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.data-table thead th {
  padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
  text-align: left;
  font-size: var(--table-header-font-size);
  font-weight: var(--table-header-font-weight);
  color: var(--table-header-color);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  background-color: var(--table-header-bg);
  border-bottom: var(--border-width) solid var(--table-border-color);
}

.data-table tbody td {
  padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
  border-bottom: var(--border-width) solid var(--table-row-border-color);
  color: var(--color-text-primary);
}

.data-table tbody tr:hover {
  background-color: var(--table-row-hover-bg);
}

.badge {
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  white-space: nowrap;
}

.badge-success {
  background-color: var(--color-success-bg);
  color: var(--color-success-darker);
}

.badge-info {
  background-color: var(--color-info-bg);
  color: var(--color-info-dark);
}

.badge-warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning-darker);
}

.badge-danger {
  background-color: var(--color-danger-bg);
  color: var(--color-danger-darker);
}

.badge-muted {
  background-color: var(--color-bg-muted);
  color: var(--color-text-muted);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--btn-border-radius);
  font-size: var(--font-size-sm);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  border: var(--border-width) solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-bg-hover);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

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
  max-width: 600px;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-col-full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  border: var(--border-width) solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: var(--color-bg-input);
  transition: border-color var(--transition-fast);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: var(--input-focus-ring);
}

.form-textarea {
  resize: vertical;
  font-family: var(--font-family);
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: var(--space-6);
  justify-content: flex-end;
  padding-top: var(--space-6);
  border-top: var(--border-width) solid var(--color-border);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
