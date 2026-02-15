<script setup lang="ts">
import { ref, onMounted } from 'vue'
import healthService from '../services/healthService'
import type { OccupationalExam, MedicalCertificate, HealthDashboard } from '../types'
import { EXAM_TYPE_LABELS, EXAM_STATUS_LABELS, CERTIFICATE_STATUS_LABELS } from '../types'

const activeTab = ref<'dashboard' | 'exams' | 'certificates' | 'alerts'>('dashboard')
const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const dashboard = ref<HealthDashboard | null>(null)
const exams = ref<OccupationalExam[]>([])
const certificates = ref<MedicalCertificate[]>([])

const showExamModal = ref(false)
const examForm = ref({
  employeeId: 0,
  type: 'periodic' as OccupationalExam['type'],
  examDate: '',
  expiryDate: '',
  status: 'scheduled' as OccupationalExam['status'],
})

const showCertModal = ref(false)
const certForm = ref({
  employeeId: 0,
  startDate: '',
  endDate: '',
  cidCode: '',
  cidDescription: '',
  doctorName: '',
  crm: '',
})

function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    scheduled: 'badge-info',
    completed: 'badge-success',
    expired: 'badge-danger',
    cancelled: 'badge-muted',
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
  }
  return classes[status] || 'badge-muted'
}

async function loadDashboard() {
  try {
    isLoading.value = true
    error.value = null
    dashboard.value = await healthService.getDashboard()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar dashboard'
  } finally {
    isLoading.value = false
  }
}

async function loadExams() {
  try {
    isLoading.value = true
    error.value = null
    exams.value = await healthService.getExams()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar exames'
  } finally {
    isLoading.value = false
  }
}

async function loadCertificates() {
  try {
    isLoading.value = true
    error.value = null
    certificates.value = await healthService.getCertificates()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar atestados'
  } finally {
    isLoading.value = false
  }
}

async function saveExam() {
  try {
    error.value = null
    await healthService.createExam(examForm.value)
    successMessage.value = 'Exame agendado com sucesso'
    setTimeout(() => { successMessage.value = null }, 3000)
    showExamModal.value = false
    await loadExams()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao agendar exame'
  }
}

async function saveCertificate() {
  try {
    error.value = null
    await healthService.createCertificate(certForm.value)
    successMessage.value = 'Atestado registrado com sucesso'
    setTimeout(() => { successMessage.value = null }, 3000)
    showCertModal.value = false
    await loadCertificates()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao registrar atestado'
  }
}

