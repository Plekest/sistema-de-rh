<script setup lang="ts">
import { onMounted } from 'vue'
import { usePayroll } from '../composables/usePayroll'
import PayrollFilters from '../components/PayrollFilters.vue'
import PayrollTable from '../components/PayrollTable.vue'
import PayrollProcessForm from '../components/PayrollProcessForm.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const {
  // Estado
  periods,
  paySlips,
  myPaySlips,
  employees,
  components,
  isLoading,
  error,
  successMessage,

  // Tabs
  activeTab,

  // Periodo selecionado
  selectedPeriodId,
  selectedPeriod,

  // Detalhamento contracheque
  selectedSlip,
  showSlipDetail,

  // Formularios
  showPeriodForm,
  periodFormLoading,
  periodFormError,
  periodFormData,
  showComponentForm,
  componentFormLoading,
  componentFormError,
  componentFormData,

  // Filtros
  componentEmployeeId,

  // Computed
  isAdmin,

  // Labels
  periodStatusLabels,
  monthLabels,
  componentTypeLabels,
  entryCodeLabels,
  monthOptions,
  yearOptions,

  // Metodos
  loadPeriods,
  loadSlips,
  loadMyPaySlips,
  loadComponents,
  backToPeriods,
  viewSlipDetail,
  closeSlipDetail,
  openPeriodForm,
  closePeriodForm,
  submitPeriodForm,
  calculatePayroll,
  closePeriod,
  openComponentForm,
  closeComponentForm,
  submitComponentForm,
  formatCurrency,
  formatDate,
  periodStatusClass,
  init,
} = usePayroll()

onMounted(() => {
  init()
})
</script>

