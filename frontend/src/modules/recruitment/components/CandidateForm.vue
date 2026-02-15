<script setup lang="ts">
import type { CreateCandidateData } from '../types'
import type { JobRequisition } from '../types'

interface Props {
  show: boolean
  formData: CreateCandidateData
  formLoading: boolean
  formError: string
  requisitions: JobRequisition[]
  candidateSourceLabels: Record<string, string>
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: []
  'update:formData': [value: CreateCandidateData]
}>()

function updateField(field: keyof CreateCandidateData, value: any) {
  const props = defineProps<Props>()
  emit('update:formData', { ...props.formData, [field]: value })
}
</script>

<template>
  <div v-if="show" class="form-card">
    <div class="form-header">
      <h2 class="form-title">Novo Candidato</h2>
      <button class="btn-close" @click="emit('close')" aria-label="Fechar formulário de novo candidato">Fechar</button>
    </div>

    <div v-if="formError" class="alert alert-error" role="alert">{{ formError }}</div>

    <form @submit.prevent="emit('submit')" class="form-grid">
      <div class="form-group">
        <label for="cand-name">Nome *</label>
        <input
          id="cand-name"
          type="text"
          :value="formData.name"
          @input="updateField('name', ($event.target as HTMLInputElement).value)"
          required
        />
      </div>

      <div class="form-group">
        <label for="cand-email">Email *</label>
        <input
          id="cand-email"
          type="email"
          :value="formData.email"
          @input="updateField('email', ($event.target as HTMLInputElement).value)"
          required
        />
      </div>

      <div class="form-group">
        <label for="cand-phone">Telefone</label>
        <input
          id="cand-phone"
          type="text"
          :value="formData.phone || ''"
          @input="updateField('phone', ($event.target as HTMLInputElement).value || null)"
        />
      </div>

      <div class="form-group">
        <label for="cand-req">Vaga *</label>
        <select
          id="cand-req"
          :value="formData.jobRequisitionId"
          @change="updateField('jobRequisitionId', Number(($event.target as HTMLSelectElement).value))"
          required
        >
          <option :value="0">Selecione...</option>
          <option
            v-for="req in requisitions.filter(r => r.status === 'open' || r.status === 'approved')"
            :key="req.id"
            :value="req.id"
          >
            {{ req.title }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="cand-source">Origem *</label>
        <select
          id="cand-source"
          :value="formData.source"
          @change="updateField('source', ($event.target as HTMLSelectElement).value)"
          required
        >
          <option v-for="(label, key) in candidateSourceLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="cand-salary">Pretensao Salarial (R$)</label>
        <input
          id="cand-salary"
          type="number"
          step="0.01"
          min="0"
          :value="formData.salaryExpectation || ''"
          @input="updateField('salaryExpectation', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
        />
      </div>

      <div class="form-group form-col-full">
        <label for="cand-linkedin">LinkedIn URL</label>
        <input
          id="cand-linkedin"
          type="url"
          :value="formData.linkedinUrl || ''"
          @input="updateField('linkedinUrl', ($event.target as HTMLInputElement).value || null)"
        />
      </div>

      <div class="form-group form-col-full">
        <label for="cand-notes">Observacoes</label>
        <textarea
          id="cand-notes"
          :value="formData.notes || ''"
          @input="updateField('notes', ($event.target as HTMLTextAreaElement).value || null)"
          rows="3"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="emit('close')" :disabled="formLoading">
          Cancelar
        </button>
        <button type="submit" class="btn-primary" :disabled="formLoading">
          {{ formLoading ? 'Criando...' : 'Criar Candidato' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-card {
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-12);
  margin-bottom: var(--space-12);
  transition: background-color var(--transition-slow), border-color var(--transition-slow);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-10);
}

.form-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  transition: color var(--transition-slow);
}

.btn-close {
  padding: var(--space-3) var(--space-6);
  background: transparent;
  color: var(--color-text-muted);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color var(--transition-base),
              color var(--transition-base),
              border-color var(--transition-base);
}

.btn-close:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-tertiary);
}

.btn-close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.alert {
  padding: var(--alert-padding-y) var(--alert-padding-x);
  border-radius: var(--alert-border-radius);
  font-size: var(--alert-font-size);
  margin-bottom: var(--space-8);
}

.alert-error {
  background: var(--color-danger-light);
  border: var(--border-width) solid var(--color-danger-lighter);
  color: var(--color-danger-dark);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  transition: color var(--transition-slow);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: var(--input-padding-y) var(--input-padding-x);
  border: var(--border-width) solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  outline: none;
  transition: border-color var(--transition-base),
              background-color var(--transition-slow),
              color var(--transition-slow);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--color-border-focus);
  box-shadow: var(--input-focus-ring);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: var(--space-6);
  margin-top: var(--space-4);
}

.btn-primary {
  padding: var(--btn-padding-y) var(--btn-padding-x);
  background: var(--color-primary-gradient);
  color: #ffffff;
  border: none;
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: var(--btn-padding-y) var(--btn-padding-x);
  background: var(--color-bg-card);
  color: var(--color-text-tertiary);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: background-color var(--transition-base),
              border-color var(--transition-base),
              color var(--transition-base);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.btn-secondary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .form-card {
    padding: var(--space-8);
  }
}
</style>
