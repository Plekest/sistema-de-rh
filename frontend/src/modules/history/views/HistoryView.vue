<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import historyService from '../services/history.service'
import employeeService from '@/modules/employees/services/employee.service'
import type { HistoryEntry, HistoryEventType } from '../types'
import { HISTORY_EVENT_TYPES } from '../types'
import type { Employee } from '@/modules/employees/types'
import { formatDate } from '@/utils/formatters'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Estado
const entries = ref<HistoryEntry[]>([])
const employees = ref<Employee[]>([])
const isLoading = ref(false)
const error = ref('')
const totalPages = ref(1)
const currentPage = ref(1)

// Filtros
const selectedEmployee = ref<number | null>(null)
const filterType = ref<HistoryEventType | ''>('')

// Formulario
const showForm = ref(false)
const formData = ref({
  type: 'note' as HistoryEventType,
  title: '',
  description: '',
  oldValue: '',
  newValue: '',
  eventDate: new Date().toISOString().substring(0, 10),
})
const isSaving = ref(false)
const formError = ref('')

const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

/**
 * Carrega registros de historico
 */
async function loadEntries() {
  if (!selectedEmployee.value) {
    entries.value = []
    totalPages.value = 1
    return
  }

  try {
    isLoading.value = true
    error.value = ''

    const params: Record<string, unknown> = {
      page: currentPage.value,
      limit: 30,
    }

    if (filterType.value) params.type = filterType.value

    const response = await historyService.getAll(selectedEmployee.value, params)
    entries.value = response.data
    totalPages.value = response.meta.lastPage
  } catch (err: unknown) {
    error.value = 'Erro ao carregar historico.'
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
    const response = await employeeService.getAll({ limit: 200 })
    employees.value = response.data
  } catch (err: unknown) {
    console.error('Erro ao carregar colaboradores:', err)
  }
}

/**
 * Abre formulario
 */
function openForm() {
  if (!selectedEmployee.value) {
    error.value = 'Selecione um colaborador antes de adicionar registros.'
    return
  }
  formData.value = {
    type: 'note',
    title: '',
    description: '',
    oldValue: '',
    newValue: '',
    eventDate: new Date().toISOString().substring(0, 10),
  }
  formError.value = ''
  showForm.value = true
}

/**
 * Salva registro
 */
async function handleSave() {
  formError.value = ''

  if (!selectedEmployee.value) {
    formError.value = 'Nenhum colaborador selecionado.'
    return
  }
  if (!formData.value.title.trim()) {
    formError.value = 'Titulo e obrigatorio.'
    return
  }
  if (!formData.value.eventDate) {
    formError.value = 'Data do evento e obrigatoria.'
    return
  }

  try {
    isSaving.value = true
    await historyService.create(selectedEmployee.value, {
      type: formData.value.type,
      title: formData.value.title,
      description: formData.value.description || undefined,
      oldValue: formData.value.oldValue || undefined,
      newValue: formData.value.newValue || undefined,
      eventDate: formData.value.eventDate,
    })
    showForm.value = false
    await loadEntries()
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string } } }
    formError.value = axiosErr.response?.data?.message || 'Erro ao salvar registro.'
  } finally {
    isSaving.value = false
  }
}

/**
 * Retorna a cor associada ao tipo de evento
 */
function getEventColor(type: string): string {
  const found = HISTORY_EVENT_TYPES.find((t) => t.value === type)
  return found ? found.color : '#a0aec0'
}

/**
 * Retorna label do tipo de evento
 */
function getEventLabel(type: string): string {
  const found = HISTORY_EVENT_TYPES.find((t) => t.value === type)
  return found ? found.label : type
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadEntries()
  }
}

watch([selectedEmployee, filterType], () => {
  currentPage.value = 1
  loadEntries()
})

onMounted(() => {
  loadEmployees()
})
</script>

