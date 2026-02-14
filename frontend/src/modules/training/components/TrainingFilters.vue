<script setup lang="ts">
/**
 * Componente de filtros para a listagem de treinamentos.
 *
 * Exibe inputs para filtrar por status, tipo, categoria e busca por texto.
 * Emite mudancas via v-model para cada filtro.
 */

interface Props {
  status: string
  type: string
  category: string
  search: string
  typeLabels: Record<string, string>
  statusLabels: Record<string, string>
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:status', value: string): void
  (e: 'update:type', value: string): void
  (e: 'update:category', value: string): void
  (e: 'update:search', value: string): void
}>()
</script>

<template>
  <div class="filters-bar">
    <div class="filter-group filter-grow">
      <label for="filter-search">Buscar</label>
      <input
        id="filter-search"
        type="text"
        :value="search"
        placeholder="Buscar por titulo, instrutor, categoria..."
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="filter-group">
      <label for="filter-status">Status</label>
      <select
        id="filter-status"
        :value="status"
        @change="emit('update:status', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">Todos os status</option>
        <option v-for="(label, key) in statusLabels" :key="key" :value="key">
          {{ label }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label for="filter-type">Tipo</label>
      <select
        id="filter-type"
        :value="type"
        @change="emit('update:type', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">Todos os tipos</option>
        <option v-for="(label, key) in typeLabels" :key="key" :value="key">
          {{ label }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label for="filter-category">Categoria</label>
      <input
        id="filter-category"
        type="text"
        :value="category"
        placeholder="Ex: Tecnico, Seguranca..."
        @input="emit('update:category', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<style scoped>
.filters-bar {
  display: flex;
  gap: var(--space-8);
  margin-bottom: var(--space-12);
  flex-wrap: wrap;
  background: var(--color-bg-card);
  padding: var(--filter-bar-padding);
  border-radius: var(--filter-bar-border-radius);
  border: var(--border-width) solid var(--color-border);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-grow {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  font-size: var(--filter-label-font-size);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-group select,
.filter-group input {
  padding: var(--input-padding-y) var(--input-padding-x);
  border: var(--border-width) solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  outline: none;
  transition: border-color var(--transition-fast);
}

.filter-group select:focus,
.filter-group input:focus {
  border-color: var(--color-border-focus);
  box-shadow: var(--input-focus-ring);
}

@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
  }

  .filter-grow {
    min-width: unset;
  }
}
</style>
