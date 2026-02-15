<script setup lang="ts">
import { ref, onMounted } from 'vue'
import analyticsService from '../services/analyticsService'
import type {
  WorkforceOverview,
  RetentionAnalysis,
  CompensationAnalysis,
  PredictiveInsights,
} from '../types'

const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const workforce = ref<WorkforceOverview | null>(null)
const retention = ref<RetentionAnalysis | null>(null)
const compensation = ref<CompensationAnalysis | null>(null)
const predictive = ref<PredictiveInsights | null>(null)

async function loadAllData() {
  try {
    isLoading.value = true
    error.value = null
    const [wf, ret, comp, pred] = await Promise.all([
      analyticsService.getWorkforce(),
      analyticsService.getRetention(),
      analyticsService.getCompensation(),
      analyticsService.getPredictive(),
    ])
    workforce.value = wf
    retention.value = ret
    compensation.value = comp
    predictive.value = pred
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar analytics'
  } finally {
    isLoading.value = false
  }
}

async function createSnapshot() {
  try {
    const period = new Date().toISOString().split('T')[0]
    await analyticsService.createSnapshot(period || '')
    successMessage.value = 'Snapshot criado com sucesso'
    setTimeout(() => { successMessage.value = null }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao criar snapshot'
  }
}

function getRiskBadgeClass(score: number): string {
  if (score >= 0.7) return 'badge-danger'
  if (score >= 0.4) return 'badge-warning'
  return 'badge-info'
}

function getRiskLabel(score: number): string {
  if (score >= 0.7) return 'Alto'
  if (score >= 0.4) return 'Médio'
  return 'Baixo'
}

onMounted(() => {
  loadAllData()
})
</script>

<template>
  <div class="analytics-view">
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">People Analytics</h1>
        <p class="page-subtitle">Análises preditivas e métricas estratégicas de RH</p>
      </div>
      <button class="btn btn-primary" @click="createSnapshot">Gerar Snapshot</button>
    </div>

    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div v-if="isLoading" class="loading">Carregando...</div>

    <template v-else>
      <!-- KPIs Row -->
      <div class="kpi-row">
        <div class="kpi-card kpi-large">
          <div class="kpi-label">Total Headcount</div>
          <div class="kpi-value">{{ workforce?.totalEmployees || 0 }}</div>
        </div>
        <div class="kpi-card kpi-large">
          <div class="kpi-label">Taxa de Turnover</div>
          <div class="kpi-value">{{ retention?.turnoverRate.toFixed(2) || '0.00' }}%</div>
        </div>
        <div class="kpi-card kpi-large">
          <div class="kpi-label">Salário Médio</div>
          <div class="kpi-value">R$ {{ compensation?.avgSalary.toLocaleString('pt-BR') || '0' }}</div>
        </div>
        <div class="kpi-card kpi-large">
          <div class="kpi-label">Tempo Médio (meses)</div>
          <div class="kpi-value">{{ workforce?.avgTenureMonths?.toFixed(0) || '0' }}</div>
        </div>
      </div>

      <!-- Workforce Section -->
      <div class="section">
        <h2 class="section-title">Composição da Força de Trabalho</h2>
        <div class="section-grid">
          <div class="chart-card">
            <h3 class="chart-title">Por Tipo</h3>
            <div v-if="workforce" class="bar-list">
              <div v-for="item in workforce.byType" :key="item.type" class="bar-item">
                <div class="bar-label">{{ item.type.toUpperCase() }}</div>
                <div class="bar-container">
                  <div class="bar-fill" :style="{ width: (item.count / workforce.totalEmployees * 100) + '%' }"></div>
                </div>
                <div class="bar-value">{{ item.count }}</div>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <h3 class="chart-title">Por Departamento</h3>
            <div v-if="workforce" class="bar-list">
              <div v-for="item in workforce.byDepartment.slice(0, 5)" :key="item.department" class="bar-item">
                <div class="bar-label">{{ item.department }}</div>
                <div class="bar-container">
                  <div class="bar-fill" :style="{ width: (item.count / workforce.totalEmployees * 100) + '%' }"></div>
                </div>
                <div class="bar-value">{{ item.count }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Retention Section -->
      <div class="section">
        <h2 class="section-title">Análise de Retenção</h2>
        <div class="retention-cards">
          <div class="info-card">
            <div class="info-label">Turnover Voluntário</div>
            <div class="info-value">{{ retention?.voluntaryRate.toFixed(2) || '0.00' }}%</div>
          </div>
          <div class="info-card">
            <div class="info-label">Turnover Involuntário</div>
            <div class="info-value">{{ retention?.involuntaryRate.toFixed(2) || '0.00' }}%</div>
          </div>
        </div>
      </div>

      <!-- Compensation Section -->
      <div v-if="compensation" class="section">
        <h2 class="section-title">Análise de Compensação</h2>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Departamento</th>
                <th>Média Salarial</th>
                <th>Mediana</th>
                <th>Colaboradores</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dept in compensation.byDepartment" :key="dept.department">
                <td>{{ dept.department }}</td>
                <td>R$ {{ dept.avg.toLocaleString('pt-BR') }}</td>
                <td>R$ {{ dept.median.toLocaleString('pt-BR') }}</td>
                <td>{{ dept.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Predictive Insights -->
      <div v-if="predictive" class="section">
        <h2 class="section-title">Insights Preditivos</h2>

        <div v-if="predictive.attritionRisk.length > 0" class="insights-section">
          <h3 class="insights-title">Risco de Attrição</h3>
          <div class="risk-cards">
            <div v-for="item in predictive.attritionRisk.slice(0, 6)" :key="item.employee.id" class="risk-card">
              <div class="risk-header">
                <span class="risk-name">{{ item.employee.fullName }}</span>
                <span class="badge" :class="getRiskBadgeClass(item.riskScore)">
                  {{ getRiskLabel(item.riskScore) }}
                </span>
              </div>
              <div class="risk-reasons">
                <span v-for="reason in item.reasons" :key="reason" class="risk-reason">{{ reason }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="predictive.upcomingExamExpirations.length > 0" class="insights-section">
          <h3 class="insights-title">Exames Vencendo</h3>
          <div class="exam-alerts">
            <div v-for="exam in predictive.upcomingExamExpirations.slice(0, 5)" :key="exam.employee.id" class="exam-alert">
              <span class="alert-name">{{ exam.employee.fullName }}</span>
              <span class="alert-type">{{ exam.examType }}</span>
              <span class="alert-date">{{ new Date(exam.expiryDate).toLocaleDateString('pt-BR') }}</span>
            </div>
          </div>
        </div>

        <div v-if="predictive.leaveBalanceWarnings.length > 0" class="insights-section">
          <h3 class="insights-title">Alertas de Férias</h3>
          <div class="leave-alerts">
            <div v-for="item in predictive.leaveBalanceWarnings.slice(0, 5)" :key="item.employee.id" class="leave-alert">
              <span class="alert-name">{{ item.employee.fullName }}</span>
              <span class="alert-warning">{{ item.warning }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.analytics-view {
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
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
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

/* KPIs Row */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-8);
}

.kpi-card {
  padding: var(--space-12);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.kpi-large {
  padding: var(--space-16);
}

.kpi-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-primary);
  line-height: 1.2;
}

/* Sections */
.section {
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  padding: var(--space-10);
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-8);
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-8);
}

.chart-card {
  padding: var(--space-8);
  background-color: var(--color-bg-subtle);
  border-radius: var(--radius-lg);
}

.chart-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-6);
}

