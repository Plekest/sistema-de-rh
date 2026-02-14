<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import dashboardService from '../services/dashboard.service'
import type { AdminDashboard } from '../types'
import BarChart from '@/components/common/BarChart.vue'
import DonutChart from '@/components/common/DonutChart.vue'

const router = useRouter()
const authStore = useAuthStore()

const data = ref<AdminDashboard | null>(null)
const isLoading = ref(true)
const error = ref('')

const LEAVE_TYPE_LABELS: Record<string, string> = {
  vacation: 'Ferias',
  medical: 'Licenca Medica',
  maternity: 'Licenca Maternidade',
  paternity: 'Licenca Paternidade',
  bereavement: 'Licenca Luto',
  wedding: 'Licenca Casamento',
  other: 'Outros',
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function getAttendancePercentage(): number {
  if (!data.value || data.value.activeEmployees === 0) return 0
  return Math.round((data.value.todayAttendance.present / data.value.activeEmployees) * 100)
}

const statusDonutData = computed(() => {
  if (!data.value) return []
  return [
    {
      label: 'Ativos',
      value: data.value.employeesByStatus.active,
      color: 'var(--color-success)',
    },
    {
      label: 'Inativos',
      value: data.value.employeesByStatus.inactive,
      color: 'var(--color-warning)',
    },
    {
      label: 'Desligados',
      value: data.value.employeesByStatus.terminated,
      color: 'var(--color-danger)',
    },
  ]
})

const departmentBarData = computed(() => {
  if (!data.value) return []
  return data.value.departmentDistribution.map((dept) => ({
    label: dept.departmentName,
    value: dept.count,
  }))
})

const attendanceDonutData = computed(() => {
  if (!data.value) return []
  return [
    {
      label: 'Presentes',
      value: data.value.todayAttendance.present,
      color: 'var(--color-success)',
    },
    {
      label: 'Atrasados',
      value: data.value.todayAttendance.late,
      color: 'var(--color-warning)',
    },
    {
      label: 'Ausentes',
      value: data.value.todayAttendance.absent,
      color: 'var(--color-danger)',
    },
  ]
})

onMounted(async () => {
  try {
    data.value = await dashboardService.getAdminDashboard()
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Erro ao carregar dashboard'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="admin-home">
    <!-- Welcome -->
    <div class="welcome-section">
      <div>
        <h1 class="welcome-title">Bom dia, {{ authStore.user?.fullName?.split(' ')[0] }}!</h1>
        <p class="welcome-subtitle">Aqui esta o resumo do seu sistema de RH</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando dashboard...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <template v-else-if="data">
      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card" role="link" tabindex="0" @click="router.push('/employees')" @keydown.enter="router.push('/employees')">
          <div class="kpi-content">
            <span class="kpi-value">{{ data.totalEmployees }}</span>
            <span class="kpi-label">Colaboradores Ativos</span>
          </div>
          <div class="kpi-detail">
            <span class="kpi-badge clt">{{ data.employeesByType.clt }} CLT</span>
            <span class="kpi-badge pj">{{ data.employeesByType.pj }} PJ</span>
          </div>
        </div>

        <div class="kpi-card" role="link" tabindex="0" @click="router.push('/attendance')" @keydown.enter="router.push('/attendance')">
          <div class="kpi-content">
            <span class="kpi-value">{{ data.todayAttendance.present }}</span>
            <span class="kpi-label">Presentes Hoje</span>
          </div>
          <div class="kpi-detail">
            <span class="kpi-percentage">{{ getAttendancePercentage() }}%</span>
            <span class="kpi-percentage-label">{{ data.todayAttendance.absent }} ausentes, {{ data.todayAttendance.late }} atrasados</span>
          </div>
        </div>

        <div class="kpi-card" role="link" tabindex="0" @click="router.push('/leave')" @keydown.enter="router.push('/leave')">
          <div class="kpi-content">
            <span class="kpi-value">{{ data.pendingLeaves }}</span>
            <span class="kpi-label">Licencas Pendentes</span>
          </div>
          <div class="kpi-detail">
            <span class="kpi-action">Aprovar &rarr;</span>
          </div>
        </div>

        <div class="kpi-card" role="link" tabindex="0" @click="router.push('/payroll')" @keydown.enter="router.push('/payroll')">
          <div class="kpi-content">
            <span class="kpi-value">{{ formatCurrency(data.monthlyPayroll.totalNet) }}</span>
            <span class="kpi-label">Ultima Folha Fechada</span>
          </div>
          <div class="kpi-detail">
            <span class="kpi-action" v-if="data.monthlyPayroll.processed">Ver folha &rarr;</span>
            <span class="kpi-percentage-label" v-else>Nenhuma folha processada</span>
          </div>
        </div>
      </div>

      <!-- Main content grid -->
      <div class="content-grid">
        <!-- Left Column -->
        <div class="content-column">
          <!-- Department Distribution -->
          <div class="card">
            <div class="card-header">
              <h3>Distribuicao por Departamento</h3>
            </div>
            <div class="card-body">
              <BarChart :data="departmentBarData" />
            </div>
          </div>

          <!-- Status Overview -->
          <div class="card">
            <div class="card-header">
              <h3>Status dos Colaboradores</h3>
            </div>
            <div class="card-body">
              <DonutChart
                :data="statusDonutData"
                :size="180"
                :center-value="data.totalEmployees.toString()"
                center-label="Total"
              />
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="content-column">
          <!-- Attendance Today -->
          <div class="card">
            <div class="card-header">
              <h3>Presenca Hoje</h3>
            </div>
            <div class="card-body">
              <DonutChart
                :data="attendanceDonutData"
                :size="180"
                :center-value="getAttendancePercentage().toString() + '%'"
                center-label="Presentes"
              />
            </div>
          </div>

          <!-- Upcoming Leaves -->
          <div class="card">
            <div class="card-header">
              <h3>Proximas Ausencias</h3>
              <button class="card-link" @click="router.push('/leave')">Ver todas</button>
            </div>
            <div class="card-body">
              <div v-if="data.upcomingLeaves.length === 0" class="empty-state">
                Nenhuma ausencia programada nos proximos 30 dias
              </div>
              <div v-else class="leave-list">
                <div
                  v-for="leave in data.upcomingLeaves"
                  :key="leave.id"
                  class="leave-item"
                >
                  <div class="leave-info">
                    <span class="leave-name">{{ leave.employeeName }}</span>
                    <span class="leave-dept">{{ leave.department }}</span>
                  </div>
                  <div class="leave-details">
                    <span class="leave-type">{{ LEAVE_TYPE_LABELS[leave.type] || leave.type }}</span>
                    <span class="leave-dates">
                      {{ formatDate(leave.startDate) }} - {{ formatDate(leave.endDate) }}
                    </span>
                    <span class="leave-days">{{ leave.daysCount }} dias</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Hires -->
          <div class="card">
            <div class="card-header">
              <h3>Admissoes Recentes</h3>
              <button class="card-link" @click="router.push('/employees')">Ver todos</button>
            </div>
            <div class="card-body">
              <div v-if="data.recentHires.length === 0" class="empty-state">
                Nenhuma admissao recente
              </div>
              <div v-else class="hire-list">
                <div
                  v-for="hire in data.recentHires"
                  :key="hire.id"
                  class="hire-item"
                  @click="router.push(`/employees/${hire.id}`)"
                >
                  <div class="hire-avatar">
                    {{ hire.fullName.charAt(0) }}
                  </div>
                  <div class="hire-info">
                    <span class="hire-name">{{ hire.fullName }}</span>
                    <span class="hire-position">{{ hire.position }} - {{ hire.department }}</span>
                  </div>
                  <span class="hire-date">{{ formatDate(hire.hireDate) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.admin-home {
  max-width: 1200px;
  margin: 0 auto;
}

/* Welcome Section */
.welcome-section {
  margin-bottom: var(--space-12);
}

.welcome-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.welcome-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
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

.error-state {
  color: var(--color-danger);
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
  margin-bottom: var(--space-12);
}

.kpi-card {
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

.kpi-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.kpi-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.kpi-detail {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.kpi-badge {
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
}

.kpi-badge.clt {
  background: var(--color-success-light);
  color: var(--color-success-darker);
}

.kpi-badge.pj {
  background: var(--color-warning-bg);
  color: var(--color-warning-darker);
}

.kpi-percentage {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-success);
}

.kpi-percentage-label {
  font-size: var(--font-size-2xs);
  color: var(--color-text-placeholder);
}

.kpi-action {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
}

.content-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

/* Card */
.card {
  background: var(--color-bg-card);
  border-radius: var(--card-border-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-8) var(--space-10);
  border-bottom: var(--border-width) solid var(--color-border-light);
}

.card-header h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
}

.card-link {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  padding: 0;
}

.card-link:hover {
  text-decoration: underline;
}

.card-body {
  padding: var(--space-8) var(--space-10);
}

.empty-state {
  text-align: center;
  padding: var(--space-12) 0;
  color: var(--color-text-placeholder);
  font-size: var(--font-size-sm);
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
  align-items: flex-start;
  padding: var(--space-6);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-lg);
  border-left: 3px solid var(--color-primary);
}

.leave-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.leave-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.leave-dept {
  font-size: var(--font-size-2xs);
  color: var(--color-text-placeholder);
}

.leave-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
}

.leave-type {
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--radius-lg);
}

.leave-dates {
  font-size: var(--font-size-2xs);
  color: var(--color-text-muted);
}

.leave-days {
  font-size: var(--font-size-2xs);
  color: var(--color-text-placeholder);
}

/* Hire List */
.hire-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.hire-item {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.hire-item:hover {
  background: var(--color-bg-hover);
}

.hire-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-primary-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.hire-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.hire-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hire-position {
  font-size: var(--font-size-2xs);
  color: var(--color-text-placeholder);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hire-date {
  font-size: var(--font-size-2xs);
  color: var(--color-text-placeholder);
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .welcome-title {
    font-size: 1.25rem;
  }
}
</style>
