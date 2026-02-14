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
      <button class="btn-close" @click="emit('close')">Fechar</button>
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
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
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
  color: #1a202c;
  margin: 0;
}

.btn-close {
  padding: 0.375rem 0.875rem;
  background: transparent;
  color: #718096;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f7fafc;
  color: #4a5568;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #c53030;
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
  color: #4a5568;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
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
  background: #fff;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #f7fafc;
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
}

@media (max-width: 480px) {
  .form-card {
    padding: 1rem;
  }
}
</style>
