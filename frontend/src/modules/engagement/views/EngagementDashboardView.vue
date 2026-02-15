<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import engagementService from '../services/engagementService'
import type { EngagementRanking, DepartmentAverage } from '../types'

const authStore = useAuthStore()
const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const currentMonth = ref(new Date().getMonth() + 1)
const currentYear = ref(new Date().getFullYear())

const companyAverage = ref<number>(0)
const totalEmployees = ref<number>(0)
const ranking = ref<EngagementRanking[]>([])
const departments = ref<DepartmentAverage[]>([])

const showEmployeeModal = ref(false)
const selectedEmployee = ref<EngagementRanking | null>(null)
const employeeBreakdown = ref({
  attendance: 0,
  performance: 0,
  training: 0,
  tenure: 0,
  leave: 0,
})

const companyScoreColor = computed(() => {
  if (companyAverage.value >= 75) return 'var(--engagement-score-high)'
  if (companyAverage.value >= 50) return 'var(--engagement-score-medium)'
  return 'var(--engagement-score-low)'
})

async function loadData() {
  try {
    isLoading.value = true
    error.value = null

    const [avgData, rankingData] = await Promise.all([
      engagementService.getCompanyAverage(currentMonth.value, currentYear.value),
      engagementService.getRanking(currentMonth.value, currentYear.value, 10),
    ])

    companyAverage.value = avgData.average
    totalEmployees.value = avgData.totalEmployees
    ranking.value = rankingData
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar dados de engagement'
  } finally {
    isLoading.value = false
  }
}

async function calculateAll() {
  if (!confirm('Calcular engagement score para todos os colaboradores?')) return
  try {
    isLoading.value = true
    error.value = null
    const result = await engagementService.calculateAll(currentMonth.value, currentYear.value)
    successMessage.value = `${result.calculated} scores calculados com sucesso`
    setTimeout(() => { successMessage.value = null }, 3000)
    await loadData()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao calcular scores'
  } finally {
    isLoading.value = false
  }
}

function openEmployeeModal(employee: EngagementRanking) {
  selectedEmployee.value = employee
  // Mock breakdown - em produção viria do backend
  const base = employee.score
  employeeBreakdown.value = {
    attendance: base * 0.25,
    performance: base * 0.30,
    training: base * 0.20,
    tenure: base * 0.15,
    leave: base * 0.10,
  }
  showEmployeeModal.value = true
}

