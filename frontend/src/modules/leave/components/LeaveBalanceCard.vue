<script setup lang="ts">
import type { LeaveBalance } from '../types'

/**
 * Card de saldo de ferias por periodo aquisitivo.
 *
 * Exibe visualmente o saldo de dias disponiveis, usados e vendidos.
 * Usa cores semanticas para indicar status do periodo.
 */

interface Props {
  balances: LeaveBalance[]
}

defineProps<Props>()

/**
 * Retorna classe CSS baseada no status do saldo
 */
function statusClass(status: string): string {
  const map: Record<string, string> = {
    accruing: 'balance-accruing',
    available: 'balance-available',
    partially_used: 'balance-partial',
    used: 'balance-used',
    expired: 'balance-expired',
  }
  return map[status] || ''
}

/**
 * Retorna label do status do saldo
 */
function statusLabel(status: string): string {
  const map: Record<string, string> = {
    accruing: 'Em acumulo',
    available: 'Disponivel',
    partially_used: 'Parcialmente usado',
    used: 'Usado',
    expired: 'Expirado',
  }
  return map[status] || status
}

/**
 * Formata data para exibicao
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR')
}
</script>

<template>
  <div v-if="balances.length > 0" class="balance-cards">
    <div
      v-for="balance in balances"
      :key="balance.id"
      class="balance-card"
      :class="statusClass(balance.status)"
    >
      <div class="balance-header">
        <span class="balance-period">
          {{ formatDate(balance.accrualStartDate) }} - {{ formatDate(balance.accrualEndDate) }}
        </span>
        <span class="balance-status">{{ statusLabel(balance.status) }}</span>
      </div>

      <div class="balance-body">
        <div class="balance-stat">
          <span class="balance-stat-value">{{ balance.remainingDays }}</span>
          <span class="balance-stat-label">Disponiveis</span>
        </div>
        <div class="balance-stat">
          <span class="balance-stat-value balance-stat-used">{{ balance.usedDays }}</span>
          <span class="balance-stat-label">Usados</span>
        </div>
        <div class="balance-stat">
          <span class="balance-stat-value balance-stat-sold">{{ balance.soldDays }}</span>
          <span class="balance-stat-label">Vendidos</span>
        </div>
        <div class="balance-stat">
          <span class="balance-stat-value balance-stat-total">{{ balance.totalDays }}</span>
          <span class="balance-stat-label">Total</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.balance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.balance-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  border-left: 4px solid var(--color-text-placeholder);
  transition: background-color var(--transition-slow), color var(--transition-slow), border-color var(--transition-slow);
}

.balance-card.balance-available {
  border-left-color: var(--color-success);
}

.balance-card.balance-accruing {
  border-left-color: var(--color-primary);
}

.balance-card.balance-partial {
  border-left-color: var(--color-warning-dark);
}

.balance-card.balance-used {
  border-left-color: var(--color-text-muted);
}

.balance-card.balance-expired {
  border-left-color: var(--color-danger);
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.balance-period {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
}

.balance-status {
  font-size: 0.688rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.balance-body {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  text-align: center;
}

.balance-stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-success-dark);
  font-variant-numeric: tabular-nums;
}

.balance-stat-used {
  color: var(--color-danger-dark);
}

.balance-stat-sold {
  color: var(--color-primary);
}

.balance-stat-total {
  color: var(--color-text-secondary);
}

.balance-stat-label {
  display: block;
  font-size: 0.688rem;
  color: var(--color-text-placeholder);
  margin-top: 0.125rem;
}

@media (max-width: 768px) {
  .balance-cards {
    grid-template-columns: 1fr;
  }
}
</style>
