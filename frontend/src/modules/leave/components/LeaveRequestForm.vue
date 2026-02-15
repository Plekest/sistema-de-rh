<script setup lang="ts">
import type { Employee } from '@/modules/employees/types'
import type { CreateLeaveData } from '../types'
import AppModal from '@/components/common/AppModal.vue'
import FormField from '@/components/common/FormField.vue'

/**
 * Formulario para criar nova solicitacao de ferias/licenca.
 *
 * Encapsulado em um AppModal para uso consistente com o design system.
 * Aceita dados de formulario e colaboradores via props, emitindo eventos para submit e close.
 */

interface Props {
  show: boolean
  isAdmin: boolean
  employees: Employee[]
  formData: CreateLeaveData
  formLoading: boolean
  formError: string
  typeLabels: Record<string, string>
  typeOptions: string[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
  (e: 'update:formData', value: CreateLeaveData): void
}>()

/**
 * Atualiza campo do formulario
 */
function updateField(field: keyof CreateLeaveData, value: unknown) {
  emit('update:formData', {
    ...arguments[0] as unknown as CreateLeaveData,
  })
}
</script>

<template>
  <AppModal :show="show" title="Nova Solicitacao" size="lg" @close="emit('close')">
    <div v-if="formError" class="alert alert-error" role="alert">{{ formError }}</div>

    <form @submit.prevent="emit('submit')" class="form-grid">
      <FormField
        v-if="isAdmin"
        label="Colaborador"
        :required="true"
        html-for="form-employee"
        class="form-col-full"
      >
        <select
          id="form-employee"
          :value="formData.employeeId"
          @change="$emit('update:formData', { ...formData, employeeId: Number(($event.target as HTMLSelectElement).value) })"
          required
        >
          <option :value="0">Selecione um colaborador...</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.fullName }}
          </option>
        </select>
      </FormField>

      <FormField
        label="Tipo"
        :required="true"
        html-for="form-type"
        class="form-col-full"
      >
        <select
          id="form-type"
          :value="formData.type"
          @change="$emit('update:formData', { ...formData, type: ($event.target as HTMLSelectElement).value })"
          required
        >
          <option value="">Selecione o tipo...</option>
          <option v-for="type in typeOptions" :key="type" :value="type">
            {{ typeLabels[type] }}
          </option>
        </select>
      </FormField>

      <FormField label="Data Inicio" :required="true" html-for="form-start">
        <input
          id="form-start"
          type="date"
          :value="formData.startDate"
          @input="$emit('update:formData', { ...formData, startDate: ($event.target as HTMLInputElement).value })"
          required
        />
      </FormField>

      <FormField label="Data Fim" :required="true" html-for="form-end">
        <input
          id="form-end"
          type="date"
          :value="formData.endDate"
          @input="$emit('update:formData', { ...formData, endDate: ($event.target as HTMLInputElement).value })"
          required
        />
      </FormField>

      <FormField label="Dias" html-for="form-days">
        <input
          id="form-days"
          type="number"
          :value="formData.daysCount"
          readonly
        />
      </FormField>

      <FormField
        v-if="formData.type === 'vacation'"
        label="Abono Pecuniario (dias)"
        html-for="form-sell"
      >
        <input
          id="form-sell"
          type="number"
          :value="formData.sellDays"
          @input="$emit('update:formData', { ...formData, sellDays: Number(($event.target as HTMLInputElement).value) })"
          min="0"
          max="10"
        />
      </FormField>

      <FormField label="Notas" html-for="form-notes" class="form-col-full">
        <textarea
          id="form-notes"
          :value="formData.notes || ''"
          @input="$emit('update:formData', { ...formData, notes: ($event.target as HTMLTextAreaElement).value })"
          rows="3"
        ></textarea>
      </FormField>
    </form>

    <template #footer>
      <button type="button" class="btn-secondary" @click="emit('close')" :disabled="formLoading">
        Cancelar
      </button>
      <button type="button" class="btn-primary" @click="emit('submit')" :disabled="formLoading">
        {{ formLoading ? 'Criando...' : 'Criar Solicitacao' }}
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-col-full {
  grid-column: 1 / -1;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.alert-error {
  background: var(--color-danger-light);
  border: 1px solid var(--color-danger-lighter);
  color: var(--color-danger-dark);
}

.btn-primary {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: var(--color-bg-card);
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

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
