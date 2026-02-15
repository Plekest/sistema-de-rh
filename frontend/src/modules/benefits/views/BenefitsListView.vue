<script setup lang="ts">
import { onMounted } from 'vue'
import { useBenefits } from '../composables/useBenefits'
import BenefitFilters from '../components/BenefitFilters.vue'
import BenefitsTable from '../components/BenefitsTable.vue'
import BenefitForm from '../components/BenefitForm.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { ENROLLMENT_STATUS_LABELS, RELATIONSHIP_LABELS } from '../types'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const {
  // Estado
  benefits,
  employeeBenefits,
  employees,
  isLoading,
  error,
  successMessage,

  // Tabs
  activeTab,

  // Filtros
  filterType,

  // Beneficio expandido
  expandedBenefitId,

  // Formularios
  showBenefitForm,
  benefitFormLoading,
  benefitFormError,
  benefitFormData,
  showPlanForm,
  planFormLoading,
  planFormError,
  planFormData,
  showEnrollForm,
  enrollFormLoading,
  enrollFormError,
  enrollFormData,
  showDependentForm,
  dependentFormLoading,
  dependentFormError,
  dependentFormData,

  // Computed
  isAdmin,

  // Labels
  typeLabels,
  typeOptions,
  relationshipLabels,

  // Metodos
  loadBenefits,
  loadEmployeeBenefits,
  toggleExpand,
  openBenefitForm,
  closeBenefitForm,
  submitBenefitForm,
  deleteBenefit,
  openPlanForm,
  closePlanForm,
  submitPlanForm,
  openEnrollForm,
  closeEnrollForm,
  submitEnrollForm,
  cancelEnrollment,
  openDependentForm,
  closeDependentForm,
  submitDependentForm,
  removeDependent,
  formatCurrency,
  formatDate,
  statusBadgeClass,
  init,
} = useBenefits()

onMounted(() => {
  init()
})
</script>

