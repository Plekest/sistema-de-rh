<script setup lang="ts">
import type { PaySlip } from '../types'

defineProps<{
  paySlips: PaySlip[]
  formatCurrency: (value: number) => string
  isMySlips?: boolean
}>()

const emit = defineEmits<{
  'view-detail': [slipId: number]
}>()
</script>

<template>
  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th v-if="!isMySlips">Colaborador</th>
          <th v-if="isMySlips">Periodo</th>
          <th class="th-right">Bruto</th>
          <th v-if="!isMySlips" class="th-right">INSS</th>
          <th v-if="!isMySlips" class="th-right">IRRF</th>
          <th v-if="!isMySlips" class="th-right">FGTS</th>
          <th class="th-right">Descontos</th>
          <th class="th-right">Liquido</th>
          <th class="th-center">Acoes</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="slip in paySlips" :key="slip.id">
          <td v-if="!isMySlips" class="td-name">{{ slip.employee?.fullName || 'N/A' }}</td>
          <td v-if="isMySlips" class="td-name">{{ new Date(slip.createdAt).toLocaleDateString('pt-BR') }}</td>
          <td class="td-right">{{ formatCurrency(slip.grossSalary) }}</td>
          <td v-if="!isMySlips" class="td-right td-deduction">{{ formatCurrency(slip.inssAmount) }}</td>
          <td v-if="!isMySlips" class="td-right td-deduction">{{ formatCurrency(slip.irrfAmount) }}</td>
          <td v-if="!isMySlips" class="td-right td-info">{{ formatCurrency(slip.fgtsAmount) }}</td>
          <td class="td-right td-deduction">{{ formatCurrency(slip.totalDeductions) }}</td>
          <td class="td-right td-net">{{ formatCurrency(slip.netSalary) }}</td>
          <td class="td-center">
            <button class="btn-action btn-detail" @click="$emit('view-detail', slip.id)">
              Detalhe
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-container {
  background: var(--color-surface, #fff);
  border-radius: 8px;
  border: 1px solid var(--color-border, #e2e8f0);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary, #4a5568);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: 2px solid var(--color-border, #e2e8f0);
  white-space: nowrap;
}

.data-table td {
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  font-size: 0.875rem;
  color: var(--color-text, #2d3748);
  border-bottom: 1px solid #f0f0f0;
}

.data-table tbody tr:hover {
  background-color: var(--color-background, #f7fafc);
}

.th-center { text-align: center; }
.th-right { text-align: right; }
.td-center { text-align: center; }
.td-right { text-align: right; font-variant-numeric: tabular-nums; }
.td-name { font-weight: 500; }

.td-deduction { color: var(--color-error, #c53030); }
.td-info { color: var(--color-text-muted, #718096); }
.td-net { font-weight: 600; color: var(--color-success, #276749); }

.btn-action {
  padding: 0.25rem 0.625rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 0.125rem;
}

.btn-detail {
  background: #ebf4ff;
  color: var(--color-primary, #667eea);
}

.btn-detail:hover {
  background: #bee3f8;
}

@media (max-width: 768px) {
  .table-container {
    overflow-x: scroll;
  }

  .data-table {
    min-width: 700px;
  }

  .btn-action {
    padding: 0.5rem 0.75rem;
    font-size: 0.813rem;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
