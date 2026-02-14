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
/* Estilos principais */
.performance-view { max-width: var(--max-width-2xl); margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-12); }
.page-title { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0; }
.tabs { display: flex; gap: 0; margin-bottom: var(--space-12); border-bottom: var(--border-width-thick) solid var(--color-border); }
.tab { padding: var(--space-5) var(--space-10); background: none; border: none; border-bottom: var(--border-width-thick) solid transparent; margin-bottom: calc(-1 * var(--border-width-thick)); font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-text-muted); cursor: pointer; transition: var(--transition-base); }
.tab:hover { color: var(--color-text-tertiary); }
.tab-active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
.btn-primary { padding: var(--btn-padding-y) var(--btn-padding-x); background: var(--color-primary-gradient); color: var(--color-bg-card); border: none; border-radius: var(--btn-border-radius); font-size: var(--btn-font-size); font-weight: var(--btn-font-weight); cursor: pointer; transition: var(--transition-base); }
.btn-primary:hover:not(:disabled) { box-shadow: var(--shadow-primary); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { padding: var(--btn-padding-y) var(--btn-padding-x); background: var(--color-bg-card); color: var(--color-text-tertiary); border: var(--border-width) solid var(--color-border); border-radius: var(--btn-border-radius); font-size: var(--btn-font-size); font-weight: var(--btn-font-weight); cursor: pointer; transition: var(--transition-base); }
.btn-secondary:hover:not(:disabled) { background: var(--color-bg-hover); border-color: var(--color-border-hover); }
.btn-close { padding: var(--space-3) var(--space-6); background: transparent; color: var(--color-text-muted); border: var(--border-width) solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); cursor: pointer; transition: var(--transition-base); }
.btn-close:hover { background: var(--color-bg-hover); color: var(--color-text-tertiary); }
.btn-small { padding: var(--space-2) var(--space-6); background: var(--color-primary-gradient); color: var(--color-bg-card); border: none; border-radius: var(--radius-xs); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); cursor: pointer; transition: var(--transition-base); }
.btn-small:hover { box-shadow: var(--shadow-primary); transform: translateY(-1px); }
.btn-action { padding: var(--space-2) var(--space-5); border: none; border-radius: var(--radius-xs); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); cursor: pointer; transition: var(--transition-base); margin: 0 var(--space-1); }
.btn-detail { background: var(--color-primary-light); color: var(--color-primary); }
.btn-detail:hover { background: var(--color-info-lighter); }
.btn-approve { background: var(--color-success-lighter); color: var(--color-success-dark); }
.btn-approve:hover { background: var(--color-success-bg); }
.btn-cancel { background: var(--color-border); color: var(--color-text-tertiary); }
.btn-cancel:hover { background: var(--color-border-hover); }
.btn-tiny { padding: var(--space-1) var(--space-4); font-size: var(--font-size-2xs); }
.alert { padding: var(--alert-padding-y) var(--alert-padding-x); border-radius: var(--alert-border-radius); font-size: var(--alert-font-size); margin-bottom: var(--space-8); }
.alert-success { background: var(--color-success-lighter); border: var(--border-width) solid var(--color-success-bg); color: var(--color-success-dark); }
.alert-error { background: var(--color-danger-light); border: var(--border-width) solid var(--color-danger-lighter); color: var(--color-danger-dark); }
.filters-bar { display: flex; gap: var(--space-8); margin-bottom: var(--space-12); flex-wrap: wrap; background: var(--color-bg-card); padding: var(--space-8) var(--space-10); border-radius: var(--card-border-radius); border: var(--border-width) solid var(--color-border); }
.filter-group { display: flex; flex-direction: column; gap: var(--space-2); }
.filter-grow { flex: 1; min-width: 200px; }
.filter-group label { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.025em; }
.filter-group select { padding: var(--input-padding-y) var(--input-padding-x); border: var(--border-width) solid var(--color-border); border-radius: var(--input-border-radius); font-size: var(--font-size-base); color: var(--color-text-secondary); background: var(--color-bg-input); outline: none; transition: border-color var(--transition-base); }
.filter-group select:focus { border-color: var(--color-border-focus); }
.form-card { background: var(--color-bg-card); border: var(--border-width) solid var(--color-border); border-radius: var(--card-border-radius); padding: var(--card-padding); margin-bottom: var(--space-12); }
.form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-10); }
.form-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin: 0; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-8); }
.form-group { display: flex; flex-direction: column; gap: var(--space-3); }
.form-col-full { grid-column: 1 / -1; }
.form-group label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-tertiary); }
.form-group input, .form-group select, .form-group textarea { padding: var(--input-padding-y) var(--input-padding-x); border: var(--border-width) solid var(--color-border); border-radius: var(--input-border-radius); font-size: var(--font-size-base); color: var(--color-text-secondary); background: var(--color-bg-input); outline: none; transition: border-color var(--transition-base); }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--color-border-focus); }
.form-group textarea { resize: vertical; font-family: inherit; }
.form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: var(--space-6); margin-top: var(--space-4); }
.cycles-list { display: flex; flex-direction: column; gap: var(--space-6); }
.cycle-card { background: var(--color-bg-card); border: var(--border-width) solid var(--color-border); border-radius: var(--card-border-radius); overflow: hidden; }
.cycle-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-8) var(--space-10); cursor: pointer; transition: background var(--transition-base); }
.cycle-header:hover { background: var(--color-bg-hover); }
.cycle-info { display: flex; align-items: center; gap: var(--space-6); flex-wrap: wrap; }
.cycle-type-tag { display: inline-block; padding: var(--space-1) var(--space-4); background: var(--color-primary-light); color: var(--color-primary); border-radius: var(--radius-xs); font-size: var(--font-size-2xs); font-weight: var(--font-weight-semibold); text-transform: uppercase; letter-spacing: 0.025em; }
.cycle-name { font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin: 0; }
.cycle-actions-header { display: flex; align-items: center; gap: var(--space-6); }
.cycle-dates { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.expand-indicator { font-size: var(--font-size-2xl); color: var(--color-text-placeholder); font-weight: var(--font-weight-normal); width: 24px; text-align: center; }
.cycle-details { border-top: var(--border-width) solid var(--color-border); padding: var(--space-8) var(--space-10); }
.detail-section { margin-bottom: var(--space-8); }
.detail-section:last-child { margin-bottom: 0; }
.detail-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.detail-title { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.025em; margin: 0 0 var(--space-4); }
.detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-8); }
.detail-item { display: flex; flex-direction: column; gap: var(--space-1); }
.detail-label { font-size: var(--font-size-2xs); font-weight: var(--font-weight-semibold); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.025em; }
.detail-value { font-size: var(--font-size-base); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); }
.competencies-list { display: flex; flex-direction: column; gap: var(--space-4); }
.competency-row { display: flex; align-items: center; gap: var(--space-6); padding: var(--space-4) var(--space-6); background: var(--color-bg-hover); border-radius: var(--radius-md); }
.competency-name { font-size: var(--font-size-base); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); flex: 1; }
.competency-weight { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.empty-section { font-size: var(--font-size-sm); color: var(--color-text-placeholder); text-align: center; padding: var(--space-6); }
.cycle-admin-actions { margin-top: var(--space-6); padding-top: var(--space-6); border-top: var(--border-width) solid var(--color-bg-muted); display: flex; justify-content: flex-end; }
.table-container { background: var(--color-bg-card); border-radius: var(--card-border-radius); border: var(--border-width) solid var(--card-border-color); overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: var(--table-cell-padding-y) var(--table-cell-padding-x); font-size: var(--table-header-font-size); font-weight: var(--table-header-font-weight); color: var(--table-header-color); text-transform: uppercase; letter-spacing: 0.025em; border-bottom: var(--border-width-thick) solid var(--table-border-color); white-space: nowrap; }
.data-table td { padding: var(--table-cell-padding-y) var(--table-cell-padding-x); font-size: var(--font-size-base); color: var(--color-text-secondary); border-bottom: var(--border-width) solid var(--table-row-border-color); }
.data-table tbody tr:hover { background-color: var(--table-row-hover-bg); }
.th-center { text-align: center; }
.td-center { text-align: center; }
.td-name { font-weight: var(--font-weight-medium); }
.td-description { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.goals-list { display: flex; flex-direction: column; gap: var(--space-6); }
.goal-card { background: var(--color-bg-card); border: var(--border-width) solid var(--color-border); border-radius: var(--card-border-radius); padding: var(--space-8); }
.goal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
.goal-info { display: flex; flex-direction: column; gap: var(--space-2); }
.goal-title { font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin: 0; }
.goal-employee { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.goal-description { font-size: var(--font-size-base); color: var(--color-text-tertiary); margin: 0 0 var(--space-6); }
.goal-details { display: flex; gap: var(--space-16); flex-wrap: wrap; }
.goal-detail-item { display: flex; flex-direction: column; gap: var(--space-1); }
.goal-detail-label { font-size: var(--font-size-2xs); font-weight: var(--font-weight-semibold); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.025em; }
.goal-detail-value { font-size: var(--font-size-base); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); }
.evaluation-form { display: flex; flex-direction: column; gap: var(--space-12); }
.evaluation-score-group { padding: var(--space-8); background: var(--color-bg-hover); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: var(--space-6); }
.score-header { border-bottom: var(--border-width) solid var(--color-border); padding-bottom: var(--space-4); }
.score-competency { font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); }
.score-input-group, .score-comment-group { display: flex; flex-direction: column; gap: var(--space-3); }
.score-input-group label, .score-comment-group label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-tertiary); }
.score-input-group input, .score-comment-group textarea { padding: var(--input-padding-y) var(--input-padding-x); border: var(--border-width) solid var(--color-border); border-radius: var(--input-border-radius); font-size: var(--font-size-base); color: var(--color-text-secondary); background: var(--color-bg-input); outline: none; transition: border-color var(--transition-base); resize: vertical; font-family: inherit; }
.score-input-group input:focus, .score-comment-group textarea:focus { border-color: var(--color-border-focus); }
.pdi-list { display: flex; flex-direction: column; gap: var(--space-6); }
.pdi-card { background: var(--color-bg-card); border: var(--border-width) solid var(--color-border); border-radius: var(--card-border-radius); padding: var(--space-8); }
.pdi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
.pdi-info { display: flex; flex-direction: column; gap: var(--space-2); }
.pdi-action { font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin: 0; }
.pdi-employee { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.pdi-description { font-size: var(--font-size-base); color: var(--color-text-tertiary); margin: 0 0 var(--space-6); }
.pdi-details { display: flex; gap: var(--space-16); flex-wrap: wrap; margin-bottom: var(--space-6); }
.pdi-detail-item { display: flex; flex-direction: column; gap: var(--space-1); }
.pdi-detail-label { font-size: var(--font-size-2xs); font-weight: var(--font-weight-semibold); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.025em; }
.pdi-detail-value { font-size: var(--font-size-base); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); }
.pdi-actions { display: flex; gap: var(--space-4); }
.badge { display: inline-block; padding: var(--badge-padding-y) var(--badge-padding-x); border-radius: var(--badge-border-radius); font-size: var(--badge-font-size); font-weight: var(--badge-font-weight); white-space: nowrap; }
.badge-draft { background: var(--color-border); color: var(--color-text-tertiary); }
.badge-self-eval { background: var(--color-warning-lighter); color: var(--color-warning-darker); }
.badge-manager-eval { background: var(--color-info-bg); color: var(--color-info-dark); }
.badge-calibration { background: var(--color-secondary-light); color: var(--color-secondary-dark); }
.badge-closed { background: var(--color-success-bg); color: var(--color-success-darker); }
.badge-pending { background: var(--color-border); color: var(--color-text-tertiary); }
.badge-in-progress { background: var(--color-info-bg); color: var(--color-info-dark); }
.badge-achieved { background: var(--color-success-bg); color: var(--color-success-darker); }
.badge-not-achieved { background: var(--color-danger-bg); color: var(--color-danger-darker); }
.badge-completed { background: var(--color-success-bg); color: var(--color-success-darker); }
.badge-cancelled { background: var(--color-danger-bg); color: var(--color-danger-darker); }
.badge-active { background: var(--color-success-bg); color: var(--color-success-darker); }
.badge-inactive { background: var(--color-border); color: var(--color-text-tertiary); }
.fade-enter-active { transition: opacity var(--transition-slow); }
.fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: var(--space-8); }
  .tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .tabs::-webkit-scrollbar { display: none; }
  .tab { white-space: nowrap; flex-shrink: 0; padding: var(--space-5) var(--space-6); font-size: var(--font-size-sm); }
  .filters-bar { flex-direction: column; }
  .form-grid { grid-template-columns: 1fr; }
  .cycle-header { flex-direction: column; align-items: flex-start; gap: var(--space-4); }
  .detail-grid { grid-template-columns: 1fr; }
  .detail-section-header { flex-direction: column; align-items: flex-start; gap: var(--space-4); }
  .goal-header, .pdi-header { flex-direction: column; align-items: flex-start; gap: var(--space-4); }
  .goal-details, .pdi-details { flex-direction: column; gap: var(--space-6); }
  .pdi-actions { flex-wrap: wrap; }
  .table-container { overflow-x: scroll; }
  .data-table { min-width: 700px; }
  .cycle-admin-actions { justify-content: flex-start; }
}
@media (max-width: 480px) {
  .form-card { padding: var(--space-8); }
  .cycle-details { padding: var(--space-6); }
  .goal-card, .pdi-card { padding: var(--space-6); }
  .competency-row { flex-direction: column; align-items: flex-start; gap: var(--space-2); }
}
</style>
