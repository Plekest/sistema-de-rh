<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import employeeService from '../services/employee.service'
import benefitsService from '@/modules/benefits/services/benefits.service'
import documentService from '@/modules/documents/services/document.service'
import attendanceService from '@/modules/attendance/services/attendance.service'
import hoursBankService from '@/modules/hours-bank/services/hours-bank.service'
import historyService from '@/modules/history/services/history.service'
import type { Employee } from '../types'
import type { EmployeeBenefit } from '@/modules/benefits/types'
import type { EmployeeDocument } from '@/modules/documents/types'
import type { TimeEntry } from '@/modules/attendance/types'
import type { HoursBankEntry, HoursBankSummary } from '@/modules/hours-bank/types'
import type { HistoryEntry } from '@/modules/history/types'
import { BENEFIT_TYPE_LABELS, ENROLLMENT_STATUS_LABELS } from '@/modules/benefits/types'
import { HISTORY_EVENT_TYPES } from '@/modules/history/types'
import { formatDate, formatDateTime, formatCurrency, formatCpf, formatCnpj, formatPhone, formatMinutesToHours, formatFileSize, getMonthName } from '@/utils/formatters'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const router = useRouter()
const route = useRoute()
const { confirm: confirmDialog } = useConfirmDialog()

const employeeId = Number(route.params.id)

// Estado
const employee = ref<Employee | null>(null)
const isLoading = ref(false)
const error = ref('')
const activeTab = ref<'data' | 'documents' | 'attendance' | 'hours' | 'history' | 'benefits'>('data')

// Beneficios
const employeeBenefits = ref<EmployeeBenefit[]>([])
const benefitsLoading = ref(false)
const benefitsLoaded = ref(false)

// Documentos
const documents = ref<EmployeeDocument[]>([])
const documentsLoading = ref(false)
const documentsLoaded = ref(false)
const documentsTotal = ref(0)

// Ponto
const attendanceRecords = ref<TimeEntry[]>([])
const attendanceLoading = ref(false)
const attendanceLoaded = ref(false)

// Banco de Horas
const hoursBankEntries = ref<HoursBankEntry[]>([])
const hoursBankBalance = ref<HoursBankSummary | null>(null)
const hoursBankLoading = ref(false)
const hoursBankLoaded = ref(false)

// Historico
const historyEntries = ref<HistoryEntry[]>([])
const historyLoading = ref(false)
const historyLoaded = ref(false)
const historyTotal = ref(0)

/**
 * Carrega dados do colaborador
 */
async function loadEmployee() {
  try {
    isLoading.value = true
    error.value = ''
    employee.value = await employeeService.getById(employeeId)
  } catch (err: unknown) {
    error.value = 'Erro ao carregar dados do colaborador.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

async function loadBenefits() {
  try {
    benefitsLoading.value = true
    employeeBenefits.value = await benefitsService.getEmployeeBenefits(employeeId)
    benefitsLoaded.value = true
  } catch (err: unknown) {
    console.error('Erro ao carregar beneficios:', err)
  } finally {
    benefitsLoading.value = false
  }
}

async function loadDocuments() {
  try {
    documentsLoading.value = true
    const response = await documentService.getAll(employeeId, { limit: 5 })
    documents.value = response.data
    documentsTotal.value = response.meta?.total || response.data.length
    documentsLoaded.value = true
  } catch (err: unknown) {
    console.error('Erro ao carregar documentos:', err)
  } finally {
    documentsLoading.value = false
  }
}

async function loadAttendance() {
  try {
    attendanceLoading.value = true
    const response = await attendanceService.getAll(employeeId, { limit: 7 })
    attendanceRecords.value = response.data
    attendanceLoaded.value = true
  } catch (err: unknown) {
    console.error('Erro ao carregar registros de ponto:', err)
  } finally {
    attendanceLoading.value = false
  }
}

async function loadHoursBank() {
  try {
    hoursBankLoading.value = true
    const [entriesResponse, balance] = await Promise.all([
      hoursBankService.getAll(employeeId, { limit: 3 }),
      hoursBankService.getBalance(employeeId),
    ])
    hoursBankEntries.value = entriesResponse.data
    hoursBankBalance.value = balance
    hoursBankLoaded.value = true
  } catch (err: unknown) {
    console.error('Erro ao carregar banco de horas:', err)
  } finally {
    hoursBankLoading.value = false
  }
}

async function loadHistory() {
  try {
    historyLoading.value = true
    const response = await historyService.getAll(employeeId, { limit: 5 })
    historyEntries.value = response.data
    historyTotal.value = response.meta?.total || response.data.length
    historyLoaded.value = true
  } catch (err: unknown) {
    console.error('Erro ao carregar historico:', err)
  } finally {
    historyLoading.value = false
  }
}

function getDocTypeLabel(type: string): string {
  const map: Record<string, string> = {
    rg: 'RG', cpf: 'CPF', cnpj: 'CNPJ', ctps: 'CTPS',
    contract: 'Contrato', certificate: 'Certificado',
    medical: 'Atestado Medico', address_proof: 'Comp. Residencia',
    diploma: 'Diploma', other: 'Outro',
  }
  return map[type] || type
}

function getAttendanceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    regular: 'Regular', overtime: 'Hora Extra',
    absence: 'Ausencia', holiday: 'Feriado',
  }
  return map[type] || type
}

