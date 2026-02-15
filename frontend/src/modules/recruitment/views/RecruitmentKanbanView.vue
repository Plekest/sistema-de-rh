<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import recruitmentService from '../services/recruitment.service'
import type { KanbanBoard, KanbanStage, KanbanCandidate, KanbanStats, JobRequisition } from '../types'

const router = useRouter()

const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const requisitions = ref<JobRequisition[]>([])
const selectedRequisitionId = ref<number | null>(null)
const board = ref<KanbanBoard | null>(null)
const stats = ref<KanbanStats | null>(null)
const showStatsModal = ref(false)

async function loadRequisitions() {
  try {
    isLoading.value = true
    error.value = null
    const response = await recruitmentService.listRequisitions({ status: 'open', limit: 100 })
    requisitions.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar vagas'
  } finally {
    isLoading.value = false
  }
}

async function loadBoard() {
  if (!selectedRequisitionId.value) return
  try {
    isLoading.value = true
    error.value = null
    board.value = await recruitmentService.getKanbanBoard(selectedRequisitionId.value)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar kanban'
  } finally {
    isLoading.value = false
  }
}

async function loadStats() {
  if (!selectedRequisitionId.value) return
  try {
    stats.value = await recruitmentService.getKanbanStats(selectedRequisitionId.value)
    showStatsModal.value = true
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar estatisticas'
  }
}

async function moveCandidate(candidateId: number, toStageId: number) {
  try {
    error.value = null
    await recruitmentService.moveKanbanCandidate(candidateId, toStageId)
    successMessage.value = 'Candidato movido com sucesso'
    setTimeout(() => { successMessage.value = null }, 3000)
    await loadBoard()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao mover candidato'
  }
}

function goToCandidateDetail(candidateId: number) {
  router.push(`/recruitment?tab=candidates&candidateId=${candidateId}`)
}

const selectedRequisition = computed(() => {
  return requisitions.value.find(r => r.id === selectedRequisitionId.value)
})

onMounted(async () => {
  await loadRequisitions()
  if (requisitions.value.length > 0) {
    selectedRequisitionId.value = requisitions.value[0]?.id ?? 0
    await loadBoard()
  }
})
</script>

