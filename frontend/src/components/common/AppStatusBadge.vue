<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md'
}>()

// Auto-mapeia status comuns para variantes
const computedVariant = computed(() => {
  if (props.variant) return props.variant

  const statusLower = props.status.toLowerCase()

  // Success
  if (['active', 'approved', 'completed', 'paid', 'done'].includes(statusLower)) {
    return 'success'
  }

  // Danger
  if (['inactive', 'rejected', 'cancelled', 'overdue', 'failed', 'terminated'].includes(statusLower)) {
    return 'danger'
  }

  // Warning
  if (['pending', 'in_progress', 'processing', 'scheduled', 'waiting'].includes(statusLower)) {
    return 'warning'
  }

  // Info
  if (['draft', 'new', 'open'].includes(statusLower)) {
    return 'info'
  }

  // Neutral default
  return 'neutral'
})
</script>

<template>
  <span
    class="status-badge"
    :class="[
      `badge-${computedVariant}`,
      `badge-${size || 'md'}`
    ]"
  >
    {{ status }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
  white-space: nowrap;
  text-transform: capitalize;
}

/* Tamanhos */
.badge-sm {
  font-size: 11px;
  padding: 2px 8px;
  line-height: 1.4;
}

.badge-md {
  font-size: 13px;
  padding: 4px 12px;
  line-height: 1.4;
}

/* Variantes - Success */
.badge-success {
  background-color: var(--color-success-bg);
  color: var(--color-success-darker);
  border: 1px solid var(--color-success-lighter);
}

/* Variantes - Danger */
.badge-danger {
  background-color: var(--color-danger-bg);
  color: var(--color-danger-darker);
  border: 1px solid var(--color-danger-lighter);
}

/* Variantes - Warning */
.badge-warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning-darker);
  border: 1px solid var(--color-warning-lighter);
}

/* Variantes - Info */
.badge-info {
  background-color: var(--color-info-bg);
  color: var(--color-info-dark);
  border: 1px solid var(--color-info-lighter);
}

/* Variantes - Neutral */
.badge-neutral {
  background-color: var(--color-bg-muted);
  color: var(--color-text-tertiary);
  border: 1px solid var(--color-border);
}
</style>