function closeEmployeeModal() {
  showEmployeeModal.value = false
  selectedEmployee.value = null
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="engagement-view">
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">Engagement Score</h1>
        <p class="page-subtitle">Análise de engajamento dos colaboradores</p>
      </div>
      <div class="header-actions">
        <div class="period-selector">
          <select v-model.number="currentMonth" @change="loadData" class="period-select">
            <option :value="1">Janeiro</option>
            <option :value="2">Fevereiro</option>
            <option :value="3">Março</option>
            <option :value="4">Abril</option>
            <option :value="5">Maio</option>
            <option :value="6">Junho</option>
            <option :value="7">Julho</option>
            <option :value="8">Agosto</option>
            <option :value="9">Setembro</option>
            <option :value="10">Outubro</option>
            <option :value="11">Novembro</option>
            <option :value="12">Dezembro</option>
          </select>
          <select v-model.number="currentYear" @change="loadData" class="period-select">
            <option :value="2024">2024</option>
            <option :value="2025">2025</option>
            <option :value="2026">2026</option>
          </select>
        </div>
        <button v-if="authStore.isAdmin" class="btn btn-primary" @click="calculateAll">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Calcular Todos
        </button>
      </div>
    </div>

    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div v-if="isLoading" class="loading">Carregando...</div>

    <template v-else>
      <!-- Card grande: Score médio da empresa -->
      <div class="company-score-card">
        <div class="score-label">Score Médio da Empresa</div>
        <div class="score-value" :style="{ color: companyScoreColor }">
          {{ companyAverage.toFixed(1) }}
        </div>
        <div class="score-meta">
          <span class="meta-item">{{ totalEmployees }} colaboradores</span>
          <span class="meta-item">
            {{ currentMonth }}/{{ currentYear }}
          </span>
        </div>
      </div>

      <!-- Top 10 Ranking -->
      <div class="ranking-section">
        <h2 class="section-title">Top 10 Colaboradores</h2>
        <div v-if="ranking.length === 0" class="empty-state">
          <p>Nenhum score calculado para este período</p>
        </div>
        <div v-else class="ranking-list">
          <div
            v-for="(item, index) in ranking"
            :key="item.employeeId"
            class="ranking-item"
            @click="openEmployeeModal(item)"
          >
            <div class="ranking-position">{{ index + 1 }}</div>
            <div class="ranking-info">
              <div class="ranking-name">{{ item.employeeName }}</div>
              <div class="ranking-dept">{{ item.departmentName || 'Sem departamento' }}</div>
            </div>
            <div class="ranking-score-container">
              <div class="ranking-score">{{ item.score.toFixed(1) }}</div>
              <div class="ranking-bar">
                <div
                  class="ranking-bar-fill"
                  :style="{ width: item.score + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal: Employee Breakdown -->
    <div v-if="showEmployeeModal" class="modal-overlay" @click.self="closeEmployeeModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Breakdown de Score</h3>
          <button class="modal-close" @click="closeEmployeeModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="breakdown-header">
            <h4 class="breakdown-name">{{ selectedEmployee?.employeeName }}</h4>
            <p class="breakdown-dept">{{ selectedEmployee?.departmentName || 'Sem departamento' }}</p>
          </div>

          <div class="breakdown-bars">
            <div class="breakdown-item">
              <div class="breakdown-label">
                <span>Presença (25%)</span>
                <span class="breakdown-value">{{ employeeBreakdown.attendance.toFixed(1) }}</span>
              </div>
              <div class="breakdown-bar">
                <div
                  class="breakdown-bar-fill"
                  :style="{ width: (employeeBreakdown.attendance * 4) + '%' }"
                ></div>
              </div>
            </div>

            <div class="breakdown-item">
              <div class="breakdown-label">
                <span>Performance (30%)</span>
                <span class="breakdown-value">{{ employeeBreakdown.performance.toFixed(1) }}</span>
              </div>
              <div class="breakdown-bar">
                <div
                  class="breakdown-bar-fill"
                  :style="{ width: (employeeBreakdown.performance * 10 / 3) + '%' }"
                ></div>
              </div>
            </div>

            <div class="breakdown-item">
              <div class="breakdown-label">
                <span>Treinamentos (20%)</span>
                <span class="breakdown-value">{{ employeeBreakdown.training.toFixed(1) }}</span>
              </div>
              <div class="breakdown-bar">
                <div
                  class="breakdown-bar-fill"
                  :style="{ width: (employeeBreakdown.training * 5) + '%' }"
                ></div>
              </div>
            </div>

            <div class="breakdown-item">
              <div class="breakdown-label">
                <span>Tempo de Casa (15%)</span>
                <span class="breakdown-value">{{ employeeBreakdown.tenure.toFixed(1) }}</span>
              </div>
              <div class="breakdown-bar">
                <div
                  class="breakdown-bar-fill"
                  :style="{ width: (employeeBreakdown.tenure * 20 / 3) + '%' }"
                ></div>
              </div>
            </div>

            <div class="breakdown-item">
              <div class="breakdown-label">
                <span>Ausências (10%)</span>
                <span class="breakdown-value">{{ employeeBreakdown.leave.toFixed(1) }}</span>
              </div>
              <div class="breakdown-bar">
                <div
                  class="breakdown-bar-fill"
                  :style="{ width: (employeeBreakdown.leave * 10) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.engagement-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-8);
  flex-wrap: wrap;
}

.header-text {
  flex: 1;
  min-width: 200px;
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

.header-actions {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  flex-wrap: wrap;
}

.period-selector {
  display: flex;
  gap: var(--space-3);
}

.period-select {
  padding: var(--space-3) var(--space-6);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.period-select:focus {
  outline: none;
  border-color: var(--color-border-focus);
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
  white-space: nowrap;
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

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  color: var(--color-text-muted);
}

/* Company Score Card */
.company-score-card {
  padding: var(--space-16);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.score-label {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.score-value {
  font-size: 6rem;
  font-weight: var(--font-weight-extrabold);
  line-height: 1;
}

.score-meta {
  display: flex;
  gap: var(--space-8);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.meta-item {
  display: flex;
  align-items: center;
}

/* Ranking Section */
.ranking-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  color: var(--color-text-muted);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-8);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ranking-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.ranking-position {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-subtle);
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.ranking-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.ranking-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.ranking-dept {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.ranking-score-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 150px;
}

.ranking-score {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-align: right;
}

.ranking-bar {
  height: var(--engagement-bar-height);
  background-color: var(--engagement-bar-bg);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.ranking-bar-fill {
  height: 100%;
  background: var(--color-primary-gradient);
  transition: width var(--transition-base);
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

.breakdown-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-10);
  padding-bottom: var(--space-10);
  border-bottom: var(--border-width) solid var(--color-border);
}

.breakdown-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.breakdown-dept {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.breakdown-bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.breakdown-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.breakdown-value {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.breakdown-bar {
  height: 24px;
  background-color: var(--engagement-bar-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.breakdown-bar-fill {
  height: 100%;
  background: var(--color-primary-gradient);
  transition: width var(--transition-base);
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .period-selector {
    flex-direction: column;
  }

  .score-value {
    font-size: 4rem;
  }

  .ranking-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-6);
  }

  .ranking-score-container {
    min-width: unset;
  }

  .ranking-score {
    text-align: left;
  }
}
</style>
