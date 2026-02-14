<script setup lang="ts">
/**
 * Componente de estado vazio para quando uma lista/tabela nao tem dados
 *
 * Exibe titulo, descricao opcional e botao de acao opcional.
 *
 * @example
 * <EmptyState
 *   title="Nenhum colaborador encontrado"
 *   description="Cadastre o primeiro colaborador ou ajuste os filtros."
 *   actionLabel="Novo Colaborador"
 *   @action="goToCreate"
 * />
 */

interface Props {
  /** Titulo principal do estado vazio */
  title: string
  /** Descricao complementar (opcional) */
  description?: string
  /** Label do botao de acao (se vazio, nao exibe botao) */
  actionLabel?: string
}

withDefaults(defineProps<Props>(), {
  description: '',
  actionLabel: '',
})

defineEmits<{
  /** Emitido quando o botao de acao e clicado */
  (e: 'action'): void
}>()
</script>

<template>
  <div class="empty-state" role="status">
    <div class="empty-state-icon" aria-hidden="true">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="8" y="6" width="32" height="36" rx="3" stroke="#CBD5E0" stroke-width="2" fill="none" />
        <line x1="14" y1="16" x2="34" y2="16" stroke="#E2E8F0" stroke-width="2" stroke-linecap="round" />
        <line x1="14" y1="22" x2="30" y2="22" stroke="#E2E8F0" stroke-width="2" stroke-linecap="round" />
        <line x1="14" y1="28" x2="26" y2="28" stroke="#E2E8F0" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>

    <h3 class="empty-state-title">{{ title }}</h3>

    <p v-if="description" class="empty-state-description">{{ description }}</p>

    <button
      v-if="actionLabel"
      class="empty-state-action"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  transition: background-color var(--transition-slow), border-color var(--transition-slow);
}

.empty-state-icon {
  margin-bottom: 1rem;
}

.empty-state-icon svg {
  transition: stroke var(--transition-slow);
}

[data-theme="dark"] .empty-state-icon svg rect {
  stroke: var(--color-border-hover);
}

[data-theme="dark"] .empty-state-icon svg line {
  stroke: var(--color-border);
}

.empty-state-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  margin: 0 0 0.5rem;
  transition: color var(--transition-slow);
}

.empty-state-description {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0 0 1.25rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: var(--line-height-normal);
  transition: color var(--transition-slow);
}

.empty-state-action {
  display: inline-flex;
  align-items: center;
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border: none;
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-primary-gradient);
  color: #ffffff;
}

.empty-state-action:hover {
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.empty-state-action:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
