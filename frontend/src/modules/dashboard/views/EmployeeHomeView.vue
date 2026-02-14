<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import dashboardService from '../services/dashboard.service'
import attendanceService from '@/modules/attendance/services/attendance.service'
import type { EmployeeDashboard } from '../types'
import type { TimeEntry } from '@/modules/attendance/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

const data = ref<EmployeeDashboard | null>(null)
const isLoading = ref(true)
const error = ref('')

// Clock / Ponto
const todayEntry = ref<TimeEntry | null>(null)
const clockLoading = ref(false)
const clockError = ref('')
const currentTime = ref('')
let clockInterval: ReturnType<typeof setInterval> | null = null

function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const nextAction = computed<{ type: string; label: string; icon: string } | null>(() => {
  const entry = todayEntry.value
  if (!entry || !entry.clockIn) return { type: 'clock_in', label: 'Registrar Entrada', icon: '>' }
  if (!entry.lunchStart) return { type: 'lunch_start', label: 'Saida Almoco', icon: '||' }
  if (!entry.lunchEnd) return { type: 'lunch_end', label: 'Volta Almoco', icon: '>' }
  if (!entry.clockOut) return { type: 'clock_out', label: 'Registrar Saida', icon: '[]' }
  return null
})

const clockSteps = computed(() => {
  const entry = todayEntry.value
  return [
    { key: 'clockIn', label: 'Entrada', time: entry?.clockIn, done: !!entry?.clockIn },
    { key: 'lunchStart', label: 'Almoco', time: entry?.lunchStart, done: !!entry?.lunchStart },
    { key: 'lunchEnd', label: 'Volta', time: entry?.lunchEnd, done: !!entry?.lunchEnd },
    { key: 'clockOut', label: 'Saida', time: entry?.clockOut, done: !!entry?.clockOut },
  ]
})

