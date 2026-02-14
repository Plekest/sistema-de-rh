<script setup lang="ts">
import type { Employee } from '@/modules/employees/types'

/**
 * Componente de filtros para a listagem de ferias/licencas.
 *
 * Exibe selects para filtrar por colaborador, tipo e status.
 * Emite mudancas via v-model para cada filtro.
 */

interface Props {
  isAdmin: boolean
  employees: Employee[]
  selectedEmployee: number | null
  filterType: string
  filterStatus: string
  typeLabels: Record<string, string>
  statusLabels: Record<string, string>
  typeOptions: string[]
  statusOptions: string[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:selectedEmployee', value: number | null): void
  (e: 'update:filterType', value: string): void
  (e: 'update:filterStatus', value: string): void
}>()
</script>

<template>
  <div class="filters-bar">
    <div v-if="isAdmin" class="filter-group filter-grow">
      <label for="filter-emp">Colaborador</label>
      <select
        id="filter-emp"
        :value="selectedEmployee"
        @change="emit('update:selectedEmployee', ($event.target as HTMLSelectElement).value === '' ? null : Number(($event.target as HTMLSelectElement).value))"
      >
        <option value="">Todos os colaboradores</option>
        <option v-for="emp in employees" :key="emp.id" :value="emp.id">
          {{ emp.fullName }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label for="filter-type">Tipo</label>
      <select
        id="filter-type"
        :value="filterType"
        @change="emit('update:filterType', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">Todos os tipos</option>
        <option v-for="type in typeOptions" :key="type" :value="type">
          {{ typeLabels[type] }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label for="filter-status">Status</label>
      <select
        id="filter-status"
        :value="filterStatus"
        @change="emit('update:filterStatus', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">Todos os status</option>
        <option v-for="status in statusOptions" :key="status" :value="status">
          {{ statusLabels[status] }}
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
  background: #fff;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
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
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.filter-group select:focus {
  border-color: #667eea;
}

@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
  }
}
</style>
