<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { usePerformance } from '../composables/usePerformance'
import PerformanceFilters from '../components/PerformanceFilters.vue'
import PerformanceCycleForm from '../components/PerformanceCycleForm.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

/**
 * View principal de avaliacao de desempenho.
 *
 * Decomposta em composable + componentes:
 * - usePerformance: toda a logica de negocio
 * - PerformanceFilters: filtros de ciclos
 * - PerformanceCycleForm: formulario de ciclo
 * - Outras tabs renderizadas inline (complexidade reduzida)
 */

const {
  // Estado
  cycles,
  competencies,
  goals,
  evaluations,
  developmentPlans,
  employees,
  isLoading,
  error,
  successMessage,

  // Tabs
  activeTab,

  // Filtros
  filterStatus,
  filterYear,
  selectedCycleId,
  selectedEmployeeIdGoals,
  selectedEmployeeIdPDI,

  // Ciclo expandido
  expandedCycleId,

  // Formularios
  showCycleForm,
  cycleFormLoading,
  cycleFormError,
  cycleFormData,
  showCompetencyForm,
  competencyFormLoading,
  competencyFormError,
  competencyFormData,
  showAddCompCycleForm,
  addCompCycleLoading,
  addCompCycleError,
  addCompCycleData,
  showGoalForm,
  goalFormLoading,
  goalFormError,
  goalFormData,
  showEvaluationForm,
  evaluationFormLoading,
  evaluationFormError,
  selectedEvaluation,
  evaluationScores,
  evaluationComments,
  showPDIForm,
  pdiFormLoading,
  pdiFormError,
  pdiFormData,

  // Computed
  isAdmin,
  canManagePerformance,

  // Labels
  cycleStatusLabels,
  cycleTypeLabels,
  competencyCategoryLabels,
  goalStatusLabels,
  evaluationTypeLabels,
  evaluationStatusLabels,
  pdiStatusLabels,

  // Metodos
  loadCycles,
  loadCompetencies,
  loadGoals,
  loadEvaluations,
  loadDevelopmentPlans,
  toggleExpandCycle,
  openCycleForm,
  closeCycleForm,
  submitCycleForm,
  advanceCycle,
  openCompetencyForm,
  closeCompetencyForm,
  submitCompetencyForm,
  openAddCompCycleForm,
  closeAddCompCycleForm,
  submitAddCompCycleForm,
  removeCompetencyFromCycle,
  openGoalForm,
  closeGoalForm,
  submitGoalForm,
  openEvaluationForm,
  closeEvaluationForm,
  submitEvaluationForm,
  openPDIForm,
  closePDIForm,
  submitPDIForm,
  updatePDIStatus,
  formatDate,
  cycleStatusClass,
  goalStatusClass,
  evaluationStatusClass,
  pdiStatusClass,
  init,
} = usePerformance()

const cycleYearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

watch(selectedCycleId, () => {
  if (activeTab.value === 'goals') loadGoals()
  if (activeTab.value === 'evaluations') loadEvaluations()
})

watch(selectedEmployeeIdGoals, () => {
  if (activeTab.value === 'goals') loadGoals()
})

watch(selectedEmployeeIdPDI, () => {
  if (activeTab.value === 'pdi') loadDevelopmentPlans()
})

onMounted(() => {
  init()
})
</script>