function formatClockTime(isoStr: string | undefined | null): string {
  if (!isoStr) return '--:--'
  const date = new Date(isoStr)
  if (isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

async function handleClockAction() {
  const action = nextAction.value
  if (!action) return

  const fnMap: Record<string, () => Promise<TimeEntry>> = {
    clock_in: () => attendanceService.clockIn(),
    lunch_start: () => attendanceService.lunchStart(),
    lunch_end: () => attendanceService.lunchEnd(),
    clock_out: () => attendanceService.clockOut(),
  }

  const fn = fnMap[action.type]
  if (!fn) return

  try {
    clockLoading.value = true
    clockError.value = ''
    todayEntry.value = await fn()
  } catch (err: any) {
    clockError.value = err?.response?.data?.message || 'Erro ao registrar ponto'
  } finally {
    clockLoading.value = false
  }
}

async function loadTodayEntry() {
  try {
    todayEntry.value = await attendanceService.getToday()
  } catch {
    // silently fail - widget is secondary
  }
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  vacation: 'Ferias',
  medical: 'Licenca Medica',
  maternity: 'Licenca Maternidade',
  paternity: 'Licenca Paternidade',
  bereavement: 'Licenca Luto',
  wedding: 'Licenca Casamento',
  other: 'Outros',
}

const LEAVE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  in_progress: 'Em andamento',
}

const HISTORY_TYPE_LABELS: Record<string, string> = {
  hire: 'Admissao',
  promotion: 'Promocao',
  transfer: 'Transferencia',
  salary_change: 'Salario',
  warning: 'Advertencia',
  note: 'Observacao',
  termination: 'Desligamento',
  document: 'Documento',
  other: 'Evento',
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function getMonthName(month: number): string {
  const months = [
    '', 'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return months[month] || ''
}

onMounted(async () => {
  updateClock()
  clockInterval = setInterval(updateClock, 30000)
  loadTodayEntry()
  try {
    data.value = await dashboardService.getEmployeeDashboard()
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Erro ao carregar dashboard'
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})
</script>

<template>
  <div class="employee-home">
    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner text="Carregando painel..." />
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <template v-else-if="data">
      <!-- Profile Card -->
      <div class="profile-card">
        <div class="profile-avatar">
          {{ data.employee.fullName.charAt(0) }}
        </div>
        <div class="profile-info">
          <h1 class="profile-name">Ola, {{ data.employee.fullName.split(' ')[0] }}!</h1>
          <p class="profile-details">
            {{ data.employee.position }} &middot; {{ data.employee.department }}
          </p>
          <div class="profile-meta">
            <span class="profile-type" :class="data.employee.type">
              {{ data.employee.type.toUpperCase() }}
            </span>
            <span class="profile-since">
              Desde {{ formatDate(data.employee.hireDate) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Clock Widget -->
      <div v-if="authStore.permissions?.attendance" class="clock-widget">
        <div class="clock-widget-left">
          <span class="clock-widget-time">{{ currentTime }}</span>
          <div class="clock-steps">
            <div
              v-for="step in clockSteps"
              :key="step.key"
              class="clock-step"
              :class="{ done: step.done }"
            >
              <span class="clock-step-dot"></span>
              <span class="clock-step-label">{{ step.label }}</span>
              <span class="clock-step-time">{{ formatClockTime(step.time) }}</span>
            </div>
          </div>
        </div>
        <div class="clock-widget-right">
          <button
            v-if="nextAction"
            class="clock-widget-btn"
            :class="{ loading: clockLoading }"
            :disabled="clockLoading"
            @click="handleClockAction"
          >
            <span class="clock-widget-btn-text">
              {{ clockLoading ? 'Registrando...' : nextAction.label }}
            </span>
          </button>
          <div v-else class="clock-widget-done">
            <span class="clock-widget-done-text">Ponto completo</span>
          </div>
          <span v-if="clockError" class="clock-widget-error">{{ clockError }}</span>
        </div>
      </div>

      <!-- Mobile FAB - Clock -->
      <button
        v-if="authStore.permissions?.attendance && nextAction"
        class="clock-fab"
        :disabled="clockLoading"
        @click="handleClockAction"
      >
        <span class="clock-fab-label">{{ nextAction.label }}</span>
      </button>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-card" role="link" tabindex="0" @click="router.push('/attendance')" @keydown.enter="router.push('/attendance')">
          <div class="stat-content">
            <span class="stat-value">{{ data.attendanceThisMonth.days }} dias</span>
            <span class="stat-label">Presenca este mes</span>
            <span class="stat-extra">{{ data.attendanceThisMonth.hoursTotal }} trabalhadas</span>
          </div>
        </div>

        <div class="stat-card" role="link" tabindex="0" @click="router.push('/leave')" @keydown.enter="router.push('/leave')">
          <div class="stat-content">
            <span class="stat-value">{{ data.myLeaves.pending }}</span>
            <span class="stat-label">Solicitacoes Pendentes</span>
            <span class="stat-extra">{{ data.myLeaves.approved }} aprovadas</span>
          </div>
        </div>

        <div class="stat-card" role="link" tabindex="0" @click="router.push('/benefits')" @keydown.enter="router.push('/benefits')">
          <div class="stat-content">
            <span class="stat-value">{{ data.myBenefits }}</span>
            <span class="stat-label">Beneficios Ativos</span>
            <span class="stat-extra">Ver detalhes &rarr;</span>
          </div>
        </div>

        <div class="stat-card" role="link" tabindex="0" @click="router.push('/payroll')" @keydown.enter="router.push('/payroll')">
          <div class="stat-content">
            <template v-if="data.lastPaySlip">
              <span class="stat-value">{{ formatCurrency(Number(data.lastPaySlip.netSalary)) }}</span>
              <span class="stat-label">Ultimo Contracheque</span>
              <span class="stat-extra">
                {{ getMonthName(data.lastPaySlip.month) }}/{{ data.lastPaySlip.year }}
              </span>
            </template>
            <template v-else>
              <span class="stat-value">--</span>
              <span class="stat-label">Nenhum contracheque</span>
              <span class="stat-extra">Ainda sem registros</span>
            </template>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Upcoming Leaves -->
        <div class="card">
          <div class="card-header">
            <h3>Minhas Proximas Licencas</h3>
            <button class="card-link" @click="router.push('/leave')">Ver todas</button>
          </div>
          <div class="card-body">
            <div v-if="data.upcomingLeaves.length === 0" class="empty-state">
              Nenhuma licenca programada nos proximos 60 dias
            </div>
            <div v-else class="leave-list">
              <div
                v-for="leave in data.upcomingLeaves"
                :key="leave.id"
                class="leave-item"
              >
                <div class="leave-left">
                  <span class="leave-type-badge">
                    {{ LEAVE_TYPE_LABELS[leave.type] || leave.type }}
                  </span>
                  <span class="leave-dates">
                    {{ formatDate(leave.startDate) }} - {{ formatDate(leave.endDate) }}
                  </span>
                </div>
                <div class="leave-right">
                  <span class="leave-days">{{ leave.daysCount }} dias</span>
                  <span class="leave-status" :class="leave.status">
                    {{ LEAVE_STATUS_LABELS[leave.status] || leave.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent History -->
        <div class="card">
          <div class="card-header">
            <h3>Historico Recente</h3>
            <button class="card-link" @click="router.push('/history')">Ver completo</button>
          </div>
          <div class="card-body">
            <div v-if="data.recentHistory.length === 0" class="empty-state">
              Nenhum evento recente
            </div>
            <div v-else class="history-list">
              <div
                v-for="entry in data.recentHistory"
                :key="entry.id"
                class="history-item"
              >
                <div class="history-dot" :class="entry.type"></div>
                <div class="history-content">
                  <span class="history-title">{{ entry.title }}</span>
                  <div class="history-meta">
                    <span class="history-type-badge">
                      {{ HISTORY_TYPE_LABELS[entry.type] || entry.type }}
                    </span>
                    <span class="history-date">{{ formatDate(entry.eventDate) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Last Pay Slip Summary -->
      <div v-if="data.lastPaySlip" class="payslip-card" role="link" tabindex="0" @click="router.push('/payroll')" @keydown.enter="router.push('/payroll')">
        <div class="payslip-header">
          <h3>Ultimo Contracheque</h3>
          <span class="payslip-period">
            {{ getMonthName(data.lastPaySlip.month) }}/{{ data.lastPaySlip.year }}
          </span>
        </div>
        <div class="payslip-values">
          <div class="payslip-item">
            <span class="payslip-label">Bruto</span>
            <span class="payslip-amount gross">
              {{ formatCurrency(Number(data.lastPaySlip.grossSalary)) }}
            </span>
          </div>
          <div class="payslip-divider"></div>
          <div class="payslip-item">
            <span class="payslip-label">Liquido</span>
            <span class="payslip-amount net">
              {{ formatCurrency(Number(data.lastPaySlip.netSalary)) }}
            </span>
          </div>
        </div>
        <span class="payslip-action">Ver detalhes do contracheque &rarr;</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.employee-home {
  max-width: var(--max-width-lg);
  margin: 0 auto;
}

/* Loading & Error */
.loading-state,
.error-state {
  text-align: center;
  padding: var(--space-24);
  color: var(--color-text-muted);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
  margin: 0 auto var(--space-8);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state { color: var(--color-danger); }

/* Profile Card */
.profile-card {
  background: var(--color-primary-gradient);
  border-radius: var(--radius-2xl);
  padding: var(--space-16);
  display: flex;
  align-items: center;
  gap: var(--space-12);
  margin-bottom: var(--space-12);
  color: white;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-2) 0;
}

.profile-details {
  font-size: var(--font-size-base);
  margin: 0 0 var(--space-4) 0;
  opacity: 0.9;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.profile-type {
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-bold);
  padding: var(--space-1) var(--space-4);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.2);
}

.profile-since {
  font-size: var(--font-size-xs);
  opacity: 0.8;
}

/* Clock Widget */
.clock-widget {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-8) var(--space-12);
  margin-bottom: var(--space-12);
  gap: var(--space-12);
}

.clock-widget-left {
  display: flex;
  align-items: center;
  gap: var(--space-12);
  flex: 1;
  min-width: 0;
}

.clock-widget-time {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.clock-steps {
  display: flex;
  gap: var(--space-8);
  flex: 1;
  min-width: 0;
}

.clock-step {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.clock-step-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  flex-shrink: 0;
}

.clock-step.done .clock-step-dot {
  background: var(--color-success);
}

.clock-step-label {
  font-size: var(--font-size-2xs);
  color: var(--color-text-placeholder);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.clock-step.done .clock-step-label {
  color: var(--color-text-tertiary);
}

.clock-step-time {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.clock-step.done .clock-step-time {
  color: var(--color-success);
}

.clock-widget-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-3);
  flex-shrink: 0;
}

.clock-widget-btn {
  padding: var(--space-6) var(--space-16);
  background: var(--color-primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.clock-widget-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-primary);
}

.clock-widget-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.clock-widget-btn.loading {
  background: linear-gradient(135deg, var(--color-warning) 0%, var(--color-warning-dark) 100%);
}

.clock-widget-done {
  padding: var(--space-6) var(--space-12);
  background: var(--color-success-light);
  border: 2px solid var(--color-success-lighter);
  border-radius: var(--radius-lg);
}

.clock-widget-done-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-success-dark);
}

.clock-widget-error {
  font-size: var(--font-size-2xs);
  color: var(--color-danger);
}

/* Mobile FAB (floating action button) */
.clock-fab {
  display: none;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
  margin-bottom: var(--space-12);
}

.stat-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-2xl);
  padding: var(--space-10);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.stat-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.stat-label {
  font-size: var(--font-size-2xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.stat-extra {
  font-size: var(--font-size-2xs);
  color: var(--color-text-placeholder);
  margin-top: var(--space-2);
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Card */
.card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f0f5;
}

.card-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.card-link {
  font-size: 0.75rem;
  color: #667eea;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  padding: 0;
}

.card-link:hover { text-decoration: underline; }

.card-body { padding: 1rem 1.25rem; }

.empty-state {
  text-align: center;
  padding: 1.5rem 0;
  color: #a0aec0;
  font-size: 0.813rem;
}

/* Leave List */
.leave-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.leave-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-lg);
}

.leave-left {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.leave-type-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.leave-dates {
  font-size: var(--font-size-2xs);
  color: var(--color-text-placeholder);
}

.leave-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.leave-days {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.leave-status {
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--radius-lg);
  text-transform: uppercase;
}

.leave-status.pending {
  background: var(--color-warning-bg);
  color: var(--color-warning-darker);
}

.leave-status.approved,
.leave-status.in_progress {
  background: var(--color-success-lighter);
  color: var(--color-success-darker);
}

/* History List */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.history-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-6);
  padding: var(--space-5) 0;
  border-bottom: var(--border-width) solid var(--color-bg-hover);
}

.history-item:last-child { border-bottom: none; }

.history-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-text-placeholder);
  margin-top: var(--space-3);
  flex-shrink: 0;
}

.history-dot.hire { background: var(--color-success); }
.history-dot.promotion { background: var(--color-primary); }
.history-dot.transfer { background: var(--color-warning); }
.history-dot.salary_change { background: var(--color-secondary); }
.history-dot.termination { background: var(--color-danger); }
.history-dot.document { background: var(--color-info); }
.history-dot.other { background: var(--color-text-placeholder); }

.history-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
}

.history-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.history-type-badge {
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 1px var(--space-3);
  border-radius: var(--radius-md);
}

.history-date {
  font-size: var(--font-size-2xs);
  color: var(--color-text-placeholder);
}

/* Pay Slip Card */
.payslip-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  padding: var(--space-10);
  cursor: pointer;
  transition: var(--transition-fast);
}

.payslip-card:hover {
  box-shadow: var(--shadow-lg);
}

.payslip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8);
}

