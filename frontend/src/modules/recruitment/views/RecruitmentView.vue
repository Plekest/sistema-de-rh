<script setup lang="ts">
import { onMounted } from 'vue'
import { useRecruitment } from '../composables/useRecruitment'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import JobPositionForm from '../components/JobPositionForm.vue'
import CandidateForm from '../components/CandidateForm.vue'
import CandidateCard from '../components/CandidateCard.vue'
import RecruitmentFilters from '../components/RecruitmentFilters.vue'

/**
 * View principal de Recrutamento e Selecao
 *
 * Decomposta em componentes menores:
 * - JobPositionForm: formulario de criacao/edicao de vaga
 * - CandidateForm: formulario de candidato
 * - CandidateCard: card individual de candidato
 * - RecruitmentFilters: area de filtros
 *
 * Toda a logica de negocio esta centralizada no composable useRecruitment.
 */

const {
  // Estado
  requisitions,
  candidates,
  stages,
  interviews,
  departments,
  positions,
  employees,
  isLoading,
  error,
  successMessage,
  actionLoading,

  // Tabs
  activeTab,

  // Filtros
  filterReqStatus,
  filterReqDepartment,
  filterReqType,
  filterCandRequisition,
  filterCandStatus,
  filterCandStage,
  filterCandSearch,

  // Vaga expandida
  expandedRequisitionId,

  // Formularios
  showRequisitionForm,
  requisitionFormLoading,
  requisitionFormError,
  requisitionFormData,
  showCandidateForm,
  candidateFormLoading,
  candidateFormError,
  candidateFormData,
  showInterviewForm,
  interviewFormLoading,
  interviewFormError,
  interviewFormData,
  showMoveForm,
  moveFormLoading,
  moveFormError,
  selectedCandidateId,
  moveFormData,
  showCompleteForm,
  completeFormLoading,
  completeFormError,
  selectedInterviewId,
  completeFormData,

  // Computed
  isAdmin,
  candidatesByStage,

  // Labels
  requisitionStatusLabels,
  employmentTypeLabels,
  workModelLabels,
  candidateStatusLabels,
  candidateSourceLabels,
  interviewStatusLabels,

  // Metodos
  loadRequisitions,
  loadCandidates,
  loadInterviews,
  toggleExpand,
  openRequisitionForm,
  closeRequisitionForm,
  submitRequisitionForm,
  approveRequisition,
  cancelRequisition,
  openCandidateForm,
  closeCandidateForm,
  submitCandidateForm,
  openMoveForm,
  closeMoveForm,
  submitMoveForm,
  hireCandidate,
  rejectCandidate,
  openInterviewForm,
  closeInterviewForm,
  submitInterviewForm,
  openCompleteForm,
  closeCompleteForm,
  submitCompleteForm,
  cancelInterview,
  formatCurrency,
  formatDate,
  formatDateTime,
  statusBadgeClass,
  getCandidateName,
  init,
} = useRecruitment()

onMounted(() => {
  init()
})
</script>

