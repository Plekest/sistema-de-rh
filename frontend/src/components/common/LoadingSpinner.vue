<script setup lang="ts">
/**
 * Componente de loading spinner animado via CSS puro
 *
 * @example
 * <LoadingSpinner />
 * <LoadingSpinner size="lg" text="Carregando dados..." />
 */

interface Props {
  /** Tamanho do spinner: sm (16px), md (32px), lg (48px) */
  size?: 'sm' | 'md' | 'lg'
  /** Texto opcional exibido abaixo do spinner */
  text?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  text: '',
})
</script>

<template>
  <div class="loading-spinner" :class="`loading-spinner--${size}`" role="status" aria-live="polite">
    <div class="spinner" :class="`spinner--${size}`">
      <div class="spinner-circle"></div>
    </div>
    <span v-if="text" class="loading-text" :class="`loading-text--${size}`">{{ text }}</span>
    <span class="sr-only">Carregando</span>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

/* Tamanhos do spinner */
.spinner--sm {
  width: 16px;
  height: 16px;
}

.spinner--md {
  width: 32px;
  height: 32px;
}

.spinner--lg {
  width: 48px;
  height: 48px;
}

.spinner {
  position: relative;
}

.spinner-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  animation: spin 0.7s linear infinite;
}

.spinner--sm .spinner-circle {
  border-width: 2px;
}

.spinner--lg .spinner-circle {
  border-width: 4px;
}

/* Texto */
.loading-text {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.loading-text--sm {
  font-size: 0.75rem;
}

.loading-text--md {
  font-size: 0.875rem;
}

.loading-text--lg {
  font-size: 1rem;
}

/* Acessibilidade: texto visivel apenas para leitores de tela */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
