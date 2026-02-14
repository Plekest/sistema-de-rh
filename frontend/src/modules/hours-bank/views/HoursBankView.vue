<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import hoursBankService from '../services/hours-bank.service'
import employeeService from '@/modules/employees/services/employee.service'
import type { HoursBankEntry } from '../types'
import type { Employee } from '@/modules/employees/types'
import { formatMinutesToHours, getMonthName } from '@/utils/formatters'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const authStore = useAuthStore()

// Estado
const entries = ref<HoursBankEntry[]>([])
const employees = ref<Employee[]>([])
const isLoading = ref(false)
const error = ref('')

// Filtros
const selectedEmployee = ref<number | null>(null)
const filterYear = ref(new Date().getFullYear())

// Saldo atual
const currentBalance = ref(0)

const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

// Anos disponiveis para filtro
const availableYears = computed(() => {
  const current = new Date().getFullYear()
  const years: number[] = []
  for (let y = current; y >= current - 5; y--) {
    years.push(y)
  }
  return years
})

/**
 * Carrega registros do banco de horas
 */
async function loadEntries() {
  if (!selectedEmployee.value) {
    entries.value = []
    currentBalance.value = 0
    return
  }

  try {
    isLoading.value = true
    error.value = ''

    const params = {
      year: filterYear.value,
      limit: 50,
    }

    const [response, balance] = await Promise.all([
      hoursBankService.getAll(selectedEmployee.value, params),
      hoursBankService.getBalance(selectedEmployee.value).catch(() => null),
    ])

    entries.value = response.data

    if (balance) {
      currentBalance.value = balance.currentBalance
    } else if (entries.value.length > 0) {
      const lastEntry = entries.value[entries.value.length - 1]
      currentBalance.value = lastEntry ? lastEntry.accumulatedBalanceMinutes : 0
    } else {
      currentBalance.value = 0
    }
  } catch (err: unknown) {
    error.value = 'Erro ao carregar banco de horas.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

/**
 * Carrega colaboradores
 */
async function loadEmployees() {
  try {
    const response = await employeeService.getAll({ limit: 200, status: 'active' })
    employees.value = response.data
  } catch (err: unknown) {
    console.error('Erro ao carregar colaboradores:', err)
  }
}

/**
 * Retorna classe CSS baseada no saldo
 */
function balanceClass(minutes: number): string {
  if (minutes > 0) return 'balance-positive'
  if (minutes < 0) return 'balance-negative'
  return 'balance-zero'
}

watch([selectedEmployee, filterYear], () => {
  loadEntries()
})

onMounted(() => {
  if (isAdmin.value) {
    loadEmployees()
  } else if (authStore.employeeId) {
    selectedEmployee.value = authStore.employeeId
  }
})
</script>

<template>
  <div class="hours-bank-view">
    <div class="page-header">
      <h1 class="page-title">Banco de Horas</h1>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <div v-if="isAdmin" class="filter-group filter-grow">
        <label for="filter-emp">Colaborador</label>
        <select id="filter-emp" v-model="selectedEmployee">
          <option :value="null">Selecione um colaborador...</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.fullName }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-year">Ano</label>
        <select id="filter-year" v-model="filterYear">
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
    </div>

    <template v-if="!selectedEmployee">
      <EmptyState
        title="Selecione um colaborador"
        description="Escolha um colaborador no filtro acima para visualizar o banco de horas."
      />
    </template>

    <template v-else>
      <!-- Saldo destaque -->
      <div class="balance-card" :class="balanceClass(currentBalance)">
        <span class="balance-label">Saldo Atual</span>
        <span class="balance-value">{{ formatMinutesToHours(currentBalance) }}</span>
        <span class="balance-unit">horas</span>
      </div>

      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="isLoading" class="loading-state">
        <LoadingSpinner text="Carregando banco de horas..." />
      </div>

      <div v-else-if="entries.length > 0" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mes / Ano</th>
              <th class="th-right">Horas Esperadas</th>
              <th class="th-right">Horas Trabalhadas</th>
              <th class="th-right">Saldo</th>
              <th class="th-right">Saldo Acumulado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in entries" :key="entry.id">
              <td class="td-month">{{ getMonthName(entry.referenceMonth) }} / {{ entry.referenceYear }}</td>
              <td class="td-right">{{ formatMinutesToHours(entry.expectedMinutes) }}</td>
              <td class="td-right">{{ formatMinutesToHours(entry.workedMinutes) }}</td>
              <td class="td-right" :class="balanceClass(entry.balanceMinutes)">
                {{ formatMinutesToHours(entry.balanceMinutes) }}
              </td>
              <td class="td-right td-bold" :class="balanceClass(entry.accumulatedBalanceMinutes)">
                {{ formatMinutesToHours(entry.accumulatedBalanceMinutes) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState
        v-else
        title="Nenhum registro encontrado"
        description="Nenhum registro de banco de horas para o periodo selecionado."
      />
    </template>
  </div>
</template>

<style scoped>
.hours-bank-view {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

/* Saldo destaque */
.balance-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #a0aec0;
}

.balance-card.balance-positive {
  border-left-color: #38a169;
}

.balance-card.balance-negative {
  border-left-color: #e53e3e;
}

.balance-label {
  font-size: 0.813rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.balance-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.balance-positive .balance-value {
  color: #276749;
}

.balance-negative .balance-value {
  color: #c53030;
}

.balance-unit {
  font-size: 0.75rem;
  color: var(--color-text-muted, #718096);
}

/* Filtros */
.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  background: #fff;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
.filter-grow { flex: 1; min-width: 200px; }
.filter-group label { font-size: 0.75rem; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.025em; }
.filter-group select { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 0.875rem; color: #2d3748; background: #fff; outline: none; }
.filter-group select:focus { border-color: #667eea; }

/* Tabela */
.table-container { background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.025em; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
.data-table td { padding: 0.75rem 1rem; font-size: 0.875rem; color: #2d3748; border-bottom: 1px solid #f0f0f0; }
.data-table tbody tr:hover { background-color: #f7fafc; }

.th-right { text-align: right; }
.td-right { text-align: right; font-variant-numeric: tabular-nums; }
.td-month { font-weight: 500; }
.td-bold { font-weight: 700; }

.balance-positive { color: #276749; }
.balance-negative { color: #c53030; }
.balance-zero { color: #718096; }

/* Estados */
.alert { padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.875rem; margin-bottom: 1rem; }
.alert-error { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; }
.loading-state { text-align: center; padding: 2rem; color: #718096; font-size: 0.875rem; }
.empty-state { text-align: center; padding: 3rem 1rem; color: var(--color-text-muted, #718096); font-size: 0.875rem; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; }
.empty-state p { margin: 0; }
.empty-title { font-size: 1rem; font-weight: 600; color: #4a5568; margin: 0 0 0.5rem !important; }
.empty-description { font-size: 0.875rem; color: var(--color-text-muted, #718096); margin: 0 !important; }

@media (max-width: 768px) {
  .filters-bar { flex-direction: column; }
  .balance-value { font-size: 2rem; }
}
</style>
