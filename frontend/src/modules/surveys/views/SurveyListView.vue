<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSurveys } from '../composables/useSurveys'

const router = useRouter()
const {
  surveys,
  isLoading,
  error,
  successMessage,
  filterStatus,
  filterType,
  isAdmin,
  typeLabels,
  statusLabels,
  activateSurvey,
  closeSurvey,
  deleteSurvey,
  formatDate,
  init,
} = useSurveys()

onMounted(() => {
  init()
})
</script>

<template>
  <div class="surveys-view">
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">Pesquisas</h1>
        <p class="page-subtitle">Gerencie pesquisas de clima, satisfação e eNPS</p>
      </div>
      <button v-if="isAdmin" class="btn btn-primary" @click="router.push('/surveys/create')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Nova Pesquisa
      </button>
    </div>

    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Tipo</label>
        <select v-model="filterType" @change="init" class="filter-select">
          <option value="">Todos</option>
          <option v-for="(label, key) in typeLabels" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select v-model="filterStatus" @change="init" class="filter-select">
          <option value="">Todos</option>
          <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="loading">Carregando...</div>

    <div v-else-if="surveys.length === 0" class="empty-state">
      <p>Nenhuma pesquisa encontrada</p>
    </div>

    <div v-else class="surveys-grid">
      <div v-for="survey in surveys" :key="survey.id" class="survey-card">
        <div class="card-header">
          <div class="card-title-row">
            <h3 class="card-title">{{ survey.title }}</h3>
            <span class="badge" :class="`badge-${survey.type}`">{{ typeLabels[survey.type] }}</span>
          </div>
          <span class="badge badge-status" :class="`badge-status-${survey.status}`">
            {{ statusLabels[survey.status] }}
          </span>
        </div>

        <p v-if="survey.description" class="card-description">{{ survey.description }}</p>

        <div class="card-meta">
          <span class="meta-item">{{ formatDate(survey.startDate) }} - {{ formatDate(survey.endDate) }}</span>
          <span v-if="survey.responseRate !== undefined" class="meta-item">
            {{ survey.responseRate }}% respondido
          </span>
        </div>

        <div class="card-actions">
          <button v-if="survey.status === 'draft'" class="btn btn-sm btn-primary" @click="activateSurvey(survey.id)">
            Ativar
          </button>
          <button v-if="survey.status === 'active'" class="btn btn-sm btn-secondary" @click="closeSurvey(survey.id)">
            Encerrar
          </button>
          <button v-if="survey.status === 'closed'" class="btn btn-sm btn-primary" @click="router.push(`/surveys/${survey.id}/results`)">
            Ver Resultados
          </button>
          <button v-if="isAdmin" class="btn btn-sm btn-danger" @click="deleteSurvey(survey.id)">
            Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.surveys-view {
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

.loading,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
}

.surveys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-8);
}

.survey-card {
  padding: var(--space-10);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  transition: all var(--transition-fast);
}

.survey-card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  padding-top: var(--space-6);
  border-top: var(--border-width) solid var(--color-border-light);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.card-actions {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.badge {
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  white-space: nowrap;
}

.badge-climate {
  background-color: var(--color-success-bg);
  color: var(--color-success-darker);
}

.badge-satisfaction {
  background-color: var(--color-info-bg);
  color: var(--color-info-dark);
}

.badge-enps {
  background-color: var(--color-secondary-light);
  color: var(--color-secondary-dark);
}

.badge-custom {
  background-color: var(--color-bg-muted);
  color: var(--color-text-secondary);
}

.badge-status-draft {
  background-color: var(--color-bg-muted);
  color: var(--color-text-muted);
}

.badge-status-active {
  background-color: var(--color-success-bg);
  color: var(--color-success-darker);
}

.badge-status-closed {
  background-color: var(--color-warning-bg);
  color: var(--color-warning-darker);
}

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
  border-color: var(--color-border-hover);
}

.btn-danger {
  background-color: var(--color-danger);
  color: white;
}

.btn-danger:hover {
  background-color: var(--color-danger-dark);
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .surveys-grid {
    grid-template-columns: 1fr;
  }
}
</style>