<template>
  <div class="kanban-view">
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">Kanban de Recrutamento</h1>
        <p class="page-subtitle">Visualize e gerencie candidatos por etapa</p>
      </div>
      <button v-if="selectedRequisitionId" class="btn btn-secondary" @click="loadStats">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        Ver Estatisticas
      </button>
    </div>

    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- Seletor de vaga -->
    <div class="requisition-selector">
      <label class="selector-label">Vaga:</label>
      <select v-model="selectedRequisitionId" @change="loadBoard" class="selector-input">
        <option value="">Selecione uma vaga...</option>
        <option v-for="req in requisitions" :key="req.id" :value="req.id">
          {{ req.title }} - {{ req.department?.name }}
        </option>
      </select>
    </div>

    <div v-if="isLoading" class="loading">Carregando...</div>

    <div v-else-if="!selectedRequisitionId" class="empty-state">
      <p>Selecione uma vaga para visualizar o kanban</p>
    </div>

    <div v-else-if="board" class="kanban-board">
      <div v-for="stage in board.stages" :key="stage.id" class="kanban-column">
        <div class="column-header">
          <h3 class="column-title">{{ stage.name }}</h3>
          <span class="column-count">{{ stage.candidates.length }}</span>
        </div>

        <div class="column-cards">
          <div v-if="stage.candidates.length === 0" class="empty-column">
            Nenhum candidato
          </div>

          <div
            v-for="candidate in stage.candidates"
            :key="candidate.id"
            class="candidate-card"
            @click="goToCandidateDetail(candidate.id)"
          >
            <div class="card-header">
              <h4 class="card-name">{{ candidate.fullName }}</h4>
              <span v-if="candidate.rating" class="card-rating">
                {{ candidate.rating }}/5
              </span>
            </div>

            <p class="card-email">{{ candidate.email }}</p>

            <div class="card-meta">
              <span class="meta-days">{{ candidate.daysInStage }} dia(s) nesta etapa</span>
            </div>

            <div class="card-actions" @click.stop>
              <select
                :value="candidate.currentStageId"
                @change="moveCandidate(candidate.id, Number(($event.target as HTMLSelectElement).value))"
                class="move-select"
              >
                <option value="" disabled>Mover para...</option>
                <option
                  v-for="s in board.stages"
                  :key="s.id"
                  :value="s.id"
                  :disabled="s.id === candidate.currentStageId"
                >
                  {{ s.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de estatisticas -->
    <div v-if="showStatsModal" class="modal-overlay" @click.self="showStatsModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Estatisticas do Pipeline</h3>
          <button class="modal-close" @click="showStatsModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div v-if="stats" class="modal-body">
          <div class="stats-section">
            <h4 class="stats-title">Total de Candidatos</h4>
            <p class="stats-value">{{ stats.totalCandidates }}</p>
          </div>

          <div class="stats-section">
            <h4 class="stats-title">Candidatos por Etapa</h4>
            <div v-for="item in stats.byStage" :key="item.stageId" class="stats-row">
              <span class="stats-label">{{ item.stageName }}</span>
              <span class="stats-number">{{ item.count }}</span>
            </div>
          </div>

          <div class="stats-section">
            <h4 class="stats-title">Tempo Medio por Etapa (dias)</h4>
            <div v-for="item in stats.avgDaysPerStage" :key="item.stageId" class="stats-row">
              <span class="stats-label">{{ item.stageName }}</span>
              <span class="stats-number">{{ item.avgDays.toFixed(1) }}</span>
            </div>
          </div>

          <div v-if="stats.conversionRate && stats.conversionRate.length > 0" class="stats-section">
            <h4 class="stats-title">Taxa de Conversao</h4>
            <div v-for="item in stats.conversionRate" :key="`${item.from}-${item.to}`" class="stats-row">
              <span class="stats-label">{{ item.from }} → {{ item.to }}</span>
              <span class="stats-number">{{ (item.rate * 100).toFixed(0) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban-view {
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

/* Seletor de vaga */
.requisition-selector {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-8);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
}

.selector-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.selector-input {
  flex: 1;
  max-width: 500px;
  padding: var(--input-padding-y) var(--input-padding-x);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--input-border-radius);
  background-color: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

.selector-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
}

/* Kanban board */
.kanban-board {
  display: flex;
  gap: var(--space-8);
  overflow-x: auto;
  padding-bottom: var(--space-8);
  min-height: 500px;
}

.kanban-column {
  flex: 0 0 320px;
  min-width: 320px;
  background-color: var(--color-bg-subtle);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 300px);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-8);
  border-bottom: var(--border-width) solid var(--color-border);
  background-color: var(--color-bg-card);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.column-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.column-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 var(--space-3);
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
}

.column-cards {
  flex: 1;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  overflow-y: auto;
}

.empty-column {
  text-align: center;
  padding: var(--space-12);
  color: var(--color-text-placeholder);
  font-size: var(--font-size-sm);
}

/* Card de candidato */
.candidate-card {
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.candidate-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-hover);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}

.card-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.card-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1) var(--space-3);
  background-color: var(--color-warning-bg);
  color: var(--color-warning-darker);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-sm);
}

.card-email {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  margin-bottom: var(--space-4);
  padding-top: var(--space-4);
  border-top: var(--border-width) solid var(--color-border-light);
}

.meta-days {
  font-size: var(--font-size-2xs);
  color: var(--color-text-tertiary);
}

.card-actions {
  margin-top: var(--space-4);
}

.move-select {
  width: 100%;
  padding: var(--space-2) var(--space-4);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.move-select:focus {
  outline: none;
  border-color: var(--color-border-focus);
}

.move-select:hover {
  border-color: var(--color-border-hover);
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

.btn-secondary {
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  border: var(--border-width) solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

/* Estados */
.loading,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
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

/* Estatisticas */
.stats-section {
  margin-bottom: var(--space-10);
}

.stats-section:last-child {
  margin-bottom: 0;
}

.stats-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin: 0 0 var(--space-6);
}

.stats-value {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) 0;
  border-bottom: var(--border-width) solid var(--color-border-light);
}

.stats-row:last-child {
  border-bottom: none;
}

.stats-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stats-number {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

/* Responsividade */
@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .requisition-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .selector-input {
    max-width: none;
  }

  .kanban-board {
    flex-direction: column;
  }

  .kanban-column {
    flex: 1;
    min-width: 100%;
    max-height: 600px;
  }
}
</style>
