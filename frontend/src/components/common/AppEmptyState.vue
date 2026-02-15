<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  actionLabel?: string
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon" aria-hidden="true">
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="8"
          y="16"
          width="48"
          height="40"
          rx="4"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        />
        <path
          d="M8 24h48"
          stroke="currentColor"
          stroke-width="2"
        />
        <circle cx="16" cy="20" r="1.5" fill="currentColor" />
        <circle cx="22" cy="20" r="1.5" fill="currentColor" />
        <circle cx="28" cy="20" r="1.5" fill="currentColor" />
        <path
          d="M20 36h24M20 42h16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          opacity="0.3"
        />
      </svg>
    </div>

    <h3 class="empty-title">
      {{ title || 'Nenhum registro encontrado' }}
    </h3>

    <p class="empty-description">
      {{ description || 'Não há dados para exibir no momento.' }}
    </p>

    <button
      v-if="actionLabel"
      class="empty-action"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-24) var(--space-16);
  text-align: center;
  min-height: 300px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: var(--color-text-placeholder);
  margin-bottom: var(--space-10);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
  letter-spacing: -0.01em;
}

.empty-description {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  max-width: 400px;
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-12);
}

.empty-action {
  padding: var(--space-5) var(--space-10);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 44px;
}

.empty-action:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.empty-action:active {
  transform: translateY(0);
}

.empty-action:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Responsividade */
@media (max-width: 768px) {
  .empty-state {
    padding: var(--space-16) var(--space-12);
    min-height: 250px;
  }

  .empty-icon {
    width: 60px;
    height: 60px;
  }

  .empty-title {
    font-size: var(--font-size-lg);
  }

  .empty-description {
    font-size: var(--font-size-sm);
  }
}
</style>
