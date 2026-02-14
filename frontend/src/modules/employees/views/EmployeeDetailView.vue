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
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
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
    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner text="Carregando dados do colaborador..." />
    </div>

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
          <div v-if="benefitsLoading" class="loading-state"><LoadingSpinner text="Carregando beneficios..." /></div>

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
          <div v-if="documentsLoading" class="loading-state"><LoadingSpinner text="Carregando documentos..." /></div>

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
          <div v-if="attendanceLoading" class="loading-state"><LoadingSpinner text="Carregando registros de ponto..." /></div>

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
          <div v-if="hoursBankLoading" class="loading-state"><LoadingSpinner text="Carregando banco de horas..." /></div>

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
          <div v-if="historyLoading" class="loading-state"><LoadingSpinner text="Carregando historico..." /></div>

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
  max-width: var(--max-width-xl);
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-12);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: var(--space-4) 0 0;
}

.btn-back {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: 0;
}

.btn-back:hover {
  text-decoration: underline;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border: none;
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: #fff;
}

.btn-primary:hover {
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

/* Summary bar */
.summary-bar {
  display: flex;
  gap: var(--space-16);
  padding: var(--space-8) var(--space-10);
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-12);
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.summary-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.summary-value {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

/* Badges */
.badge {
  display: inline-block;
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  width: fit-content;
}

.badge-clt { background-color: var(--color-primary-light); color: var(--color-primary); }
.badge-pj { background-color: var(--color-secondary-light); color: var(--color-secondary-dark); }
.badge-active { background-color: var(--color-success-light); color: var(--color-success-darker); }
.badge-inactive { background-color: var(--color-warning-light); color: var(--color-warning-darker); }
.badge-terminated { background-color: var(--color-danger-light); color: var(--color-danger-dark); }

/* Tabs */
.tabs-container {
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
}

.tabs {
  display: flex;
  border-bottom: var(--border-width-thick) solid var(--color-border);
  padding: 0 var(--space-10);
  overflow-x: auto;
}

.tab-btn {
  padding: var(--space-6) var(--space-10);
  background: none;
  border: none;
  border-bottom: var(--border-width-thick) solid transparent;
  margin-bottom: calc(-1 * var(--border-width-thick));
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition-fast);
}

.tab-btn:hover { color: var(--color-text-secondary); }
.tab-btn.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }

.tab-content {
  padding: var(--space-12) var(--space-10);
}

/* Detail grid */
.detail-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}

.detail-section {
  border-bottom: var(--border-width) solid var(--color-border-light);
  padding-bottom: var(--space-12);
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-8);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.detail-field-full {
  grid-column: 1 / -1;
}

.field-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.field-value {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.notes-text {
  font-size: var(--font-size-base);
  color: var(--color-text-tertiary);
  line-height: var(--line-height-relaxed);
  white-space: pre-wrap;
  margin: 0;
}

/* Tab empty state */
.tab-empty {
  text-align: center;
  padding: var(--space-16) var(--space-8);
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
}

.tab-empty p {
  margin: 0;
}

/* Preview components */
.preview-list {
  /* container */
}

.preview-header {
  margin-bottom: var(--space-6);
}

.preview-count {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) 0;
  border-bottom: var(--border-width) solid var(--color-border-light);
}

.preview-row:last-child {
  border-bottom: none;
}

.preview-row-left {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  min-width: 0;
}

.preview-row-right {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  flex-shrink: 0;
}

.preview-title {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  white-space: nowrap;
}

.preview-action {
  margin-top: var(--space-10);
  text-align: center;
  padding-top: var(--space-8);
  border-top: var(--border-width) solid var(--color-border-light);
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  padding: var(--space-4) var(--space-10);
  border: var(--border-width) solid var(--color-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  background: var(--color-bg-card);
  text-decoration: none;
  transition: var(--transition-fast);
}

.btn-outline:hover {
  background: var(--color-primary-light);
}

/* Document type badge */
.badge-doc-type {
  background-color: var(--color-border);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-2xs);
  padding: var(--badge-padding-y) var(--badge-padding-x);
  white-space: nowrap;
}

