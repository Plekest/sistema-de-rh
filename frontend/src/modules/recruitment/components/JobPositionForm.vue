<script setup lang="ts">
import type { CreateJobRequisitionData } from '../types'
import type { Department, Position } from '@/modules/employees/types'
import {
  REQUISITION_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODEL_LABELS,
} from '../types'

interface Props {
  show: boolean
  formData: CreateJobRequisitionData
  formLoading: boolean
  formError: string
  departments: Department[]
  positions: Position[]
  employmentTypeLabels: Record<string, string>
  workModelLabels: Record<string, string>
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: []
  'update:formData': [value: CreateJobRequisitionData]
}>()

function updateField(field: keyof CreateJobRequisitionData, value: any) {
  emit('update:formData', { ...defineProps<Props>().formData, [field]: value })
}
</script>

<template>
  <div v-if="show" class="form-card">
    <div class="form-header">
      <h2 class="form-title">Nova Vaga</h2>
      <button class="btn-close" @click="emit('close')" aria-label="Fechar formulário de nova vaga">Fechar</button>
    </div>

    <div v-if="formError" class="alert alert-error" role="alert">{{ formError }}</div>

    <form @submit.prevent="emit('submit')" class="form-grid">
      <div class="form-group">
        <label for="req-title">Titulo da Vaga *</label>
        <input
          id="req-title"
          type="text"
          :value="formData.title"
          @input="updateField('title', ($event.target as HTMLInputElement).value)"
          required
        />
      </div>

      <div class="form-group">
        <label for="req-dept">Departamento *</label>
        <select
          id="req-dept"
          :value="formData.departmentId"
          @change="updateField('departmentId', Number(($event.target as HTMLSelectElement).value))"
          required
        >
          <option :value="0">Selecione...</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="req-pos">Cargo</label>
        <select
          id="req-pos"
          :value="formData.positionId || ''"
          @change="updateField('positionId', ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)"
        >
          <option value="">Selecione...</option>
          <option v-for="pos in positions" :key="pos.id" :value="pos.id">
            {{ pos.title }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="req-type">Tipo de Contrato *</label>
        <select
          id="req-type"
          :value="formData.employmentType"
          @change="updateField('employmentType', ($event.target as HTMLSelectElement).value)"
          required
        >
          <option v-for="(label, key) in employmentTypeLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="req-work">Modelo de Trabalho *</label>
        <select
          id="req-work"
          :value="formData.workModel"
          @change="updateField('workModel', ($event.target as HTMLSelectElement).value)"
          required
        >
          <option v-for="(label, key) in workModelLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="req-headcount">Numero de Vagas *</label>
        <input
          id="req-headcount"
          type="number"
          min="1"
          :value="formData.headcount"
          @input="updateField('headcount', Number(($event.target as HTMLInputElement).value))"
          required
        />
      </div>

      <div class="form-group">
        <label for="req-salary-min">Salario Minimo (R$)</label>
        <input
          id="req-salary-min"
          type="number"
          step="0.01"
          min="0"
          :value="formData.salaryRangeMin || ''"
          @input="updateField('salaryRangeMin', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
        />
      </div>

      <div class="form-group">
        <label for="req-salary-max">Salario Maximo (R$)</label>
        <input
          id="req-salary-max"
          type="number"
          step="0.01"
          min="0"
          :value="formData.salaryRangeMax || ''"
          @input="updateField('salaryRangeMax', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
        />
      </div>

      <div class="form-group form-col-full">
        <label for="req-desc">Descricao da Vaga</label>
        <textarea
          id="req-desc"
          :value="formData.description || ''"
          @input="updateField('description', ($event.target as HTMLTextAreaElement).value || null)"
          rows="3"
        ></textarea>
      </div>

      <div class="form-group form-col-full">
        <label for="req-requirements">Requisitos</label>
        <textarea
          id="req-requirements"
          :value="formData.requirements || ''"
          @input="updateField('requirements', ($event.target as HTMLTextAreaElement).value || null)"
          rows="3"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="emit('close')" :disabled="formLoading">
          Cancelar
        </button>
        <button type="submit" class="btn-primary" :disabled="formLoading">
          {{ formLoading ? 'Criando...' : 'Criar Vaga' }}
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
