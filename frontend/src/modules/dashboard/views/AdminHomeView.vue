<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import dashboardService from '../services/dashboard.service'
import type { AdminDashboard } from '../types'

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
  if (!data.value || data.value.totalEmployeesCount === 0) return 0
  return Math.round((data.value.attendanceToday / data.value.totalEmployeesCount) * 100)
}

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
            <span class="kpi-value">{{ data.attendanceToday }}</span>
            <span class="kpi-label">Presentes Hoje</span>
          </div>
          <div class="kpi-detail">
            <span class="kpi-percentage">{{ getAttendancePercentage() }}%</span>
            <span class="kpi-percentage-label">do total</span>
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
            <span class="kpi-value">{{ formatCurrency(data.totalPayroll) }}</span>
            <span class="kpi-label">Ultima Folha Fechada</span>
          </div>
          <div class="kpi-detail">
            <span class="kpi-action">Ver folha &rarr;</span>
          </div>
        </div>
      </div>

      <!-- Main content grid -->
      <div class="content-grid">
        <!-- Left Column -->
        <div class="content-column">
          <!-- Department Distribution -->
          <div class="card" v-if="data.departmentDistribution.length > 0">
            <div class="card-header">
              <h3>Distribuicao por Departamento</h3>
            </div>
            <div class="card-body">
              <div class="department-list">
                <div
                  v-for="dept in data.departmentDistribution"
                  :key="dept.departmentName"
                  class="department-item"
                >
                  <div class="department-info">
                    <span class="department-name">{{ dept.departmentName }}</span>
                    <span class="department-count">{{ dept.count }}</span>
                  </div>
                  <div class="department-bar">
                    <div
                      class="department-bar-fill"
                      :style="{
                        width: `${Math.round((dept.count / data!.totalEmployeesCount) * 100)}%`,
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Overview -->
          <div class="card">
            <div class="card-header">
              <h3>Status dos Colaboradores</h3>
            </div>
            <div class="card-body">
              <div class="status-grid">
                <div class="status-item status-active">
                  <span class="status-count">{{ data.employeesByStatus.active }}</span>
                  <span class="status-label">Ativos</span>
                </div>
                <div class="status-item status-inactive">
                  <span class="status-count">{{ data.employeesByStatus.inactive }}</span>
                  <span class="status-label">Inativos</span>
                </div>
                <div class="status-item status-terminated">
                  <span class="status-count">{{ data.employeesByStatus.terminated }}</span>
                  <span class="status-label">Desligados</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="content-column">
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
  margin-bottom: 1.5rem;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.welcome-subtitle {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

/* Loading & Error */
.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  color: #e53e3e;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.kpi-card {
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kpi-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
}

.kpi-label {
  font-size: 0.75rem;
  color: #718096;
  margin-top: 0.125rem;
}

.kpi-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.kpi-badge {
  font-size: 0.688rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
}

.kpi-badge.clt {
  background: #e6fffa;
  color: #234e52;
}

.kpi-badge.pj {
  background: #fefcbf;
  color: #744210;
}

.kpi-percentage {
  font-size: 0.875rem;
  font-weight: 700;
  color: #38a169;
}

.kpi-percentage-label {
  font-size: 0.688rem;
  color: #a0aec0;
}

.kpi-action {
  font-size: 0.75rem;
  color: #667eea;
  font-weight: 500;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.content-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.card-link:hover {
  text-decoration: underline;
}

.card-body {
  padding: 1rem 1.25rem;
}

.empty-state {
  text-align: center;
  padding: 1.5rem 0;
  color: #a0aec0;
  font-size: 0.813rem;
}

/* Department Distribution */
.department-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.department-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.department-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.department-name {
  font-size: 0.813rem;
  color: #4a5568;
  font-weight: 500;
}

.department-count {
  font-size: 0.813rem;
  color: #718096;
  font-weight: 600;
}

.department-bar {
  height: 6px;
  background: #edf2f7;
  border-radius: 3px;
  overflow: hidden;
}

.department-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  min-width: 4px;
  transition: width 0.3s ease;
}

/* Status Grid */
.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  gap: 0.25rem;
}

.status-active { background: #f0fff4; }
.status-inactive { background: #fffff0; }
.status-terminated { background: #fff5f5; }

.status-count {
  font-size: 1.5rem;
  font-weight: 700;
}

.status-active .status-count { color: #22543d; }
.status-inactive .status-count { color: #744210; }
.status-terminated .status-count { color: #742a2a; }

.status-label {
  font-size: 0.688rem;
  color: #718096;
  font-weight: 500;
}

/* Leave List */
.leave-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.leave-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  background: #fafbfc;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.leave-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.leave-name {
  font-size: 0.813rem;
  font-weight: 600;
  color: #2d3748;
}

.leave-dept {
  font-size: 0.688rem;
  color: #a0aec0;
}

.leave-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.leave-type {
  font-size: 0.688rem;
  font-weight: 600;
  color: #667eea;
  background: #ebf4ff;
  padding: 0.125rem 0.5rem;
  border-radius: 8px;
}

.leave-dates {
  font-size: 0.688rem;
  color: #718096;
}

.leave-days {
  font-size: 0.688rem;
  color: #a0aec0;
}

/* Hire List */
.hire-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hire-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.hire-item:hover {
  background: #f7fafc;
}

.hire-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.hire-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.hire-name {
  font-size: 0.813rem;
  font-weight: 600;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hire-position {
  font-size: 0.688rem;
  color: #a0aec0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hire-date {
  font-size: 0.688rem;
  color: #a0aec0;
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
