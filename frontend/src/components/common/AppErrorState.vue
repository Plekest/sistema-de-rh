<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  retryLabel?: string
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="error-state">
    <div class="error-icon" aria-hidden="true">
      <div class="icon-circle">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
          <path d="M12 8v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      </div>
    </div>

    <h3 class="error-title">
      {{ title || 'Ocorreu um erro' }}
    </h3>

    <p class="error-description">
      {{ description || 'Não foi possível carregar os dados. Tente novamente.' }}
    </p>

    <button
      class="error-retry"
      @click="$emit('retry')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      <span>{{ retryLabel || 'Tentar novamente' }}</span>
    </button>
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-24) var(--space-16);
  text-align: center;
  min-height: 300px;
}

.error-icon {
  margin-bottom: var(--space-10);
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--color-danger-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-danger);
}

.icon-circle svg {
  width: 40px;
  height: 40px;
}

.error-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
  letter-spacing: -0.01em;
}

.error-description {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  max-width: 400px;
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-12);
}

.error-retry {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-10);
  background-color: var(--color-danger);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 44px;
}

.error-retry:hover {
  background-color: var(--color-danger-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.error-retry:active {
  transform: translateY(0);
}

.error-retry:focus-visible {
  outline: 2px solid var(--color-danger);
  outline-offset: 2px;
}

/* Responsividade */
@media (max-width: 768px) {
  .error-state {
    padding: var(--space-16) var(--space-12);
    min-height: 250px;
  }

  .icon-circle {
    width: 60px;
    height: 60px;
  }

  .icon-circle svg {
    width: 30px;
    height: 30px;
  }

  .error-title {
    font-size: var(--font-size-lg);
  }

  .error-description {
    font-size: var(--font-size-sm);
  }
}
</style>
