<script setup lang="ts">
import type { CreateCycleData } from '../types'

defineProps<{
  show: boolean
  loading: boolean
  error: string
  formData: CreateCycleData
  typeLabels: Record<string, string>
}>()

const emit = defineEmits<{
  close: []
  submit: []
  'update:formData': [value: CreateCycleData]
}>()
</script>

<template>
  <div v-if="show" class="form-card">
    <div class="form-header">
      <h2 class="form-title">Novo Ciclo</h2>
      <button class="btn-close" @click="emit('close')">Fechar</button>
    </div>

    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <form @submit.prevent="emit('submit')" class="form-grid">
      <div class="form-group form-col-full">
        <label for="cycle-name">Nome *</label>
        <input id="cycle-name" type="text" v-model="formData.name" required />
      </div>

      <div class="form-group">
        <label for="cycle-type">Tipo *</label>
        <select id="cycle-type" v-model="formData.type" required>
          <option v-for="(label, key) in typeLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="cycle-start">Data Inicio *</label>
        <input id="cycle-start" type="date" v-model="formData.startDate" required />
      </div>

      <div class="form-group">
        <label for="cycle-end">Data Fim *</label>
        <input id="cycle-end" type="date" v-model="formData.endDate" required />
      </div>

      <div class="form-group">
        <label for="cycle-self-deadline">Prazo Autoavaliacao *</label>
        <input id="cycle-self-deadline" type="date" v-model="formData.selfEvalDeadline" required />
      </div>

      <div class="form-group">
        <label for="cycle-manager-deadline">Prazo Avaliacao Gestor *</label>
        <input id="cycle-manager-deadline" type="date" v-model="formData.managerEvalDeadline" required />
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="emit('close')" :disabled="loading">
          Cancelar
        </button>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Criando...' : 'Criar Ciclo' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: background-color var(--transition-slow), border-color var(--transition-slow);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.btn-close {
  padding: 0.375rem 0.875rem;
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 5px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-tertiary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
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
  color: var(--color-text-tertiary);
}

.form-group input,
.form-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  outline: none;
  transition: border-color 0.2s, background-color var(--transition-slow), color var(--transition-slow);
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--color-border-focus);
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-primary {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: var(--color-text-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.alert-error {
  background: var(--color-danger-light);
  border: 1px solid #fed7d7;
  color: var(--color-danger-dark);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-card {
    padding: 1rem;
  }
}
</style>
