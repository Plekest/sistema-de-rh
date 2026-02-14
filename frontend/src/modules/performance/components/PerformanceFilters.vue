<script setup lang="ts">
defineProps<{
  filterStatus: string
  filterYear: number
  statusLabels: Record<string, string>
  yearOptions: number[]
}>()

const emit = defineEmits<{
  'update:filterStatus': [value: string]
  'update:filterYear': [value: number]
  reload: []
}>()
</script>

<template>
  <div class="filters-bar">
    <div class="filter-group">
      <label for="filter-status">Status</label>
      <select
        id="filter-status"
        :value="filterStatus"
        @change="emit('update:filterStatus', ($event.target as HTMLSelectElement).value); emit('reload')"
      >
        <option value="">Todos</option>
        <option v-for="(label, key) in statusLabels" :key="key" :value="key">
          {{ label }}
        </option>
      </select>
    </div>
    <div class="filter-group">
      <label for="filter-year">Ano</label>
      <select
        id="filter-year"
        :value="filterYear"
        @change="emit('update:filterYear', Number(($event.target as HTMLSelectElement).value)); emit('reload')"
      >
        <option v-for="year in yearOptions" :key="year" :value="year">
          {{ year }}
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