<template>
  <div class="history-view">
    <div class="page-header">
      <h1 class="page-title">Historico</h1>
      <button v-if="isAdmin" class="btn btn-primary" @click="openForm" :disabled="!selectedEmployee">
        Adicionar Registro
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <div class="filter-group filter-grow">
        <label for="filter-emp">Colaborador</label>
        <select id="filter-emp" v-model="selectedEmployee">
          <option :value="null">Selecione um colaborador...</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.fullName }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-type">Tipo de Evento</label>
        <select id="filter-type" v-model="filterType">
          <option value="">Todos</option>
          <option v-for="et in HISTORY_EVENT_TYPES" :key="et.value" :value="et.value">
            {{ et.label }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <template v-if="!selectedEmployee">
      <div class="empty-state">
        <p class="empty-title">Selecione um colaborador</p>
        <p class="empty-description">Escolha um colaborador no filtro acima para visualizar o historico.</p>
      </div>
    </template>

    <template v-else>
      <div v-if="isLoading" class="loading-state">Carregando...</div>

      <!-- Timeline -->
      <div v-else-if="entries.length > 0" class="timeline">
        <div v-for="entry in entries" :key="entry.id" class="timeline-item">
          <div class="timeline-marker" :style="{ backgroundColor: getEventColor(entry.type) }"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span
                class="timeline-badge"
                :style="{ backgroundColor: getEventColor(entry.type) + '20', color: getEventColor(entry.type) }"
              >
                {{ getEventLabel(entry.type) }}
              </span>
              <span class="timeline-date">{{ formatDate(entry.eventDate) }}</span>
            </div>
            <h3 class="timeline-title">{{ entry.title }}</h3>
            <p v-if="entry.description" class="timeline-description">{{ entry.description }}</p>
            <div v-if="entry.oldValue || entry.newValue" class="timeline-values">
              <span v-if="entry.oldValue" class="value-old">De: {{ entry.oldValue }}</span>
              <span v-if="entry.newValue" class="value-new">Para: {{ entry.newValue }}</span>
            </div>
            <span v-if="entry.employee" class="timeline-employee">{{ entry.employee.fullName }}</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-title">Nenhum registro no historico</p>
        <p class="empty-description">Adicione um novo registro para este colaborador.</p>
      </div>
    </template>

    <!-- Paginacao -->
    <div v-if="totalPages > 1" class="pagination">
      <button class="pagination-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">Anterior</button>
      <span class="pagination-info">Pagina {{ currentPage }} de {{ totalPages }}</span>
      <button class="pagination-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">Proxima</button>
    </div>

    <!-- Modal formulario -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Novo Registro</h2>
          <button class="modal-close" @click="showForm = false">&times;</button>
        </div>

        <form @submit.prevent="handleSave" class="modal-body">
          <div v-if="formError" class="alert alert-error">{{ formError }}</div>

          <div class="form-stack">
            <div class="form-row">
              <div class="form-group">
                <label for="form-type">Tipo *</label>
                <select id="form-type" v-model="formData.type">
                  <option v-for="et in HISTORY_EVENT_TYPES" :key="et.value" :value="et.value">
                    {{ et.label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="form-date">Data do Evento *</label>
                <input id="form-date" v-model="formData.eventDate" type="date" />
              </div>
            </div>

            <div class="form-group">
              <label for="form-title">Titulo *</label>
              <input id="form-title" v-model="formData.title" type="text" placeholder="Ex: Promocao para Analista Senior" />
            </div>

            <div class="form-group">
              <label for="form-desc">Descricao</label>
              <textarea id="form-desc" v-model="formData.description" rows="3" placeholder="Detalhes adicionais..."></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="form-old">Valor Anterior</label>
                <input id="form-old" v-model="formData.oldValue" type="text" placeholder="Ex: Analista Pleno" />
              </div>

              <div class="form-group">
                <label for="form-new">Novo Valor</label>
                <input id="form-new" v-model="formData.newValue" type="text" placeholder="Ex: Analista Senior" />
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showForm = false">Cancelar</button>
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
.history-view {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-title { font-size: 1.5rem; font-weight: 700; color: #1a202c; margin: 0; }

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

.btn-primary { background-color: #2b6cb0; color: #fff; }
.btn-primary:hover:not(:disabled) { background-color: #2c5282; }
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
.filter-group select { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 0.875rem; color: #2d3748; background: #fff; outline: none; }
.filter-group select:focus { border-color: #2b6cb0; }

/* Timeline */
.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item {
  position: relative;
  padding-bottom: 1.5rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -1.625rem;
  top: 0.375rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #e2e8f0;
}

.timeline-content {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem 1.25rem;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timeline-badge {
  display: inline-block;
  padding: 0.125rem 0.625rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.timeline-date {
  font-size: 0.75rem;
  color: #a0aec0;
}

.timeline-title {
  font-size: 0.938rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.25rem;
}

.timeline-description {
  font-size: 0.875rem;
  color: #4a5568;
  margin: 0 0 0.5rem;
  line-height: 1.5;
}

.timeline-values {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.813rem;
}

.value-old {
  color: #e53e3e;
}

.value-new {
  color: #38a169;
}

.timeline-employee {
  font-size: 0.75rem;
  color: #a0aec0;
}

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

.form-stack { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.25rem; }
.form-group label { font-size: 0.813rem; font-weight: 600; color: #4a5568; }
.form-group input,
.form-group select,
.form-group textarea { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 0.875rem; color: #2d3748; background: #fff; outline: none; font-family: inherit; }
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: #2b6cb0; }

/* Estados */
.alert { padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.875rem; margin-bottom: 1rem; }
.alert-error { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; }
.loading-state { text-align: center; padding: 2rem; color: #718096; font-size: 0.875rem; }
.empty-state { text-align: center; padding: 3rem 1rem; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; }
.empty-title { font-size: 1rem; font-weight: 600; color: #4a5568; margin: 0 0 0.5rem; }
.empty-description { font-size: 0.875rem; color: #a0aec0; margin: 0; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 1rem; }
  .filters-bar { flex-direction: column; }
  .form-row { grid-template-columns: 1fr; }
  .timeline { padding-left: 1.5rem; }
}
</style>
