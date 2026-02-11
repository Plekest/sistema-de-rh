<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import attendanceService from '../services/attendance.service'
import employeeService from '@/modules/employees/services/employee.service'
import type { TimeEntry } from '../types'
import type { Employee } from '@/modules/employees/types'
import { formatDate, formatTime, formatMinutesToHours } from '@/utils/formatters'

// Estado
const entries = ref<TimeEntry[]>([])
const employees = ref<Employee[]>([])
const isLoading = ref(false)
const error = ref('')
const totalPages = ref(1)
const currentPage = ref(1)
const total = ref(0)

// Filtros
const filterEmployee = ref<number | null>(null)
const filterStartDate = ref('')
const filterEndDate = ref('')

// Modal de registro manual
const showManualForm = ref(false)
const manualForm = ref({
  employeeId: 0,
  date: '',
  clockIn: '',
  clockOut: '',
  lunchStart: '',
  lunchEnd: '',
  type: 'regular' as const,
  notes: '',
})
const isSaving = ref(false)
const formError = ref('')

/**
 * Carrega registros de ponto
 */
async function loadEntries() {
  if (!filterEmployee.value) {
    entries.value = []
    total.value = 0
    totalPages.value = 1
    return
  }

  try {
    isLoading.value = true
    error.value = ''

    const params: Record<string, unknown> = {
      page: currentPage.value,
      limit: 20,
    }

    if (filterStartDate.value) params.startDate = filterStartDate.value
    if (filterEndDate.value) params.endDate = filterEndDate.value

    const response = await attendanceService.getAll(filterEmployee.value, params)
    entries.value = response.data
    totalPages.value = response.meta.lastPage
    total.value = response.meta.total
  } catch (err: unknown) {
    error.value = 'Erro ao carregar registros de ponto.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

/**
 * Carrega lista de colaboradores para filtro
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
 * Aplica filtros
 */
function applyFilters() {
  currentPage.value = 1
  loadEntries()
}

/**
 * Salva registro manual
 */
async function saveManualEntry() {
  if (!manualForm.value.employeeId || !manualForm.value.date) {
    formError.value = 'Colaborador e data sao obrigatorios.'
    return
  }

  try {
    isSaving.value = true
    formError.value = ''
    await attendanceService.create(manualForm.value.employeeId, {
      date: manualForm.value.date,
      clockIn: manualForm.value.clockIn || undefined,
      clockOut: manualForm.value.clockOut || undefined,
      lunchStart: manualForm.value.lunchStart || undefined,
      lunchEnd: manualForm.value.lunchEnd || undefined,
      type: manualForm.value.type,
      notes: manualForm.value.notes || undefined,
    })
    showManualForm.value = false
    resetManualForm()
    await loadEntries()
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string } } }
    formError.value = axiosErr.response?.data?.message || 'Erro ao salvar registro.'
  } finally {
    isSaving.value = false
  }
}

function resetManualForm() {
  manualForm.value = {
    employeeId: 0,
    date: '',
    clockIn: '',
    clockOut: '',
    lunchStart: '',
    lunchEnd: '',
    type: 'regular',
    notes: '',
  }
  formError.value = ''
}

function openManualForm() {
  resetManualForm()
  showManualForm.value = true
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadEntries()
  }
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    regular: 'Regular',
    overtime: 'Hora Extra',
    absence: 'Falta',
    holiday: 'Feriado',
  }
  return map[type] || type
}

watch(filterEmployee, () => {
  applyFilters()
})

watch([filterStartDate, filterEndDate], () => {
  if (filterEmployee.value) {
    applyFilters()
  }
})

onMounted(() => {
  loadEmployees()
})
</script>

