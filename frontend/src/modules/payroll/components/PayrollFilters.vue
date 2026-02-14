<script setup lang="ts">
import type { Employee } from '@/modules/employees/types'

defineProps<{
  employees: Employee[]
  modelValue: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  'change': [employeeId: number]
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value ? Number(target.value) : null
  emit('update:modelValue', value)
  if (value) {
    emit('change', value)
  }
}
</script>

<template>
  <div class="filters-bar">
    <div class="filter-group filter-grow">
      <label for="comp-employee">Colaborador</label>
      <select
        id="comp-employee"
        :value="modelValue"
        @change="handleChange"
      >
        <option :value="null">Selecione um colaborador...</option>
        <option v-for="emp in employees" :key="emp.id" :value="emp.id">
          {{ emp.fullName }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  background: var(--color-surface, #fff);
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid var(--color-border, #e2e8f0);
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-grow {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary, #4a5568);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-group select {
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 5px;
  font-size: 0.875rem;
  color: var(--color-text, #2d3748);
  background: var(--color-surface, #fff);
  outline: none;
  transition: border-color 0.2s;
}

.filter-group select:focus {
  border-color: var(--color-primary, #667eea);
}

@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
  }
}
</style>
