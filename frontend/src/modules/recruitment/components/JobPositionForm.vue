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
      <button class="btn-close" @click="emit('close')">Fechar</button>
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