<template>
  <div class="attendance-list">
    <div class="page-header">
      <div>
        <h1 class="page-title">Gerenciamento de Ponto</h1>
        <p class="page-subtitle" v-if="total > 0">{{ total }} registro(s)</p>
      </div>
      <button class="btn btn-primary" @click="openManualForm">
        Registro Manual
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <div class="filter-group filter-grow">
        <label for="filter-emp">Colaborador</label>
        <select id="filter-emp" v-model="filterEmployee">
          <option :value="null">Selecione um colaborador...</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.fullName }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-start">Data Inicio</label>
        <input id="filter-start" v-model="filterStartDate" type="date" />
      </div>

      <div class="filter-group">
        <label for="filter-end">Data Fim</label>
        <input id="filter-end" v-model="filterEndDate" type="date" />
      </div>
    </div>

    <div v-if="!filterEmployee" class="empty-state">
      <p class="empty-title">Selecione um colaborador</p>
      <p class="empty-description">Escolha um colaborador no filtro acima para visualizar os registros de ponto.</p>
    </div>

    <div v-else-if="error" class="alert alert-error">{{ error }}</div>

    <div v-else-if="isLoading" class="loading-state">Carregando...</div>

    <div v-else-if="entries.length > 0" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>Data</th>
            <th>Entrada</th>
            <th>Saida Almoco</th>
            <th>Volta Almoco</th>
            <th>Saida</th>
            <th>Total</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in entries" :key="entry.id">
            <td class="td-name">{{ entry.employee?.fullName || '-' }}</td>
            <td>{{ formatDate(entry.date) }}</td>
            <td>{{ formatTime(entry.clockIn) }}</td>
            <td>{{ formatTime(entry.lunchStart) }}</td>
            <td>{{ formatTime(entry.lunchEnd) }}</td>
            <td>{{ formatTime(entry.clockOut) }}</td>
            <td class="td-total">{{ formatMinutesToHours(entry.totalWorkedMinutes) }}</td>
            <td>
              <span class="badge" :class="'badge-' + entry.type">
                {{ typeLabel(entry.type) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <p>Nenhum registro de ponto encontrado.</p>
    </div>

    <!-- Paginacao -->
    <div v-if="totalPages > 1" class="pagination">
      <button class="pagination-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">Anterior</button>
      <span class="pagination-info">Pagina {{ currentPage }} de {{ totalPages }}</span>
      <button class="pagination-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">Proxima</button>
    </div>

    <!-- Modal de registro manual -->
    <div v-if="showManualForm" class="modal-overlay" @click.self="showManualForm = false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Registro Manual de Ponto</h2>
          <button class="modal-close" @click="showManualForm = false">&times;</button>
        </div>

        <div v-if="formError" class="alert alert-error">{{ formError }}</div>

        <form @submit.prevent="saveManualEntry" class="modal-body">
          <div class="form-grid">
            <div class="form-group col-full">
              <label for="manual-emp">Colaborador *</label>
              <select id="manual-emp" v-model="manualForm.employeeId">
                <option :value="0" disabled>Selecione...</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                  {{ emp.fullName }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="manual-date">Data *</label>
              <input id="manual-date" v-model="manualForm.date" type="date" />
            </div>

            <div class="form-group">
              <label for="manual-type">Tipo</label>
              <select id="manual-type" v-model="manualForm.type">
                <option value="regular">Regular</option>
                <option value="overtime">Hora Extra</option>
                <option value="absence">Falta</option>
                <option value="holiday">Feriado</option>
              </select>
            </div>

            <div class="form-group">
              <label for="manual-in">Entrada</label>
              <input id="manual-in" v-model="manualForm.clockIn" type="time" />
            </div>

            <div class="form-group">
              <label for="manual-lunch-start">Saida Almoco</label>
              <input id="manual-lunch-start" v-model="manualForm.lunchStart" type="time" />
            </div>

            <div class="form-group">
              <label for="manual-lunch-end">Volta Almoco</label>
              <input id="manual-lunch-end" v-model="manualForm.lunchEnd" type="time" />
            </div>

            <div class="form-group">
              <label for="manual-out">Saida</label>
              <input id="manual-out" v-model="manualForm.clockOut" type="time" />
            </div>

            <div class="form-group col-full">
              <label for="manual-notes">Observacoes</label>
              <textarea id="manual-notes" v-model="manualForm.notes" rows="2"></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showManualForm = false">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.attendance-list {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-title { font-size: 1.5rem; font-weight: 700; color: #1a202c; margin: 0; }
.page-subtitle { font-size: 0.813rem; color: #718096; margin: 0.25rem 0 0; }

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

.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
.btn-primary:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background-color: #edf2f7; color: #4a5568; }
.btn-secondary:hover { background-color: #e2e8f0; }

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
.filter-group input,
.filter-group select { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 0.875rem; color: #2d3748; background: #fff; outline: none; }
.filter-group input:focus,
.filter-group select:focus { border-color: #667eea; }

/* Tabela */
.table-container { background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.025em; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
.data-table td { padding: 0.75rem 1rem; font-size: 0.875rem; color: #2d3748; border-bottom: 1px solid #f0f0f0; }
.data-table tbody tr:hover { background-color: #f7fafc; }
.td-name { font-weight: 500; }
.td-total { font-weight: 600; font-variant-numeric: tabular-nums; }

.badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
.badge-regular { background-color: #ebf4ff; color: #667eea; }
.badge-overtime { background-color: #faf5ff; color: #6b46c1; }
.badge-absence { background-color: #fff5f5; color: #c53030; }
.badge-holiday { background-color: #f0fff4; color: #276749; }

/* Paginacao */
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
.pagination-btn { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 5px; background: #fff; color: #4a5568; font-size: 0.875rem; cursor: pointer; }
.pagination-btn:hover:not(:disabled) { background-color: #edf2f7; }
.pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pagination-info { font-size: 0.875rem; color: #718096; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1rem; }
.modal { background: #fff; border-radius: 8px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #e2e8f0; }
.modal-title { font-size: 1.125rem; font-weight: 700; color: #1a202c; margin: 0; }
.modal-close { background: none; border: none; font-size: 1.5rem; color: #a0aec0; cursor: pointer; padding: 0; line-height: 1; }
.modal-close:hover { color: #4a5568; }
.modal-body { padding: 1.25rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.col-full { grid-column: 1 / -1; }
.form-group { display: flex; flex-direction: column; gap: 0.25rem; }
.form-group label { font-size: 0.813rem; font-weight: 600; color: #4a5568; }
.form-group input,
.form-group select,
.form-group textarea { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 0.875rem; color: #2d3748; background: #fff; outline: none; font-family: inherit; }
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: #667eea; }

/* Estados e alertas */
.alert { padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.875rem; margin-bottom: 1rem; }
.alert-error { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; }
.loading-state { text-align: center; padding: 2rem; color: #718096; font-size: 0.875rem; }
.empty-state { text-align: center; padding: 3rem 1rem; color: #a0aec0; font-size: 0.875rem; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; }
.empty-state p { margin: 0; }
.empty-title { font-size: 1rem; font-weight: 600; color: #4a5568; margin: 0 0 0.5rem !important; }
.empty-description { font-size: 0.875rem; color: #a0aec0; margin: 0 !important; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 1rem; }
  .filters-bar { flex-direction: column; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>
