<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  completed: number
  total: number
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
})

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.completed / props.total) * 100)
})

const barColor = computed(() => {
  if (percentage.value === 100) return 'var(--color-success)'
  if (percentage.value >= 50) return 'var(--color-info)'
  return 'var(--color-warning)'
})
</script>

<template>
  <div class="progress-container" :class="`progress-${size}`">
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: `${percentage}%`, backgroundColor: barColor }"
      ></div>
    </div>
    <div class="progress-label">
      <span class="progress-text">{{ completed }} de {{ total }}</span>
      <span class="progress-percentage">{{ percentage }}%</span>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.progress-bar {
  width: 100%;
  height: var(--onboarding-progress-height);
  background-color: var(--onboarding-progress-bg);
  border-radius: var(--radius-full);
  overflow: hidden;
  transition: background-color var(--transition-slow);
}

.progress-small .progress-bar {
  height: 6px;
}

.progress-large .progress-bar {
  height: 12px;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-slow), background-color var(--transition-base);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.progress-small .progress-label {
  font-size: var(--font-size-xs);
}

.progress-large .progress-label {
  font-size: var(--font-size-base);
}

.progress-text {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-slow);
}

.progress-percentage {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-slow);
}
</style>