async function approveCertificate(id: number) {
  if (!confirm('Aprovar este atestado?')) return
  try {
    await healthService.approveCertificate(id)
    successMessage.value = 'Atestado aprovado'
    setTimeout(() => { successMessage.value = null }, 3000)
    await loadCertificates()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao aprovar'
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

onMounted(() => {
  loadDashboard()
  loadExams()
  loadCertificates()
})
</script>

<template>
  <div class="health-view">
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">Saúde Ocupacional</h1>
        <p class="page-subtitle">Gerencie exames ocupacionais e atestados médicos</p>
      </div>
    </div>

    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="tabs">
      <button class="tab" :class="{ 'tab-active': activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">Dashboard</button>
      <button class="tab" :class="{ 'tab-active': activeTab === 'exams' }" @click="activeTab = 'exams'">Exames</button>
      <button class="tab" :class="{ 'tab-active': activeTab === 'certificates' }" @click="activeTab = 'certificates'">Atestados</button>
      <button class="tab" :class="{ 'tab-active': activeTab === 'alerts' }" @click="activeTab = 'alerts'">Alertas</button>
    </div>

    <!-- Tab: Dashboard -->
    <div v-if="activeTab === 'dashboard'" class="tab-content">
      <div v-if="isLoading" class="loading">Carregando...</div>
      <div v-else-if="!dashboard" class="empty-state">Sem dados disponíveis</div>
      <div v-else>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total de Exames</div>
            <div class="kpi-value">{{ dashboard.totalExams }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Média de Dias Ausentes</div>
            <div class="kpi-value">{{ dashboard.avgDaysAbsent.toFixed(1) }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Exames Vencidos</div>
            <div class="kpi-value kpi-danger">{{ dashboard.expiredExams.length }}</div>
          </div>
        </div>

        <div v-if="dashboard.upcomingExams.length > 0" class="section">
          <h3 class="section-title">Exames Próximos</h3>
          <div class="exam-list">
            <div v-for="exam in dashboard.upcomingExams" :key="exam.id" class="exam-item">
              <span>{{ exam.employee?.fullName || 'Colaborador' }} - {{ EXAM_TYPE_LABELS[exam.type] }}</span>
              <span class="exam-date">{{ formatDate(exam.examDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Exames -->
    <div v-if="activeTab === 'exams'" class="tab-content">
      <div class="tab-actions">
        <button class="btn btn-primary" @click="showExamModal = true">Agendar Exame</button>
      </div>

      <div v-if="isLoading" class="loading">Carregando...</div>
      <div v-else-if="exams.length === 0" class="empty-state">Nenhum exame agendado</div>
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Tipo</th>
              <th>Data do Exame</th>
              <th>Validade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="exam in exams" :key="exam.id">
              <td>{{ exam.employee?.fullName || '-' }}</td>
              <td>{{ EXAM_TYPE_LABELS[exam.type] }}</td>
              <td>{{ formatDate(exam.examDate) }}</td>
              <td>{{ exam.expiryDate ? formatDate(exam.expiryDate) : '-' }}</td>
              <td>
                <span class="badge" :class="getStatusBadgeClass(exam.status)">
                  {{ EXAM_STATUS_LABELS[exam.status] }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab: Atestados -->
    <div v-if="activeTab === 'certificates'" class="tab-content">
      <div class="tab-actions">
        <button class="btn btn-primary" @click="showCertModal = true">Registrar Atestado</button>
      </div>

      <div v-if="isLoading" class="loading">Carregando...</div>
      <div v-else-if="certificates.length === 0" class="empty-state">Nenhum atestado registrado</div>
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Dias</th>
              <th>CID</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cert in certificates" :key="cert.id">
              <td>{{ cert.employee?.fullName || '-' }}</td>
              <td>{{ formatDate(cert.startDate) }}</td>
              <td>{{ formatDate(cert.endDate) }}</td>
              <td>{{ cert.daysCount }}</td>
              <td>{{ cert.cidCode || '-' }}</td>
              <td>
                <span class="badge" :class="getStatusBadgeClass(cert.status)">
                  {{ CERTIFICATE_STATUS_LABELS[cert.status] }}
                </span>
              </td>
              <td>
                <button v-if="cert.status === 'pending'" class="btn-sm btn-success" @click="approveCertificate(cert.id)">
                  Aprovar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab: Alertas -->
    <div v-if="activeTab === 'alerts'" class="tab-content">
      <div v-if="isLoading" class="loading">Carregando...</div>
      <div v-else-if="!dashboard" class="empty-state">Sem alertas</div>
      <div v-else class="alerts-container">
        <div v-if="dashboard.expiredExams.length > 0" class="alert-section">
          <h3 class="alert-title">Exames Vencidos</h3>
          <div class="alert-list">
            <div v-for="exam in dashboard.expiredExams" :key="exam.id" class="alert-item alert-danger">
              <span>{{ exam.employee?.fullName || 'Colaborador' }}</span>
              <span>{{ EXAM_TYPE_LABELS[exam.type] }} - Vencido em {{ formatDate(exam.expiryDate!) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Exame -->
    <div v-if="showExamModal" class="modal-overlay" @click.self="showExamModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Agendar Exame</h3>
          <button class="modal-close" @click="showExamModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveExam" class="form-grid">
            <div class="form-group">
              <label class="form-label">ID do Colaborador *</label>
              <input v-model.number="examForm.employeeId" type="number" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Tipo *</label>
              <select v-model="examForm.type" class="form-select" required>
                <option value="admission">Admissional</option>
                <option value="periodic">Periódico</option>
                <option value="dismissal">Demissional</option>
                <option value="return_to_work">Retorno ao Trabalho</option>
                <option value="role_change">Mudança de Função</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Data do Exame *</label>
              <input v-model="examForm.examDate" type="date" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Validade</label>
              <input v-model="examForm.expiryDate" type="date" class="form-input" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showExamModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal: Atestado -->
    <div v-if="showCertModal" class="modal-overlay" @click.self="showCertModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Registrar Atestado</h3>
          <button class="modal-close" @click="showCertModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCertificate" class="form-grid">
            <div class="form-group">
              <label class="form-label">ID do Colaborador *</label>
              <input v-model.number="certForm.employeeId" type="number" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Data Início *</label>
              <input v-model="certForm.startDate" type="date" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Data Fim *</label>
              <input v-model="certForm.endDate" type="date" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">CID</label>
              <input v-model="certForm.cidCode" type="text" class="form-input" />
            </div>
            <div class="form-group form-col-full">
              <label class="form-label">Descrição CID</label>
              <input v-model="certForm.cidDescription" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Médico</label>
              <input v-model="certForm.doctorName" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">CRM</label>
              <input v-model="certForm.crm" type="text" class="form-input" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showCertModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.health-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
}

.alert {
  padding: var(--alert-padding-y) var(--alert-padding-x);
  border-radius: var(--alert-border-radius);
  font-size: var(--alert-font-size);
}

.alert-success {
  background-color: var(--color-success-light);
  color: var(--color-success-darker);
  border: var(--border-width) solid var(--color-success);
}

.alert-error {
  background-color: var(--color-danger-light);
  color: var(--color-danger-darker);
  border: var(--border-width) solid var(--color-danger);
}

.tabs {
  display: flex;
  gap: var(--space-2);
  border-bottom: var(--border-width) solid var(--color-border);
}

.tab {
  padding: var(--space-4) var(--space-8);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab:hover {
  color: var(--color-text-primary);
}

.tab-active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.tab-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: flex-end;
}

.loading,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  color: var(--color-text-muted);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-8);
}

.kpi-card {
  padding: var(--space-10);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  text-align: center;
}

.kpi-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.kpi-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.kpi-value.kpi-danger {
  color: var(--color-danger);
}

.section {
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  padding: var(--space-10);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-6);
}

.exam-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.exam-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  background-color: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.exam-date {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.table-container {
  overflow-x: auto;
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.data-table thead th {
  padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
  text-align: left;
  font-size: var(--table-header-font-size);
  font-weight: var(--table-header-font-weight);
  color: var(--table-header-color);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  background-color: var(--table-header-bg);
  border-bottom: var(--border-width) solid var(--table-border-color);
}

.data-table tbody td {
  padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
  border-bottom: var(--border-width) solid var(--table-row-border-color);
  color: var(--color-text-primary);
}

.data-table tbody tr:hover {
  background-color: var(--table-row-hover-bg);
}

.badge {
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
}

.badge-success {
  background-color: var(--color-success-bg);
  color: var(--color-success-darker);
}

.badge-info {
  background-color: var(--color-info-bg);
  color: var(--color-info-dark);
}

.badge-warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning-darker);
}

.badge-danger {
  background-color: var(--color-danger-bg);
  color: var(--color-danger-darker);
}

.badge-muted {
  background-color: var(--color-bg-muted);
  color: var(--color-text-muted);
}

.btn,
.btn-sm {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--btn-border-radius);
  font-size: var(--font-size-sm);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-xs);
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  border: var(--border-width) solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-bg-hover);
}

.btn-success {
  background-color: var(--color-success);
  color: white;
}

.btn-success:hover {
  background-color: var(--color-success-dark);
}

.alerts-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.alert-section {
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  padding: var(--space-10);
}

.alert-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-6);
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.alert-item {
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  display: flex;
  justify-content: space-between;
}

.alert-item.alert-danger {
  background-color: var(--color-danger-light);
  color: var(--color-danger-darker);
  border: var(--border-width) solid var(--color-danger-lighter);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--palette-overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-12);
}

.modal {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-10) var(--space-12);
  border-bottom: var(--border-width) solid var(--color-border);
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-3xl);
  line-height: 1;
}

.modal-close:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--space-12);
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-col-full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.form-input,
.form-select {
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  border: var(--border-width) solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: var(--color-bg-input);
  transition: border-color var(--transition-fast);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: var(--input-focus-ring);
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: var(--space-6);
  justify-content: flex-end;
  padding-top: var(--space-6);
  border-top: var(--border-width) solid var(--color-border);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
