<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
  text?: string
}>()
</script>

<template>
  <div class="loading-spinner">
    <div class="spinner" :class="`spinner-${size || 'md'}`">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  padding: var(--space-12);
}

.spinner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-sm {
  width: 20px;
  height: 20px;
}

.spinner-md {
  width: 40px;
  height: 40px;
}

.spinner-lg {
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-sm .spinner-ring {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.spinner-md .spinner-ring {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

.spinner-lg .spinner-ring {
  width: 60px;
  height: 60px;
  border-width: 4px;
}

.spinner-ring:nth-child(1) {
  border-top-color: var(--color-primary);
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  border-top-color: var(--color-primary);
  opacity: 0.3;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  margin: 0;
}
</style>
