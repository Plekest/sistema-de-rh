<script setup lang="ts">
import { computed } from 'vue'

interface DonutChartData {
  label: string
  value: number
  color: string
}

interface Props {
  data: DonutChartData[]
  size?: number
  showLegend?: boolean
  centerLabel?: string
  centerValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 200,
  showLegend: true,
  centerLabel: '',
  centerValue: '',
})

const total = computed(() => {
  return props.data.reduce((sum, item) => sum + item.value, 0)
})

const gradientStops = computed(() => {
  if (props.data.length === 0) return 'transparent'

  let percentage = 0
  const stops: string[] = []

  props.data.forEach((item) => {
    const itemPercentage = total.value > 0 ? (item.value / total.value) * 100 : 0

    stops.push(`${item.color} ${percentage}%`)
    percentage += itemPercentage
    stops.push(`${item.color} ${percentage}%`)
  })

  return `conic-gradient(from 0deg, ${stops.join(', ')})`
})

function getPercentage(value: number): number {
  if (total.value === 0) return 0
  return Math.round((value / total.value) * 100)
}
</script>

<template>
  <div class="donut-chart">
    <div class="donut-chart-container">
      <div
        class="donut-chart-circle"
        :style="{
          width: `${size}px`,
          height: `${size}px`,
          background: gradientStops,
        }"
      >
        <div class="donut-chart-center">
          <div v-if="centerValue || centerLabel" class="donut-chart-center-content">
            <div v-if="centerValue" class="donut-chart-center-value">{{ centerValue }}</div>
            <div v-if="centerLabel" class="donut-chart-center-label">{{ centerLabel }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showLegend && data.length > 0" class="donut-chart-legend">
      <div v-for="item in data" :key="item.label" class="donut-chart-legend-item">
        <div class="donut-chart-legend-indicator" :style="{ backgroundColor: item.color }"></div>
        <div class="donut-chart-legend-content">
          <span class="donut-chart-legend-label">{{ item.label }}</span>
          <div class="donut-chart-legend-values">
            <span class="donut-chart-legend-value">{{ item.value }}</span>
            <span class="donut-chart-legend-percentage">{{ getPercentage(item.value) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="data.length === 0" class="donut-chart-empty">Sem dados para exibir</div>
  </div>
</template>

<style scoped>
.donut-chart {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-12);
}

.donut-chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.donut-chart-circle {
  border-radius: var(--radius-full);
  position: relative;
  animation: donut-appear 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: var(--shadow-sm);
}

.donut-chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 65%;
  height: 65%;
  background: var(--color-bg-card);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-chart-center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.donut-chart-center-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1;
}

.donut-chart-center-label {
  font-size: var(--font-size-2xs);
  color: var(--color-text-muted);
  text-align: center;
  font-weight: var(--font-weight-medium);
}

.donut-chart-legend {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
}

.donut-chart-legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.donut-chart-legend-indicator {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-xs);
  flex-shrink: 0;
}

.donut-chart-legend-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.donut-chart-legend-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.donut-chart-legend-values {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.donut-chart-legend-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-semibold);
}

.donut-chart-legend-percentage {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.donut-chart-empty {
  text-align: center;
  padding: var(--space-12) 0;
  color: var(--color-text-placeholder);
  font-size: var(--font-size-sm);
}

@keyframes donut-appear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
