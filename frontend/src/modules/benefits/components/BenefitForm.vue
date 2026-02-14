<script setup lang="ts">
import type { CreateBenefitData, CreatePlanData } from '../types'
import type { Employee } from '@/modules/employees/types'

const props = defineProps<{
  // Benefit Form
  showBenefitForm?: boolean
  benefitFormData?: CreateBenefitData
  benefitFormError?: string
  benefitFormLoading?: boolean
  typeOptions?: string[]
  typeLabels?: Record<string, string>

  // Plan Form
  showPlanForm?: boolean
  planFormData?: CreatePlanData
  planFormError?: string
  planFormLoading?: boolean
}>()

const emit = defineEmits<{
  'update:benefitFormData': [data: CreateBenefitData]
  'update:planFormData': [data: CreatePlanData]
  'submit-benefit': []
  'submit-plan': []
  'close-benefit': []
  'close-plan': []
}>()
</script>

<template>
  <!-- Formulário de Benefício -->
  <div v-if="showBenefitForm" class="form-card">
    <div class="form-header">
      <h2 class="form-title">Novo Beneficio</h2>
      <button class="btn-close" @click="$emit('close-benefit')">Fechar</button>
    </div>

    <div v-if="benefitFormError" class="alert alert-error" role="alert">{{ benefitFormError }}</div>

    <form @submit.prevent="$emit('submit-benefit')" class="form-grid">
      <div class="form-group">
        <label for="ben-name">Nome *</label>
        <input
          id="ben-name"
          type="text"
          :value="benefitFormData?.name"
          @input="$emit('update:benefitFormData', { ...benefitFormData!, name: ($event.target as HTMLInputElement).value })"
          required
        />
      </div>

      <div class="form-group">
        <label for="ben-type">Tipo *</label>
        <select
          id="ben-type"
          :value="benefitFormData?.type"
          @change="$emit('update:benefitFormData', { ...benefitFormData!, type: ($event.target as HTMLSelectElement).value })"
          required
        >
          <option value="">Selecione...</option>
          <option v-for="type in typeOptions" :key="type" :value="type">
            {{ typeLabels?.[type] }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="ben-provider">Fornecedor</label>
        <input
          id="ben-provider"
          type="text"
          :value="benefitFormData?.provider"
          @input="$emit('update:benefitFormData', { ...benefitFormData!, provider: ($event.target as HTMLInputElement).value })"
        />
      </div>

      <div class="form-group">
        <label for="ben-desc">Descricao</label>
        <input
          id="ben-desc"
          type="text"
          :value="benefitFormData?.description"
          @input="$emit('update:benefitFormData', { ...benefitFormData!, description: ($event.target as HTMLInputElement).value })"
        />
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('close-benefit')" :disabled="benefitFormLoading">
          Cancelar
        </button>
        <button type="submit" class="btn-primary" :disabled="benefitFormLoading">
          {{ benefitFormLoading ? 'Criando...' : 'Criar Beneficio' }}
        </button>
      </div>
    </form>
  </div>

  <!-- Formulário de Plano -->
  <div v-if="showPlanForm" class="form-card">
    <div class="form-header">
      <h2 class="form-title">Novo Plano</h2>
      <button class="btn-close" @click="$emit('close-plan')">Fechar</button>
    </div>

    <div v-if="planFormError" class="alert alert-error" role="alert">{{ planFormError }}</div>

    <form @submit.prevent="$emit('submit-plan')" class="form-grid">
      <div class="form-group">
        <label for="plan-name">Nome do Plano *</label>
        <input
          id="plan-name"
          type="text"
          :value="planFormData?.name"
          @input="$emit('update:planFormData', { ...planFormData!, name: ($event.target as HTMLInputElement).value })"
          required
        />
      </div>

      <div class="form-group">
        <label for="plan-value">Valor Mensal (R$) *</label>
        <input
          id="plan-value"
          type="number"
          step="0.01"
          min="0"
          :value="planFormData?.monthlyValue"
          @input="$emit('update:planFormData', { ...planFormData!, monthlyValue: Number(($event.target as HTMLInputElement).value) })"
          required
        />
      </div>

      <div class="form-group">
        <label for="plan-disc-val">Desconto Colaborador (R$)</label>
        <input
          id="plan-disc-val"
          type="number"
          step="0.01"
          min="0"
          :value="planFormData?.employeeDiscountValue || ''"
          @input="$emit('update:planFormData', { ...planFormData!, employeeDiscountValue: Number(($event.target as HTMLInputElement).value) || null })"
        />
      </div>

      <div class="form-group">
        <label for="plan-disc-pct">Desconto Colaborador (%)</label>
        <input
          id="plan-disc-pct"
          type="number"
          step="0.01"
          min="0"
          max="100"
          :value="planFormData?.employeeDiscountPercentage || ''"
          @input="$emit('update:planFormData', { ...planFormData!, employeeDiscountPercentage: Number(($event.target as HTMLInputElement).value) || null })"
        />
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('close-plan')" :disabled="planFormLoading">
          Cancelar
        </button>
        <button type="submit" class="btn-primary" :disabled="planFormLoading">
          {{ planFormLoading ? 'Criando...' : 'Criar Plano' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
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

.alert {
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: var(--spacing-4, 1rem);
}

.alert-error {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: var(--color-error, #c53030);
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

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-card {
    padding: var(--spacing-4, 1rem);
  }
}
</style>