/* Attendance type badges */
.badge-attendance-regular { background-color: var(--color-success-light); color: var(--color-success-darker); }
.badge-attendance-overtime { background-color: var(--color-primary-light); color: var(--color-primary); }
.badge-attendance-absence { background-color: var(--color-danger-light); color: var(--color-danger-dark); }
.badge-attendance-holiday { background-color: var(--color-secondary-light); color: var(--color-secondary-dark); }

/* Preview table */
.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.preview-table th {
  text-align: left;
  font-size: var(--table-header-font-size);
  font-weight: var(--table-header-font-weight);
  color: var(--table-header-color);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
  border-bottom: var(--border-width-thick) solid var(--table-border-color);
}

.preview-table td {
  padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
  color: var(--color-text-secondary);
  border-bottom: var(--border-width) solid var(--table-row-border-color);
}

.preview-table tbody tr:last-child td {
  border-bottom: none;
}

.font-medium { font-weight: var(--font-weight-medium); }

/* Hours bank balance cards */
.hours-balance-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}

.balance-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8);
  background: var(--color-bg-hover);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
}

.balance-label {
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.balance-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}

.balance-positive { color: var(--color-success-darker) !important; }
.balance-negative { color: var(--color-danger-dark) !important; }
.balance-zero { color: var(--color-text-muted) !important; }

/* History timeline */
.history-timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-6) 0;
  border-bottom: var(--border-width) solid var(--color-border-light);
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: var(--space-2);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.badge-history {
  font-size: var(--font-size-2xs);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-xl);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}

.timeline-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.timeline-title {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.timeline-values {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
}

.value-old {
  color: var(--color-danger-dark);
  text-decoration: line-through;
}

.value-arrow {
  color: var(--color-text-muted);
}

.value-new {
  color: var(--color-success-darker);
  font-weight: var(--font-weight-medium);
}

.timeline-author {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

/* Alertas e estados */
.alert { padding: var(--alert-padding-y) var(--alert-padding-x); border-radius: var(--alert-border-radius); font-size: var(--alert-font-size); margin-bottom: var(--space-8); }
.alert-error { background: var(--color-danger-light); border: var(--border-width) solid var(--color-danger-lighter); color: var(--color-danger-dark); }
.loading-state { text-align: center; padding: var(--space-24) var(--space-8); color: var(--color-text-muted); font-size: var(--font-size-base); }

/* Beneficios */
.benefits-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.benefit-card {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-8) var(--space-10);
}

.benefit-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
}

.benefit-card-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.benefit-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.benefit-type {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.benefit-card-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-6);
}

.benefit-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.detail-label {
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-value {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.benefit-dependents {
  padding-top: var(--space-4);
  border-top: var(--border-width) solid var(--color-border-light);
  margin-bottom: var(--space-4);
}

.benefit-card-actions {
  padding-top: var(--space-6);
  border-top: var(--border-width) solid var(--color-border-light);
}

.btn-cancel-enrollment {
  padding: var(--space-3) var(--space-6);
  background: var(--color-danger-light);
  color: var(--color-danger-dark);
  border: var(--border-width) solid var(--color-danger-lighter);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
}

.btn-cancel-enrollment:hover {
  background: var(--color-danger-lighter);
}

.badge-suspended { background-color: var(--color-warning-lighter); color: var(--color-warning-darker); }

/* Responsivo */
@media (max-width: 768px) {
  .summary-bar { flex-direction: column; gap: var(--space-6); }
  .detail-fields { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; gap: var(--space-8); }
  .hours-balance-cards { grid-template-columns: 1fr; }
  .preview-table { font-size: var(--font-size-xs); }
  .preview-table th, .preview-table td { padding: var(--space-3) var(--space-3); }
  .preview-row { flex-direction: column; align-items: flex-start; gap: var(--space-2); }
  .preview-row-right { gap: var(--space-4); }
  .tabs {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tab-btn { padding: var(--space-6) var(--space-6); font-size: var(--font-size-sm); }
  .tab-content { padding: var(--space-8); }
}

@media (max-width: 480px) {
  .summary-bar .stat-item { padding: var(--space-4); }
  .preview-table { font-size: var(--font-size-2xs); }
  .history-timeline .timeline-item { padding-left: var(--space-8); }
  .btn-outline { font-size: var(--font-size-sm); padding: var(--space-4) var(--space-8); }
}
</style>