.payslip-header h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
}

.payslip-period {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  background: var(--color-primary-light);
  padding: var(--space-2) var(--space-6);
  border-radius: var(--radius-2xl);
}

.payslip-values {
  display: flex;
  align-items: center;
  gap: var(--space-16);
  margin-bottom: var(--space-6);
}

.payslip-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.payslip-label {
  font-size: var(--font-size-2xs);
  color: var(--color-text-placeholder);
  font-weight: var(--font-weight-medium);
}

.payslip-amount {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
}

.payslip-amount.gross { color: var(--color-text-tertiary); }
.payslip-amount.net { color: var(--color-success); }

.payslip-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border);
}

.payslip-action {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

/* Responsive */
@media (max-width: 768px) {
  .employee-home {
    padding-bottom: 5rem;
  }

  .profile-card {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }

  .profile-meta {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .profile-name {
    font-size: 1.25rem;
  }

  .payslip-values {
    gap: 1rem;
  }

  .payslip-amount {
    font-size: 1.25rem;
  }

  /* Clock widget mobile */
  .clock-widget {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .clock-widget-left {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .clock-steps {
    width: 100%;
    justify-content: space-between;
  }

  .clock-widget-right {
    width: 100%;
    align-items: stretch;
  }

  .clock-widget-btn {
    text-align: center;
    padding: 1rem;
    font-size: 1rem;
  }

  .clock-widget-done {
    text-align: center;
  }

  /* Show mobile FAB */
  .clock-fab {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: var(--space-10);
    left: 50%;
    transform: translateX(-50%);
    z-index: var(--z-sticky);
    padding: var(--space-6) var(--space-16);
    background: var(--color-primary-gradient);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    box-shadow: var(--shadow-primary-lg);
    transition: all var(--transition-base);
    white-space: nowrap;
  }

  .clock-fab:hover:not(:disabled) {
    box-shadow: 0 6px 24px var(--color-primary-gradient-hover-shadow);
    transform: translateX(-50%) translateY(-2px);
  }

  .clock-fab:active:not(:disabled) {
    transform: translateX(-50%) translateY(0);
  }

  .clock-fab:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .clock-steps {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .clock-step {
    flex: 0 0 calc(50% - 0.25rem);
  }
}
</style>
