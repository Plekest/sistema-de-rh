<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import turnoverService from '../services/turnoverService'
import type {
  TurnoverRate,
  TurnoverByDepartment,
  TurnoverByReason,
  TurnoverTrend,
  TurnoverRecord,
} from '../types'
import { TURNOVER_TYPE_LABELS } from '../types'

const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const periodFrom = ref('')
const periodTo = ref('')
const currentRate = ref<TurnoverRate | null>(null)
const avgTenure = ref<number>(0)
const trend = ref<TurnoverTrend[]>([])
const byDepartment = ref<TurnoverByDepartment[]>([])
const byReason = ref<TurnoverByReason[]>([])
const records = ref<TurnoverRecord[]>([])
const recordsMeta = ref<any>(null)

const showRecordModal = ref(false)
const formData = ref({
  employeeId: 0,
  type: 'voluntary' as 'voluntary' | 'involuntary' | 'retirement' | 'end_of_contract',
  reason: '',
  exitDate: '',
  exitInterviewDone: false,
})

const rateColor = computed(() => {
  if (!currentRate.value) return 'var(--turnover-rate-good)'
  const rate = currentRate.value.rate
  if (rate < 3) return 'var(--turnover-rate-good)'
  if (rate <= 5) return 'var(--turnover-rate-warning)'
  return 'var(--turnover-rate-danger)'
})

async function loadData() {
  try {
    isLoading.value = true
    error.value = null

    // Período padrão: últimos 12 meses
    const to = new Date()
    const from = new Date()
    from.setMonth(from.getMonth() - 12)

    if (!periodFrom.value) periodFrom.value = from.toISOString().split('T')[0] ?? ''
    if (!periodTo.value) periodTo.value = to.toISOString().split('T')[0] ?? ''

    const [rateData, tenureData, trendData, byDeptData, byReasonData, recordsData] =
      await Promise.all([
        turnoverService.getRate(periodFrom.value, periodTo.value),
        turnoverService.getAverageTenure(),
        turnoverService.getTrend(12),
        turnoverService.getByDepartment(to.getFullYear()),
        turnoverService.getByReason(periodFrom.value, periodTo.value),
        turnoverService.list({ page: 1, limit: 10 }),
      ])

    currentRate.value = rateData
    avgTenure.value = tenureData.averageMonths
    trend.value = trendData
    byDepartment.value = byDeptData
    byReason.value = byReasonData
    records.value = recordsData.data
    recordsMeta.value = recordsData.meta
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar dados de turnover'
  } finally {
    isLoading.value = false
  }
}

function openRecordModal() {
  formData.value = {
    employeeId: 0,
    type: 'voluntary',
    reason: '',
    exitDate: '',
    exitInterviewDone: false,
  }
  showRecordModal.value = true
}

function closeRecordModal() {
  showRecordModal.value = false
}