function formatTimeFromISO(isoStr: string | undefined): string {
  if (!isoStr) return '-'
  const date = new Date(isoStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function getHistoryEventLabel(type: string): string {
  const found = HISTORY_EVENT_TYPES.find((e) => e.value === type)
  return found?.label || type
}

function getHistoryEventColor(type: string): string {
  const found = HISTORY_EVENT_TYPES.find((e) => e.value === type)
  return found?.color || '#a0aec0'
}

async function cancelBenefitEnrollment(enrollment: EmployeeBenefit) {
  const planName = enrollment.benefitPlan?.benefit?.name || enrollment.benefitPlan?.name || 'este beneficio'

  const result = await confirmDialog({
    title: 'Cancelar Adesao',
    message: `Confirma o cancelamento da adesao ao beneficio "${planName}"?`,
    variant: 'warning',
    confirmLabel: 'Cancelar Adesao',
  })

  if (!result) return

  try {
    await benefitsService.cancelEnrollment(employeeId, enrollment.id)
    loadBenefits()
  } catch (err: unknown) {
    console.error('Erro ao cancelar adesao:', err)
  }
}

function onTabChange(tab: typeof activeTab.value) {
  activeTab.value = tab
  if (tab === 'benefits' && !benefitsLoaded.value) loadBenefits()
  if (tab === 'documents' && !documentsLoaded.value) loadDocuments()
  if (tab === 'attendance' && !attendanceLoaded.value) loadAttendance()
  if (tab === 'hours' && !hoursBankLoaded.value) loadHoursBank()
  if (tab === 'history' && !historyLoaded.value) loadHistory()
}

function goBack() {
  router.push('/employees')
}

function goToEdit() {
  router.push(`/employees/${employeeId}/edit`)
}

function typeLabel(type: string): string {
  return type === 'clt' ? 'CLT' : 'PJ'
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    terminated: 'Desligado',
  }
  return map[status] || status
}

const tabs = [
  { key: 'data' as const, label: 'Dados' },
  { key: 'benefits' as const, label: 'Beneficios' },
  { key: 'documents' as const, label: 'Documentos' },
  { key: 'attendance' as const, label: 'Ponto' },
  { key: 'hours' as const, label: 'Banco de Horas' },
  { key: 'history' as const, label: 'Historico' },
]

onMounted(() => {
  loadEmployee()
})
</script>

<template>
  <div class="employee-detail">
    <div class="page-header">
      <div>
        <button class="btn-back" @click="goBack">Voltar</button>
        <h1 class="page-title" v-if="employee">{{ employee.fullName }}</h1>
        <h1 class="page-title" v-else>Colaborador</h1>
      </div>
      <button v-if="employee" class="btn btn-primary" @click="goToEdit">
        Editar
      </button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="isLoading" class="loading-state">Carregando...</div>

    <template v-else-if="employee">
      <!-- Info resumo -->
      <div class="summary-bar">
        <div class="summary-item">
          <span class="summary-label">Tipo</span>
          <span class="badge" :class="'badge-' + employee.type">{{ typeLabel(employee.type) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Departamento</span>
          <span class="summary-value">{{ employee.department?.name || '-' }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Cargo</span>
          <span class="summary-value">{{ employee.position?.title || '-' }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Status</span>
          <span class="badge" :class="'badge-' + employee.status">{{ statusLabel(employee.status) }}</span>
        </div>
      </div>

      <!-- Abas -->
      <div class="tabs-container">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="onTabChange(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Dados -->
        <div v-show="activeTab === 'data'" class="tab-content">
          <div class="detail-grid">
            <section class="detail-section">
              <h3 class="section-title">Dados Pessoais</h3>
              <div class="detail-fields">
                <div class="detail-field">
                  <span class="field-label">Nome Completo</span>
                  <span class="field-value">{{ employee.fullName }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Email</span>
                  <span class="field-value">{{ employee.email }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Telefone</span>
                  <span class="field-value">{{ formatPhone(employee.phone) }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">CPF</span>
                  <span class="field-value">{{ formatCpf(employee.cpf) }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">CNPJ</span>
                  <span class="field-value">{{ formatCnpj(employee.cnpj) }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">RG</span>
                  <span class="field-value">{{ employee.rg || '-' }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Data de Nascimento</span>
                  <span class="field-value">{{ formatDate(employee.birthDate) }}</span>
                </div>
              </div>
            </section>

            <section class="detail-section">
              <h3 class="section-title">Dados Profissionais</h3>
              <div class="detail-fields">
                <div class="detail-field">
                  <span class="field-label">Matricula</span>
                  <span class="field-value">{{ employee.registrationNumber || '-' }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Data de Admissao</span>
                  <span class="field-value">{{ formatDate(employee.hireDate) }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Data de Desligamento</span>
                  <span class="field-value">{{ formatDate(employee.terminationDate) }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Salario</span>
                  <span class="field-value">{{ employee.salary ? formatCurrency(employee.salary) : '-' }}</span>
                </div>
              </div>
            </section>

            <section class="detail-section">
              <h3 class="section-title">Endereco</h3>
              <div class="detail-fields">
                <div class="detail-field detail-field-full">
                  <span class="field-label">Logradouro</span>
                  <span class="field-value">
                    {{ employee.addressStreet || '-' }}
                    {{ employee.addressNumber ? ', ' + employee.addressNumber : '' }}
                    {{ employee.addressComplement ? ' - ' + employee.addressComplement : '' }}
                  </span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Bairro</span>
                  <span class="field-value">{{ employee.addressNeighborhood || '-' }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Cidade / Estado</span>
                  <span class="field-value">
                    {{ employee.addressCity || '-' }}{{ employee.addressState ? ' / ' + employee.addressState : '' }}
                  </span>
                </div>
                <div class="detail-field">
                  <span class="field-label">CEP</span>
                  <span class="field-value">{{ employee.addressZip || '-' }}</span>
                </div>
              </div>
            </section>

            <section v-if="employee.notes" class="detail-section">
              <h3 class="section-title">Observacoes</h3>
              <p class="notes-text">{{ employee.notes }}</p>
            </section>
          </div>
        </div>

        <!-- Beneficios -->
        <div v-show="activeTab === 'benefits'" class="tab-content">
          <div v-if="benefitsLoading" class="loading-state">Carregando...</div>

          <div v-else-if="employeeBenefits.length > 0" class="benefits-list">
            <div
              v-for="enrollment in employeeBenefits"
              :key="enrollment.id"
              class="benefit-card"
            >
              <div class="benefit-card-header">
                <div class="benefit-card-info">
                  <span class="benefit-name">{{ enrollment.benefitPlan?.benefit?.name || '-' }}</span>
                  <span class="benefit-type">{{ BENEFIT_TYPE_LABELS[enrollment.benefitPlan?.benefit?.type || ''] || '' }}</span>
                </div>
                <span
                  class="badge"
                  :class="{
                    'badge-active': enrollment.status === 'active',
                    'badge-inactive': enrollment.status === 'cancelled',
                    'badge-suspended': enrollment.status === 'suspended',
                  }"
                >
                  {{ ENROLLMENT_STATUS_LABELS[enrollment.status] }}
                </span>
              </div>

              <div class="benefit-card-details">
                <div class="benefit-detail">
                  <span class="detail-label">Plano</span>
                  <span class="detail-value">{{ enrollment.benefitPlan?.name || '-' }}</span>
                </div>
                <div class="benefit-detail">
                  <span class="detail-label">Valor Mensal</span>
                  <span class="detail-value">{{ enrollment.benefitPlan?.monthlyValue ? formatCurrency(enrollment.benefitPlan.monthlyValue) : '-' }}</span>
                </div>
                <div class="benefit-detail">
                  <span class="detail-label">Desc. Colaborador</span>
                  <span class="detail-value">
                    <template v-if="enrollment.benefitPlan?.employeeDiscountValue">
                      {{ formatCurrency(enrollment.benefitPlan.employeeDiscountValue) }}
                    </template>
                    <template v-else-if="enrollment.benefitPlan?.employeeDiscountPercentage">
                      {{ enrollment.benefitPlan.employeeDiscountPercentage }}%
                    </template>
                    <template v-else>-</template>
                  </span>
                </div>
                <div class="benefit-detail">
                  <span class="detail-label">Adesao</span>
                  <span class="detail-value">{{ formatDate(enrollment.enrollmentDate) }}</span>
                </div>
                <div v-if="enrollment.cancellationDate" class="benefit-detail">
                  <span class="detail-label">Cancelamento</span>
                  <span class="detail-value">{{ formatDate(enrollment.cancellationDate) }}</span>
                </div>
              </div>

              <div v-if="enrollment.dependents && enrollment.dependents.length > 0" class="benefit-dependents">
                <span class="detail-label">Dependentes: {{ enrollment.dependents.length }}</span>
              </div>

              <div v-if="enrollment.status === 'active'" class="benefit-card-actions">
                <button
                  class="btn-cancel-enrollment"
                  @click="cancelBenefitEnrollment(enrollment)"
                >
                  Cancelar Adesao
                </button>
              </div>
            </div>
          </div>

          <div v-else class="tab-placeholder">
            <p>Nenhum beneficio vinculado a este colaborador.</p>
            <RouterLink to="/benefits" class="tab-link">Ir para Beneficios</RouterLink>
          </div>
        </div>

        <!-- Documentos -->
        <div v-show="activeTab === 'documents'" class="tab-content">
          <div v-if="documentsLoading" class="loading-state">Carregando...</div>

          <template v-else-if="documentsLoaded">
            <div v-if="documents.length > 0" class="preview-list">
              <div class="preview-header">
                <span class="preview-count">{{ documentsTotal }} documento{{ documentsTotal !== 1 ? 's' : '' }}</span>
              </div>
              <div
                v-for="doc in documents"
                :key="doc.id"
                class="preview-row"
              >
                <div class="preview-row-left">
                  <span class="badge badge-doc-type">{{ getDocTypeLabel(doc.type) }}</span>
                  <span class="preview-title">{{ doc.title }}</span>
                </div>
                <div class="preview-row-right">
                  <span v-if="doc.fileSize" class="preview-meta">{{ formatFileSize(doc.fileSize) }}</span>
                  <span class="preview-meta">{{ formatDate(doc.uploadedAt) }}</span>
                </div>
              </div>
            </div>

            <div v-else class="tab-empty">
              <p>Nenhum documento cadastrado.</p>
            </div>

            <div class="preview-action">
              <RouterLink to="/documents" class="btn btn-outline">
                Ver todos os documentos
              </RouterLink>
            </div>
          </template>
        </div>

        <!-- Ponto -->
        <div v-show="activeTab === 'attendance'" class="tab-content">
          <div v-if="attendanceLoading" class="loading-state">Carregando...</div>

          <template v-else-if="attendanceLoaded">
            <div v-if="attendanceRecords.length > 0" class="preview-list">
              <div class="preview-header">
                <span class="preview-count">Ultimos registros</span>
              </div>
              <table class="preview-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Entrada</th>
                    <th>Almoco</th>
                    <th>Saida</th>
                    <th>Total</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in attendanceRecords" :key="record.id">
                    <td>{{ formatDate(record.date) }}</td>
                    <td>{{ formatTimeFromISO(record.clockIn) }}</td>
                    <td>
                      <template v-if="record.lunchStart && record.lunchEnd">
                        {{ formatTimeFromISO(record.lunchStart) }} - {{ formatTimeFromISO(record.lunchEnd) }}
                      </template>
                      <template v-else>-</template>
                    </td>
                    <td>{{ formatTimeFromISO(record.clockOut) }}</td>
                    <td class="font-medium">{{ formatMinutesToHours(record.totalWorkedMinutes) }}</td>
                    <td>
                      <span class="badge" :class="'badge-attendance-' + record.type">
                        {{ getAttendanceTypeLabel(record.type) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="tab-empty">
              <p>Nenhum registro de ponto encontrado.</p>
            </div>

            <div class="preview-action">
              <RouterLink to="/attendance/manage" class="btn btn-outline">
                Ver todos os registros de ponto
              </RouterLink>
            </div>
          </template>
        </div>

        <!-- Banco de Horas -->
        <div v-show="activeTab === 'hours'" class="tab-content">
          <div v-if="hoursBankLoading" class="loading-state">Carregando...</div>

          <template v-else-if="hoursBankLoaded">
            <div v-if="hoursBankBalance" class="hours-balance-cards">
              <div class="balance-card">
                <span class="balance-label">Saldo Atual</span>
                <span
                  class="balance-value"
                  :class="{
                    'balance-positive': hoursBankBalance.currentBalance > 0,
                    'balance-negative': hoursBankBalance.currentBalance < 0,
                    'balance-zero': hoursBankBalance.currentBalance === 0,
                  }"
                >
                  {{ formatMinutesToHours(hoursBankBalance.currentBalance) }}
                </span>
              </div>
              <div class="balance-card">
                <span class="balance-label">Total Esperado</span>
                <span class="balance-value">{{ formatMinutesToHours(hoursBankBalance.totalExpected) }}</span>
              </div>
              <div class="balance-card">
                <span class="balance-label">Total Trabalhado</span>
                <span class="balance-value">{{ formatMinutesToHours(hoursBankBalance.totalWorked) }}</span>
              </div>
            </div>

            <div v-if="hoursBankEntries.length > 0" class="preview-list" style="margin-top: 1.25rem;">
              <div class="preview-header">
                <span class="preview-count">Ultimos meses</span>
              </div>
              <table class="preview-table">
                <thead>
                  <tr>
                    <th>Periodo</th>
                    <th>Esperado</th>
                    <th>Trabalhado</th>
                    <th>Saldo Mes</th>
                    <th>Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in hoursBankEntries" :key="entry.id">
                    <td>{{ getMonthName(entry.referenceMonth) }}/{{ entry.referenceYear }}</td>
                    <td>{{ formatMinutesToHours(entry.expectedMinutes) }}</td>
                    <td>{{ formatMinutesToHours(entry.workedMinutes) }}</td>
                    <td>
                      <span
                        class="font-medium"
                        :class="{
                          'balance-positive': entry.balanceMinutes > 0,
                          'balance-negative': entry.balanceMinutes < 0,
                        }"
                      >
                        {{ formatMinutesToHours(entry.balanceMinutes) }}
                      </span>
                    </td>
                    <td>
                      <span
                        class="font-medium"
                        :class="{
                          'balance-positive': entry.accumulatedBalanceMinutes > 0,
                          'balance-negative': entry.accumulatedBalanceMinutes < 0,
                        }"
                      >
                        {{ formatMinutesToHours(entry.accumulatedBalanceMinutes) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else-if="!hoursBankBalance" class="tab-empty">
              <p>Nenhum registro de banco de horas encontrado.</p>
            </div>

            <div class="preview-action">
              <RouterLink to="/hours-bank" class="btn btn-outline">
                Ver banco de horas completo
              </RouterLink>
            </div>
          </template>
        </div>

        <!-- Historico -->
        <div v-show="activeTab === 'history'" class="tab-content">
          <div v-if="historyLoading" class="loading-state">Carregando...</div>

          <template v-else-if="historyLoaded">
            <div v-if="historyEntries.length > 0" class="preview-list">
              <div class="preview-header">
                <span class="preview-count">{{ historyTotal }} evento{{ historyTotal !== 1 ? 's' : '' }}</span>
              </div>
              <div class="history-timeline">
                <div
                  v-for="entry in historyEntries"
                  :key="entry.id"
                  class="timeline-item"
                >
                  <div class="timeline-dot" :style="{ backgroundColor: getHistoryEventColor(entry.type) }"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <span
                        class="badge badge-history"
                        :style="{ backgroundColor: getHistoryEventColor(entry.type) + '20', color: getHistoryEventColor(entry.type) }"
                      >
                        {{ getHistoryEventLabel(entry.type) }}
                      </span>
                      <span class="timeline-date">{{ formatDate(entry.eventDate) }}</span>
                    </div>
                    <span class="timeline-title">{{ entry.title }}</span>
                    <div v-if="entry.oldValue || entry.newValue" class="timeline-values">
                      <span v-if="entry.oldValue" class="value-old">{{ entry.oldValue }}</span>
                      <span v-if="entry.oldValue && entry.newValue" class="value-arrow">→</span>
                      <span v-if="entry.newValue" class="value-new">{{ entry.newValue }}</span>
                    </div>
                    <span v-if="entry.createdByUser" class="timeline-author">
                      por {{ entry.createdByUser.fullName }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="tab-empty">
              <p>Nenhum evento registrado.</p>
            </div>

            <div class="preview-action">
              <RouterLink to="/history" class="btn btn-outline">
                Ver historico completo
              </RouterLink>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.employee-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0.5rem 0 0;
}

.btn-back {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.btn-back:hover {
  text-decoration: underline;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
  transform: translateY(-1px);
}

/* Summary bar */
.summary-bar {
  display: flex;
  gap: 2rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.summary-value {
  font-size: 0.875rem;
  color: #2d3748;
  font-weight: 500;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.badge-clt { background-color: #ebf4ff; color: #667eea; }
.badge-pj { background-color: #faf5ff; color: #6b46c1; }
.badge-active { background-color: #f0fff4; color: #276749; }
.badge-inactive { background-color: #fffff0; color: #975a16; }
.badge-terminated { background-color: #fff5f5; color: #c53030; }

/* Tabs */
.tabs-container {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  padding: 0 1.25rem;
  overflow-x: auto;
}

.tab-btn {
  padding: 0.875rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #718096;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.tab-btn:hover { color: #2d3748; }
.tab-btn.active { color: #667eea; border-bottom-color: #667eea; }

.tab-content {
  padding: 1.5rem 1.25rem;
}

/* Detail grid */
.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1.5rem;
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.detail-field-full {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 500;
}

.field-value {
  font-size: 0.875rem;
  color: #2d3748;
}

.notes-text {
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}

/* Tab empty state */
.tab-empty {
  text-align: center;
  padding: 2rem 1rem;
  color: #718096;
  font-size: 0.875rem;
}

.tab-empty p {
  margin: 0;
}

/* Preview components */
.preview-list {
  /* container */
}

.preview-header {
  margin-bottom: 0.75rem;
}

.preview-count {
  font-size: 0.813rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.preview-row:last-child {
  border-bottom: none;
}

.preview-row-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}

.preview-row-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.preview-title {
  font-size: 0.875rem;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-meta {
  font-size: 0.75rem;
  color: #a0aec0;
  white-space: nowrap;
}

.preview-action {
  margin-top: 1.25rem;
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  border: 1px solid #667eea;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #667eea;
  background: #fff;
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-outline:hover {
  background: #ebf4ff;
}

/* Document type badge */
.badge-doc-type {
  background-color: #e2e8f0;
  color: #4a5568;
  font-size: 0.688rem;
  padding: 0.125rem 0.5rem;
  white-space: nowrap;
}

/* Attendance type badges */
.badge-attendance-regular { background-color: #f0fff4; color: #276749; }
.badge-attendance-overtime { background-color: #ebf4ff; color: #667eea; }
.badge-attendance-absence { background-color: #fff5f5; color: #c53030; }
.badge-attendance-holiday { background-color: #faf5ff; color: #6b46c1; }

/* Preview table */
.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.813rem;
}

.preview-table th {
  text-align: left;
  font-size: 0.688rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  padding: 0.5rem 0.625rem;
  border-bottom: 2px solid #e2e8f0;
}

.preview-table td {
  padding: 0.5rem 0.625rem;
  color: #2d3748;
  border-bottom: 1px solid #f0f0f0;
}

.preview-table tbody tr:last-child td {
  border-bottom: none;
}

.font-medium { font-weight: 500; }

/* Hours bank balance cards */
.hours-balance-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.balance-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.balance-label {
  font-size: 0.688rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.balance-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
}

.balance-positive { color: #276749 !important; }
.balance-negative { color: #c53030 !important; }
.balance-zero { color: #718096 !important; }

/* History timeline */
.history-timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-history {
  font-size: 0.688rem;
  padding: 0.063rem 0.438rem;
  border-radius: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.timeline-date {
  font-size: 0.75rem;
  color: #a0aec0;
}

.timeline-title {
  font-size: 0.875rem;
  color: #2d3748;
}

.timeline-values {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.813rem;
}

.value-old {
  color: #c53030;
  text-decoration: line-through;
}

.value-arrow {
  color: #718096;
}

.value-new {
  color: #276749;
  font-weight: 500;
}

.timeline-author {
  font-size: 0.75rem;
  color: #a0aec0;
}

/* Alertas e estados */
.alert { padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.875rem; margin-bottom: 1rem; }
.alert-error { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; }
.loading-state { text-align: center; padding: 3rem 1rem; color: #718096; font-size: 0.875rem; }

/* Beneficios */
.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.benefit-card {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem 1.25rem;
}

.benefit-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.benefit-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.benefit-name {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1a202c;
}

.benefit-type {
  font-size: 0.75rem;
  color: #718096;
}

.benefit-card-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.benefit-detail {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.detail-label {
  font-size: 0.688rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-value {
  font-size: 0.875rem;
  color: #2d3748;
}

.benefit-dependents {
  padding-top: 0.5rem;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 0.5rem;
}

.benefit-card-actions {
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
}

.btn-cancel-enrollment {
  padding: 0.375rem 0.875rem;
  background: #fff5f5;
  color: #c53030;
  border: 1px solid #fed7d7;
  border-radius: 5px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-enrollment:hover {
  background: #fed7d7;
}

.badge-suspended { background-color: #fef3c7; color: #92400e; }

/* Responsivo */
@media (max-width: 768px) {
  .summary-bar { flex-direction: column; gap: 0.75rem; }
  .detail-fields { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; gap: 1rem; }
  .hours-balance-cards { grid-template-columns: 1fr; }
  .preview-table { font-size: 0.75rem; }
  .preview-table th, .preview-table td { padding: 0.375rem 0.375rem; }
  .preview-row { flex-direction: column; align-items: flex-start; gap: 0.25rem; }
  .preview-row-right { gap: 0.5rem; }
  .tabs {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tab-btn { padding: 0.75rem 0.875rem; font-size: 0.813rem; }
  .tab-content { padding: 1rem; }
}

@media (max-width: 480px) {
  .summary-bar .stat-item { padding: 0.5rem; }
  .preview-table { font-size: 0.688rem; }
  .history-timeline .timeline-item { padding-left: 1rem; }
  .btn-outline { font-size: 0.813rem; padding: 0.5rem 1rem; }
}
</style>