<template>
  <div class="recruitment-view">
    <div class="page-header">
      <h1 class="page-title">Recrutamento e Selecao</h1>
      <button v-if="isAdmin" class="btn-primary" @click="openRequisitionForm">Nova Vaga</button>
    </div>

    <!-- Mensagens -->
    <Transition name="fade">
      <div v-if="successMessage" class="alert alert-success" role="alert">{{ successMessage }}</div>
    </Transition>
    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'requisitions' }"
        @click="activeTab = 'requisitions'; loadRequisitions()"
      >
        Vagas
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'candidates' }"
        @click="activeTab = 'candidates'; loadCandidates()"
      >
        Candidatos
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'pipeline' }"
        @click="activeTab = 'pipeline'; loadCandidates()"
      >
        Pipeline
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'interviews' }"
        @click="activeTab = 'interviews'; loadCandidates(); loadInterviews()"
      >
        Entrevistas
      </button>
    </div>

    <!-- === TAB: VAGAS === -->
    <template v-if="activeTab === 'requisitions'">
      <!-- Filtros -->
      <RecruitmentFilters
        type="requisitions"
        :filterReqStatus="filterReqStatus"
        :filterReqDepartment="filterReqDepartment"
        :filterReqType="filterReqType"
        :departments="departments"
        :requisitionStatusLabels="requisitionStatusLabels"
        :employmentTypeLabels="employmentTypeLabels"
        @update:filterReqStatus="filterReqStatus = $event"
        @update:filterReqDepartment="filterReqDepartment = $event"
        @update:filterReqType="filterReqType = $event"
        @reload="loadRequisitions"
      />

      <!-- Formulario nova vaga -->
      <JobPositionForm
        :show="showRequisitionForm"
        :formData="requisitionFormData"
        :formLoading="requisitionFormLoading"
        :formError="requisitionFormError"
        :departments="departments"
        :positions="positions"
        :employmentTypeLabels="employmentTypeLabels"
        :workModelLabels="workModelLabels"
        @close="closeRequisitionForm"
        @submit="submitRequisitionForm"
        @update:formData="requisitionFormData = $event"
      />

      <!-- Lista de vagas -->
      <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando vagas..." /></div>

      <div v-else-if="requisitions.length > 0" class="requisitions-list">
        <div v-for="req in requisitions" :key="req.id" class="requisition-card">
          <div class="requisition-header" @click="toggleExpand(req.id)">
            <div class="requisition-info">
              <h3 class="requisition-title">{{ req.title }}</h3>
              <span class="requisition-meta">
                {{ req.department?.name || 'N/A' }} | {{ employmentTypeLabels[req.employmentType] }} | {{ workModelLabels[req.workModel] }}
              </span>
            </div>
            <div class="requisition-actions-header">
              <span class="badge" :class="statusBadgeClass(req.status)">
                {{ requisitionStatusLabels[req.status] }}
              </span>
              <span class="expand-indicator">{{ expandedRequisitionId === req.id ? '−' : '+' }}</span>
            </div>
          </div>

          <!-- Detalhes expandidos -->
          <div v-if="expandedRequisitionId === req.id" class="requisition-details">
            <div class="detail-section">
              <div class="detail-row">
                <span class="detail-label">Vagas:</span>
                <span class="detail-value">{{ req.headcount }}</span>
              </div>
              <div v-if="req.salaryRangeMin || req.salaryRangeMax" class="detail-row">
                <span class="detail-label">Faixa Salarial:</span>
                <span class="detail-value">
                  {{ req.salaryRangeMin ? formatCurrency(req.salaryRangeMin) : 'N/A' }} -
                  {{ req.salaryRangeMax ? formatCurrency(req.salaryRangeMax) : 'N/A' }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Criada em:</span>
                <span class="detail-value">{{ formatDate(req.createdAt) }}</span>
              </div>
            </div>

            <div v-if="req.description" class="detail-section">
              <h4 class="detail-section-title">Descricao</h4>
              <p class="detail-text">{{ req.description }}</p>
            </div>

            <div v-if="req.requirements" class="detail-section">
              <h4 class="detail-section-title">Requisitos</h4>
              <p class="detail-text">{{ req.requirements }}</p>
            </div>

            <div class="requisition-admin-actions">
              <button
                v-if="isAdmin && req.status === 'pending_approval'"
                class="btn-action btn-approve"
                :disabled="actionLoading !== null"
                @click.stop="approveRequisition(req.id)"
              >
                {{ actionLoading === 'approveRequisition' ? 'Aprovando...' : 'Aprovar' }}
              </button>
              <button
                v-if="isAdmin && req.status !== 'cancelled' && req.status !== 'filled'"
                class="btn-action btn-cancel"
                :disabled="actionLoading !== null"
                @click.stop="cancelRequisition(req.id)"
              >
                {{ actionLoading === 'cancelRequisition' ? 'Cancelando...' : 'Cancelar' }}
              </button>
              <button
                v-if="isAdmin && (req.status === 'approved' || req.status === 'open')"
                class="btn-action btn-approve"
                :disabled="actionLoading !== null"
                @click.stop="openCandidateForm(req.id)"
              >
                Adicionar Candidato
              </button>
            </div>
          </div>
        </div>
      </div>

      <EmptyState
        v-else
        title="Nenhuma vaga encontrada"
        description="Nao ha vagas cadastradas no sistema."
      />
    </template>

    <!-- === TAB: CANDIDATOS === -->
    <template v-if="activeTab === 'candidates'">
      <!-- Filtros -->
      <RecruitmentFilters
        type="candidates"
        :filterCandRequisition="filterCandRequisition"
        :filterCandStatus="filterCandStatus"
        :filterCandStage="filterCandStage"
        :filterCandSearch="filterCandSearch"
        :departments="departments"
        :requisitions="requisitions"
        :stages="stages"
        :candidateStatusLabels="candidateStatusLabels"
        @update:filterCandRequisition="filterCandRequisition = $event"
        @update:filterCandStatus="filterCandStatus = $event"
        @update:filterCandStage="filterCandStage = $event"
        @update:filterCandSearch="filterCandSearch = $event"
        @reload="loadCandidates"
      />

      <!-- Formulario novo candidato -->
      <CandidateForm
        :show="showCandidateForm"
        :formData="candidateFormData"
        :formLoading="candidateFormLoading"
        :formError="candidateFormError"
        :requisitions="requisitions"
        :candidateSourceLabels="candidateSourceLabels"
        @close="closeCandidateForm"
        @submit="submitCandidateForm"
        @update:formData="candidateFormData = $event"
      />

      <!-- Botao adicionar candidato -->
      <div v-if="!showCandidateForm && !showMoveForm" class="candidates-actions-bar">
        <button v-if="isAdmin" class="btn-primary" @click="openCandidateForm()">Novo Candidato</button>
      </div>

      <!-- Lista de candidatos -->
      <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando candidatos..." /></div>

      <div v-else-if="candidates.length > 0" class="candidates-list">
        <CandidateCard
          v-for="cand in candidates"
          :key="cand.id"
          :candidate="cand"
          :isAdmin="isAdmin"
          :actionLoading="actionLoading"
          :candidateSourceLabels="candidateSourceLabels"
          :candidateStatusLabels="candidateStatusLabels"
          :statusBadgeClass="statusBadgeClass"
          @move="openMoveForm"
          @interview="openInterviewForm"
          @hire="hireCandidate"
          @reject="rejectCandidate"
        />
      </div>

      <EmptyState
        v-else
        title="Nenhum candidato encontrado"
        description="Nao ha candidatos cadastrados."
      />
    </template>

    <!-- === TAB: PIPELINE === -->
    <template v-if="activeTab === 'pipeline'">
      <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando pipeline..." /></div>

      <div v-else class="pipeline-view">
        <div v-for="stage in stages" :key="stage.id" class="pipeline-stage">
          <div class="pipeline-stage-header">
            <h3 class="pipeline-stage-title">{{ stage.name }}</h3>
            <span class="pipeline-stage-count">{{ candidatesByStage.get(stage.id)?.length || 0 }}</span>
          </div>

          <div class="pipeline-cards">
            <div
              v-for="cand in candidatesByStage.get(stage.id)"
              :key="cand.id"
              class="pipeline-card"
            >
              <div class="pipeline-card-name">{{ cand.name }}</div>
              <div class="pipeline-card-job">{{ cand.jobRequisition?.title }}</div>
              <div v-if="isAdmin" class="pipeline-card-actions">
                <button class="btn-action btn-approve btn-tiny" @click="openMoveForm(cand.id)">
                  Mover
                </button>
              </div>
            </div>

            <div v-if="!candidatesByStage.get(stage.id)?.length" class="pipeline-empty">
              Nenhum candidato
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- === TAB: ENTREVISTAS === -->
    <template v-if="activeTab === 'interviews'">
      <!-- TODO: Criar InterviewForm component -->
      <!-- Lista simplificada aqui por brevidade -->
      <div v-if="!showInterviewForm && !showCompleteForm" class="interviews-actions-bar">
        <button v-if="isAdmin" class="btn-primary" @click="openInterviewForm()">Agendar Entrevista</button>
      </div>

      <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando entrevistas..." /></div>

      <div v-else-if="interviews.length > 0" class="interviews-list">
        <div v-for="interview in interviews" :key="interview.id" class="interview-card">
          <div class="interview-header">
            <div class="interview-info">
              <h3 class="interview-candidate">{{ getCandidateName(interview.candidateId) }}</h3>
              <span class="interview-meta">
                {{ formatDateTime(interview.scheduledAt) }} | {{ interview.durationMinutes }} min
              </span>
              <span v-if="interview.interviewer" class="interview-interviewer">
                Entrevistador: {{ interview.interviewer.fullName }}
              </span>
            </div>
            <span class="badge" :class="statusBadgeClass(interview.status)">
              {{ interviewStatusLabels[interview.status] }}
            </span>
          </div>

          <div v-if="interview.location || interview.meetingLink" class="interview-details">
            <span v-if="interview.location" class="interview-location">Local: {{ interview.location }}</span>
            <a v-if="interview.meetingLink" :href="interview.meetingLink" target="_blank" class="interview-link">
              Link da Reuniao
            </a>
          </div>

          <div v-if="interview.feedback" class="interview-feedback">
            <strong>Feedback:</strong> {{ interview.feedback }}
            <span v-if="interview.score !== null" class="interview-score">Nota: {{ interview.score }}</span>
          </div>

          <div v-if="isAdmin && interview.status === 'scheduled'" class="interview-actions">
            <button class="btn-action btn-approve" :disabled="actionLoading !== null" @click="openCompleteForm(interview.id)">
              Completar
            </button>
            <button class="btn-action btn-cancel" :disabled="actionLoading !== null" @click="cancelInterview(interview.id)">
              {{ actionLoading === 'cancelInterview' ? 'Cancelando...' : 'Cancelar' }}
            </button>
          </div>
        </div>
      </div>

      <EmptyState
        v-else
        title="Nenhuma entrevista encontrada"
        description="Nao ha entrevistas agendadas."
      />
    </template>

    <!-- === FORMULARIO MOVER CANDIDATO (overlay global) === -->
    <div v-if="showMoveForm" class="form-overlay" @click.self="closeMoveForm">
      <div class="form-card form-modal">
        <div class="form-header">
          <h2 class="form-title">Mover Candidato de Etapa</h2>
          <button class="btn-close" @click="closeMoveForm">Fechar</button>
        </div>

        <div v-if="moveFormError" class="alert alert-error" role="alert">{{ moveFormError }}</div>

        <form @submit.prevent="submitMoveForm" class="form-grid">
          <div class="form-group">
            <label for="move-stage">Etapa de Destino *</label>
            <select id="move-stage" v-model="moveFormData.stageId" required>
              <option :value="0">Selecione...</option>
              <option v-for="stage in stages" :key="stage.id" :value="stage.id">
                {{ stage.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="move-score">Nota (1-5)</label>
            <input id="move-score" type="number" min="1" max="5" v-model="moveFormData.score" />
          </div>

          <div class="form-group form-col-full">
            <label for="move-feedback">Feedback</label>
            <textarea id="move-feedback" v-model="moveFormData.feedback" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeMoveForm" :disabled="moveFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="moveFormLoading">
              {{ moveFormLoading ? 'Movendo...' : 'Mover' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recruitment-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.tab {
  padding: 0.625rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: #4a5568;
}

.tab-active {
  color: #667eea;
  border-bottom-color: #667eea;
}

/* Botoes */
.btn-primary {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background: #fff;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.btn-close {
  padding: 0.375rem 0.875rem;
  background: transparent;
  color: #718096;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f7fafc;
  color: #4a5568;
}

.btn-action {
  padding: 0.25rem 0.625rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 0.125rem;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-approve {
  background: #c6f6d5;
  color: #276749;
}

.btn-approve:hover:not(:disabled) {
  background: #9ae6b4;
}

.btn-cancel {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-cancel:hover:not(:disabled) {
  background: #cbd5e0;
}

.btn-tiny {
  padding: 0.125rem 0.5rem;
  font-size: 0.688rem;
}

/* Alertas */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.alert-success {
  background: #c6f6d5;
  border: 1px solid #9ae6b4;
  color: #276749;
}

.alert-error {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #c53030;
}

/* Cards de vagas */
.requisitions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.requisition-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.requisition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.requisition-header:hover {
  background: #f7fafc;
}

.requisition-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.requisition-title {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.requisition-meta {
  font-size: 0.813rem;
  color: #718096;
}

.requisition-actions-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.expand-indicator {
  font-size: 1.25rem;
  color: #a0aec0;
  font-weight: 300;
  width: 24px;
  text-align: center;
}

.requisition-details {
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1.25rem;
}

.detail-section {
  margin-bottom: 1rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
  font-size: 0.813rem;
}

.detail-label {
  font-weight: 600;
  color: #4a5568;
}

.detail-value {
  color: #2d3748;
}

.detail-section-title {
  font-size: 0.813rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin: 0 0 0.5rem;
}

.detail-text {
  font-size: 0.813rem;
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

.requisition-admin-actions {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #edf2f7;
  display: flex;
  gap: 0.5rem;
}

/* Candidatos */
.candidates-actions-bar,
.interviews-actions-bar {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-end;
}

.candidates-list,
.interviews-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.interview-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem 1.25rem;
}

.interview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.interview-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.interview-candidate {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.interview-meta,
.interview-interviewer {
  font-size: 0.813rem;
  color: #718096;
}

.interview-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.813rem;
  color: #718096;
}

.interview-link {
  color: #667eea;
  text-decoration: none;
}

.interview-link:hover {
  text-decoration: underline;
}

.interview-feedback {
  background: #f7fafc;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.813rem;
  color: #2d3748;
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
}

.interview-score {
  display: block;
  margin-top: 0.25rem;
  font-weight: 600;
  color: #667eea;
}

.interview-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Pipeline */
.pipeline-view {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.pipeline-stage {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.pipeline-stage-header {
  background: #f7fafc;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.pipeline-stage-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.pipeline-stage-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: #718096;
  background: #e2e8f0;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
}

.pipeline-cards {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 100px;
}

.pipeline-card {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.625rem;
}

.pipeline-card-name {
  font-size: 0.813rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.pipeline-card-job {
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 0.375rem;
}

.pipeline-card-actions {
  display: flex;
  gap: 0.25rem;
}

.pipeline-empty {
  text-align: center;
  color: #a0aec0;
  font-size: 0.75rem;
  padding: 1rem 0;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Estados */
.loading-state {
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-size: 0.875rem;
}

/* Overlay para formularios modais */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.form-modal {
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.form-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-col-full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.813rem;
  font-weight: 600;
  color: #4a5568;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Fade transition */
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .tabs::-webkit-scrollbar {
    display: none;
  }

  .tab {
    white-space: nowrap;
    flex-shrink: 0;
    padding: 0.625rem 0.875rem;
    font-size: 0.813rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .pipeline-view {
    grid-template-columns: 1fr;
  }

  .requisition-header,
  .interview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .requisition-admin-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .requisition-details {
    padding: 0.75rem;
  }

  .pipeline-cards {
    padding: 0.5rem;
  }
}
</style>