<template>
  <div class="benefits-view">
    <div class="page-header">
      <h1 class="page-title">Beneficios</h1>
      <button v-if="isAdmin" class="btn-primary" @click="openBenefitForm">Novo Beneficio</button>
    </div>

    <!-- Mensagens -->
    <div v-if="successMessage" class="alert alert-success" role="alert">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'catalog' }"
        @click="activeTab = 'catalog'; loadBenefits()"
      >
        Catalogo de Beneficios
      </button>
      <button
        v-if="authStore?.employeeId"
        class="tab"
        :class="{ 'tab-active': activeTab === 'myBenefits' }"
        @click="activeTab = 'myBenefits'; loadEmployeeBenefits()"
      >
        Meus Beneficios
      </button>
    </div>

    <!-- === TAB: CATÁLOGO === -->
    <template v-if="activeTab === 'catalog'">
      <BenefitFilters
        v-model="filterType"
        :type-options="typeOptions"
        :type-labels="typeLabels"
        @change="loadBenefits"
      />

      <BenefitForm
        :show-benefit-form="showBenefitForm"
        :benefit-form-data="benefitFormData"
        :benefit-form-error="benefitFormError"
        :benefit-form-loading="benefitFormLoading"
        :type-options="typeOptions"
        :type-labels="typeLabels"
        :show-plan-form="showPlanForm"
        :plan-form-data="planFormData"
        :plan-form-error="planFormError"
        :plan-form-loading="planFormLoading"
        @update:benefit-form-data="benefitFormData = $event"
        @update:plan-form-data="planFormData = $event"
        @submit-benefit="submitBenefitForm"
        @submit-plan="submitPlanForm"
        @close-benefit="closeBenefitForm"
        @close-plan="closePlanForm"
      />

      <!-- Formulário adesão -->
      <div v-if="showEnrollForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Adesao a Beneficio</h2>
          <button class="btn-close" @click="closeEnrollForm">Fechar</button>
        </div>

        <div v-if="enrollFormError" class="alert alert-error" role="alert">{{ enrollFormError }}</div>

        <form @submit.prevent="submitEnrollForm" class="form-grid">
          <div v-if="isAdmin" class="form-group form-col-full">
            <label for="enroll-emp">Colaborador *</label>
            <select id="enroll-emp" v-model="enrollFormData.employeeId" required>
              <option :value="0">Selecione...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.fullName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="enroll-date">Data de Adesao *</label>
            <input id="enroll-date" type="date" v-model="enrollFormData.enrollmentDate" required />
          </div>

          <div class="form-group form-col-full">
            <label for="enroll-notes">Observacoes</label>
            <textarea id="enroll-notes" v-model="enrollFormData.notes" rows="2"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeEnrollForm" :disabled="enrollFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="enrollFormLoading">
              {{ enrollFormLoading ? 'Realizando...' : 'Realizar Adesao' }}
            </button>
          </div>
        </form>
      </div>

      <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando..." /></div>

      <BenefitsTable
        v-else-if="benefits.length > 0"
        :benefits="benefits"
        :type-labels="typeLabels"
        :expanded-benefit-id="expandedBenefitId"
        :is-admin="isAdmin"
        :format-currency="formatCurrency"
        @toggle-expand="toggleExpand"
        @open-plan-form="openPlanForm"
        @open-enroll-form="openEnrollForm"
        @delete-benefit="deleteBenefit"
      />

      <div v-else class="empty-state">
        <p class="empty-title">Nenhum beneficio encontrado</p>
        <p class="empty-description">Nao ha beneficios cadastrados no sistema.</p>
      </div>
    </template>

    <!-- === TAB: MEUS BENEFÍCIOS === -->
    <template v-if="activeTab === 'myBenefits'">
      <!-- Formulário de dependente -->
      <div v-if="showDependentForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Adicionar Dependente</h2>
          <button class="btn-close" @click="closeDependentForm">Fechar</button>
        </div>

        <div v-if="dependentFormError" class="alert alert-error" role="alert">{{ dependentFormError }}</div>

        <form @submit.prevent="submitDependentForm" class="form-grid">
          <div class="form-group">
            <label for="dep-name">Nome *</label>
            <input id="dep-name" type="text" v-model="dependentFormData.name" required />
          </div>

          <div class="form-group">
            <label for="dep-rel">Parentesco *</label>
            <select id="dep-rel" v-model="dependentFormData.relationship" required>
              <option v-for="(label, key) in relationshipLabels" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="dep-cpf">CPF</label>
            <input id="dep-cpf" type="text" v-model="dependentFormData.cpf" maxlength="11" placeholder="Somente numeros" />
          </div>

          <div class="form-group">
            <label for="dep-birth">Data de Nascimento</label>
            <input id="dep-birth" type="date" v-model="dependentFormData.birthDate" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeDependentForm" :disabled="dependentFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="dependentFormLoading">
              {{ dependentFormLoading ? 'Adicionando...' : 'Adicionar Dependente' }}
            </button>
          </div>
        </form>
      </div>

      <div v-if="isLoading" class="loading-state"><LoadingSpinner text="Carregando..." /></div>

      <div v-else-if="employeeBenefits.length > 0" class="my-benefits-list">
        <div v-for="enrollment in employeeBenefits" :key="enrollment.id" class="enrollment-card">
          <div class="enrollment-header">
            <div class="enrollment-info">
              <span class="benefit-type-tag">
                {{ typeLabels[enrollment.benefitPlan?.benefit?.type || ''] || '' }}
              </span>
              <h3 class="enrollment-benefit-name">
                {{ enrollment.benefitPlan?.benefit?.name || '' }} - {{ enrollment.benefitPlan?.name || '' }}
              </h3>
            </div>
            <span class="badge" :class="statusBadgeClass(enrollment.status)">
              {{ ENROLLMENT_STATUS_LABELS[enrollment.status] || enrollment.status }}
            </span>
          </div>

          <div class="enrollment-details">
            <div class="detail-item">
              <span class="detail-label">Valor Mensal</span>
              <span class="detail-value">{{ formatCurrency(enrollment.benefitPlan?.monthlyValue || 0) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Data de Adesao</span>
              <span class="detail-value">{{ formatDate(enrollment.enrollmentDate) }}</span>
            </div>
            <div v-if="enrollment.benefitPlan?.employeeDiscountValue" class="detail-item">
              <span class="detail-label">Desconto</span>
              <span class="detail-value">{{ formatCurrency(enrollment.benefitPlan.employeeDiscountValue) }}</span>
            </div>
            <div v-else-if="enrollment.benefitPlan?.employeeDiscountPercentage" class="detail-item">
              <span class="detail-label">Desconto</span>
              <span class="detail-value">{{ enrollment.benefitPlan.employeeDiscountPercentage }}%</span>
            </div>
          </div>

          <!-- Dependentes -->
          <div v-if="enrollment.dependents && enrollment.dependents.length > 0" class="dependents-section">
            <span class="dependents-title">Dependentes</span>
            <div v-for="dep in enrollment.dependents" :key="dep.id" class="dependent-row">
              <span class="dependent-name">{{ dep.name }}</span>
              <span class="dependent-rel">{{ RELATIONSHIP_LABELS[dep.relationship] || dep.relationship }}</span>
              <span v-if="dep.birthDate" class="dependent-birth">{{ formatDate(dep.birthDate) }}</span>
              <button
                v-if="isAdmin || enrollment.status === 'active'"
                class="btn-action btn-cancel btn-tiny"
                @click="removeDependent(dep.id)"
              >
                Remover
              </button>
            </div>
          </div>

          <div class="enrollment-actions">
            <button
              v-if="enrollment.status === 'active'"
              class="btn-action btn-approve"
              @click="openDependentForm(enrollment.id)"
            >
              Adicionar Dependente
            </button>
            <button
              v-if="enrollment.status === 'active' && isAdmin"
              class="btn-action btn-cancel"
              @click="cancelEnrollment(enrollment)"
            >
              Cancelar Adesao
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-title">Nenhum beneficio vinculado</p>
        <p class="empty-description">Voce nao possui beneficios ativos. Acesse o catalogo para realizar adesao.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.benefits-view {
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
  background: var(--color-bg-card);
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
  border-color: var(--color-border-hover);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.btn-approve {
  background: var(--color-success-lighter);
  color: var(--color-success-dark);
}

.btn-approve:hover {
  background: var(--color-success);
}

.btn-cancel {
  background: var(--color-border, #e2e8f0);
  color: var(--color-text-secondary, #4a5568);
}

.btn-cancel:hover {
  background: var(--color-border-hover);
}

.btn-tiny {
  padding: 0.125rem var(--spacing-2, 0.5rem);
  font-size: 0.688rem;
}

.alert {
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: var(--spacing-4, 1rem);
}

.alert-success {
  background: var(--color-success-lighter);
  border: 1px solid var(--color-success);
  color: var(--color-success-dark);
}

.alert-error {
  background: var(--color-danger-light);
  border: 1px solid var(--color-danger-lighter);
  color: var(--color-danger-dark);
}

.form-card {
  background: var(--color-bg-card);
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
.form-group select,
.form-group textarea {
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 5px;
  font-size: 0.875rem;
  color: var(--color-text, #2d3748);
  background: var(--color-bg-card);
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--color-primary, #667eea);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3, 0.75rem);
  margin-top: var(--spacing-2, 0.5rem);
}

.my-benefits-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3, 0.75rem);
}

.enrollment-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  padding: var(--spacing-5, 1.25rem);
}

.enrollment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4, 1rem);
}

.enrollment-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3, 0.75rem);
  flex-wrap: wrap;
}