.bar-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.bar-item {
  display: grid;
  grid-template-columns: 100px 1fr 60px;
  gap: var(--space-4);
  align-items: center;
}

.bar-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.bar-container {
  height: 24px;
  background-color: var(--color-bg-muted);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--color-primary-gradient);
  transition: width var(--transition-base);
  min-width: 2px;
}

.bar-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-align: right;
}

.retention-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-8);
}

.info-card {
  padding: var(--space-8);
  background-color: var(--color-bg-subtle);
  border-radius: var(--radius-lg);
  text-align: center;
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
}

.info-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
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

.insights-section {
  margin-bottom: var(--space-10);
}

.insights-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-6);
}

.risk-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-6);
}

.risk-card {
  padding: var(--space-6);
  background-color: var(--color-bg-subtle);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
}

.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.risk-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.badge {
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
}

.badge-danger {
  background-color: var(--color-danger-bg);
  color: var(--color-danger-darker);
}

.badge-warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning-darker);
}

.badge-info {
  background-color: var(--color-info-bg);
  color: var(--color-info-dark);
}

.risk-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.risk-reason {
  padding: var(--space-1) var(--space-3);
  background-color: var(--color-bg-muted);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-2xs);
  border-radius: var(--radius-xs);
}

.exam-alerts,
.leave-alerts {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.exam-alert,
.leave-alert {
  padding: var(--space-4) var(--space-6);
  background-color: var(--color-warning-light);
  border: var(--border-width) solid var(--color-warning-lighter);
  border-radius: var(--radius-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.alert-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.alert-type,
.alert-date,
.alert-warning {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .kpi-row {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .section-grid {
    grid-template-columns: 1fr;
  }

  .bar-item {
    grid-template-columns: 80px 1fr 50px;
  }
}
</style>
