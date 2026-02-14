<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import attendanceService from '../services/attendance.service'
import type { TimeEntry } from '../types'
import { formatDate, formatTime, formatMinutesToHours } from '@/utils/formatters'
import { useApiError } from '@/composables/useApiError'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { DataTableColumn } from '@/components/common/types'

const { error, handleError, clearError } = useApiError()

// Estado
const isLoading = ref(false)
const clockError = ref('')
const currentTime = ref('')
const currentDate = ref('')
const todayEntry = ref<TimeEntry | null>(null)
const recentEntries = ref<TimeEntry[]>([])
const clockingAction = ref('')

let clockInterval: ReturnType<typeof setInterval> | null = null

/**
 * Colunas da tabela de registros recentes
 */
const recentColumns: DataTableColumn[] = [
  { key: 'date', label: 'Data' },
  { key: 'clockIn', label: 'Entrada' },
  { key: 'lunchStart', label: 'Saida Almoco' },
  { key: 'lunchEnd', label: 'Volta Almoco' },
  { key: 'clockOut', label: 'Saida' },
  { key: 'totalWorkedMinutes', label: 'Total', align: 'right' },
  { key: 'type', label: 'Tipo' },
  { key: 'lateStatus', label: 'Atraso' },
]

/**
 * Atualiza relogio digital
 */
function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  currentDate.value = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Carrega dados do dia
 */
async function loadData() {
  try {
    isLoading.value = true
    clearError()
    const [today, recent] = await Promise.all([
      attendanceService.getToday(),
      attendanceService.getRecent(),
    ])
    todayEntry.value = today
    recentEntries.value = recent
  } catch (err: unknown) {
    handleError(err, 'Erro ao carregar registros de ponto.')
  } finally {
    isLoading.value = false
  }
}

/**
 * Mapeia tipo de acao para funcao do service
 */
function getClockFunction(type: string): (() => Promise<TimeEntry>) | null {
  switch (type) {
    case 'clock_in': return () => attendanceService.clockIn()
    case 'lunch_start': return () => attendanceService.lunchStart()
    case 'lunch_end': return () => attendanceService.lunchEnd()
    case 'clock_out': return () => attendanceService.clockOut()
    default: return null
  }
}

/**
 * Registra acao de ponto
 */
async function handleClockAction(type: 'clock_in' | 'lunch_start' | 'lunch_end' | 'clock_out') {
  const fn = getClockFunction(type)
  if (!fn) return

  try {
    clockingAction.value = type
    clockError.value = ''
    const entry = await fn()
    todayEntry.value = entry
    await loadData()
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string } } }
    clockError.value = axiosErr.response?.data?.message || 'Erro ao registrar ponto.'
  } finally {
    clockingAction.value = ''
  }
}

/**
 * Verifica se botao deve estar desabilitado
 */
function isActionDisabled(type: string): boolean {
  if (!todayEntry.value) return type !== 'clock_in'
  const entry = todayEntry.value
  switch (type) {
    case 'clock_in': return !!entry.clockIn
    case 'lunch_start': return !entry.clockIn || !!entry.lunchStart
    case 'lunch_end': return !entry.lunchStart || !!entry.lunchEnd
    case 'clock_out': return !entry.clockIn || !!entry.clockOut
    default: return false
  }
}

/**
 * Retorna horario registrado para acao
 */
function getRecordedTime(type: string): string | null {
  if (!todayEntry.value) return null
  const entry = todayEntry.value
  switch (type) {
    case 'clock_in': return entry.clockIn || null
    case 'lunch_start': return entry.lunchStart || null
    case 'lunch_end': return entry.lunchEnd || null
    case 'clock_out': return entry.clockOut || null
    default: return null
  }
}

const clockActions = [
  { type: 'clock_in' as const, label: 'Entrada' },
  { type: 'lunch_start' as const, label: 'Saida Almoco' },
  { type: 'lunch_end' as const, label: 'Volta Almoco' },
  { type: 'clock_out' as const, label: 'Saida' },
]

/**
 * Retorna label do tipo de registro
 */
function typeLabel(type: string): string {
  const map: Record<string, string> = {
    regular: 'Regular',
    overtime: 'Hora Extra',
    absence: 'Falta',
    holiday: 'Feriado',
  }
  return map[type] || type
}

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
  loadData()
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})
</script>