.benefit-type-tag {
  display: inline-block;
  padding: 0.188rem var(--spacing-2, 0.5rem);
  background: var(--color-info-light);
  color: var(--color-primary);
  border-radius: 4px;
  font-size: 0.688rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.enrollment-benefit-name {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--color-text, #1a202c);
  margin: 0;
}

.enrollment-details {
  display: flex;
  gap: var(--spacing-8, 2rem);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-3, 0.75rem);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.detail-label {
  font-size: 0.688rem;
  font-weight: 600;
  color: var(--color-text-muted, #718096);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-value {
  font-size: 0.875rem;
  color: var(--color-text, #2d3748);
  font-weight: 500;
}

.dependents-section {
  margin-top: var(--spacing-3, 0.75rem);
  padding-top: var(--spacing-3, 0.75rem);
  border-top: 1px solid var(--color-border-light);
}

.dependents-title {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary, #4a5568);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: var(--spacing-2, 0.5rem);
}

.dependent-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-3, 0.75rem);
  padding: 0.375rem 0;
  font-size: 0.813rem;
}

.dependent-name {
  font-weight: 500;
  color: var(--color-text, #2d3748);
}

.dependent-rel {
  color: var(--color-text-muted, #718096);
}

.dependent-birth {
  color: var(--color-text-placeholder);
}

.enrollment-actions {
  margin-top: var(--spacing-3, 0.75rem);
  display: flex;
  gap: var(--spacing-2, 0.5rem);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-active {
  background: var(--color-success-bg);
  color: var(--color-success-dark);
}

.badge-cancelled {
  background: var(--color-border, #e2e8f0);
  color: var(--color-text-secondary, #4a5568);
}

.badge-suspended {
  background: var(--color-warning-lighter);
  color: var(--color-warning-darker);
}

.loading-state {
  text-align: center;
  padding: var(--spacing-8, 2rem);
  color: var(--color-text-muted, #718096);
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-12, 3rem) var(--spacing-4, 1rem);
  color: #a0aec0;
  font-size: 0.875rem;
  background: var(--color-bg-card);
  border-radius: 8px;
  border: 1px solid var(--color-border, #e2e8f0);
}

.empty-state p {
  margin: 0;
}

.empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary, #4a5568);
  margin: 0 0 var(--spacing-2, 0.5rem) !important;
}

.empty-description {
  font-size: 0.875rem;
  color: var(--color-text-placeholder);
  margin: 0 !important;
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
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .enrollment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2, 0.5rem);
  }

  .enrollment-details {
    flex-direction: column;
    gap: var(--spacing-3, 0.75rem);
  }

  .dependent-row {
    flex-wrap: wrap;
  }

  .enrollment-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .form-card {
    padding: var(--spacing-4, 1rem);
  }

  .enrollment-card {
    padding: var(--spacing-3, 0.75rem);
  }
}
</style>
