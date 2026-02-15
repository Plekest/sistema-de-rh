<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import lifecycleService from '../services/lifecycleService'
import type { LifecycleEvent, LifecycleSummary } from '../types'

const route = useRoute()
const isLoading = ref(false)
const error = ref<string | null>(null)

const timeline = ref<LifecycleEvent[]>([])
const summary = ref<LifecycleSummary | null>(null)
const filterFrom = ref('')
const filterTo = ref('')
const filterTypes = ref<string[]>([])

const employeeId = parseInt(route.params.id as string)

const eventTypeIcons: Record<string, string> = {
  history: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  leave: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  training: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  evaluation: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  onboarding: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  turnover: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
}

const eventTypeColors: Record<string, string> = {
  history: 'var(--color-primary)',
  leave: 'var(--color-success)',
  training: 'var(--color-secondary)',
  evaluation: 'var(--color-warning)',
  onboarding: 'var(--color-info)',
  turnover: 'var(--color-danger)',
}

async function loadData() {
  try {
    isLoading.value = true
    error.value = null
    const [timelineData, summaryData] = await Promise.all([
      lifecycleService.getTimeline(employeeId, {
        from: filterFrom.value || undefined,
        to: filterTo.value || undefined,
        types: filterTypes.value.length > 0 ? filterTypes.value : undefined,
      }),
      lifecycleService.getSummary(employeeId),
    ])
    timeline.value = timelineData
    summary.value = summaryData
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar dados'
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="lifecycle-view">
    <div class="view-header">
      <h1 class="page-title">Jornada do Colaborador</h1>
      <p class="page-subtitle">Timeline completa de eventos e marcos profissionais</p>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- Summary cards -->
    <div v-if="summary" class="summary-grid">
      <div class="summary-card">
        <h3 class="summary-label">Tempo de Casa</h3>
        <p class="summary-value">{{ summary.tenureMonths }} meses</p>
      </div>
      <div class="summary-card">
        <h3 class="summary-label">Promocoes</h3>
        <p class="summary-value">{{ summary.totalPromotions }}</p>
      </div>
      <div class="summary-card">
        <h3 class="summary-label">Treinamentos</h3>
        <p class="summary-value">{{ summary.totalTrainings }}</p>
      </div>
      <div v-if="summary.engagementScore" class="summary-card">
        <h3 class="summary-label">Engagement Score</h3>
        <p class="summary-value">{{ summary.engagementScore }}/100</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">De</label>
        <input v-model="filterFrom" @change="loadData" type="date" class="filter-input" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Ate</label>
        <input v-model="filterTo" @change="loadData" type="date" class="filter-input" />
      </div>
    </div>

    <div v-if="isLoading" class="loading">Carregando...</div>

    <div v-else-if="timeline.length === 0" class="empty-state">
      <p>Nenhum evento encontrado</p>
    </div>

    <!-- Timeline -->
    <div v-else class="timeline">
      <div v-for="(event, index) in timeline" :key="index" class="timeline-item">
        <div class="timeline-marker" :style="{ backgroundColor: eventTypeColors[event.source] }">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path :d="eventTypeIcons[event.source]"></path>
          </svg>
        </div>
        <div class="timeline-content">
          <div class="timeline-date">{{ formatDate(event.date) }}</div>
          <h3 class="timeline-title">{{ event.title }}</h3>
          <p class="timeline-description">{{ event.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lifecycle-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  max-width: 900px;
  margin: 0 auto;
}

.view-header {
  text-align: center;
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

.alert-error {
  padding: var(--alert-padding-y) var(--alert-padding-x);
  background-color: var(--color-danger-light);
  color: var(--color-danger-darker);
  border: var(--border-width) solid var(--color-danger);
  border-radius: var(--alert-border-radius);
  font-size: var(--alert-font-size);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-8);
}

.summary-card {
  padding: var(--space-10);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  text-align: center;
}

.summary-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-4);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.summary-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0;
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

.filter-input {
  padding: var(--space-3) var(--space-6);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.loading,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  color: var(--color-text-muted);
}

.timeline {
  position: relative;
  padding-left: var(--space-10);
}

.timeline::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--color-border);
}

.timeline-item {
  position: relative;
  display: flex;
  gap: var(--space-8);
  margin-bottom: var(--space-12);
}

.timeline-marker {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
  color: white;
  box-shadow: 0 0 0 4px var(--color-bg-page);
}

.timeline-content {
  flex: 1;
  padding: var(--space-8);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
}

.timeline-date {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: var(--space-3);
}

.timeline-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3);
}

.timeline-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
  }

  .timeline {
    padding-left: var(--space-8);
  }

  .timeline::before {
    left: 15px;
  }

  .timeline-marker {
    width: 32px;
    height: 32px;
  }
}
</style>
