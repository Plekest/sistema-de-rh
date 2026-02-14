<script setup lang="ts">
import type { Benefit } from '../types'

defineProps<{
  benefits: Benefit[]
  typeLabels: Record<string, string>
  expandedBenefitId: number | null
  isAdmin: boolean
  formatCurrency: (value: number) => string
}>()

const emit = defineEmits<{
  'toggle-expand': [benefitId: number]
  'open-plan-form': [benefitId: number]
  'open-enroll-form': [planId: number]
  'delete-benefit': [benefitId: number]
}>()
</script>

<template>
  <div class="benefits-list">
    <div v-for="benefit in benefits" :key="benefit.id" class="benefit-card">
      <div class="benefit-header" @click="$emit('toggle-expand', benefit.id)">
        <div class="benefit-info">
          <span class="benefit-type-tag">{{ typeLabels[benefit.type] || benefit.type }}</span>
          <h3 class="benefit-name">{{ benefit.name }}</h3>
          <span v-if="benefit.provider" class="benefit-provider">{{ benefit.provider }}</span>
        </div>
        <div class="benefit-actions-header">
          <span class="benefit-plans-count">
            {{ benefit.plans?.length || 0 }} plano(s)
          </span>
          <span class="expand-indicator">{{ expandedBenefitId === benefit.id ? '−' : '+' }}</span>
        </div>
      </div>

      <div v-if="benefit.description" class="benefit-description">
        {{ benefit.description }}
      </div>

      <!-- Planos expandidos -->
      <div v-if="expandedBenefitId === benefit.id" class="plans-section">
        <div class="plans-header">
          <span class="plans-title">Planos Disponiveis</span>
          <button v-if="isAdmin" class="btn-small" @click.stop="$emit('open-plan-form', benefit.id)">Adicionar Plano</button>
        </div>

        <div v-if="benefit.plans && benefit.plans.length > 0" class="plans-list">
          <div v-for="plan in benefit.plans" :key="plan.id" class="plan-row">
            <div class="plan-info">
              <span class="plan-name">{{ plan.name }}</span>
              <span class="plan-value">{{ formatCurrency(plan.monthlyValue) }}/mes</span>
              <span v-if="plan.employeeDiscountValue" class="plan-discount">
                Desconto: {{ formatCurrency(plan.employeeDiscountValue) }}
              </span>
              <span v-else-if="plan.employeeDiscountPercentage" class="plan-discount">
                Desconto: {{ plan.employeeDiscountPercentage }}%
              </span>
            </div>
            <div class="plan-actions">
              <button class="btn-action btn-approve" @click.stop="$emit('open-enroll-form', plan.id)">
                Aderir
              </button>
            </div>
          </div>
        </div>

        <div v-else class="plans-empty">
          Nenhum plano cadastrado.
        </div>

        <div v-if="isAdmin" class="benefit-admin-actions">
          <button class="btn-action btn-cancel" @click.stop="$emit('delete-benefit', benefit.id)">
            Desativar Beneficio
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.benefits-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3, 0.75rem);
}

.benefit-card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 8px;
  overflow: hidden;
}

.benefit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4, 1rem) var(--spacing-5, 1.25rem);
  cursor: pointer;
  transition: background 0.2s;
}

.benefit-header:hover {
  background: var(--color-background, #f7fafc);
}

.benefit-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3, 0.75rem);
  flex-wrap: wrap;
}

.benefit-type-tag {
  display: inline-block;
  padding: 0.188rem var(--spacing-2, 0.5rem);
  background: #ebf4ff;
  color: var(--color-primary, #667eea);
  border-radius: 4px;
  font-size: 0.688rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.benefit-name {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--color-text, #1a202c);
  margin: 0;
}

.benefit-provider {
  font-size: 0.813rem;
  color: var(--color-text-muted, #718096);
}

.benefit-actions-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3, 0.75rem);
}

.benefit-plans-count {
  font-size: 0.75rem;
  color: var(--color-text-muted, #718096);
}

.expand-indicator {
  font-size: 1.25rem;
  color: #a0aec0;
  font-weight: 300;
  width: 24px;
  text-align: center;
}

.benefit-description {
  padding: 0 var(--spacing-5, 1.25rem) var(--spacing-3, 0.75rem);
  font-size: 0.813rem;
  color: var(--color-text-muted, #718096);
}

.plans-section {
  border-top: 1px solid var(--color-border, #e2e8f0);
  padding: var(--spacing-4, 1rem) var(--spacing-5, 1.25rem);
}

.plans-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3, 0.75rem);
}

.plans-title {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--color-text-secondary, #4a5568);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.btn-small {
  padding: 0.25rem var(--spacing-3, 0.75rem);
  background: linear-gradient(135deg, var(--color-primary, #667eea) 0%, #764ba2 100%);
  color: var(--color-surface, #fff);
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
  transform: translateY(-1px);
}

.plans-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2, 0.5rem);
}

.plan-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem var(--spacing-3, 0.75rem);
  background: var(--color-background, #f7fafc);
  border-radius: 6px;
}

.plan-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-4, 1rem);
  flex-wrap: wrap;
}

.plan-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text, #2d3748);
}

.plan-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary, #667eea);
}

.plan-discount {
  font-size: 0.75rem;
  color: var(--color-text-muted, #718096);
}

.plan-actions {
  display: flex;
  gap: 0.25rem;
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

.plans-empty {
  font-size: 0.813rem;
  color: #a0aec0;
  text-align: center;
  padding: var(--spacing-3, 0.75rem);
}

.benefit-admin-actions {
  margin-top: var(--spacing-3, 0.75rem);
  padding-top: var(--spacing-3, 0.75rem);
  border-top: 1px solid #edf2f7;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .benefit-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2, 0.5rem);
  }

  .plan-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2, 0.5rem);
  }
}
</style>