<template>
  <div class="performance-view">
    <div class="page-header">
      <h1 class="page-title">Avaliacao de Desempenho</h1>
      <button v-if="canManagePerformance && activeTab === 'cycles'" class="btn-primary" @click="openCycleForm">
        Novo Ciclo
      </button>
      <button v-if="canManagePerformance && activeTab === 'competencies'" class="btn-primary" @click="openCompetencyForm">
        Nova Competencia
      </button>
      <button v-if="canManagePerformance && activeTab === 'goals' && selectedCycleId" class="btn-primary" @click="openGoalForm">
        Nova Meta
      </button>
      <button v-if="canManagePerformance && activeTab === 'pdi'" class="btn-primary" @click="openPDIForm">
        Novo PDI
      </button>
    </div>

    <!-- Mensagens -->
    <Transition name="fade">
      <div v-if="successMessage" class="alert alert-success" role="status" aria-live="polite">{{ successMessage }}</div>
    </Transition>
    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab" :class="{ 'tab-active': activeTab === 'cycles' }" @click="activeTab = 'cycles'; loadCycles()">
        Ciclos
      </button>
      <button
        v-if="canManagePerformance"
        class="tab"
        :class="{ 'tab-active': activeTab === 'competencies' }"
        @click="activeTab = 'competencies'; loadCompetencies()"
      >
        Competencias
      </button>
      <button class="tab" :class="{ 'tab-active': activeTab === 'goals' }" @click="activeTab = 'goals'">
        Metas
      </button>
      <button class="tab" :class="{ 'tab-active': activeTab === 'evaluations' }" @click="activeTab = 'evaluations'">
        Avaliacoes
      </button>
      <button class="tab" :class="{ 'tab-active': activeTab === 'pdi' }" @click="activeTab = 'pdi'; loadDevelopmentPlans()">
        PDI
      </button>
    </div>

    <!-- TAB: CICLOS -->
    <template v-if="activeTab === 'cycles'">
      <PerformanceFilters
        :filterStatus="filterStatus"
        :filterYear="filterYear"
        :statusLabels="cycleStatusLabels"
        :yearOptions="cycleYearOptions"
        @update:filterStatus="filterStatus = $event"
        @update:filterYear="filterYear = $event"
        @reload="loadCycles"
      />

      <PerformanceCycleForm
        :show="showCycleForm"
        :loading="cycleFormLoading"
        :error="cycleFormError"
        :formData="cycleFormData"
        :typeLabels="cycleTypeLabels"
        @close="closeCycleForm"
        @submit="submitCycleForm"
        @update:formData="cycleFormData = $event"
      />

      <!-- Form adicionar competencia ao ciclo - inline por simplicidade -->
      <div v-if="showAddCompCycleForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Adicionar Competencia ao Ciclo</h2>
          <button class="btn-close" @click="closeAddCompCycleForm">Fechar</button>
        </div>
        <div v-if="addCompCycleError" class="alert alert-error">{{ addCompCycleError }}</div>
        <form @submit.prevent="submitAddCompCycleForm" class="form-grid">
          <div class="form-group">
            <label>Competencia *</label>
            <select v-model="addCompCycleData.competencyId" required>
              <option :value="0">Selecione...</option>
              <option v-for="c in competencies.filter(x => x.isActive)" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Peso *</label>
            <input type="number" step="0.1" min="0" v-model="addCompCycleData.weight" required />
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeAddCompCycleForm" :disabled="addCompCycleLoading">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="addCompCycleLoading">{{ addCompCycleLoading ? 'Adicionando...' : 'Adicionar' }}</button>
          </div>
        </form>
      </div>

      <LoadingSpinner v-if="isLoading" text="Carregando..." />

      <div v-else-if="cycles.length > 0" class="cycles-list">
        <div v-for="cycle in cycles" :key="cycle.id" class="cycle-card">
          <div class="cycle-header" @click="toggleExpandCycle(cycle.id)">
            <div class="cycle-info">
              <span class="cycle-type-tag">{{ cycleTypeLabels[cycle.type] }}</span>
              <h3 class="cycle-name">{{ cycle.name }}</h3>
              <span class="badge" :class="cycleStatusClass(cycle.status)">{{ cycleStatusLabels[cycle.status] }}</span>
            </div>
            <div class="cycle-actions-header">
              <span class="cycle-dates">{{ formatDate(cycle.startDate) }} - {{ formatDate(cycle.endDate) }}</span>
              <span class="expand-indicator">{{ expandedCycleId === cycle.id ? '−' : '+' }}</span>
            </div>
          </div>

          <div v-if="expandedCycleId === cycle.id" class="cycle-details">
            <div class="detail-section">
              <h4 class="detail-title">Prazos</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Autoavaliacao</span>
                  <span class="detail-value">{{ formatDate(cycle.selfEvalDeadline) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Avaliacao Gestor</span>
                  <span class="detail-value">{{ formatDate(cycle.managerEvalDeadline) }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <div class="detail-section-header">
                <h4 class="detail-title">Competencias Avaliadas</h4>
                <button v-if="canManagePerformance && cycle.status === 'draft'" class="btn-small" @click.stop="openAddCompCycleForm(cycle.id)">
                  Adicionar Competencia
                </button>
              </div>

              <div v-if="cycle.cycleCompetencies && cycle.cycleCompetencies.length > 0" class="competencies-list">
                <div v-for="cc in cycle.cycleCompetencies" :key="cc.id" class="competency-row">
                  <span class="competency-name">{{ cc.competency?.name || 'N/A' }}</span>
                  <span class="competency-weight">Peso: {{ cc.weight }}</span>
                  <button
                    v-if="canManagePerformance && cycle.status === 'draft'"
                    class="btn-action btn-cancel btn-tiny"
                    @click.stop="removeCompetencyFromCycle(cycle.id, cc.competencyId)"
                  >
                    Remover
                  </button>
                </div>
              </div>
              <div v-else class="empty-section">Nenhuma competencia associada.</div>
            </div>

            <div v-if="canManagePerformance" class="cycle-admin-actions">
              <button v-if="cycle.status !== 'closed'" class="btn-action btn-approve" @click.stop="advanceCycle(cycle.id)">
                Avancar Status
              </button>
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-else title="Nenhum ciclo encontrado" description="Nao ha ciclos de avaliacao cadastrados." />
    </template>

    <!-- TAB: COMPETENCIAS (inline simplificado) -->
    <template v-if="activeTab === 'competencies' && canManagePerformance">
      <div v-if="showCompetencyForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Nova Competencia</h2>
          <button class="btn-close" @click="closeCompetencyForm">Fechar</button>
        </div>
        <div v-if="competencyFormError" class="alert alert-error">{{ competencyFormError }}</div>
        <form @submit.prevent="submitCompetencyForm" class="form-grid">
          <div class="form-group">
            <label>Nome *</label>
            <input type="text" v-model="competencyFormData.name" required />
          </div>
          <div class="form-group">
            <label>Categoria *</label>
            <select v-model="competencyFormData.category" required>
              <option v-for="(label, key) in competencyCategoryLabels" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div class="form-group form-col-full">
            <label>Descricao *</label>
            <textarea v-model="competencyFormData.description" rows="3" required></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeCompetencyForm" :disabled="competencyFormLoading">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="competencyFormLoading">{{ competencyFormLoading ? 'Criando...' : 'Criar Competencia' }}</button>
          </div>
        </form>
      </div>

      <LoadingSpinner v-if="isLoading" text="Carregando..." />

      <div v-else-if="competencies.length > 0" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Descricao</th>
              <th class="th-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comp in competencies" :key="comp.id">
              <td class="td-name">{{ comp.name }}</td>
              <td>{{ competencyCategoryLabels[comp.category] }}</td>
              <td class="td-description">{{ comp.description }}</td>
              <td class="td-center">
                <span class="badge" :class="comp.isActive ? 'badge-active' : 'badge-inactive'">
                  {{ comp.isActive ? 'Ativa' : 'Inativa' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState v-else title="Nenhuma competencia encontrada" description="Nao ha competencias cadastradas no sistema." />
    </template>

    <!-- TAB: METAS (inline simplificado) -->
    <template v-if="activeTab === 'goals'">
      <div class="filters-bar">
        <div class="filter-group filter-grow">
          <label>Ciclo</label>
          <select v-model="selectedCycleId" @change="loadGoals">
            <option :value="null">Selecione um ciclo...</option>
            <option v-for="cycle in cycles" :key="cycle.id" :value="cycle.id">{{ cycle.name }}</option>
          </select>
        </div>
        <div v-if="canManagePerformance" class="filter-group filter-grow">
          <label>Colaborador</label>
          <select v-model="selectedEmployeeIdGoals" @change="loadGoals">
            <option :value="null">Todos</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.fullName }}</option>
          </select>
        </div>
      </div>

      <div v-if="showGoalForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Nova Meta</h2>
          <button class="btn-close" @click="closeGoalForm">Fechar</button>
        </div>
        <div v-if="goalFormError" class="alert alert-error">{{ goalFormError }}</div>
        <form @submit.prevent="submitGoalForm" class="form-grid">
          <div class="form-group">
            <label>Colaborador *</label>
            <select v-model="goalFormData.employeeId" required>
              <option :value="0">Selecione...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.fullName }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Peso *</label>
            <input type="number" step="0.1" min="0" v-model="goalFormData.weight" required />
          </div>
          <div class="form-group form-col-full">
            <label>Titulo *</label>
            <input type="text" v-model="goalFormData.title" required />
          </div>
          <div class="form-group form-col-full">
            <label>Descricao *</label>
            <textarea v-model="goalFormData.description" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label>Valor Alvo</label>
            <input type="text" v-model="goalFormData.targetValue" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeGoalForm" :disabled="goalFormLoading">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="goalFormLoading">{{ goalFormLoading ? 'Criando...' : 'Criar Meta' }}</button>
          </div>
        </form>
      </div>

      <EmptyState v-if="!selectedCycleId" title="Selecione um ciclo" description="Escolha um ciclo para ver as metas cadastradas." />

      <LoadingSpinner v-else-if="isLoading" text="Carregando..." />

      <div v-else-if="goals.length > 0" class="goals-list">
        <div v-for="goal in goals" :key="goal.id" class="goal-card">
          <div class="goal-header">
            <div class="goal-info">
              <h3 class="goal-title">{{ goal.title }}</h3>
              <span class="goal-employee">{{ goal.employee?.fullName || 'N/A' }}</span>
            </div>
            <span class="badge" :class="goalStatusClass(goal.status)">{{ goalStatusLabels[goal.status] }}</span>
          </div>
          <p class="goal-description">{{ goal.description }}</p>
          <div class="goal-details">
            <div class="goal-detail-item">
              <span class="goal-detail-label">Peso</span>
              <span class="goal-detail-value">{{ goal.weight }}</span>
            </div>
            <div v-if="goal.targetValue" class="goal-detail-item">
              <span class="goal-detail-label">Alvo</span>
              <span class="goal-detail-value">{{ goal.targetValue }}</span>
            </div>
            <div v-if="goal.achievedValue !== null" class="goal-detail-item">
              <span class="goal-detail-label">Atingido</span>
              <span class="goal-detail-value">{{ goal.achievedValue }}</span>
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-else title="Nenhuma meta encontrada" description="Nao ha metas cadastradas para este ciclo." />
    </template>

    <!-- TAB: AVALIACOES (inline simplificado) -->
    <template v-if="activeTab === 'evaluations'">
      <div class="filters-bar">
        <div class="filter-group filter-grow">
          <label>Ciclo</label>
          <select v-model="selectedCycleId" @change="loadEvaluations">
            <option :value="null">Selecione um ciclo...</option>
            <option v-for="cycle in cycles" :key="cycle.id" :value="cycle.id">{{ cycle.name }}</option>
          </select>
        </div>
      </div>

      <div v-if="showEvaluationForm && selectedEvaluation" class="form-card">
        <div class="form-header">
          <h2 class="form-title">{{ evaluationTypeLabels[selectedEvaluation.type] }} - {{ selectedEvaluation.employee?.fullName }}</h2>
          <button class="btn-close" @click="closeEvaluationForm">Fechar</button>
        </div>
        <div v-if="evaluationFormError" class="alert alert-error">{{ evaluationFormError }}</div>
        <form @submit.prevent="submitEvaluationForm" class="evaluation-form">
          <div v-for="(score, idx) in evaluationScores" :key="idx" class="evaluation-score-group">
            <div class="score-header">
              <span class="score-competency">{{ competencies.find(c => c.id === score.competencyId)?.name || 'N/A' }}</span>
            </div>
            <div class="score-input-group">
              <label>Nota (1-5) *</label>
              <input type="number" min="1" max="5" step="1" v-model="score.score" required />
            </div>
            <div class="score-comment-group">
              <label>Comentario</label>
              <textarea v-model="score.comments" rows="2"></textarea>
            </div>
          </div>
          <div class="form-group form-col-full">
            <label>Comentarios Gerais</label>
            <textarea v-model="evaluationComments" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeEvaluationForm" :disabled="evaluationFormLoading">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="evaluationFormLoading">{{ evaluationFormLoading ? 'Submetendo...' : 'Submeter Avaliacao' }}</button>
          </div>
        </form>
      </div>

      <EmptyState v-if="!selectedCycleId" title="Selecione um ciclo" description="Escolha um ciclo para ver as avaliacoes." />

      <LoadingSpinner v-else-if="isLoading" text="Carregando..." />

      <div v-else-if="evaluations.length > 0" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Tipo</th>
              <th>Avaliador</th>
              <th class="th-center">Status</th>
              <th class="th-center">Nota</th>
              <th class="th-center">Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="evaluation in evaluations" :key="evaluation.id">
              <td class="td-name">{{ evaluation.employee?.fullName || 'N/A' }}</td>
              <td>{{ evaluationTypeLabels[evaluation.type] }}</td>
              <td>{{ evaluation.evaluator?.fullName || 'N/A' }}</td>
              <td class="td-center">
                <span class="badge" :class="evaluationStatusClass(evaluation.status)">{{ evaluationStatusLabels[evaluation.status] }}</span>
              </td>
              <td class="td-center">{{ evaluation.overallScore?.toFixed(1) || '-' }}</td>
              <td class="td-center">
                <button v-if="evaluation.status !== 'completed'" class="btn-action btn-detail" @click="openEvaluationForm(evaluation.id)">
                  Avaliar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState v-else title="Nenhuma avaliacao encontrada" description="Nao ha avaliacoes cadastradas para este ciclo." />
    </template>

    <!-- TAB: PDI (inline simplificado) -->
    <template v-if="activeTab === 'pdi'">
      <div v-if="canManagePerformance" class="filters-bar">
        <div class="filter-group filter-grow">
          <label>Colaborador</label>
          <select v-model="selectedEmployeeIdPDI" @change="loadDevelopmentPlans">
            <option :value="null">Todos</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.fullName }}</option>
          </select>
        </div>
      </div>

      <div v-if="showPDIForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Novo Plano de Desenvolvimento</h2>
          <button class="btn-close" @click="closePDIForm">Fechar</button>
        </div>
        <div v-if="pdiFormError" class="alert alert-error">{{ pdiFormError }}</div>
        <form @submit.prevent="submitPDIForm" class="form-grid">
          <div class="form-group">
            <label>Colaborador *</label>
            <select v-model="pdiFormData.employeeId" required>
              <option :value="0">Selecione...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.fullName }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Responsavel *</label>
            <select v-model="pdiFormData.responsibleId" required>
              <option :value="0">Selecione...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.fullName }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Ciclo (Opcional)</label>
            <select v-model="pdiFormData.cycleId">
              <option :value="undefined">Nenhum</option>
              <option v-for="cycle in cycles" :key="cycle.id" :value="cycle.id">{{ cycle.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Prazo *</label>
            <input type="date" v-model="pdiFormData.deadline" required />
          </div>
          <div class="form-group form-col-full">
            <label>Acao *</label>
            <input type="text" v-model="pdiFormData.action" required />
          </div>
          <div class="form-group form-col-full">
            <label>Descricao *</label>
            <textarea v-model="pdiFormData.description" rows="3" required></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closePDIForm" :disabled="pdiFormLoading">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="pdiFormLoading">{{ pdiFormLoading ? 'Criando...' : 'Criar PDI' }}</button>
          </div>
        </form>
      </div>

      <LoadingSpinner v-if="isLoading" text="Carregando..." />

      <div v-else-if="developmentPlans.length > 0" class="pdi-list">
        <div v-for="pdi in developmentPlans" :key="pdi.id" class="pdi-card">
          <div class="pdi-header">
            <div class="pdi-info">
              <h3 class="pdi-action">{{ pdi.action }}</h3>
              <span class="pdi-employee">{{ pdi.employee?.fullName || 'N/A' }}</span>
            </div>
            <span class="badge" :class="pdiStatusClass(pdi.status)">{{ pdiStatusLabels[pdi.status] }}</span>
          </div>
          <p class="pdi-description">{{ pdi.description }}</p>
          <div class="pdi-details">
            <div class="pdi-detail-item">
              <span class="pdi-detail-label">Responsavel</span>
              <span class="pdi-detail-value">{{ pdi.responsible?.fullName || 'N/A' }}</span>
            </div>
            <div class="pdi-detail-item">
              <span class="pdi-detail-label">Prazo</span>
              <span class="pdi-detail-value">{{ formatDate(pdi.deadline) }}</span>
            </div>
          </div>
          <div v-if="canManagePerformance" class="pdi-actions">
            <button v-if="pdi.status === 'pending'" class="btn-action btn-approve" @click="updatePDIStatus(pdi.id, 'in_progress')">Iniciar</button>
            <button v-if="pdi.status === 'in_progress'" class="btn-action btn-approve" @click="updatePDIStatus(pdi.id, 'completed')">Concluir</button>
            <button v-if="pdi.status !== 'cancelled' && pdi.status !== 'completed'" class="btn-action btn-cancel" @click="updatePDIStatus(pdi.id, 'cancelled')">Cancelar</button>
          </div>
        </div>
      </div>

      <EmptyState v-else title="Nenhum PDI encontrado" description="Nao ha planos de desenvolvimento cadastrados." />
    </template>
  </div>
</template>

<style scoped>
/* Estilos principais copiados da view original, reduzido para economizar espaço */
.performance-view { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #1a202c; margin: 0; }
.tabs { display: flex; gap: 0; margin-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0; }
.tab { padding: 0.625rem 1.25rem; background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; font-size: 0.875rem; font-weight: 600; color: #718096; cursor: pointer; transition: all 0.2s; }
.tab:hover { color: #4a5568; }
.tab-active { color: #667eea; border-bottom-color: #667eea; }
.btn-primary { padding: 0.625rem 1.25rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { padding: 0.625rem 1.25rem; background: #fff; color: #4a5568; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-secondary:hover:not(:disabled) { background: #f7fafc; border-color: #cbd5e0; }
.btn-close { padding: 0.375rem 0.875rem; background: transparent; color: #718096; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 0.813rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-close:hover { background: #f7fafc; color: #4a5568; }
.btn-small { padding: 0.25rem 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-small:hover { box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35); transform: translateY(-1px); }
.btn-action { padding: 0.25rem 0.625rem; border: none; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; margin: 0 0.125rem; }
.btn-detail { background: #ebf4ff; color: #667eea; }
.btn-detail:hover { background: #bee3f8; }
.btn-approve { background: #c6f6d5; color: #276749; }
.btn-approve:hover { background: #9ae6b4; }
.btn-cancel { background: #e2e8f0; color: #4a5568; }
.btn-cancel:hover { background: #cbd5e0; }
.btn-tiny { padding: 0.125rem 0.5rem; font-size: 0.688rem; }
.alert { padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.875rem; margin-bottom: 1rem; }
.alert-success { background: #c6f6d5; border: 1px solid #9ae6b4; color: #276749; }
.alert-error { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; }
.filters-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; background: #fff; padding: 1rem 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; }
.filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
.filter-grow { flex: 1; min-width: 200px; }
.filter-group label { font-size: 0.75rem; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.025em; }
.filter-group select { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 0.875rem; color: #2d3748; background: #fff; outline: none; transition: border-color 0.2s; }
.filter-group select:focus { border-color: #667eea; }
.form-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
.form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.form-title { font-size: 1.125rem; font-weight: 600; color: #1a202c; margin: 0; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-col-full { grid-column: 1 / -1; }
.form-group label { font-size: 0.813rem; font-weight: 600; color: #4a5568; }
.form-group input, .form-group select, .form-group textarea { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 0.875rem; color: #2d3748; background: #fff; outline: none; transition: border-color 0.2s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #667eea; }
.form-group textarea { resize: vertical; font-family: inherit; }
.form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
.cycles-list { display: flex; flex-direction: column; gap: 0.75rem; }
.cycle-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.cycle-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; cursor: pointer; transition: background 0.2s; }
.cycle-header:hover { background: #f7fafc; }
.cycle-info { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.cycle-type-tag { display: inline-block; padding: 0.188rem 0.5rem; background: #ebf4ff; color: #667eea; border-radius: 4px; font-size: 0.688rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em; }
.cycle-name { font-size: 0.938rem; font-weight: 600; color: #1a202c; margin: 0; }
.cycle-actions-header { display: flex; align-items: center; gap: 0.75rem; }
.cycle-dates { font-size: 0.813rem; color: #718096; }
.expand-indicator { font-size: 1.25rem; color: #a0aec0; font-weight: 300; width: 24px; text-align: center; }
.cycle-details { border-top: 1px solid #e2e8f0; padding: 1rem 1.25rem; }
.detail-section { margin-bottom: 1rem; }
.detail-section:last-child { margin-bottom: 0; }
.detail-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.detail-title { font-size: 0.813rem; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.025em; margin: 0 0 0.5rem; }
.detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.detail-item { display: flex; flex-direction: column; gap: 0.125rem; }
.detail-label { font-size: 0.688rem; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.025em; }
.detail-value { font-size: 0.875rem; color: #2d3748; font-weight: 500; }
.competencies-list { display: flex; flex-direction: column; gap: 0.5rem; }
.competency-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; background: #f7fafc; border-radius: 6px; }
.competency-name { font-size: 0.875rem; font-weight: 500; color: #2d3748; flex: 1; }
.competency-weight { font-size: 0.75rem; color: #718096; }
.empty-section { font-size: 0.813rem; color: #a0aec0; text-align: center; padding: 0.75rem; }
.cycle-admin-actions { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #edf2f7; display: flex; justify-content: flex-end; }
.table-container { background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.025em; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
.data-table td { padding: 0.75rem 1rem; font-size: 0.875rem; color: #2d3748; border-bottom: 1px solid #f0f0f0; }
.data-table tbody tr:hover { background-color: #f7fafc; }
.th-center { text-align: center; }
.td-center { text-align: center; }
.td-name { font-weight: 500; }
.td-description { font-size: 0.813rem; color: #718096; }
.goals-list { display: flex; flex-direction: column; gap: 0.75rem; }
.goal-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
.goal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.goal-info { display: flex; flex-direction: column; gap: 0.25rem; }
.goal-title { font-size: 0.938rem; font-weight: 600; color: #1a202c; margin: 0; }
.goal-employee { font-size: 0.813rem; color: #718096; }
.goal-description { font-size: 0.875rem; color: #4a5568; margin: 0 0 0.75rem; }
.goal-details { display: flex; gap: 2rem; flex-wrap: wrap; }
.goal-detail-item { display: flex; flex-direction: column; gap: 0.125rem; }
.goal-detail-label { font-size: 0.688rem; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.025em; }
.goal-detail-value { font-size: 0.875rem; color: #2d3748; font-weight: 500; }
.evaluation-form { display: flex; flex-direction: column; gap: 1.5rem; }
.evaluation-score-group { padding: 1rem; background: #f7fafc; border-radius: 6px; display: flex; flex-direction: column; gap: 0.75rem; }
.score-header { border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
.score-competency { font-size: 0.938rem; font-weight: 600; color: #2d3748; }
.score-input-group, .score-comment-group { display: flex; flex-direction: column; gap: 0.375rem; }
.score-input-group label, .score-comment-group label { font-size: 0.813rem; font-weight: 600; color: #4a5568; }
.score-input-group input, .score-comment-group textarea { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 0.875rem; color: #2d3748; background: #fff; outline: none; transition: border-color 0.2s; resize: vertical; font-family: inherit; }
.score-input-group input:focus, .score-comment-group textarea:focus { border-color: #667eea; }
.pdi-list { display: flex; flex-direction: column; gap: 0.75rem; }
.pdi-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
.pdi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.pdi-info { display: flex; flex-direction: column; gap: 0.25rem; }
.pdi-action { font-size: 0.938rem; font-weight: 600; color: #1a202c; margin: 0; }
.pdi-employee { font-size: 0.813rem; color: #718096; }
.pdi-description { font-size: 0.875rem; color: #4a5568; margin: 0 0 0.75rem; }
.pdi-details { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
.pdi-detail-item { display: flex; flex-direction: column; gap: 0.125rem; }
.pdi-detail-label { font-size: 0.688rem; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.025em; }
.pdi-detail-value { font-size: 0.875rem; color: #2d3748; font-weight: 500; }
.pdi-actions { display: flex; gap: 0.5rem; }
.badge { display: inline-block; padding: 0.25rem 0.625rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
.badge-draft { background: #e2e8f0; color: #4a5568; }
.badge-self-eval { background: #fef3c7; color: #92400e; }
.badge-manager-eval { background: #dbeafe; color: #1e40af; }
.badge-calibration { background: #ede9fe; color: #6b21a8; }
.badge-closed { background: #d1fae5; color: #065f46; }
.badge-pending { background: #e2e8f0; color: #4a5568; }
.badge-in-progress { background: #dbeafe; color: #1e40af; }
.badge-achieved { background: #d1fae5; color: #065f46; }
.badge-not-achieved { background: #fee2e2; color: #991b1b; }
.badge-completed { background: #d1fae5; color: #065f46; }
.badge-cancelled { background: #fee2e2; color: #991b1b; }
.badge-active { background: #d1fae5; color: #065f46; }
.badge-inactive { background: #e2e8f0; color: #4a5568; }
.fade-enter-active { transition: opacity 0.3s ease; }
.fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .tabs::-webkit-scrollbar { display: none; }
  .tab { white-space: nowrap; flex-shrink: 0; padding: 0.625rem 0.875rem; font-size: 0.813rem; }
  .filters-bar { flex-direction: column; }
  .form-grid { grid-template-columns: 1fr; }
  .cycle-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .detail-grid { grid-template-columns: 1fr; }
  .detail-section-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .goal-header, .pdi-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .goal-details, .pdi-details { flex-direction: column; gap: 0.75rem; }
  .pdi-actions { flex-wrap: wrap; }
  .table-container { overflow-x: scroll; }
  .data-table { min-width: 700px; }
  .cycle-admin-actions { justify-content: flex-start; }
}
@media (max-width: 480px) {
  .form-card { padding: 1rem; }
  .cycle-details { padding: 0.75rem; }
  .goal-card, .pdi-card { padding: 0.75rem; }
  .competency-row { flex-direction: column; align-items: flex-start; gap: 0.25rem; }
}
</style>
