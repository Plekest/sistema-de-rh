<script setup lang="ts">
defineProps<{
  modelValue: string
  typeOptions: string[]
  typeLabels: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': []
}>()

function handleChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update:modelValue', value)
  emit('change')
}
</script>

<template>
  <div class="filters-bar">
    <div class="filter-group">
      <label for="filter-type">Tipo</label>
      <select
        id="filter-type"
        :value="modelValue"
        @change="handleChange"
      >
        <option value="">Todos os tipos</option>
        <option v-for="type in typeOptions" :key="type" :value="type">
          {{ typeLabels[type] }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.filters-bar {
  display: flex;
  gap: var(--spacing-4, 1rem);
  margin-bottom: var(--spacing-6, 1.5rem);
  flex-wrap: wrap;
  background: var(--color-surface, #fff);
  padding: var(--spacing-4, 1rem) var(--spacing-5, 1.25rem);
  border-radius: 8px;
  border: 1px solid var(--color-border, #e2e8f0);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