<template>
  <div class="attendance-view">
    <div class="page-header">
      <h1 class="page-title">Registro de Ponto</h1>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- Relogio e acoes -->
    <div class="clock-card">
      <div class="clock-display">
        <span class="clock-time">{{ currentTime }}</span>
        <span class="clock-date">{{ currentDate }}</span>
      </div>

      <div v-if="clockError" class="alert alert-error alert-small">{{ clockError }}</div>

      <div class="clock-actions">
        <button
          v-for="action in clockActions"
          :key="action.type"
          class="clock-btn"
          :class="{
            'clock-btn-done': getRecordedTime(action.type),
            'clock-btn-loading': clockingAction === action.type
          }"
          :disabled="isActionDisabled(action.type) || !!clockingAction"
          @click="handleClockAction(action.type)"
        >
          <span class="clock-btn-label">{{ action.label }}</span>
          <span v-if="getRecordedTime(action.type)" class="clock-btn-time">
            {{ formatTime(getRecordedTime(action.type)!) }}
          </span>
          <span v-else-if="clockingAction === action.type" class="clock-btn-time">
            Registrando...
          </span>
        </button>
      </div>
    </div>

    <!-- Registros recentes -->
    <div class="recent-section">
      <h2 class="section-title">Ultimos 7 dias</h2>

      <DataTable
        :columns="recentColumns"
        :data="(recentEntries as unknown as Record<string, unknown>[])"
        :loading="isLoading"
        emptyMessage="Nenhum registro encontrado"
        emptyDescription="Nenhum registro de ponto nos ultimos 7 dias."
      >
        <template #cell-date="{ row }">
          {{ formatDate((row as any).date) }}
        </template>

        <template #cell-clockIn="{ row }">
          {{ formatTime((row as any).clockIn) }}
        </template>

        <template #cell-lunchStart="{ row }">
          {{ formatTime((row as any).lunchStart) }}
        </template>

        <template #cell-lunchEnd="{ row }">
          {{ formatTime((row as any).lunchEnd) }}
        </template>

        <template #cell-clockOut="{ row }">
          {{ formatTime((row as any).clockOut) }}
        </template>

        <template #cell-totalWorkedMinutes="{ row }">
          <span class="td-total">{{ formatMinutesToHours((row as any).totalWorkedMinutes) }}</span>
        </template>

        <template #cell-type="{ row }">
          <StatusBadge :status="typeLabel((row as any).type)" />
        </template>

        <!-- F1.2: Indicador visual de atraso -->
        <template #cell-lateStatus="{ row }">
          <StatusBadge
            v-if="(row as any).isLate"
            :status="`Atrasado ${(row as any).lateMinutes}min`"
            variant="danger"
          />
          <span v-else class="no-late">-</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
.attendance-view {
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

/* Relogio */
.clock-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
}

.clock-display {
  margin-bottom: 1.5rem;
}

.clock-time {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: #1a202c;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

.clock-date {
  display: block;
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.25rem;
  text-transform: capitalize;
}

.clock-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  max-width: 700px;
  margin: 0 auto;
}

.clock-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
}

.clock-btn:hover:not(:disabled) {
  border-color: #667eea;
  background: #ebf8ff;
}

.clock-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clock-btn-done {
  border-color: #38a169;
  background: #f0fff4;
}

.clock-btn-done:disabled {
  opacity: 0.85;
}

.clock-btn-loading {
  border-color: #d69e2e;
  background: #fffff0;
}

.clock-btn-label {
  font-size: 0.813rem;
  font-weight: 600;
  color: #4a5568;
}

.clock-btn-time {
  font-size: 0.875rem;
  font-weight: 700;
  color: #38a169;
}

.clock-btn-loading .clock-btn-time {
  color: #d69e2e;
}

/* Alertas */
.alert { padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.875rem; margin-bottom: 1rem; }
.alert-error { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; }
.alert-small { margin-bottom: 1rem; }

/* Secao recentes */
.recent-section {
  margin-top: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 1rem;
}

/* Total */
.td-total {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* Sem atraso */
.no-late {
  color: #a0aec0;
  font-size: 0.813rem;
}

/* Responsivo */
@media (max-width: 768px) {
  .clock-actions {
    grid-template-columns: repeat(2, 1fr);
  }

  .clock-time {
    font-size: 2.25rem;
  }

  .clock-card {
    padding: 1.5rem 1rem;
  }
}
</style>
