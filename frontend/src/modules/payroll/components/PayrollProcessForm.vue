<script setup lang="ts">
import type { CreatePeriodData } from '../types'

const { formData } = defineProps<{
  formData: CreatePeriodData
  loading: boolean
  error: string
  monthOptions: Array<{ value: number; label: string }>
  yearOptions: number[]
}>()

const emit = defineEmits<{
  'update:formData': [data: CreatePeriodData]
  'submit': []
  'close': []
}>()

function updateMonth(value: number) {
  emit('update:formData', { ...formData, referenceMonth: value })
}

function updateYear(value: number) {
  emit('update:formData', { ...formData, referenceYear: value })
}
</script>

<template>
  <div class="form-card">
    <div class="form-header">
      <h2 class="form-title">Novo Periodo</h2>
      <button class="btn-close" @click="$emit('close')">Fechar</button>
    </div>

    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <form @submit.prevent="$emit('submit')" class="form-grid">
      <div class="form-group">
        <label for="period-month">Mes *</label>
        <select
          id="period-month"
          :value="formData.referenceMonth"
          @change="updateMonth(Number(($event.target as HTMLSelectElement).value))"
          required
        >
          <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="period-year">Ano *</label>
        <select
          id="period-year"
          :value="formData.referenceYear"
          @change="updateYear(Number(($event.target as HTMLSelectElement).value))"
          required
        >
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')" :disabled="loading">
          Cancelar
        </button>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Criando...' : 'Criar Periodo' }}
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