async function saveRecord() {
  try {
    error.value = null
    await turnoverService.record(formData.value)
    successMessage.value = 'Desligamento registrado com sucesso'
    setTimeout(() => { successMessage.value = null }, 3000)
    closeRecordModal()
    await loadData()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao registrar desligamento'
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
  <div class="turnover-view">
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">Análise de Turnover</h1>
        <p class="page-subtitle">Monitore e analise a rotatividade de colaboradores</p>
      </div>
      <div class="header-actions">
        <div class="period-selector">
          <input
            v-model="periodFrom"
            type="date"
            class="period-input"
            @change="loadData"
          />
          <span class="period-separator">até</span>
          <input
            v-model="periodTo"
            type="date"
            class="period-input"
            @change="loadData"
          />
        </div>
        <button class="btn btn-primary" @click="openRecordModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Registrar Desligamento
        </button>
      </div>
    </div>

    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div v-if="isLoading" class="loading">Carregando...</div>

    <template v-else>
      <!-- Cards resumo -->
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Taxa de Turnover</div>
          <div class="summary-value" :style="{ color: rateColor }">
            {{ currentRate?.rate.toFixed(2) }}%
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-label">Total de Saídas</div>
          <div class="summary-value">{{ currentRate?.departures || 0 }}</div>
        </div>

        <div class="summary-card">
          <div class="summary-label">Tempo Médio de Casa</div>
          <div class="summary-value">{{ Math.round(avgTenure) }} meses</div>
        </div>
      </div>

      <!-- Tendência -->
      <div class="section">
        <h2 class="section-title">Tendência (Últimos 12 meses)</h2>
        <div class="trend-list">
          <div v-for="item in trend" :key="item.month" class="trend-item">
            <div class="trend-month">{{ item.month }}</div>
            <div class="trend-bar-container">
              <div
                class="trend-bar"
                :style="{ width: (item.rate * 10) + '%' }"
                :title="`${item.rate.toFixed(2)}%`"
              ></div>
            </div>
            <div class="trend-value">{{ item.rate.toFixed(1) }}%</div>
            <div class="trend-departures">{{ item.departures }} saídas</div>
          </div>
        </div>
      </div>

      <!-- Por Departamento -->
      <div class="section">
        <h2 class="section-title">Por Departamento</h2>
        <div v-if="byDepartment.length === 0" class="empty-state">
          <p>Nenhum dado disponível</p>
        </div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Departamento</th>
                <th>Taxa</th>
                <th>Saídas</th>
                <th>Indicador</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dept in byDepartment" :key="dept.departmentId">
                <td>{{ dept.departmentName }}</td>
                <td>{{ dept.rate.toFixed(2) }}%</td>
                <td>{{ dept.departures }}</td>
                <td>
                  <div class="indicator-bar">
                    <div
                      class="indicator-bar-fill"
                      :style="{
                        width: (dept.rate * 10) + '%',
                        backgroundColor:
                          dept.rate < 3
                            ? 'var(--turnover-rate-good)'
                            : dept.rate <= 5
                            ? 'var(--turnover-rate-warning)'
                            : 'var(--turnover-rate-danger)',
                      }"
                    ></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Por Motivo -->
      <div class="section">
        <h2 class="section-title">Por Motivo de Desligamento</h2>
        <div v-if="byReason.length === 0" class="empty-state">
          <p>Nenhum dado disponível</p>
        </div>
        <div v-else class="reason-list">
          <div v-for="reason in byReason" :key="reason.type" class="reason-item">
            <div class="reason-label">
              <span>{{ TURNOVER_TYPE_LABELS[reason.type] || reason.type }}</span>
              <span class="reason-count">{{ reason.count }} ({{ reason.percentage.toFixed(1) }}%)</span>
            </div>
            <div class="reason-bar">
              <div
                class="reason-bar-fill"
                :style="{ width: reason.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Registros recentes -->
      <div class="section">
        <h2 class="section-title">Registros Recentes</h2>
        <div v-if="records.length === 0" class="empty-state">
          <p>Nenhum registro encontrado</p>
        </div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Tipo</th>
                <th>Data</th>
                <th>Departamento</th>
                <th>Tempo de Casa</th>
                <th>Entrevista</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in records" :key="record.id">
                <td>{{ record.employeeName || '-' }}</td>
                <td>
                  <span class="type-badge">{{ TURNOVER_TYPE_LABELS[record.type] }}</span>
                </td>
                <td>{{ formatDate(record.exitDate) }}</td>
                <td>{{ record.departmentName || '-' }}</td>
                <td>{{ record.tenureMonths || '-' }} meses</td>
                <td>
                  <span v-if="record.exitInterviewDone" class="status-done">Sim</span>
                  <span v-else class="status-pending">Não</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Modal: Registrar Desligamento -->
    <div v-if="showRecordModal" class="modal-overlay" @click.self="closeRecordModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Registrar Desligamento</h3>
          <button class="modal-close" @click="closeRecordModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveRecord" class="form">
            <div class="form-group">
              <label class="form-label">Colaborador *</label>
              <input
                v-model.number="formData.employeeId"
                type="number"
                class="form-input"
                required
                placeholder="ID do colaborador"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Tipo de Desligamento *</label>
              <select v-model="formData.type" class="form-select" required>
                <option value="voluntary">Voluntário</option>
                <option value="involuntary">Involuntário</option>
                <option value="retirement">Aposentadoria</option>
                <option value="end_of_contract">Fim de Contrato</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Data de Saída *</label>
              <input
                v-model="formData.exitDate"
                type="date"
                class="form-input"
                required
              />
            </div>

            <div class="form-group form-col-full">
              <label class="form-label">Motivo</label>
              <textarea
                v-model="formData.reason"
                class="form-textarea"
                rows="3"
                placeholder="Descreva o motivo do desligamento..."
              ></textarea>
            </div>

            <div class="form-group form-col-full">
              <label class="form-checkbox">
                <input v-model="formData.exitInterviewDone" type="checkbox" />
                <span>Entrevista de desligamento realizada</span>
              </label>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeRecordModal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.turnover-view {
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
  align-items: center;
}

.period-input {
  padding: var(--space-3) var(--space-6);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.period-separator {
  font-size: var(--font-size-xs);
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

.btn-secondary {
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  border: var(--border-width) solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover);
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

.loading,
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

/* Summary Grid */
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
  margin-bottom: var(--space-4);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.summary-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

/* Sections */
.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

/* Trend */
.trend-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-10);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
}

.trend-item {
  display: grid;
  grid-template-columns: 100px 1fr 60px 80px;
  gap: var(--space-6);
  align-items: center;
}

.trend-month {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.trend-bar-container {
  height: var(--turnover-bar-height);
  background-color: var(--turnover-bar-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.trend-bar {
  height: 100%;
  background: var(--color-primary-gradient);
  min-width: 2px;
  transition: width var(--transition-base);
}

.trend-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-align: right;
}

.trend-departures {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: right;
}

/* Reason List */
.reason-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-10);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
}

.reason-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.reason-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.reason-count {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.reason-bar {
  height: 24px;
  background-color: var(--turnover-bar-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.reason-bar-fill {
  height: 100%;
  background: var(--color-primary-gradient);
  transition: width var(--transition-base);
}

/* Table */
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

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background-color: var(--table-row-hover-bg);
}

.indicator-bar {
  height: 8px;
  background-color: var(--turnover-bar-bg);
  border-radius: var(--radius-full);
  overflow: hidden;
  max-width: 200px;
}

.indicator-bar-fill {
  height: 100%;
  transition: width var(--transition-base);
}

.type-badge {
  display: inline-block;
  padding: var(--badge-padding-y) var(--badge-padding-x);
  background-color: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  border-radius: var(--badge-border-radius);
}

.status-done {
  color: var(--color-success);
  font-weight: var(--font-weight-semibold);
}

.status-pending {
  color: var(--color-text-muted);
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

.form {
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

.form-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.form-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
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
    align-items: stretch;
  }

  .trend-item {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .trend-value,
  .trend-departures {
    text-align: left;
  }

  .form {
    grid-template-columns: 1fr;
  }

  .table-container {
    font-size: var(--font-size-xs);
  }
}
</style>