<template>
  <div class="payroll-view">
    <div class="page-header">
      <h1 class="page-title">Folha de Pagamento</h1>
      <button v-if="isAdmin && activeTab === 'periods' && !selectedPeriodId" class="btn-primary" @click="openPeriodForm">
        Novo Periodo
      </button>
    </div>

    <!-- Mensagens -->
    <Transition name="fade">
      <div v-if="successMessage" class="alert alert-success" role="status" aria-live="polite">{{ successMessage }}</div>
    </Transition>
    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-if="isAdmin"
        class="tab"
        :class="{ 'tab-active': activeTab === 'periods' }"
        @click="activeTab = 'periods'; backToPeriods(); loadPeriods()"
      >
        Periodos
      </button>
      <button
        v-if="$authStore?.employeeId"
        class="tab"
        :class="{ 'tab-active': activeTab === 'mySlips' }"
        @click="activeTab = 'mySlips'; loadMyPaySlips()"
      >
        Meus Contracheques
      </button>
      <button
        v-if="isAdmin"
        class="tab"
        :class="{ 'tab-active': activeTab === 'components' }"
        @click="activeTab = 'components'"
      >
        Componentes Salariais
      </button>
    </div>

    <!-- === TAB: PERÍODOS === -->
    <template v-if="activeTab === 'periods' && isAdmin">
      <!-- Formulário novo período -->
      <PayrollProcessForm
        v-if="showPeriodForm"
        :form-data="periodFormData"
        :loading="periodFormLoading"
        :error="periodFormError"
        :month-options="monthOptions"
        :year-options="yearOptions"
        @update:form-data="periodFormData = $event"
        @submit="submitPeriodForm"
        @close="closePeriodForm"
      />

      <!-- Se tem periodo selecionado, mostra contracheques -->
      <template v-if="selectedPeriodId">
        <div class="sub-header">
          <button class="btn-back" @click="backToPeriods">&larr; Voltar</button>
          <h2 class="sub-title">
            {{ monthLabels[selectedPeriod?.referenceMonth || 1] }} / {{ selectedPeriod?.referenceYear }}
            <span class="badge" :class="periodStatusClass(selectedPeriod?.status || '')">
              {{ periodStatusLabels[selectedPeriod?.status || ''] }}
            </span>
          </h2>
          <div class="sub-actions">
            <button
              v-if="selectedPeriod?.status === 'open'"
              class="btn-primary"
              @click="calculatePayroll(selectedPeriodId!)"
            >
              Calcular Folha
            </button>
            <button
              v-if="selectedPeriod?.status === 'open' && paySlips.length > 0"
              class="btn-secondary"
              @click="closePeriod(selectedPeriodId!)"
            >
              Fechar Periodo
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando..." /></div>

        <PayrollTable
          v-else-if="paySlips.length > 0"
          :pay-slips="paySlips"
          :format-currency="formatCurrency"
          @view-detail="viewSlipDetail"
        />

        <EmptyState
          v-else
          title="Nenhum contracheque gerado"
          description="Clique em 'Calcular Folha' para gerar os contracheques deste periodo."
        />
      </template>

      <!-- Lista de períodos -->
      <template v-else>
        <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando..." /></div>

        <div v-else-if="periods.length > 0" class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Periodo</th>
                <th class="th-center">Status</th>
                <th class="th-center">Fechamento</th>
                <th class="th-center">Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="period in periods" :key="period.id">
                <td class="td-name">
                  {{ monthLabels[period.referenceMonth] }} / {{ period.referenceYear }}
                </td>
                <td class="td-center">
                  <span class="badge" :class="periodStatusClass(period.status)">
                    {{ periodStatusLabels[period.status] }}
                  </span>
                </td>
                <td class="td-center">
                  {{ period.closedAt ? formatDate(period.closedAt) : '-' }}
                </td>
                <td class="td-center td-actions">
                  <button class="btn-action btn-detail" @click="loadSlips(period.id)">
                    Ver Contracheques
                  </button>
                  <button
                    v-if="period.status === 'open'"
                    class="btn-action btn-approve"
                    @click="calculatePayroll(period.id)"
                  >
                    Calcular
                  </button>
                  <button
                    v-if="period.status === 'open'"
                    class="btn-action btn-cancel"
                    @click="closePeriod(period.id)"
                  >
                    Fechar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmptyState
          v-else
          title="Nenhum periodo encontrado"
          description="Crie um novo periodo para iniciar a folha de pagamento."
        />
      </template>
    </template>

    <!-- === TAB: MEUS CONTRACHEQUES === -->
    <template v-if="activeTab === 'mySlips'">
      <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando..." /></div>

      <PayrollTable
        v-else-if="myPaySlips.length > 0"
        :pay-slips="myPaySlips"
        :format-currency="formatCurrency"
        :is-my-slips="true"
        @view-detail="viewSlipDetail"
      />

      <EmptyState
        v-else
        title="Nenhum contracheque encontrado"
        description="Seus contracheques aparecerao aqui apos o calculo da folha."
      />
    </template>

    <!-- === TAB: COMPONENTES SALARIAIS === -->
    <template v-if="activeTab === 'components' && isAdmin">
      <PayrollFilters
        v-model="componentEmployeeId"
        :employees="employees"
        @change="loadComponents"
      />

      <div class="filter-action-row">
        <button class="btn-primary" @click="openComponentForm" :disabled="!componentEmployeeId">
          Novo Componente
        </button>
      </div>

      <!-- Formulário componente -->
      <div v-if="showComponentForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Novo Componente Salarial</h2>
          <button class="btn-close" @click="closeComponentForm">Fechar</button>
        </div>

        <div v-if="componentFormError" class="alert alert-error" role="alert">{{ componentFormError }}</div>

        <form @submit.prevent="submitComponentForm" class="form-grid">
          <div class="form-group">
            <label for="comp-type">Tipo *</label>
            <select id="comp-type" v-model="componentFormData.type" required>
              <option v-for="(label, key) in componentTypeLabels" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="comp-amount">Valor (R$) *</label>
            <input id="comp-amount" type="number" step="0.01" min="0" v-model="componentFormData.amount" required />
          </div>

          <div class="form-group form-col-full">
            <label for="comp-desc">Descricao *</label>
            <input id="comp-desc" type="text" v-model="componentFormData.description" required />
          </div>

          <div class="form-group">
            <label for="comp-from">Vigencia De *</label>
            <input id="comp-from" type="date" v-model="componentFormData.effectiveFrom" required />
          </div>

          <div class="form-group">
            <label for="comp-until">Vigencia Ate</label>
            <input id="comp-until" type="date" v-model="componentFormData.effectiveUntil" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeComponentForm" :disabled="componentFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="componentFormLoading">
              {{ componentFormLoading ? 'Criando...' : 'Criar Componente' }}
            </button>
          </div>
        </form>
      </div>

      <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando..." /></div>

      <div v-else-if="componentEmployeeId && components.length > 0" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descricao</th>
              <th class="th-right">Valor</th>
              <th class="th-center">Status</th>
              <th>Vigencia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comp in components" :key="comp.id">
              <td>{{ componentTypeLabels[comp.type] || comp.type }}</td>
              <td>{{ comp.description }}</td>
              <td class="td-right">{{ formatCurrency(comp.amount) }}</td>
              <td class="td-center">
                <span class="badge" :class="comp.isActive ? 'badge-active' : 'badge-inactive'">
                  {{ comp.isActive ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="td-period">
                {{ formatDate(comp.effectiveFrom) }}
                {{ comp.effectiveUntil ? ' - ' + formatDate(comp.effectiveUntil) : ' em diante' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState
        v-else-if="componentEmployeeId && components.length === 0"
        title="Nenhum componente salarial"
        description="Este colaborador nao possui componentes salariais cadastrados."
      />

      <EmptyState
        v-else-if="!componentEmployeeId"
        title="Selecione um colaborador"
        description="Escolha um colaborador para ver e gerenciar seus componentes salariais."
      />
    </template>

    <!-- Modal detalhamento do contracheque -->
    <div v-if="showSlipDetail && selectedSlip" class="modal-overlay" @click.self="closeSlipDetail" @keydown.escape="closeSlipDetail">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-header">
          <h2 class="modal-title" id="modal-title">Contracheque</h2>
          <button class="btn-close" @click="closeSlipDetail">Fechar</button>
        </div>

        <div class="slip-header-info">
          <div class="slip-employee">{{ selectedSlip.employee?.fullName || 'N/A' }}</div>
          <div v-if="selectedSlip.employee?.position" class="slip-position">{{ selectedSlip.employee.position.name }}</div>
        </div>

        <div class="slip-summary">
          <div class="summary-item">
            <span class="summary-label">Salario Bruto</span>
            <span class="summary-value">{{ formatCurrency(selectedSlip.grossSalary) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Proventos</span>
            <span class="summary-value summary-earning">{{ formatCurrency(selectedSlip.totalEarnings) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Descontos</span>
            <span class="summary-value summary-deduction">{{ formatCurrency(selectedSlip.totalDeductions) }}</span>
          </div>
          <div class="summary-item summary-highlight">
            <span class="summary-label">Salario Liquido</span>
            <span class="summary-value">{{ formatCurrency(selectedSlip.netSalary) }}</span>
          </div>
        </div>

        <div class="slip-taxes">
          <div class="tax-item">
            <span class="tax-label">INSS</span>
            <span class="tax-value">{{ formatCurrency(selectedSlip.inssAmount) }}</span>
          </div>
          <div class="tax-item">
            <span class="tax-label">IRRF</span>
            <span class="tax-value">{{ formatCurrency(selectedSlip.irrfAmount) }}</span>
          </div>
          <div class="tax-item">
            <span class="tax-label">FGTS (informativo)</span>
            <span class="tax-value">{{ formatCurrency(selectedSlip.fgtsAmount) }}</span>
          </div>
        </div>

        <!-- Detalhamento de entradas -->
        <div v-if="selectedSlip.entries && selectedSlip.entries.length > 0" class="slip-entries">
          <h3 class="entries-title">Proventos</h3>
          <div
            v-for="entry in selectedSlip.entries.filter(e => e.componentType === 'earning')"
            :key="entry.id"
            class="entry-row"
          >
            <span class="entry-desc">{{ entryCodeLabels[entry.code] || entry.description }}</span>
            <span class="entry-amount entry-earning">{{ formatCurrency(entry.amount) }}</span>
          </div>

          <h3 class="entries-title">Descontos</h3>
          <div
            v-for="entry in selectedSlip.entries.filter(e => e.componentType === 'deduction')"
            :key="entry.id"
            class="entry-row"
          >
            <span class="entry-desc">{{ entryCodeLabels[entry.code] || entry.description }}</span>
            <span class="entry-amount entry-deduction">{{ formatCurrency(entry.amount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payroll-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6, 1.5rem);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text, #1a202c);
  margin: 0;
}

.sub-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-4, 1rem);
  margin-bottom: var(--spacing-6, 1.5rem);
  flex-wrap: wrap;
}

.sub-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text, #1a202c);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
}

.sub-actions {
  margin-left: auto;
  display: flex;
  gap: var(--spacing-2, 0.5rem);
}

.btn-back {
  padding: 0.375rem 0.75rem;
  background: transparent;
  color: var(--color-primary, #667eea);
  border: 1px solid #bee3f8;
  border-radius: 5px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #ebf8ff;
}

.tabs {
  display: flex;
  gap: 0;
  margin-bottom: var(--spacing-6, 1.5rem);
  border-bottom: 2px solid var(--color-border, #e2e8f0);
}

.tab {
  padding: 0.625rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted, #718096);
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: var(--color-text-secondary, #4a5568);
}

.tab-active {
  color: var(--color-primary, #667eea);
  border-bottom-color: var(--color-primary, #667eea);
}

.btn-primary {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, var(--color-primary, #667eea) 0%, #764ba2 100%);
  color: var(--color-surface, #fff);
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
  background: var(--color-surface, #fff);
  color: var(--color-text-secondary, #4a5568);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-background, #f7fafc);
  border-color: #cbd5e0;
}

.btn-close {
  padding: 0.375rem 0.875rem;
  background: transparent;
  color: var(--color-text-muted, #718096);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 5px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--color-background, #f7fafc);
  color: var(--color-text-secondary, #4a5568);
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

.btn-detail {
  background: #ebf4ff;
  color: var(--color-primary, #667eea);
}

.btn-detail:hover {
  background: #bee3f8;
}

.btn-approve {
  background: #c6f6d5;
  color: #276749;
}

.btn-approve:hover {
  background: #9ae6b4;
}

.btn-cancel {
  background: var(--color-border, #e2e8f0);
  color: var(--color-text-secondary, #4a5568);
}

.btn-cancel:hover {
  background: #cbd5e0;
}

.alert {
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: var(--spacing-4, 1rem);
}

.alert-success {
  background: #c6f6d5;
  border: 1px solid #9ae6b4;
  color: #276749;
}

.alert-error {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: var(--color-error, #c53030);
}

.filter-action-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-6, 1.5rem);
}

.form-card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  padding: var(--spacing-6, 1.5rem);
  margin-bottom: var(--spacing-6, 1.5rem);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5, 1.25rem);
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text, #1a202c);
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4, 1rem);
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
  color: var(--color-text-secondary, #4a5568);
}

.form-group input,
.form-group select {
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 5px;
  font-size: 0.875rem;
  color: var(--color-text, #2d3748);
  background: var(--color-surface, #fff);
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--color-primary, #667eea);
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3, 0.75rem);
  margin-top: var(--spacing-2, 0.5rem);
}

.table-container {
  background: var(--color-surface, #fff);
  border-radius: 8px;
  border: 1px solid var(--color-border, #e2e8f0);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary, #4a5568);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: 2px solid var(--color-border, #e2e8f0);
  white-space: nowrap;
}

.data-table td {
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  font-size: 0.875rem;
  color: var(--color-text, #2d3748);
  border-bottom: 1px solid #f0f0f0;
}

.data-table tbody tr:hover {
  background-color: var(--color-background, #f7fafc);
}

.th-center { text-align: center; }
.th-right { text-align: right; }
.td-center { text-align: center; }
.td-right { text-align: right; font-variant-numeric: tabular-nums; }
.td-name { font-weight: 500; }
.td-period { white-space: nowrap; }
.td-actions { white-space: nowrap; }

.badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-open { background: #fef3c7; color: #92400e; }
.badge-calculating { background: #dbeafe; color: #1e40af; }
.badge-closed { background: #d1fae5; color: #065f46; }
.badge-active { background: #d1fae5; color: #065f46; }
.badge-inactive { background: var(--color-border, #e2e8f0); color: var(--color-text-secondary, #4a5568); }

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--spacing-4, 1rem);
}

.modal-card {
  background: var(--color-surface, #fff);
  border-radius: 10px;
  padding: var(--spacing-6, 1.5rem);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5, 1.25rem);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text, #1a202c);
  margin: 0;
}

.slip-header-info {
  margin-bottom: var(--spacing-4, 1rem);
}

.slip-employee {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #2d3748);
}

.slip-position {
  font-size: 0.813rem;
  color: var(--color-text-muted, #718096);
}

.slip-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-3, 0.75rem);
  margin-bottom: var(--spacing-4, 1rem);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: var(--spacing-3, 0.75rem);
  background: var(--color-background, #f7fafc);
  border-radius: 6px;
}

.summary-highlight {
  grid-column: 1 / -1;
  background: #ebf8ff;
}

.summary-label {
  font-size: 0.688rem;
  font-weight: 600;
  color: var(--color-text-muted, #718096);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text, #1a202c);
}

.summary-earning { color: var(--color-success, #276749); }
.summary-deduction { color: var(--color-error, #c53030); }

.slip-taxes {
  display: flex;
  gap: var(--spacing-4, 1rem);
  margin-bottom: var(--spacing-4, 1rem);
  padding: var(--spacing-3, 0.75rem);
  background: #fffbeb;
  border-radius: 6px;
}

.tax-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.tax-label {
  font-size: 0.688rem;
  font-weight: 600;
  color: #92400e;
  text-transform: uppercase;
}

.tax-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #78350f;
}

.slip-entries {
  border-top: 1px solid var(--color-border, #e2e8f0);
  padding-top: var(--spacing-4, 1rem);
}

.entries-title {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--color-text-secondary, #4a5568);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin: 0 0 var(--spacing-2, 0.5rem);
}

.entries-title + .entries-title {
  margin-top: var(--spacing-4, 1rem);
}

.entry-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.entry-desc {
  font-size: 0.875rem;
  color: var(--color-text, #2d3748);
}

.entry-amount {
  font-size: 0.875rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.entry-earning { color: var(--color-success, #276749); }
.entry-deduction { color: var(--color-error, #c53030); }

.loading-state {
  text-align: center;
  padding: var(--spacing-8, 2rem);
  color: var(--color-text-muted, #718096);
  font-size: 0.875rem;
}

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
    gap: var(--spacing-4, 1rem);
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

  .sub-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .sub-actions {
    margin-left: 0;
    width: 100%;
  }

  .sub-actions .btn-primary,
  .sub-actions .btn-secondary {
    flex: 1;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .table-container {
    overflow-x: scroll;
  }

  .data-table {
    min-width: 700px;
  }

  .slip-summary {
    grid-template-columns: 1fr;
  }

  .slip-taxes {
    flex-direction: column;
  }

  .modal-card {
    max-width: 100%;
    padding: var(--spacing-4, 1rem);
  }

  .td-actions {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .btn-action {
    padding: 0.5rem 0.75rem;
    font-size: 0.813rem;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .form-card {
    padding: var(--spacing-4, 1rem);
  }

  .summary-value {
    font-size: 1rem;
  }
}
</style>
