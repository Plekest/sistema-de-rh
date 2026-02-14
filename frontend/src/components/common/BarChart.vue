<script setup lang="ts">
import { computed } from 'vue'

interface BarChartData {
  label: string
  value: number
  color?: string
}

interface Props {
  data: BarChartData[]
  maxValue?: number
  showValues?: boolean
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxValue: undefined,
  showValues: true,
  height: 24,
})

const max = computed(() => {
  if (props.maxValue) return props.maxValue
  if (props.data.length === 0) return 1
  return Math.max(...props.data.map((d) => d.value))
})

function getPercentage(value: number): number {
  if (max.value === 0) return 0
  return Math.round((value / max.value) * 100)
}

function getBarColor(index: number, customColor?: string): string {
  if (customColor) return customColor
  const colors = [
    'var(--color-primary)',
    'var(--color-secondary)',
    'var(--color-success)',
    'var(--color-info)',
    'var(--color-warning)',
  ]
  return colors[index % colors.length]
}
</script>

<template>
  <div class="bar-chart">
    <div v-if="data.length === 0" class="bar-chart-empty">Sem dados para exibir</div>
    <div v-else class="bar-chart-list">
      <div v-for="(item, index) in data" :key="item.label" class="bar-chart-item">
        <div class="bar-chart-header">
          <span class="bar-chart-label">{{ item.label }}</span>
          <span v-if="showValues" class="bar-chart-value">{{ item.value }}</span>
        </div>
        <div class="bar-chart-track" :style="{ height: `${height}px` }">
          <div
            class="bar-chart-fill"
            :style="{
              width: `${getPercentage(item.value)}%`,
              backgroundColor: getBarColor(index, item.color),
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bar-chart {
  width: 100%;
}

.bar-chart-empty {
  text-align: center;
  padding: var(--space-12) 0;
  color: var(--color-text-placeholder);
  font-size: var(--font-size-sm);
}

.bar-chart-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.bar-chart-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.bar-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bar-chart-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.bar-chart-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-semibold);
}

.bar-chart-track {
  background: var(--color-bg-muted);
  border-radius: var(--radius-xs);
  overflow: hidden;
  position: relative;
}

.bar-chart-fill {
  height: 100%;
  border-radius: var(--radius-xs);
  min-width: 2px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  animation: bar-grow 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: left center;
}

@keyframes bar-grow {
  from {
    width: 0%;
  }
}
</style>
