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
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.empty-state-icon {
  margin-bottom: 1rem;
}

.empty-state-title {
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 0.5rem;
}

.empty-state-description {
  font-size: 0.875rem;
  color: var(--color-text-muted, #718096);
  margin: 0 0 1.25rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.empty-state-action {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.empty-state-action:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
  transform: translateY(-1px);
}

.empty-state-action:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>
